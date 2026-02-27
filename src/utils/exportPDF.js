/**
 * exportPDF.js  — Visor de Movilidad AMVA
 * ─────────────────────────────────────────────────────────────────────────────
 * Genera PDF con portada, tabla de contenido, secciones formateadas y gráficas.
 *
 * COLORES: se usan únicamente desde COLORS (exportConfig.js → constants.js).
 *          No se define ningún color localmente aquí.
 *
 * Para agregar/quitar indicadores: edita SOLO exportConfig.js → EXPORT_SECTIONS.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { EXPORT_SECTIONS, COLORS, fmtExport } from "./exportConfig";
import { MACROZONA_BY_ID } from "../config/geoLookup";

// ─── Constantes de layout ─────────────────────────────────────────────────────
const PAGE_W = 210;
const PAGE_H = 297;
const ML     = 16;   // margen izquierdo
const MR     = 16;   // margen derecho
const MT     = 16;   // margen superior (debajo del header)
const MB     = 18;   // margen inferior
const CW     = PAGE_W - ML - MR;

// ─── Conversión hex → RGB (derivada de COLORS, sin colores locales) ───────────
const hex2rgb = (hex) => {
  const h = (hex || "#000000").replace("#", "");
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
};

// Todos los colores vienen de COLORS
const C = {
  hdr:    hex2rgb(COLORS.headerBg),
  gr1:    hex2rgb(COLORS.primaryGreen),
  gr2:    hex2rgb(COLORS.secondaryGreen),
  blue:   hex2rgb(COLORS.tertiaryBlue),
  orange: hex2rgb(COLORS.tertiaryOrange),
  pink:   hex2rgb(COLORS.tertiaryPink),
  lgr:    hex2rgb(COLORS.lightGreen),
  lblue:  hex2rgb(COLORS.lightBlue),
  lorange:hex2rgb(COLORS.lightOrange),
  text:   hex2rgb(COLORS.darkText),
  muted:  hex2rgb(COLORS.grayText),
  white:  [255, 255, 255],
  alt:    hex2rgb(COLORS.rowAlt),
  row:    hex2rgb(COLORS.rowOdd),
  border: hex2rgb(COLORS.borderColor),
};

const COMPARE_RGB = (COLORS.compareColors || []).map(hex2rgb);

// ─── Utilidades de dibujo ─────────────────────────────────────────────────────
const rf  = (doc, x, y, w, h, rgb) => { doc.setFillColor(...rgb); doc.rect(x, y, w, h, "F"); };
const rfs = (doc, x, y, w, h, fRgb, sRgb) => {
  doc.setFillColor(...fRgb);
  doc.setDrawColor(...sRgb);
  doc.rect(x, y, w, h, "FD");
};

function text(doc, txt, x, y, opts = {}) {
  doc.setFont("helvetica", opts.italic ? "italic" : (opts.bold ? "bold" : "normal"));
  doc.setFontSize(opts.sz || 9);
  doc.setTextColor(...(opts.color || C.text));
  doc.text(String(txt), x, y, {
    align:    opts.align    || "left",
    maxWidth: opts.maxWidth || undefined,
    baseline: "middle",
  });
}

// ─── Header y footer de página ────────────────────────────────────────────────
function drawPageHeaderFooter(doc, pageNum, totalPages) {
  rf(doc, 0, 0, PAGE_W, 14, C.hdr);
  rf(doc, 0, 13, PAGE_W, 2, C.gr2);
  text(doc, "VISOR DE MOVILIDAD — AMVA", ML, 7.5, { bold:true, sz:9, color:C.white });
  text(doc, `Pág. ${pageNum} / ${totalPages}`, PAGE_W - MR, 7.5, { sz:8, color:C.lgr, align:"right" });

  rf(doc, 0, PAGE_H - 10, PAGE_W, 10, C.lgr);
  const now = new Date().toLocaleString("es-CO", { dateStyle:"short", timeStyle:"short" });
  text(doc, `Generado: ${now}`, ML, PAGE_H - 4.5, { sz:7, color:C.muted });
  text(doc, "Área Metropolitana del Valle de Aburrá", PAGE_W - MR, PAGE_H - 4.5,
       { sz:7, color:C.muted, align:"right" });
}

// ─── Cursor de posición ───────────────────────────────────────────────────────
class Cursor {
  constructor(doc) {
    this.doc = doc;
    this.y   = MT + 2;
    this._pages = 1;
  }
  get maxY() { return PAGE_H - MB; }
  checkBreak(needed = 25) { if (this.y + needed > this.maxY) this.addPage(); }
  addPage() {
    this.doc.addPage();
    this._pages++;
    this.y = MT + 2;
  }
}

// ─── Título de sección ────────────────────────────────────────────────────────
function drawSectionHeading(doc, cursor, label, index) {
  cursor.checkBreak(16);
  rf(doc, ML, cursor.y, CW, 13, C.lgr);
  rf(doc, ML, cursor.y, 4,  13, C.gr1);
  text(doc, `${index}. ${label}`, ML + 8, cursor.y + 6.8,
       { bold:true, sz:12, color:C.hdr });
  cursor.y += 17;
}

// ─── Mini bar chart ──────────────────────────────────────────────────
/**
 * Dibuja un gráfico de barras horizontal.
 * @param {object} opts
 *   categories, seriesArr, unit, xAxisLabel (eje de valor), yAxisLabel (eje de categoría)
 */
function drawMiniBarChart(doc, cursor, categories, seriesArr, unit, xAxisLabel, yAxisLabel) {
  if (!categories || !categories.length) return;

  const n    = categories.length;
  const nSer = seriesArr.length;

  const barH   = nSer > 1
    ? Math.max(2.2, Math.min(4.0, 36 / n))
    : Math.max(2.8, Math.min(5.5, 48 / n));
  const serGap = 0.8;
  const catGap = nSer > 1 ? 5 : 2.5;
  const blockH = barH * nSer + serGap * (nSer - 1) + catGap;

  const legendH    = nSer > 1 ? (Math.ceil(nSer / 2) * 7 + 4) : 0;
  const xLabelH    = xAxisLabel ? 9 : 0;
  const chartH     = 10 + n * blockH + legendH + xLabelH;

  cursor.checkBreak(chartH + 6);
  const y0 = cursor.y;

  // Fondo del gráfico
  rfs(doc, ML, y0, CW, chartH, C.row, C.border);

  // Acento lateral izquierdo
  rf(doc, ML, y0, 3, chartH, C.gr1);

  const padL = 62, padR = 18, padT = 8;
  const zone = CW - padL - padR;

  const allVals = seriesArr.flatMap((s) => (s.values || []).map(Number).filter(Number.isFinite));
  const maxV    = Math.max(...allVals, 1);

  // Líneas de cuadrícula verticales (4 divisiones)
  doc.setDrawColor(...C.border);
  doc.setLineDashPattern([1, 2.5], 0);
  doc.setLineWidth(0.2);
  [0.25, 0.5, 0.75, 1.0].forEach((frac) => {
    const gx = ML + padL + frac * zone;
    doc.line(gx, y0 + padT - 2, gx, y0 + padT + n * blockH + 2);
    // Valor en el eje
    const gridVal = frac * maxV;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.2);
    doc.setTextColor(...C.muted);
    doc.text(fmtExport(gridVal, unit), gx, y0 + padT - 4.5, { baseline:"middle", align:"center" });
  });
  doc.setLineDashPattern([], 0);
  doc.setLineWidth(0.25);

  // Línea del eje de valores (x=0)
  doc.setDrawColor(...C.gr2);
  doc.setLineWidth(0.5);
  doc.line(ML + padL, y0 + padT - 2, ML + padL, y0 + padT + n * blockH + 2);
  doc.setLineWidth(0.25);

  categories.forEach((cat, ci) => {
    const yBase = y0 + padT + ci * blockH;

    // Etiqueta de categoría
    doc.setFont("helvetica");
    doc.setFontSize(5.0);
    doc.setTextColor(...C.text);
    const catStr = String(cat).slice(0, 34);
    doc.text(catStr, ML + padL - 3, yBase + (barH * nSer) / 2,
             { maxWidth: padL - 6, baseline: "middle", align: "right" });

    // Barras de cada serie
    seriesArr.forEach((s, si) => {
      const val  = Number((s.values || [])[ci]) || 0;
      const barW = Math.max(1.2, (val / maxV) * zone);
      const yBar = yBase + si * (barH + serGap);

      // Barra
      const bRgb = s.color || C.gr1;
      doc.setFillColor(...bRgb);
      doc.roundedRect(ML + padL, yBar, barW, barH, 0.6, 0.6, "F");

      // Valor al extremo de la barra
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.0);
      doc.setTextColor(...C.text);
      const valStr = fmtExport(val, unit);
      const valX   = ML + padL + barW + 1.8;
      if (valX + doc.getTextWidth(valStr) < ML + CW - 2) {
        doc.text(valStr, valX, yBar + barH / 2, { baseline: "middle" });
      }
    });

    // Línea separadora entre categorías (modo comparar)
    if (nSer > 1 && ci < n - 1) {
      const divY = yBase + blockH - catGap / 2;
      doc.setDrawColor(...C.text);
      doc.setLineDashPattern([1, 2], 0);
      doc.setLineWidth(0.15);
      doc.line(ML + padL - 2, divY, ML + padL + zone + 4, divY);
      doc.setLineDashPattern([], 0);
      doc.setLineWidth(0.25);
    }
  });

  // ── Etiqueta del eje de valores (debajo del gráfico) ─────────────────────
  if (yAxisLabel) {
    const lx = ML + padL + zone / 2;
    const ly = y0 + chartH - legendH - 3;
    text(doc, yAxisLabel, lx, ly, { sz:7.5, bold:true, color:C.hdr, align:"center" });
  }

  // Etiqueta del eje de categorías (texto vertical al lado izquierdo)
  if (xAxisLabel) {
    const lx = ML + 10;
    const ly = y0 + padT + (n * blockH) / 2;

    doc.saveGraphicsState();

    // Rotamos -90 grados alrededor del punto (lx, ly)
    doc.text(xAxisLabel, lx, ly-10, {
      angle: -90,
    });

    doc.restoreGraphicsState();
  }

  // ── Leyenda ───────────────────────────────────────────────────────────────
  if (nSer > 1) {
    const legCols = Math.round(nSer / 3) + 1;
    const legColW = zone / legCols;
    const ly0     = y0 + chartH - legendH + 3;
    seriesArr.forEach((s, si) => {
      const col = si % legCols;
      const row = Math.floor(si / legCols);
      const lx  = ML + padL + col * legColW;
      const ly  = ly0 + row * 6.5;
      const bRgb = s.color || C.gr1;
      doc.setFillColor(...bRgb);
      doc.roundedRect(lx, ly - 2.2, 4.5, 3.5, 0.5, 0.5, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.2);
      doc.setTextColor(...C.text);
      doc.text(String(s.name || "").slice(0, 32), lx + 6, ly - 0.3, { baseline: "middle" });
    });
  }

  cursor.y += chartH + 6;
}

// ─── autoTable wrapper ────────────────────────────────────────────────────────
function drawTable(doc, cursor, head, body, opts = {}) {
  const { accentRgb = C.gr1, colStyles = {} } = opts;
  const extra = opts.extraConfig || {};

  const tableOpts = {
    head,
    body,
    startY:     cursor.y,
    margin:     { left: ML, right: MR },
    tableWidth: CW,
    styles: {
      font:        "helvetica",
      fontSize:    9,
      cellPadding: 3,
      valign:      "middle",
      overflow:    "linebreak",
      lineColor:   C.border,
      lineWidth:   0.3,
    },
    headStyles: {
      fillColor: accentRgb,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize:  9,
      halign:    "center",
    },
    alternateRowStyles: { fillColor: C.alt },
    bodyStyles:          { fillColor: C.row, fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 58, fontStyle: "bold" },
      ...colStyles,
    },
  };

  Object.entries(extra).forEach(([k, v]) => { if (v !== undefined) tableOpts[k] = v; });
  autoTable(doc, tableOpts);
  cursor.y = doc.lastAutoTable.finalY + 6;
}

// ─── Renders por tipo ─────────────────────────────────────────────────────────

function renderKpiTable(doc, cursor, data) {
  const { kpis } = data;
  const inCompare = kpis.some((k) => k.comparisons?.length > 0);

  if (!inCompare) {
    const cardW  = (CW - 4) / 2;
    const cardH  = 17;
    const cols   = 2;

    kpis.forEach((kpi, i) => {
      if (i % cols === 0) cursor.checkBreak(cardH + 4);
      const col = i % cols;
      const x   = ML + col * (cardW + 4);
      const y   = cursor.y;

      rfs(doc, x, y, cardW, cardH, (i % 4) < 2 ? C.lgr : C.row, C.border);
      rf(doc, x, y, 3, cardH, C.gr1);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.muted);
      doc.text(String(kpi.label || "").toUpperCase().slice(0, 52), x + 6, y + 5.5,
               { baseline: "middle", maxWidth: cardW - 8 });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(...C.hdr);
      doc.text(String(kpi.value || "--"), x + 6, y + 13, { baseline: "middle" });

      if (col === cols - 1 || i === kpis.length - 1) cursor.y += cardH + 4;
    });
  } else {
    const allDets = [...new Set(kpis.flatMap((k) => k.comparisons.map((c) => c.detalle)))];
    const head = [["Indicador", ...allDets]];
    const body = kpis.map((k) => [
      k.label,
      ...allDets.map((d) => k.comparisons.find((c) => c.detalle === d)?.value ?? "--"),
    ]);
    drawTable(doc, cursor, head, body, { accentRgb: C.blue });
  }
  cursor.y += 3;
}

function renderBarChart(doc, cursor, data, section) {
  const { categories = [], values = [], series = [], compareMode, unit } = data;
  const xAxisLabel = section?.xAxisLabel || "";
  const yAxisLabel = section?.yAxisLabel || "";

  if (!categories.length) return;

  if (!compareMode) {
    const head = [["Categoría", `Valor${unit ? " (" + unit + ")" : ""}`]];
    const body = categories.map((cat, i) => [cat, fmtExport(values[i] ?? 0, unit)]);
    drawTable(doc, cursor, head, body, { accentRgb: C.gr1 });
    drawMiniBarChart(doc, cursor, categories,
      [{ values, color: C.gr1, name: yAxisLabel || "Valor" }], unit, xAxisLabel, yAxisLabel);
  } else {
    if (!series.length) return;
    const head = [["Categoría", ...series.map((s) =>
      `${s.name}${unit ? " (" + unit + ")" : ""}` )]];
    const body = categories.map((cat, i) => [
      cat, ...series.map((s) => fmtExport(s.values[i] ?? 0, unit)),
    ]);
    drawTable(doc, cursor, head, body, {
      accentRgb: C.blue,
      extraConfig: {
        didParseCell(data) {
          if (data.section === "head" && data.column.index > 0) {
            const si = data.column.index - 1;
            const rgb = COMPARE_RGB[si % COMPARE_RGB.length] || C.blue;
            data.cell.styles.fillColor = rgb;
          }
        },
      },
    });
    drawMiniBarChart(doc, cursor, categories,
      series.map((s, si) => ({
        values: s.values,
        color:  hex2rgb(s.color) || COMPARE_RGB[si % COMPARE_RGB.length],
        name:   s.name,
      })), unit, xAxisLabel, yAxisLabel);
  }
}

function renderTimeTable(doc, cursor, data) {
  const { timeAxis, series } = data;

  // Solo se llama en modo NO comparar (skipInCompareMode: true garantiza esto)
  const head = [["Hora", ...series.map((s) => s.name)]];
  const body = timeAxis.map((h, i) => [h, ...series.map((s) => fmtExport(s.values[i] ?? 0))]);
  drawTable(doc, cursor, head, body, {
    accentRgb: C.gr2,
    extraConfig: {
      didParseCell(data) {
        if (data.section === "head" && data.column.index > 0) {
          const si = data.column.index - 1;
          const rgb = hex2rgb(series[si]?.color || COLORS.secondaryGreen);
          data.cell.styles.fillColor = rgb;
        }
      },
    },
  });
}

function renderOdTable(doc, cursor, data) {
  const renderHalf = (rows, title, accentRgb) => {
    cursor.checkBreak(20);
    // Sub-título
    rf(doc, ML, cursor.y, CW, 10, accentRgb);
    text(doc, title, ML + 6, cursor.y + 5, { bold:true, sz:9.5, color:C.white });
    cursor.y += 13;

    if (!rows.length) {
      text(doc, "Sin datos disponibles.", ML, cursor.y, { italic:true, color:C.muted });
      cursor.y += 10;
      return;
    }

    const head = [["Municipio", "Macrozona", "Viajes", "% del total"]];
    const body = rows.map((r) => [
      r.municipio,
      r.macrozona,
      fmtExport(r.trips),
      fmtExport(r.pct, "%"),
    ]);
    drawTable(doc, cursor, head, body, {
      accentRgb,
      colStyles: {
        0: { cellWidth: 38 },
        1: { cellWidth: 60 },
        2: { cellWidth: 30, halign: "right" },
        3: { cellWidth: 30, halign: "right" },
      },
      extraConfig: {
        styles: { fontSize: 8.5 },
        columnStyles: {
          0: { cellWidth: 38, fontStyle: "normal" },
          1: { cellWidth: 60 },
          2: { cellWidth: 30, halign: "right" },
          3: { cellWidth: 30, halign: "right" },
        },
      },
    });
  };

  renderHalf(data.origin || [],      "Macrozonas de Origen",  C.gr1);
  cursor.y += 4;
  renderHalf(data.destination || [], "Macrozonas de Destino", C.orange);
}

// ─── Portada ──────────────────────────────────────────────────────────────────
async function drawCoverPage(doc, ctx) {
  const { filters, compareMode, themeName, selectedValues } = ctx;

  rf(doc, 0, 0, PAGE_W, 82, C.hdr);
  rf(doc, 0, 80, PAGE_W, 4, C.gr1);
  rf(doc, 0, 83, PAGE_W, 2, C.lgr);

  const { logoUrl } = ctx;
  if (logoUrl) {
    try {
      const resp = await fetch(logoUrl);
      if (resp.ok) {
        const blob    = await resp.blob();
        const dataUrl = await new Promise((res) => {
          const rd = new FileReader();
          rd.onload  = () => res(rd.result);
          rd.onerror = () => res(null);
          rd.readAsDataURL(blob);
        });
        if (dataUrl) {
          const ext  = logoUrl.match(/\.svg(\?|$)/i) ? "SVG" : "PNG";
          const side = 28;
          doc.addImage(dataUrl, ext, (PAGE_W - side) / 2, 7, side, side);
        }
      }
    } catch { /* sin logo */ }
  }

  text(doc, "Encuestas Origen - Destino 2025", PAGE_W / 2, 44,
       { bold:true, sz:24, color:C.white, align:"center" });
  text(doc, "Área Metropolitana del Valle de Aburrá", PAGE_W / 2, 56,
       { sz:14, color:C.lgr, align:"center" });
  text(doc, "Informe de Indicadores de Movilidad", PAGE_W / 2, 67,
       { italic:true, sz:10, color:C.lgr, align:"center" });

  const now = new Date().toLocaleString("es-CO", { dateStyle:"long", timeStyle:"short" });
  text(doc, `Generado el ${now}`, PAGE_W / 2, 95, { sz:9, color:C.muted, align:"center" });

  // Caja de parámetros
  const boxY = 104, boxH = 74;
  rfs(doc, ML, boxY, CW, boxH, C.lgr, C.gr1);
  rf(doc, ML, boxY, 3.5, boxH, C.gr1);

  text(doc, "Parámetros del informe", ML + 7, boxY + 9, { bold:true, sz:10, color:C.hdr });

  const pData = [
    ["Municipio",         filters.municipio || "AMVA General"],
    ["Tipo de zona",      filters.zona || "Todos"],
    ["Macrozona",         filters.macrozona ? `${MACROZONA_BY_ID[filters.macrozona].macrozona}` : "Todas"],
    ["Modo de análisis",  compareMode ? "Comparar" : "Agrupar"],
    ["Variable de comp.", themeName || "N/A"],
    ...(compareMode && selectedValues?.length
      ? [["Valores", selectedValues.slice(0, 5).join(", ") + (selectedValues.length > 5 ? "…" : "")]]
      : []),
  ];

  pData.forEach(([k, v], i) => {
    const fy = boxY + 18 + i * 9.5;
    text(doc, `${k}:`, ML + 7, fy, { bold:true, sz:8.5, color:C.muted });
    text(doc, String(v).slice(0, 90), ML + 54, fy, { sz:9, color:C.text });
  });

  // Tabla de contenido
  const visibleSections = EXPORT_SECTIONS.filter(
    (s) => !(s.skipInCompareMode && compareMode)
  );
  const tocY = 188;
  text(doc, "Contenido del informe", ML, tocY, { bold:true, sz:11, color:C.hdr });
  rf(doc, ML, tocY + 3, CW, 0.7, C.gr1);

  visibleSections.forEach((s, i) => {
    const ty = tocY + 13 + i * 8;
    if (ty > PAGE_H - 22) return;
    text(doc, `${i + 1}.`, ML + 2, ty, { bold:true, sz:8.5, color:C.gr1 });
    text(doc, s.sectionLabel, ML + 10, ty, { sz:8.5, color:C.text });
    doc.setDrawColor(...C.border);
    doc.setLineDashPattern([1, 2], 0);
    doc.line(
      ML + 11 + doc.getTextWidth(s.sectionLabel) + 2, ty - 0.5,
      PAGE_W - MR - 14, ty - 0.5
    );
    doc.setLineDashPattern([], 0);
  });

  rf(doc, 0, PAGE_H - 10, PAGE_W, 10, C.lgr);
  text(doc, `Generado: ${now}`, ML, PAGE_H - 4.5, { sz:7, color:C.muted });
  text(doc, "Área Metropolitana del Valle de Aburrá", PAGE_W - MR, PAGE_H - 4.5,
       { sz:7, color:C.muted, align:"right" });
}

// ─── API pública ──────────────────────────────────────────────────────────────
export async function generatePdfReport(ctx) {
  const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });

  await drawCoverPage(doc, ctx);

  const cursor = new Cursor(doc);

  const visibleSections = EXPORT_SECTIONS.filter(
    (s) => !(s.skipInCompareMode && ctx.compareMode)
  );

  visibleSections.forEach((section, index) => {
    const data = section.extractNormalizedData(ctx);

    doc.addPage();
    cursor._pages++;
    cursor.y = MT + 2;

    drawSectionHeading(doc, cursor, section.sectionLabel, index + 1);

    if (!data) {
      text(doc, "Sin datos disponibles para los filtros seleccionados.",
           ML, cursor.y, { italic:true, color:C.muted });
      cursor.y += 10;
      return;
    }

    switch (data.type) {
      case "kpi_table":  renderKpiTable(doc, cursor, data);              break;
      case "bar_chart":  renderBarChart(doc, cursor, data, section);     break;
      case "time_table": renderTimeTable(doc, cursor, data);             break;
      case "od_table":   renderOdTable(doc, cursor, data);               break;
      default:
        text(doc, "Tipo de sección no reconocido.", ML, cursor.y, { color:C.muted });
        cursor.y += 10;
    }
  });

  const total = doc.internal.getNumberOfPages();
  for (let p = 2; p <= total; p++) {
    doc.setPage(p);
    drawPageHeaderFooter(doc, p - 1, total - 1);
  }

  doc.save(`Informe_Movilidad_AMVA_${new Date().toISOString().slice(0, 10)}.pdf`);
}