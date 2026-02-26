/**
 * exportExcel.js  — Visor de Movilidad AMVA
 * ─────────────────────────────────────────────────────────────────────────────
 * Genera un Excel con formato completo usando ExcelJS.
 * npm install exceljs file-saver
 *
 * Para agregar/quitar indicadores: edita SOLO exportConfig.js → EXPORT_SECTIONS.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { EXPORT_SECTIONS, COLORS, HOURLY_SERIES_META } from "./exportConfig";

// ─── Paleta en formato ARGB (ExcelJS) — derivada de COLORS (exportConfig.js) ─
const hex2argb = (hex) => "FF" + hex.replace("#","").toUpperCase().padStart(6,"0");

// Todos los colores vienen de COLORS (que a su vez viene de constants.js)
const P = {
  headerDark:   hex2argb(COLORS.headerBg),
  primaryGreen: hex2argb(COLORS.primaryGreen),
  secGreen:     hex2argb(COLORS.secondaryGreen),
  blue:         hex2argb(COLORS.tertiaryBlue),
  orange:       hex2argb(COLORS.tertiaryOrange),
  pink:         hex2argb(COLORS.tertiaryPink),
  lightGreen:   hex2argb(COLORS.lightGreen),
  lightBlue:    hex2argb(COLORS.lightBlue    || "#DBEAFE"),
  lightOrange:  hex2argb(COLORS.lightOrange  || "#FED7AA"),
  rowAlt:       hex2argb(COLORS.rowAlt),
  white:        "FFFFFFFF",
  grayText:     "FF64748B",
  darkText:     "FF1E293B",
  borderColor:  "FFD0D7E2",
  rowOdd:       "FFF8FAFC",
};

// Colores de comparación derivados de COLORS.compareColors
const COMPARE_ARGB = (COLORS.compareColors || [
  "#2563EB","#EA580C","#DB2777","#7C3AED","#0891B2",
  "#65A30D","#D97706","#BE185D","#4F46E5","#0F766E",
]).map(hex2argb);

// ─── Formateo de números ──────────────────────────────────────────────────────
/**
 * Formatea un número para celdas Excel (valor real, sin unidad).
 * - Porcentajes y promedios: máx 2 decimales
 * - Enteros: sin decimales
 * - Separador de miles: punto  (es-CO)
 * - Separador decimal:  coma   (es-CO)
 */
function fmtNum(v, unit) {
  if (typeof v !== "number" || !Number.isFinite(v)) return v;
  if (unit === "%") {
    // Ya viene escalado (ej. 45.67) — 1 decimal
    return parseFloat(v.toFixed(1));
  }
  if (unit === "min") {
    // Promedio en minutos — 1 decimal
    return parseFloat(v.toFixed(1));
  }
  // Conteos / cantidades — entero estricto
  return Math.round(v);
}

/**
 * String para mostrar con formato es-CO (solo para celdas de texto/portada).
 * Celdas de dato usan fmtNum() directamente para que Excel reconozca el número.
 */
function fmtStr(v, unit) {
  const n = fmtNum(v, unit);
  if (typeof n !== "number") return String(n);
  return n.toLocaleString("es-CO", {
    minimumFractionDigits: unit === "%" || unit === "min" ? 1 : 0,
    maximumFractionDigits: 2,
  }) + (unit === "%" ? " %" : unit === "min" ? " min" : "");
}

// ─── Helpers de estilo ─────────────────────────────────────────────────────────
const THIN_BORDER = {
  top:    { style:"thin",   color:{ argb: P.borderColor } },
  bottom: { style:"thin",   color:{ argb: P.borderColor } },
  left:   { style:"thin",   color:{ argb: P.borderColor } },
  right:  { style:"thin",   color:{ argb: P.borderColor } },
};
const MEDIUM_BORDER = (argb = P.primaryGreen) => ({
  top:    { style:"medium", color:{ argb } },
  bottom: { style:"medium", color:{ argb } },
  left:   { style:"medium", color:{ argb } },
  right:  { style:"medium", color:{ argb } },
});

/** Aplica estilos a una celda ExcelJS */
function style(cell, opts = {}) {
  const { bold, sz, bg, border, wrap, halign, valign, italic, color } = opts;

  // Determinar color de texto: oscuro si fondo es claro, blanco si fondo es oscuro
  let fontColor = P.darkText;
  if (color) {
    fontColor = color;
  } else if (bg && bg !== P.white) {
    // Si el fondo es verde oscuro o similar, usar blanco
    if ([P.headerDark, P.primaryGreen, P.secGreen, P.blue, P.orange].includes(bg)) {
      fontColor = P.white;
    } else {
      fontColor = P.darkText;
    }
  }

  cell.font = {
    name: "Calibri",
    size: sz || 11,
    bold: !!bold,
    italic: !!italic,
    color: { argb: fontColor },
  };

  if (bg) {
    cell.fill = { type:"pattern", pattern:"solid", fgColor:{ argb: bg } };
  }

  const rawBorder = border || THIN_BORDER;
  const cleanBorder = {};
  for (const side of ["top","bottom","left","right"]) {
    const s = rawBorder[side];
    if (s && typeof s.style === "string" && s.style !== "none") cleanBorder[side] = s;
  }
  cell.border = Object.keys(cleanBorder).length ? cleanBorder : THIN_BORDER;

  cell.alignment = {
    wrapText:   wrap !== undefined ? wrap : true,
    vertical:   valign || "middle",
    horizontal: halign || "left",
  };
}

/** Celda de título de sección */
function sectionTitle(cell, text, colorArgb = P.headerDark) {
  cell.value = text;
  cell.font      = { name: "Calibri", size: 13, bold: true, color: { argb: colorArgb } };
  cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: P.lightGreen } };
  cell.border    = { bottom: { style: "medium", color: { argb: P.primaryGreen } } };
  cell.alignment = { wrapText: false, vertical: "middle", horizontal: "left" };
}

/** Celda de encabezado de columna */
function colHeader(cell, text, bgArgb = P.headerDark, sz = 11) {
  cell.value = text;
  style(cell, { bold: true, sz, bg: bgArgb, halign: "center", wrap: false, valign:"middle" });
}

/** Celda de fila de datos (alternando) */
function dataCell(cell, value, isAlt = false, opts = {}) {
  cell.value = value;
  style(cell, {
    sz: 10,
    bg: isAlt ? P.rowAlt : P.rowOdd,
    color: P.darkText,
    halign: typeof value === "number" ? "right" : "left",
    bold: opts.bold || false,
    wrap: opts.wrap !== undefined ? opts.wrap : false,
  });
}

/** Celda de etiqueta de fila */
function labelCell(cell, text, isAlt = false) {
  cell.value = text;
  style(cell, {
    bold: true, sz: 10,
    bg: isAlt ? P.rowAlt : P.rowOdd,
    color: P.darkText,
    wrap: true,
  });
}

/** Fila vacía de separación */
function blankRow(ws, ri) {
  const row = ws.getRow(ri);
  row.height = 6;
}

/** Configura ancho de columnas */
function setWidths(ws, widths) {
  widths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });
}

// ─── Hoja: Portada ─────────────────────────────────────────────────────────────
async function buildCoverSheet(wb, ctx, logo) {
  const ws = wb.addWorksheet("Portada");
  const { filters, compareMode, themeName, selectedValues } = ctx;
  const now = new Date().toLocaleString("es-CO", { dateStyle:"long", timeStyle:"short" });

  setWidths(ws, [4, 28, 55, 20]);

  // ── Banda de título (filas 1-5) ──────────────────────────────────────────
  for (let r = 1; r <= 5; r++) {
    for (let c = 1; c <= 4; c++) {
      const cell = ws.getCell(r, c);
      cell.fill = { type:"pattern", pattern:"solid", fgColor:{ argb: P.headerDark } };
      cell.border = {};
    }
    ws.getRow(r).height = 14;
  }
  ws.getRow(3).height = 28;

  // Título principal
  const titleCell = ws.getCell("B3");
  titleCell.value = "Encuestas Origen - Destino 2025";
  titleCell.font  = { name:"Calibri", size:22, bold:true, color:{ argb: P.white } };
  titleCell.alignment = { horizontal:"left", vertical:"middle" };
  ws.mergeCells("B3:D3");

  const subCell = ws.getCell("B4");
  subCell.value = "Informe de Indicadores de Movilidad AMVA";
  subCell.font  = { name:"Calibri", size:12, italic:true, color:{ argb: P.lightGreen } };
  subCell.alignment = { horizontal:"left", vertical:"middle" };
  ws.mergeCells("B4:D4");

  // ── Logo (cuadrado, esquina superior derecha) ────────────────────────────
  if (logo) {
    try {
      const imgId = wb.addImage({ base64: logo.b64, extension: logo.ext });
      // 55px × 55px → ratio cuadrado. tl = top-left en coords de celda (col, row)
      ws.addImage(imgId, { tl: { col: 3.1, row: 0.2 }, ext: { width: 100, height: 100 } });
    } catch (e) { console.warn("Error al agregar logo al Excel:", e);}
  }

  // Logo: omitido por ahora (complejidad con ExcelJS)
  // Se puede agregar un logo embebido en base64 en una versión futura

  // ── Banda verde separadora (fila 6) ─────────────────────────────────────
  ws.getRow(6).height = 5;
  for (let c = 1; c <= 4; c++) {
    const cell = ws.getCell(6, c);
    cell.fill = { type:"pattern", pattern:"solid", fgColor:{ argb: P.secGreen } };
    cell.border = {};
  }

  // ── Caja de parámetros (desde fila 8) ────────────────────────────────────
  ws.getRow(7).height = 8;
  
  const paramTitle = ws.getCell("B8");
  sectionTitle(paramTitle, "⚙  Parámetros del informe");
  ws.mergeCells("B8:D8");
  ws.getRow(8).height = 22;

  ws.getRow(9).height = 5;

  const params = [
    ["Fecha de generación", now],
    ["Municipio",           filters.municipio || "AMVA General"],
    ["Tipo de zona",        filters.zona || "Todos"],
    ["Macrozona",           filters.macrozona ? `ID ${filters.macrozona}` : "Todas"],
    ["Modo de análisis",    compareMode ? "Comparar" : "Agrupar"],
    ["Variable de comp.",   themeName || "N/A"],
    ...(compareMode && selectedValues?.length
      ? [["Valores seleccionados", selectedValues.join(", ")]]
      : []),
  ];

  params.forEach(([k, v], i) => {
    const row = 10 + i;
    const isAlt = i % 2 === 0;
    ws.getRow(row).height = 18;

    const kCell = ws.getCell(row, 2);
    kCell.value = k;
    style(kCell, { bold:true, sz:10, bg: isAlt ? P.lightGreen : P.rowOdd, color: P.headerDark });

    const vCell = ws.getCell(row, 3);
    vCell.value = v;
    style(vCell, { sz:10, bg: isAlt ? P.lightGreen : P.rowOdd, color: P.darkText });
  });

  // ── Tabla de contenido ────────────────────────────────────────────────────
  const tocStartRow = 10 + params.length + 3;
  ws.getRow(tocStartRow - 1).height = 8;

  const tocTitle = ws.getCell(tocStartRow, 2);
  sectionTitle(tocTitle, "📋  Contenido del informe");
  ws.mergeCells(`B${tocStartRow}:D${tocStartRow}`);
  ws.getRow(tocStartRow).height = 22;

  ws.getRow(tocStartRow + 1).height = 5;

  // Encabezados tabla de contenido
  const tcHr = tocStartRow + 2;
  colHeader(ws.getCell(tcHr, 2), "#",    P.primaryGreen, 10);
  colHeader(ws.getCell(tcHr, 3), "Sección", P.primaryGreen, 10);
  ws.getRow(tcHr).height = 18;

  EXPORT_SECTIONS.forEach((s, i) => {
    const r = tcHr + 1 + i;
    const isAlt = i % 2 === 0;
    ws.getRow(r).height = 16;

    const numCell = ws.getCell(r, 2);
    numCell.value = i + 1;
    style(numCell, { sz:10, bg: isAlt ? P.rowAlt : P.rowOdd, halign:"center", color: P.primaryGreen, bold:true });

    const nameCell = ws.getCell(r, 3);
    nameCell.value = s.sectionLabel;
    style(nameCell, { sz:10, bg: isAlt ? P.rowAlt : P.rowOdd });
  });

  ws.views = [{ showGridLines: false }];
}

// ─── Hoja: Filtros ─────────────────────────────────────────────────────────────
function buildFiltersSheet(wb, ctx) {
  const ws = wb.addWorksheet("Filtros Aplicados");
  const { filters, compareMode, themeName, selectedValues } = ctx;

  setWidths(ws, [2, 32, 58]);

  // Título
  ws.getRow(1).height = 30;
  const titleCell = ws.getCell("B1");
  titleCell.value = "Filtros aplicados al informe";
  style(titleCell, { bold:true, sz:14, bg: P.headerDark, halign:"left", wrap:false, color: P.white });
  ws.mergeCells("B1:C1");

  ws.getRow(2).height = 5;

  // Encabezados
  ws.getRow(3).height = 20;
  colHeader(ws.getCell("B3"), "Parámetro", P.primaryGreen);
  colHeader(ws.getCell("C3"), "Valor",     P.primaryGreen);

  const rows = [
    ["Municipio",           filters.municipio || "AMVA General"],
    ["Tipo de zona",        filters.zona || "Todos"],
    ["Macrozona",           filters.macrozona ? `ID ${filters.macrozona}` : "Todas"],
    ["Modo de análisis",    compareMode ? "Comparar" : "Agrupar"],
    ["Variable de comp.",   themeName || "N/A"],
    ["Valores comparados",  compareMode ? (selectedValues || []).join(", ") : "N/A"],
  ];

  const tf = filters.temasFiltros || {};
  Object.entries(tf).forEach(([tema, vals]) => {
    if (vals?.length) rows.push([`Filtro temático: ${tema}`, vals.join(", ")]);
  });

  rows.forEach(([k, v], i) => {
    const r = 4 + i;
    ws.getRow(r).height = 18;
    labelCell(ws.getCell(r, 2), k, i % 2 === 0);
    dataCell(ws.getCell(r, 3), v, i % 2 === 0, { wrap:true });
  });
}

// ─── Renders de secciones ──────────────────────────────────────────────────────

function renderKpiTable(ws, data, startRow) {
  let r = startRow;
  const { kpis } = data;
  const inCompare = kpis.some((k) => k.comparisons?.length > 0);

  if (!inCompare) {
    // Encabezados
    ws.getRow(r).height = 20;
    colHeader(ws.getCell(r, 2), "Indicador", P.headerDark);
    colHeader(ws.getCell(r, 3), "Valor",     P.headerDark);
    r++;
    kpis.forEach((kpi, i) => {
      ws.getRow(r).height = 18;
      labelCell(ws.getCell(r, 2), kpi.label, i % 2 === 0);
      const vc = ws.getCell(r, 3);
      vc.value = kpi.value;  // ya es string formateado desde exportConfig.fmtKpi
      style(vc, { sz:11, bg: i % 2 === 0 ? P.rowAlt : P.rowOdd, halign:"right", bold:true,
                  color: P.darkText });
      r++;
    });
  } else {
    const allDets = [...new Set(kpis.flatMap((k) => k.comparisons.map((c) => c.detalle)))];
    ws.getRow(r).height = 20;
    colHeader(ws.getCell(r, 2), "Indicador", P.headerDark);
    allDets.forEach((d, ci) => {
      const argb = COMPARE_ARGB[ci % COMPARE_ARGB.length];
      colHeader(ws.getCell(r, 3 + ci), d, argb);
    });
    r++;
    kpis.forEach((kpi, i) => {
      ws.getRow(r).height = 18;
      labelCell(ws.getCell(r, 2), kpi.label, i % 2 === 0);
      allDets.forEach((d, ci) => {
        const found = kpi.comparisons.find((c) => c.detalle === d);
        const vc = ws.getCell(r, 3 + ci);
        vc.value = found?.value ?? "--";
        style(vc, { sz:10, bg: i % 2 === 0 ? P.rowAlt : P.rowOdd,
                    halign:"right", color: P.darkText });
      });
      r++;
    });
  }
  return r;
}

function renderBarChart(ws, data, startRow) {
  let r = startRow;
  const { categories = [], values = [], series = [], compareMode, unit } = data;
  const unitLabel = unit ? ` (${unit})` : "";

  if (!compareMode) {
    ws.getRow(r).height = 20;
    colHeader(ws.getCell(r, 2), "Categoría",      P.headerDark);
    colHeader(ws.getCell(r, 3), `Valor${unitLabel}`, P.primaryGreen);
    r++;
    categories.forEach((cat, i) => {
      ws.getRow(r).height = 17;
      labelCell(ws.getCell(r, 2), cat, i % 2 === 0);
      const vc = ws.getCell(r, 3);
      vc.value = fmtNum(values[i] ?? 0, data.unit);
      style(vc, { sz:10, bg: i % 2 === 0 ? P.rowAlt : P.rowOdd, halign:"right" });
      r++;
    });
  } else {
    ws.getRow(r).height = 20;
    colHeader(ws.getCell(r, 2), "Categoría", P.headerDark);
    (series || []).forEach((s, ci) => {
      const argb = hex2argb(s.color) || COMPARE_ARGB[ci % COMPARE_ARGB.length];
      colHeader(ws.getCell(r, 3 + ci), `${s.name}${unitLabel}`, argb);
    });
    r++;
    categories.forEach((cat, i) => {
      ws.getRow(r).height = 17;
      labelCell(ws.getCell(r, 2), cat, i % 2 === 0);
      (series || []).forEach((s, ci) => {
        const vc = ws.getCell(r, 3 + ci);
        vc.value = fmtNum(s.values[i] ?? 0, data.unit);
        style(vc, { sz:10, bg: i % 2 === 0 ? P.rowAlt : P.rowOdd, halign:"right" });
      });
      r++;
    });
  }
  return r;
}

function renderTimeTable(ws, data, startRow) {
  let r = startRow;
  const { timeAxis, series, compareMode } = data;

  if (!compareMode) {
    // Fila de encabezados
    ws.getRow(r).height = 20;
    colHeader(ws.getCell(r, 2), "Hora", P.headerDark);
    series.forEach((s, ci) => {
      const argb = hex2argb(s.color) || COMPARE_ARGB[ci % COMPARE_ARGB.length];
      colHeader(ws.getCell(r, 3 + ci), s.name, argb);
    });
    r++;

    timeAxis.forEach((hour, i) => {
      ws.getRow(r).height = 16;
      labelCell(ws.getCell(r, 2), hour, i % 2 === 0);
      series.forEach((s, ci) => {
        const vc = ws.getCell(r, 3 + ci);
        vc.value = fmtNum(s.values[i] ?? 0, "");
        style(vc, { sz:10, bg: i % 2 === 0 ? P.rowAlt : P.rowOdd, halign:"right" });
      });
      r++;
    });
  } else {
    // Modo comparar: fila 1 de series (merge), fila 2 de detalles
    const detalles = series[0]?.subSeries?.map((ss) => ss.detalle) || [];
    const nDet = detalles.length || 1;

    // Fila 1: Hora | Serie A (merge nDet celdas) | Serie B ...
    ws.getRow(r).height = 22;
    colHeader(ws.getCell(r, 2), "Hora", P.headerDark);
    series.forEach((s, si) => {
      const argb = hex2argb(s.color) || COMPARE_ARGB[si % COMPARE_ARGB.length];
      const startCol = 3 + si * nDet;
      colHeader(ws.getCell(r, startCol), s.name, argb);
      if (nDet > 1) {
        ws.mergeCells(r, startCol, r, startCol + nDet - 1);
      }
    });
    r++;

    // Fila 2: sub-encabezados de detalle
    ws.getRow(r).height = 18;
    // Celda vacía en columna Hora
    const emptyHdr = ws.getCell(r, 2);
    style(emptyHdr, { bg: P.headerDark });

    series.forEach((s, si) => {
      const argb = hex2argb(s.color) || COMPARE_ARGB[si % COMPARE_ARGB.length];
      // Tono más claro para los sub-encabezados
      detalles.forEach((d, di) => {
        colHeader(ws.getCell(r, 3 + si * nDet + di), d, argb, 9);
      });
    });
    r++;

    // Filas de datos
    timeAxis.forEach((hour, i) => {
      ws.getRow(r).height = 16;
      labelCell(ws.getCell(r, 2), hour, i % 2 === 0);
      series.forEach((s, si) => {
        (s.subSeries || []).forEach((ss, di) => {
          const vc = ws.getCell(r, 3 + si * nDet + di);
          vc.value = fmtNum(ss.values[i] ?? 0, "");
          style(vc, { sz:10, bg: i % 2 === 0 ? P.rowAlt : P.rowOdd, halign:"right" });
        });
      });
      r++;
    });
  }
  return r;
}

// ─── Construir hoja por sección ───────────────────────────────────────────────
function buildSectionSheet(wb, section, ctx) {
  const ws = wb.addWorksheet(section.excelSheetName);
  const data = section.extractNormalizedData(ctx);

  setWidths(ws, [2, 40, ...Array(20).fill(18)]);

  // Fila 1: título de sección
  ws.getRow(1).height = 28;
  const titleCell = ws.getCell("B1");
  titleCell.value = section.sectionLabel;
  style(titleCell, {
    bold:true, sz:13, bg: P.headerDark, halign:"left", wrap:false,
    color: P.white,
    border: MEDIUM_BORDER(P.secGreen),
  });
  ws.mergeCells("B1:V1");

  // Fila 2: separador
  ws.getRow(2).height = 8;
  for (let c = 2; c <= 22; c++) {
    const sep = ws.getCell(2, c);
    sep.fill = { type:"pattern", pattern:"solid", fgColor:{ argb: P.secGreen } };
    sep.border = {};
  }

  // Fila 3: vacía
  blankRow(ws, 3);

  let nextRow = 4;

  if (!data) {
    ws.getCell("B4").value = "Sin datos disponibles para los filtros seleccionados.";
    style(ws.getCell("B4"), { italic:true, color: P.grayText, sz:10 });
    return;
  }

  switch (data.type) {
    case "kpi_table":   nextRow = renderKpiTable(ws, data, nextRow);  break;
    case "bar_chart":   nextRow = renderBarChart(ws, data, nextRow);  break;
    case "time_table":  nextRow = renderTimeTable(ws, data, nextRow); break;
    default:
      ws.getCell("B4").value = "Tipo de sección no reconocido.";
  }

  // Fila de totales (sólo bar_chart y kpi_table sin comparar — suma/promedio opcional)
  // Queda la fila final como espacio
  ws.getRow(nextRow).height = 8;

  // Vista: congelar las 3 primeras filas
  ws.views = [{ state:"frozen", ySplit:3, topLeftCell:"A4" }];
}

// ─── Carga del logo ───────────────────────────────────────────────────────────
// logoUrl debe pasarse en ctx; en DashboardContent.jsx:
//   import logoUrl from "../assets/logo-area.png";   (Vite resuelve la URL)
async function loadLogo(logoUrl) {
  if (!logoUrl) return null;
  try {
    const resp = await fetch(logoUrl);
    if (!resp.ok) return null;
    const blob = await resp.blob();
    const b64 = await new Promise((res) => {
      const reader = new FileReader();
      reader.onload  = () => res(reader.result.split(",")[1]);
      reader.onerror = () => res(null);
      reader.readAsDataURL(blob);
    });
    if (!b64) return null;
    const ext = logoUrl.match(/\.svg(\?|$)/i) ? "svg" : "png";
    return { b64, ext };
  } catch { return null; }
}

// ─── API pública ──────────────────────────────────────────────────────────────
/**
 * generateExcelReport(ctx)
 * ctx = { filters, compareMode, selectedValues, themeName,
 *         indicadoresData, analysisViewsData, mobilityPatternsData }
 */
export async function generateExcelReport(ctx) {
  const wb = new ExcelJS.Workbook();
  wb.creator  = "Visor AMVA";
  wb.company  = "Área Metropolitana del Valle de Aburrá";
  wb.created  = new Date();
  wb.modified = new Date();

  // Cargar logo usando la URL que pasa DashboardContent (import de Vite)
  const logo = await loadLogo(ctx.logoUrl);
  await buildCoverSheet(wb, ctx, logo);
  buildFiltersSheet(wb, ctx);

  // Hojas de indicadores
  EXPORT_SECTIONS.forEach((section) => buildSectionSheet(wb, section, ctx));

  // Generar y descargar
  const buffer   = await wb.xlsx.writeBuffer();
  const blob     = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const fileName = `Informe_Movilidad_AMVA_${new Date().toISOString().slice(0,10)}.xlsx`;
  saveAs(blob, fileName);
}