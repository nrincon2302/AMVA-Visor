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

// Todos los colores derivados de COLORS (importado de exportConfig → constants.js)
const C = {
  hdr:    hex2rgb(COLORS.headerBg),
  gr1:    hex2rgb(COLORS.primaryGreen),
  gr2:    hex2rgb(COLORS.secondaryGreen),
  blue:   hex2rgb(COLORS.tertiaryBlue),
  orange: hex2rgb(COLORS.tertiaryOrange),
  pink:   hex2rgb(COLORS.tertiaryPink),
  lgr:    hex2rgb(COLORS.lightGreen),
  lblue:  hex2rgb(COLORS.lightBlue  || "#DBEAFE"),
  lorange:hex2rgb(COLORS.lightOrange || "#FED7AA"),
  text:   hex2rgb(COLORS.darkText   || "#1E293B"),
  muted:  hex2rgb(COLORS.grayText   || "#64748B"),
  white:  [255,255,255],
  alt:    hex2rgb(COLORS.rowAlt),
  border: hex2rgb(COLORS.borderColor || "#E2E8F0"),
  row:    hex2rgb(COLORS.rowOdd      || "#F8FAFC"),
};

const COMPARE_RGB = (COLORS.compareColors || []).map(hex2rgb);

/** Formato numérico es-CO: enteros sin decimal, % y min con 1 decimal.
 *  Separador de miles → punto, decimal → coma (es-CO locale). */
/** Formatea un número con máx 2 decimales en todo modo (agrupar y comparar).
 *  - Si es entero exacto: sin decimales.  Ej: 1234 → "1.234"
 *  - Si tiene decimales: hasta 2.         Ej: 45.678 → "45,68"
 *  Separador de miles: punto, decimal: coma  (locale es-CO).
 */
const fmtVal = (v, unit = "") => {
  if (typeof v !== "number" || !Number.isFinite(v)) return String(v ?? "--");
  // Redondear a máximo 2 decimales
  const n = parseFloat(v.toFixed(2));
  const isInt = Number.isInteger(n);
  const str = n.toLocaleString("es-CO", {
    minimumFractionDigits: isInt ? 0 : undefined,
    maximumFractionDigits: 2,
  });
  return str + (unit === "%" ? " %" : unit === "min" ? " min" : "");
};

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
  const n    = categories.length;
  const nSer = seriesArr.length;

  // Modo comparar: barras más compactas con espacio extra entre categorías
  const barH   = nSer > 1
    ? Math.max(1.8, Math.min(3.2, 30 / n))
    : Math.max(2,   Math.min(4.5, 40 / n));
  const serGap = 0.7;                        // separación entre barras de la misma categoría
  const catGap = nSer > 1 ? 4.5 : 2;        // espacio extra entre categorías distintas
  const blockH = barH * nSer + serGap * (nSer - 1) + catGap;
  const legendH = nSer > 1 ? 14 : 4;
  const chartH  = 10 + n * blockH + legendH;

  cursor.checkBreak(chartH + 4);
  const y0 = cursor.y;

  // Fondo
  rfs(doc, ML, y0, CW, chartH, C.row, C.border);

  const padL = 58, padR = 14, padT = 6, padB = legendH;
  const zone = CW - padL - padR;

  const allVals = seriesArr.flatMap((s) => (s.values || []).map(Number).filter(Number.isFinite));
  const maxV    = Math.max(...allVals, 1);

  categories.forEach((cat, ci) => {
    const yBase = y0 + padT + ci * blockH;

    // Etiqueta de categoría
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.2);
    doc.setTextColor(...C.muted);
    doc.text(String(cat).slice(0, 30), ML + 2, yBase + (barH * nSer) / 2,
             { maxWidth: padL - 4, baseline: "middle" });

    // Barras de cada serie
    seriesArr.forEach((s, si) => {
      const val  = Number((s.values || [])[ci]) || 0;
      const barW = Math.max(0.8, (val / maxV) * zone);
      const yBar = yBase + si * (barH + serGap);

      doc.setFillColor(...(s.color || C.gr1));
      doc.roundedRect(ML + padL, yBar, barW, barH, 0.5, 0.5, "F");

      // Valor al extremo derecho de la barra
      doc.setFont("helvetica", "normal");
      doc.setFontSize(5.0);
      doc.setTextColor(...C.muted);
      doc.text(fmtVal(val, unit), ML + padL + barW + 1.5, yBar + barH / 2,
               { baseline: "middle" });
    });

    // Línea punteada divisoria entre categorías (solo modo comparar)
    if (nSer > 1 && ci < n - 1) {
      const divY = yBase + blockH - catGap / 2;
      doc.setDrawColor(200, 212, 220);
      doc.setLineDashPattern([1, 2], 0);
      doc.setLineWidth(0.18);
      doc.line(ML + padL - 3, divY, ML + padL + zone + 8, divY);
      doc.setLineDashPattern([], 0);
      doc.setLineWidth(0.2);
    }
  });

  // Leyenda (en 2 columnas si hay muchas series)
  if (nSer > 1) {
    const legCols = nSer > 5 ? 2 : 1;
    const legColW = zone / legCols;
    const ly0     = y0 + chartH - legendH + 2;
    seriesArr.forEach((s, si) => {
      const col = si % legCols;
      const row = Math.floor(si / legCols);
      const lx  = ML + padL + col * legColW;
      const ly  = ly0 + row * 6;
      doc.setFillColor(...(s.color || C.gr1));
      doc.roundedRect(lx, ly - 2, 4, 3, 0.4, 0.4, "F");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(5.5);
      doc.setTextColor(...C.text);
      doc.text(String(s.name || "").slice(0, 30), lx + 5.5, ly - 0.3, { baseline: "middle" });
    });
  }

  cursor.y += chartH + 4;
}

// ─── autoTable wrapper ────────────────────────────────────────────────────────
function drawTable(doc, cursor, head, body, opts = {}) {
  const { accentRgb = C.gr1 } = opts;

  // Construir opciones: extraConfig se fusiona sin permitir que undefined sobreescriba claves
  const extra = opts.extraConfig || {};
  const tableOpts = {
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
  };
  // Mezclar extraConfig omitiendo valores undefined (evita crashear autoTable)
  Object.entries(extra).forEach(([k, v]) => { if (v !== undefined) tableOpts[k] = v; });
  autoTable(doc, tableOpts);

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
    // Modo comparar: 4 columnas (una por serie de transporte).
    // Dentro de cada celda se lista "Detalle: valor" por línea → legible sin sub-columnas.
    const head = [["Hora", ...series.map((s) => s.name)]];
    const body = timeAxis.map((hour, hi) => [
      hour,
      ...series.map((s) => {
        const lines = (s.subSeries || []).map((ss) => {
          const v = fmtVal(ss.values[hi] ?? 0, "");
          return `${ss.detalle}: ${v}`;
        });
        return lines.join("\n");
      }),
    ]);

    drawTable(doc, cursor, head, body, {
      accentRgb: C.gr2,
      extraConfig: {
        styles:      { fontSize: 7, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 14, fontStyle: "bold", halign: "center" },
        },
        didParseCell(data) {
          if (data.section === "head" && data.column.index > 0) {
            const si  = data.column.index - 1;
            const rgb = hex2rgb(series[si]?.color || "#339933");
            data.cell.styles.fillColor = rgb;
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

  // Logo centrado, cuadrado (28×28 mm), encima del título
  const { logoUrl } = ctx;
  if (logoUrl) {
    try {
      const resp = await fetch(logoUrl);
      if (resp.ok) {
        const blob  = await resp.blob();
        const dataUrl = await new Promise((res) => {
          const rd = new FileReader();
          rd.onload  = () => res(rd.result);
          rd.onerror = () => res(null);
          rd.readAsDataURL(blob);
        });
        if (dataUrl) {
          const ext   = logoUrl.match(/\.svg(\?|$)/i) ? "SVG" : "PNG";
          const side  = 28;                          // cuadrado 28×28 mm
          const logoX = (PAGE_W - side) / 2;         // centrado horizontal
          doc.addImage(dataUrl, ext, logoX, 7, side, side);
        }
      }
    } catch { /* sin logo, continuar */ }
  }

  // Título debajo del logo
  text(doc, "Encuestas Origen - Destino 2025", PAGE_W / 2, 44, { bold:true, sz:24, color:C.white, align:"center" });
  text(doc, "Área Metropolitana del Valle de Aburrá", PAGE_W / 2, 56,
       { sz:14, color:C.lgr, align:"center" });
  text(doc, "Informe de Indicadores de Movilidad", PAGE_W / 2, 67,
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