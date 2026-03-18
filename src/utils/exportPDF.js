import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { EXPORT_SECTIONS, COLORS, fmtExport } from "./exportConfig";
import { MACROZONA_BY_ID } from "../config/geoLookup";

// ─── Layout ───────────────────────────────────────────────────────────────────
const PAGE_W = 210;
const PAGE_H = 297;
const ML     = 16;
const MR     = 16;
const MT     = 16;
const MB     = 18;
const CW     = PAGE_W - ML - MR;

// ─── Color helpers ────────────────────────────────────────────────────────────
const hex2rgb = (hex) => {
  const h = (hex || "#000000").replace("#", "");
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
};

const C = {
  hdr:     hex2rgb(COLORS.headerBg),
  gr1:     hex2rgb(COLORS.primaryGreen),
  gr2:     hex2rgb(COLORS.secondaryGreen),
  blue:    hex2rgb(COLORS.tertiaryBlue),
  orange:  hex2rgb(COLORS.tertiaryOrange),
  lgr:     hex2rgb(COLORS.lightGreen),
  text:    hex2rgb(COLORS.darkText),
  muted:   hex2rgb(COLORS.grayText),
  white:   [255, 255, 255],
  alt:     hex2rgb(COLORS.rowAlt),
  row:     hex2rgb(COLORS.rowOdd),
  border:  hex2rgb(COLORS.borderColor),
};

const COMPARE_RGB = (COLORS.compareColors || []).map(hex2rgb);

// ─── Draw helpers ─────────────────────────────────────────────────────────────
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

// ─── Shared: build macrozone param rows ───────────────────────────────────────
function macroListLabel(ids = []) {
  if (!ids.length) return null;

  const names = ids.map((id) => {
    const info = MACROZONA_BY_ID[id];
    return info ? `${info.municipio} — ${info.macrozona}` : `ID ${id}`;
  });

  if (names.length <= 2) return names.join(", ");
  return `${names[0]}, ${names[1]} y ${names.length - 2} más`;
}

function buildMacroParams(ctx) {
  const { filters, origenes = [], destinos = [] } = ctx;
  const hasOD = origenes.length > 0 || destinos.length > 0;
  const rows  = [];

  const mzLabel = hasOD ? "Macrozona de residencia" : "Macrozona";
  const mzValue = filters.macrozona
    ? (MACROZONA_BY_ID[filters.macrozona]?.macrozona ?? `ID ${filters.macrozona}`)
    : "Todas";
  rows.push([mzLabel, mzValue]);

  const orLabel = origenes.length > 1 ? "Macrozonas de origen" : "Macrozona de origen";
  const destLabel = destinos.length > 1 ? "Macrozonas de destino" : "Macrozona de destino";

  const orValue   = macroListLabel(origenes);
  const destValue = macroListLabel(destinos);

  if (orValue)   rows.push([orLabel,   orValue]);
  if (destValue) rows.push([destLabel, destValue]);

  return rows;
}

// ─── Page header / footer ─────────────────────────────────────────────────────
function drawPageHeaderFooter(doc, pageNum, totalPages) {
  rf(doc, 0, 0, PAGE_W, 14, C.hdr);
  rf(doc, 0, 10, PAGE_W, 2, C.gr2);
  text(doc, "VISOR DE MOVILIDAD", ML, 7.5, { bold:true, sz:9, color:C.white });
  text(doc, `Pág. ${pageNum} / ${totalPages}`, PAGE_W - MR, 7.5, { sz:8, color:C.lgr, align:"right" });

  rf(doc, 0, PAGE_H - 10, PAGE_W, 10, C.lgr);
  const now = new Date().toLocaleString("es-CO", { dateStyle:"short", timeStyle:"short" });
  text(doc, `Generado: ${now}`, ML, PAGE_H - 4.5, { sz:7, color:C.muted });
  text(doc, "Área Metropolitana del Valle de Aburrá", PAGE_W - MR, PAGE_H - 4.5,
       { sz:7, color:C.muted, align:"right" });
}

// ─── Cursor ───────────────────────────────────────────────────────────────────
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

// ─── Section heading ──────────────────────────────────────────────────────────
function drawSectionHeading(doc, cursor, label, index) {
  cursor.checkBreak(16);
  rf(doc, ML, cursor.y, CW, 13, C.lgr);
  rf(doc, ML, cursor.y, 4,  13, C.gr1);
  text(doc, `${index}. ${label}`, ML + 8, cursor.y + 6.8,
       { bold:true, sz:12, color:C.hdr });
  cursor.y += 17;
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────
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

  const legendH = nSer > 1 ? (Math.ceil(nSer / 2) * 7 + 4) : 0;
  const xLabelH = xAxisLabel ? 9 : 0;
  const chartH  = 10 + n * blockH + legendH + xLabelH;

  cursor.checkBreak(chartH + 6);
  const y0 = cursor.y;

  rfs(doc, ML, y0, CW, chartH, C.row, C.border);
  rf(doc, ML, y0, 3, chartH, C.gr1);

  const padL = 62, padR = 18, padT = 8;
  const zone = CW - padL - padR;

  const allVals = seriesArr.flatMap((s) => (s.values || []).map(Number).filter(Number.isFinite));
  const maxV    = Math.max(...allVals, 1);

  doc.setDrawColor(...C.border);
  doc.setLineDashPattern([1, 2.5], 0);
  doc.setLineWidth(0.2);
  [0.25, 0.5, 0.75, 1.0].forEach((frac) => {
    const gx = ML + padL + frac * zone;
    doc.line(gx, y0 + padT - 2, gx, y0 + padT + n * blockH + 2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.2);
    doc.setTextColor(...C.muted);
    doc.text(fmtExport(frac * maxV, unit), gx, y0 + padT - 4.5, { baseline:"middle", align:"center" });
  });
  doc.setLineDashPattern([], 0);
  doc.setLineWidth(0.25);

  doc.setDrawColor(...C.gr2);
  doc.setLineWidth(0.5);
  doc.line(ML + padL, y0 + padT - 2, ML + padL, y0 + padT + n * blockH + 2);
  doc.setLineWidth(0.25);

  categories.forEach((cat, ci) => {
    const yBase = y0 + padT + ci * blockH;
    doc.setFont("helvetica");
    doc.setFontSize(5.0);
    doc.setTextColor(...C.text);
    doc.text(String(cat).slice(0, 34), ML + padL - 3, yBase + (barH * nSer) / 2,
             { maxWidth: padL - 6, baseline: "middle", align: "right" });

    seriesArr.forEach((s, si) => {
      const val  = Number((s.values || [])[ci]) || 0;
      const barW = Math.max(1.2, (val / maxV) * zone);
      const yBar = yBase + si * (barH + serGap);
      doc.setFillColor(...(s.color || C.gr1));
      doc.roundedRect(ML + padL, yBar, barW, barH, 0.6, 0.6, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.0);
      doc.setTextColor(...C.text);
      const valStr = fmtExport(val, unit);
      const valX   = ML + padL + barW + 1.8;
      if (valX + doc.getTextWidth(valStr) < ML + CW - 2) {
        doc.text(valStr, valX, yBar + barH / 2, { baseline: "middle" });
      }
    });

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

  if (yAxisLabel) {
    text(doc, yAxisLabel, ML + padL + zone / 2, y0 + chartH - legendH - 3,
         { sz:7.5, bold:true, color:C.hdr, align:"center" });
  }

  if (xAxisLabel) {
    doc.saveGraphicsState();
    doc.text(xAxisLabel, ML + 10, y0 + padT + (n * blockH) / 2 - 10, { angle: -90 });
    doc.restoreGraphicsState();
  }

  if (nSer > 1) {
    const legCols = Math.round(nSer / 3) + 1;
    const legColW = zone / legCols;
    const ly0     = y0 + chartH - legendH + 3;
    seriesArr.forEach((s, si) => {
      const col  = si % legCols;
      const row  = Math.floor(si / legCols);
      const lx   = ML + padL + col * legColW;
      const ly   = ly0 + row * 6.5;
      doc.setFillColor(...(s.color || C.gr1));
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

// ─── Section renderers ────────────────────────────────────────────────────────
function renderKpiTable(doc, cursor, data) {
  const { kpis } = data;
  const inCompare = kpis.some((k) => k.comparisons?.length > 0);

  if (!inCompare) {
    const cardW = (CW - 4) / 2;
    const cardH = 17;
    kpis.forEach((kpi, i) => {
      if (i % 2 === 0) cursor.checkBreak(cardH + 4);
      const col = i % 2;
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

      if (col === 1 || i === kpis.length - 1) cursor.y += cardH + 4;
    });
  } else {
    const allDets = [...new Set(kpis.flatMap((k) => k.comparisons.map((c) => c.detalle)))];
    drawTable(doc, cursor,
      [["Indicador", ...allDets]],
      kpis.map((k) => [k.label, ...allDets.map((d) => k.comparisons.find((c) => c.detalle === d)?.value ?? "--")]),
      { accentRgb: C.blue }
    );
  }
  cursor.y += 3;
}

function renderBarChart(doc, cursor, data, section) {
  const { categories = [], values = [], series = [], compareMode, unit } = data;
  const xAxisLabel = section?.xAxisLabel || "";
  const yAxisLabel = section?.yAxisLabel || "";
  if (!categories.length) return;

  if (!compareMode) {
    drawTable(doc, cursor,
      [["Categoría", `Valor${unit ? " (" + unit + ")" : ""}`]],
      categories.map((cat, i) => [cat, fmtExport(values[i] ?? 0, unit)]),
      { accentRgb: C.gr1 }
    );
    drawMiniBarChart(doc, cursor, categories,
      [{ values, color: C.gr1, name: yAxisLabel || "Valor" }], unit, xAxisLabel, yAxisLabel);
  } else {
    if (!series.length) return;
    drawTable(doc, cursor,
      [["Categoría", ...series.map((s) => `${s.name}${unit ? " (" + unit + ")" : ""}`)]],
      categories.map((cat, i) => [cat, ...series.map((s) => fmtExport(s.values[i] ?? 0, unit))]),
      {
        accentRgb: C.blue,
        extraConfig: {
          didParseCell(d) {
            if (d.section === "head" && d.column.index > 0) {
              d.cell.styles.fillColor = COMPARE_RGB[(d.column.index - 1) % COMPARE_RGB.length] || C.blue;
            }
          },
        },
      }
    );
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
  drawTable(doc, cursor,
    [["Hora", ...series.map((s) => s.name)]],
    timeAxis.map((h, i) => [h, ...series.map((s) => fmtExport(s.values[i] ?? 0))]),
    {
      accentRgb: C.gr2,
      extraConfig: {
        didParseCell(d) {
          if (d.section === "head" && d.column.index > 0) {
            d.cell.styles.fillColor = hex2rgb(series[d.column.index - 1]?.color || COLORS.secondaryGreen);
          }
        },
      },
    }
  );
}

function renderOdTable(doc, cursor, data) {
  const renderHalf = (rows, title, accentRgb) => {
    cursor.checkBreak(20);
    rf(doc, ML, cursor.y, CW, 10, accentRgb);
    text(doc, title, ML + 6, cursor.y + 5, { bold:true, sz:9.5, color:C.white });
    cursor.y += 13;

    if (!rows.length) {
      text(doc, "Sin datos disponibles.", ML, cursor.y, { italic:true, color:C.muted });
      cursor.y += 10;
      return;
    }

    drawTable(doc, cursor,
      [["Municipio", "Macrozona", "Viajes", "% del total"]],
      rows.map((r) => [r.municipio, r.macrozona, fmtExport(r.trips), fmtExport(r.pct, "%")]),
      {
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
      }
    );
  };

  renderHalf(data.origin || [],      "Macrozonas de Origen",  C.gr1);
  cursor.y += 4;
  renderHalf(data.destination || [], "Macrozonas de Destino", C.orange);
}

// ─── Cover page ───────────────────────────────────────────────────────────────
async function drawCoverPage(doc, ctx) {
  const { filters, compareMode, themeName, selectedValues } = ctx;

  rf(doc, 0, 0, PAGE_W, 72, C.hdr);
  rf(doc, 0, 70, PAGE_W, 4, C.gr1);
  rf(doc, 0, 73, PAGE_W, 2, C.lgr);

  if (ctx.logoUrl) {
    try {
      const resp = await fetch(ctx.logoUrl);
      if (resp.ok) {
        const blob    = await resp.blob();
        const dataUrl = await new Promise((res) => {
          const rd = new FileReader();
          rd.onload  = () => res(rd.result);
          rd.onerror = () => res(null);
          rd.readAsDataURL(blob);
        });
        if (dataUrl) {
          const ext  = ctx.logoUrl.match(/\.svg(\?|$)/i) ? "SVG" : "PNG";
          doc.addImage(dataUrl, ext, (PAGE_W - 28) / 2, 7, 28, 28);
        }
      }
    } catch { /* sin logo */ }
  }

  text(doc, "Encuestas Origen - Destino 2025", PAGE_W / 2, 45,
       { bold:true, sz:20, color:C.white, align:"center" });
  text(doc, "Área Metropolitana del Valle de Aburrá", PAGE_W / 2, 53,
       { sz:14, color:C.lgr, align:"center" });
  text(doc, "Informe de Indicadores de Movilidad", PAGE_W / 2, 59,
       { italic:true, sz:10, color:C.lgr, align:"center" });

  const now = new Date().toLocaleString("es-CO", { dateStyle:"long", timeStyle:"short" });
  text(doc, `Generado el ${now}`, PAGE_W / 2, 80, { sz:9, color:C.muted, align:"center" });

  // ── Parameter box ────────────────────────────────────────────────────────
  const macroRows = buildMacroParams(ctx);
  const pData = [
    ["Municipio",        filters.municipio || "AMVA General"],
    ["Tipo de zona",     filters.zona || "Todos"],
    ...macroRows,
    ["Modo de análisis", compareMode ? "Comparar" : "Agrupar"],
    ["Variable",         themeName || "N/A"],
    ...(compareMode && selectedValues?.length
      ? [["Valores", selectedValues.slice(0, 5).join(", ") + (selectedValues.length > 5 ? "…" : "")]]
      : []),
  ];

  const valueColWidth = 90;
  const estimatedRows = pData.reduce((acc, [, v]) => {
    const charsPerLine = Math.floor(valueColWidth / 2.2);
    return acc + Math.max(1, Math.ceil(String(v).length / charsPerLine));
  }, 0);
  const boxH = Math.max(70, 18 + estimatedRows * 9.5);

  const boxY = 84;
  rfs(doc, ML, boxY, CW, boxH, C.lgr, C.gr1);
  rf(doc, ML, boxY, 3.5, boxH, C.gr1);
  text(doc, "Parámetros del informe", ML + 7, boxY + 9, { bold:true, sz:10, color:C.hdr });

  let paramY = boxY + 18;
  pData.forEach(([k, v]) => {
    if (k) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.muted);
      doc.text(`${k}:`, ML + 7, paramY, { baseline:"middle" });
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.text);
    const valueX    = ML + 54;
    const maxWidth  = PAGE_W - MR - valueX - 4;
    const lines     = doc.splitTextToSize(String(v), maxWidth);
    doc.text(lines, valueX, paramY, { baseline:"middle" });

    paramY += Math.max(1, lines.length) * 9.5;
  });

  // ── Table of contents ────────────────────────────────────────────────────
  const visibleSections = EXPORT_SECTIONS.filter(
    (s) => !(s.skipInCompareMode && compareMode) && !(s.skipWithODFilter && ctx.hasODFilter) && !s.skipWhen?.(ctx)
  );
  const tocY = boxY + boxH + 10;
  if (tocY < PAGE_H - 40) {
    text(doc, "Contenido del informe", ML, tocY, { bold:true, sz:11, color:C.hdr });
    rf(doc, ML, tocY + 3, CW, 0.7, C.gr1);

    visibleSections.forEach((s, i) => {
      const ty = tocY + 10 + i * 5;
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
  }

  rf(doc, 0, PAGE_H - 10, PAGE_W, 10, C.lgr);
  text(doc, `Generado: ${now}`, ML, PAGE_H - 4.5, { sz:7, color:C.muted });
  text(doc, "Área Metropolitana del Valle de Aburrá", PAGE_W - MR, PAGE_H - 4.5,
       { sz:7, color:C.muted, align:"right" });
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function generatePdfReport(ctx) {
  const doc = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });

  await drawCoverPage(doc, ctx);

  const cursor = new Cursor(doc);

  const visibleSections = EXPORT_SECTIONS.filter(
    (s) => !(s.skipInCompareMode && ctx.compareMode) && !(s.skipWithODFilter && ctx.hasODFilter) && !s.skipWhen?.(ctx)
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