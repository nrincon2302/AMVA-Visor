/**
 * exportPDF.js  — Visor de Movilidad AMVA
 * ─────────────────────────────────────────────────────────────────────────────
 * Genera PDF con portada, tabla de contenido, secciones formateadas y gráficas.
 * npm install jspdf jspdf-autotable
 *
 * Para agregar/quitar indicadores: edita SOLO exportConfig.js → EXPORT_SECTIONS.
 *
 * IMPORTANTE: importar autoTable como función separada y llamar autoTable(doc, opts)
 * en lugar de doc.autoTable(opts) para compatibilidad con versiones recientes.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { EXPORT_SECTIONS, COLORS, HOURLY_SERIES_META } from "./exportConfig";

// ─── Constantes de layout ─────────────────────────────────────────────────────
const PAGE_W   = 210;
const PAGE_H   = 297;
const ML       = 18;   // margen izquierdo
const MR       = 18;   // margen derecho
const MT       = 22;   // margen superior (debajo del header)
const MB       = 20;   // margen inferior (encima del footer)
const CW       = PAGE_W - ML - MR;

// ─── Paleta RGB ───────────────────────────────────────────────────────────────
const hex2rgb = (hex) => {
  const h = hex.replace("#","");
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
};

const C = {
  hdr:    hex2rgb(COLORS.headerBg),       // [27, 58, 45]
  gr1:    hex2rgb(COLORS.primaryGreen),   // [27,122, 62]
  gr2:    hex2rgb(COLORS.secondaryGreen),
  blue:   hex2rgb(COLORS.tertiaryBlue),
  orange: hex2rgb(COLORS.tertiaryOrange),
  pink:   hex2rgb(COLORS.tertiaryPink),
  lgr:    hex2rgb(COLORS.lightGreen),
  lblue:  hex2rgb(COLORS.lightBlue),
  text:   [30, 41, 59],
  muted:  [100,116,139],
  white:  [255,255,255],
  alt:    hex2rgb(COLORS.rowAlt),
  border: [226,232,240],
  row:    [248,250,252],
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
  doc.setFontSize(opts.sz || 10);
  doc.setTextColor(...(opts.color || C.text));
  doc.text(String(txt), x, y, {
    align:    opts.align    || "left",
    maxWidth: opts.maxWidth || undefined,
    baseline: "middle",
  });
}

// ─── Header y footer de página ────────────────────────────────────────────────
function drawPageHeaderFooter(doc, pageNum, totalPages) {
  // Header
  rf(doc, 0, 0, PAGE_W, 14, C.hdr);
  rf(doc, 0, 13, PAGE_W, 2,  C.gr2);
  text(doc, "VISOR DE MOVILIDAD — AMVA", ML, 7.5, { bold:true, sz:9, color:C.white });
  text(doc, `Pág. ${pageNum} / ${totalPages}`, PAGE_W - MR, 7.5, { sz:8, color:C.lgr, align:"right" });

  // Footer
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

// ─── Sección: título ──────────────────────────────────────────────────────────
function drawSectionHeading(doc, cursor, label, index) {
  cursor.checkBreak(16);
  rf(doc,  ML,      cursor.y,     CW,   12, C.lgr);
  rf(doc,  ML,      cursor.y,     3.5,  12, C.gr1);
  text(doc, `${index}. ${label}`, ML + 6, cursor.y + 6.5,
       { bold:true, sz:11, color:C.hdr });
  cursor.y += 15;
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────
function drawMiniBarChart(doc, cursor, categories, seriesArr, unit) {
  if (!categories || !categories.length) return;
  const n      = categories.length;
  const nSer   = seriesArr.length;
  const barH   = Math.max(2, Math.min(4.5, (40 / n)));
  const blockH = barH * nSer + 2;
  const chartH = 12 + n * blockH + (nSer > 1 ? 10 : 4);

  cursor.checkBreak(chartH + 4);
  const y0 = cursor.y;

  // Fondo
  rfs(doc, ML, y0, CW, chartH, C.row, C.border);

  const padL = 58, padR = 14, padT = 6, padB = nSer > 1 ? 12 : 5;
  const zone = CW - padL - padR;

  const allVals = seriesArr.flatMap((s) => (s.values || []).map(Number).filter(Number.isFinite));
  const maxV    = Math.max(...allVals, 1);

  categories.forEach((cat, ci) => {
    const yBase = y0 + padT + ci * blockH;

    // Etiqueta
    doc.setFont("helvetica","normal");
    doc.setFontSize(6.2);
    doc.setTextColor(...C.muted);
    const lbl = String(cat).slice(0, 30);
    doc.text(lbl, ML + 2, yBase + blockH / 2, { maxWidth: padL - 4, baseline:"middle" });

    seriesArr.forEach((s, si) => {
      const val  = Number((s.values || [])[ci]) || 0;
      const barW = Math.max(0.8, (val / maxV) * zone);
      const yBar = yBase + si * (barH + 0.5);

      doc.setFillColor(...(s.color || C.gr1));
      doc.roundedRect(ML + padL, yBar, barW, barH, 0.8, 0.8, "F");

      // Valor
      doc.setFont("helvetica","normal");
      doc.setFontSize(5.2);
      doc.setTextColor(...C.muted);
      const lv = `${val % 1 === 0 ? val : val.toFixed(1)}${unit === "%" ? "%" : unit === "min" ? " min" : ""}`;
      doc.text(lv, ML + padL + barW + 1.5, yBar + barH / 2, { baseline:"middle" });
    });
  });

  // Leyenda multi-serie
  if (nSer > 1) {
    let lx = ML + padL;
    const ly = y0 + chartH - padB / 2 + 2;
    seriesArr.forEach((s) => {
      doc.setFillColor(...(s.color || C.gr1));
      doc.roundedRect(lx, ly - 2.5, 5, 2.5, 0.5, 0.5, "F");
      doc.setFont("helvetica","normal");
      doc.setFontSize(5.5);
      doc.setTextColor(...C.text);
      const nm = String(s.name || "").slice(0,22);
      doc.text(nm, lx + 6.5, ly - 0.5, { baseline:"middle" });
      lx += doc.getTextWidth(nm) + 14;
      if (lx > ML + CW - 20) lx = ML + padL; // wrap leyenda
    });
  }

  cursor.y += chartH + 4;
}

// ─── autoTable wrapper ────────────────────────────────────────────────────────
function drawTable(doc, cursor, head, body, opts = {}) {
  const { accentRgb = C.gr1 } = opts;

  autoTable(doc, {
    head,
    body,
    startY:    cursor.y,
    margin:    { left: ML, right: MR },
    tableWidth: CW,
    styles: {
      font:        "helvetica",
      fontSize:    8,
      cellPadding: 2.5,
      valign:      "middle",
      overflow:    "linebreak",
      lineColor:   C.border,
      lineWidth:   0.25,
    },
    headStyles: {
      fillColor:  accentRgb,
      textColor:  [255,255,255],
      fontStyle:  "bold",
      fontSize:   8.5,
      halign:     "center",
    },
    alternateRowStyles: { fillColor: C.alt },
    bodyStyles:          { fillColor: C.row },
    columnStyles:        { 0: { cellWidth: 55, fontStyle:"bold" } },
    ...(opts.extraConfig || {}),
  });

  cursor.y = doc.lastAutoTable.finalY + 5;
}

// ─── Renders por tipo ─────────────────────────────────────────────────────────
function renderKpiTable(doc, cursor, data) {
  const { kpis } = data;
  const inCompare = kpis.some((k) => k.comparisons?.length > 0);

  if (!inCompare) {
    // Cards en grid 2 columnas
    const cardW  = (CW - 3) / 2;
    const cardH  = 15;
    const cols   = 2;

    kpis.forEach((kpi, i) => {
      if (i % cols === 0) cursor.checkBreak(cardH + 3);
      const col = i % cols;
      const x   = ML + col * (cardW + 3);
      const y   = cursor.y;

      rfs(doc, x, y, cardW, cardH, col === 0 || i % 4 < 2 ? C.lgr : C.row, C.border);
      rf(doc, x, y, 2.5, cardH, C.gr1);

      // Etiqueta
      doc.setFont("helvetica","bold");
      doc.setFontSize(7);
      doc.setTextColor(...C.muted);
      doc.text(String(kpi.label || "").toUpperCase().slice(0,52), x + 5, y + 5, { baseline:"middle" });

      // Valor
      doc.setFont("helvetica","bold");
      doc.setFontSize(12);
      doc.setTextColor(...C.hdr);
      doc.text(String(kpi.value || "--"), x + 5, y + 11.5, { baseline:"middle" });

      if (col === cols - 1 || i === kpis.length - 1) cursor.y += cardH + 3;
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

function renderBarChart(doc, cursor, data) {
  const { categories = [], values = [], series = [], compareMode, unit } = data;
  if (!categories.length) return;

  if (!compareMode) {
    const head = [["Categoría", `Valor${unit ? " (" + unit + ")" : ""}`]];
    const body = categories.map((cat, i) => [cat, values[i] ?? 0]);
    drawTable(doc, cursor, head, body, { accentRgb: C.gr1 });
    drawMiniBarChart(doc, cursor, categories,
      [{ values, color: C.gr1, name: "Valor" }], unit);
  } else {
    if (!series.length) return;
    const head = [["Categoría", ...series.map((s) =>
      `${s.name}${unit ? " (" + unit + ")" : ""}` )]];
    const body = categories.map((cat, i) => [
      cat, ...series.map((s) => s.values[i] ?? 0),
    ]);
    drawTable(doc, cursor, head, body, {
      accentRgb: C.blue,
      extraConfig: {
        headStyles: undefined,
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
      })), unit);
  }
}

function renderTimeTable(doc, cursor, data) {
  const { timeAxis, series, compareMode } = data;

  if (!compareMode) {
    const head = [["Hora", ...series.map((s) => s.name)]];
    const body = timeAxis.map((h, i) => [h, ...series.map((s) => s.values[i] ?? 0)]);
    drawTable(doc, cursor, head, body, {
      accentRgb: C.gr2,
      extraConfig: {
        didParseCell(data) {
          if (data.section === "head" && data.column.index > 0) {
            const si = data.column.index - 1;
            const rgb = hex2rgb(series[si]?.color || "#339933");
            data.cell.styles.fillColor = rgb;
          }
        },
      },
    });
  } else {
    const detalles = series[0]?.subSeries?.map((ss) => ss.detalle) || [];
    const nDet = detalles.length || 1;

    // Construimos una tabla plana con dos filas de cabecera
    const row1 = ["Hora", ...series.flatMap((s) => [s.name, ...Array(nDet - 1).fill("")])];
    const row2 = ["",     ...series.flatMap(() => detalles)];
    const body = timeAxis.map((h, i) => [
      h, ...series.flatMap((s) => (s.subSeries || []).map((ss) => ss.values[i] ?? 0)),
    ]);

    drawTable(doc, cursor, [row1, row2], body, {
      accentRgb: C.blue,
      extraConfig: {
        didParseCell(data) {
          if (data.section !== "head") return;
          if (data.column.index === 0) return;
          const ci = data.column.index - 1;
          const si = Math.floor(ci / nDet);
          const rgb = hex2rgb(series[si]?.color || "#2563EB");
          // Fila 0: color completo; fila 1: tono ligeramente más claro
          if (data.row.index === 0) {
            data.cell.styles.fillColor = rgb;
          } else {
            const lighter = rgb.map((v) => Math.min(255, v + 40));
            data.cell.styles.fillColor = lighter;
          }
        },
      },
    });
  }
}

// ─── Portada ──────────────────────────────────────────────────────────────────
async function drawCoverPage(doc, ctx) {
  const { filters, compareMode, themeName, selectedValues } = ctx;

  // Fondo oscuro superior
  rf(doc, 0, 0, PAGE_W, 82, C.hdr);
  rf(doc, 0, 80, PAGE_W, 4,  C.gr1);
  rf(doc, 0, 83, PAGE_W, 2,  C.lgr);

  // Intento de logo
  const logoCandidates = ["/assets/logo.png","/assets/logo.svg","/logo.png"];
  for (const path of logoCandidates) {
    try {
      const resp = await fetch(path);
      if (!resp.ok) continue;
      const blob = await resp.blob();
      const b64 = await new Promise((res) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = () => res(null);
        r.readAsDataURL(blob);
      });
      if (b64) {
        const ext = path.endsWith(".svg") ? "SVG" : "PNG";
        doc.addImage(b64, ext, PAGE_W - MR - 35, 8, 32, 32);
      }
      break;
    } catch { /* sin logo */ }
  }

  // Texto del título
  text(doc, "Encuestas Origen - Destino 2025", PAGE_W / 2, 32, { bold:true, sz:28, color:C.white, align:"center" });
  text(doc, "Área Metropolitana del Valle de Aburrá", PAGE_W / 2, 48,
       { sz:14, color:C.lgr, align:"center" });
  text(doc, "Informe de Indicadores de Movilidad", PAGE_W / 2, 62,
       { italic:true, sz:10, color:C.lgr, align:"center" });

  // Fecha
  const now = new Date().toLocaleString("es-CO", { dateStyle:"long", timeStyle:"short" });
  text(doc, `Generado el ${now}`, PAGE_W / 2, 95, { sz:8.5, color:C.muted, align:"center" });

  // Caja de parámetros
  const boxY = 104;
  const boxH = 72;
  rfs(doc, ML, boxY, CW, boxH, C.lgr, C.gr1);
  rf(doc,  ML, boxY, 3.5, boxH, C.gr1);

  text(doc, "Parámetros del informe", ML + 7, boxY + 9,
       { bold:true, sz:10, color:C.hdr });

  const pData = [
    ["Municipio",          filters.municipio || "AMVA General"],
    ["Tipo de zona",       filters.zona || "Todos"],
    ["Macrozona",          filters.macrozona ? `ID ${filters.macrozona}` : "Todas"],
    ["Modo de análisis",   compareMode ? "Comparar" : "Agrupar"],
    ["Variable de comp.",  themeName || "N/A"],
    ...(compareMode && selectedValues?.length
      ? [["Valores", selectedValues.slice(0,5).join(", ") + (selectedValues.length > 5 ? "…" : "")]]
      : []),
  ];

  pData.forEach(([k, v], i) => {
    const fy = boxY + 17 + i * 9.5;
    text(doc, `${k}:`, ML + 7,  fy, { bold:true, sz:8, color:C.muted });
    text(doc, String(v).slice(0,90), ML + 52, fy, { sz:8.5, color:C.text });
  });

  // Tabla de contenido
  const tocY = 188;
  text(doc, "Contenido del informe", ML, tocY, { bold:true, sz:11, color:C.hdr });
  rf(doc, ML, tocY + 3, CW, 0.6, C.gr1);

  EXPORT_SECTIONS.forEach((s, i) => {
    const ty = tocY + 12 + i * 8;
    if (ty > PAGE_H - 22) return;
    text(doc, `${i + 1}.`, ML + 2,  ty, { bold:true, sz:8, color:C.gr1 });
    text(doc, s.sectionLabel, ML + 10, ty, { sz:8, color:C.text });
    // Línea punteada
    doc.setDrawColor(...C.border);
    doc.setLineDashPattern([1,2],0);
    doc.line(ML + 11 + doc.getTextWidth(s.sectionLabel) + 2, ty - 0.5, PAGE_W - MR - 14, ty - 0.5);
    doc.setLineDashPattern([],0);
  });

  // Footer portada
  rf(doc, 0, PAGE_H - 10, PAGE_W, 10, C.lgr);
  text(doc, `Generado: ${now}`, ML, PAGE_H - 4.5, { sz:7, color:C.muted });
  text(doc, "Área Metropolitana del Valle de Aburrá", PAGE_W - MR, PAGE_H - 4.5,
       { sz:7, color:C.muted, align:"right" });
}

// ─── API pública ──────────────────────────────────────────────────────────────
/**
 * generatePdfReport(ctx)
 * ctx = { filters, compareMode, selectedValues, themeName,
 *         indicadoresData, analysisViewsData, mobilityPatternsData }
 */
export async function generatePdfReport(ctx) {
  const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });

  // Portada (página 1)
  await drawCoverPage(doc, ctx);

  const cursor = new Cursor(doc);

  // Páginas de contenido
  EXPORT_SECTIONS.forEach((section, index) => {
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
      case "kpi_table":  renderKpiTable(doc, cursor, data);  break;
      case "bar_chart":  renderBarChart(doc, cursor, data);  break;
      case "time_table": renderTimeTable(doc, cursor, data); break;
      default:
        text(doc, "Tipo de sección no reconocido.", ML, cursor.y, { color:C.muted });
        cursor.y += 10;
    }
  });

  // Aplicar header/footer a todas las páginas de contenido (2 en adelante)
  const total = doc.internal.getNumberOfPages();
  for (let p = 2; p <= total; p++) {
    doc.setPage(p);
    drawPageHeaderFooter(doc, p - 1, total - 1);
  }

  doc.save(`Informe_Movilidad_AMVA_${new Date().toISOString().slice(0,10)}.pdf`);
}