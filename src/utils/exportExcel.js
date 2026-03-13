/**
 * exportExcel.js  — Visor de Movilidad AMVA
 */
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { EXPORT_SECTIONS, COLORS, numExport } from "./exportConfig";
import { MACROZONA_BY_ID } from "../config/geoLookup";

// ─── Color helpers ────────────────────────────────────────────────────────────
const hex2argb = (hex) =>
  "FF" + (hex || "#000000").replace("#", "").toUpperCase().padStart(6, "0");

const P = {
  headerDark:   hex2argb(COLORS.headerBg),
  primaryGreen: hex2argb(COLORS.primaryGreen),
  secGreen:     hex2argb(COLORS.secondaryGreen),
  blue:         hex2argb(COLORS.tertiaryBlue),
  orange:       hex2argb(COLORS.tertiaryOrange),
  pink:         hex2argb(COLORS.tertiaryPink),
  lightGreen:   hex2argb(COLORS.lightGreen),
  lightBlue:    hex2argb(COLORS.lightBlue),
  lightOrange:  hex2argb(COLORS.lightOrange),
  rowAlt:       hex2argb(COLORS.rowAlt),
  rowOdd:       hex2argb(COLORS.rowOdd),
  white:        "FFFFFFFF",
  grayText:     hex2argb(COLORS.grayText),
  darkText:     hex2argb(COLORS.darkText),
  borderColor:  hex2argb(COLORS.borderColor),
};

const COMPARE_ARGB = (COLORS.compareColors || []).map(hex2argb);

// ─── Style helpers ────────────────────────────────────────────────────────────
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

function style(cell, opts = {}) {
  const { bold, sz, bg, border, wrap, halign, valign, italic, color } = opts;

  let fontColor = P.darkText;
  if (color) {
    fontColor = color;
  } else if (bg && bg !== P.white) {
    if ([P.headerDark, P.primaryGreen, P.secGreen, P.blue, P.orange, P.pink].includes(bg)) {
      fontColor = P.white;
    }
  }

  cell.font = {
    name: "Calibri", size: sz || 11, bold: !!bold, italic: !!italic,
    color: { argb: fontColor },
  };

  if (bg) cell.fill = { type:"pattern", pattern:"solid", fgColor:{ argb: bg } };

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

function sectionTitle(cell, text, colorArgb = P.headerDark) {
  cell.value = text;
  cell.font      = { name:"Calibri", size:13, bold:true, color:{ argb: colorArgb } };
  cell.fill      = { type:"pattern", pattern:"solid", fgColor:{ argb: P.lightGreen } };
  cell.border    = { bottom:{ style:"medium", color:{ argb: P.primaryGreen } } };
  cell.alignment = { wrapText:false, vertical:"middle", horizontal:"left" };
}

function colHeader(cell, text, bgArgb = P.headerDark, sz = 11) {
  cell.value = text;
  style(cell, { bold:true, sz, bg: bgArgb, halign:"center", wrap:false, valign:"middle" });
}

function dataCell(cell, value, isAlt = false, opts = {}) {
  cell.value = value;
  style(cell, {
    sz: 10, bg: isAlt ? P.rowAlt : P.rowOdd, color: P.darkText,
    halign: typeof value === "number" ? "right" : "left",
    bold: opts.bold || false,
    wrap: opts.wrap !== undefined ? opts.wrap : false,
  });
}

function labelCell(cell, text, isAlt = false) {
  cell.value = text;
  style(cell, { bold:true, sz:10, bg: isAlt ? P.rowAlt : P.rowOdd, color: P.darkText, wrap:true });
}

function blankRow(ws, ri) { ws.getRow(ri).height = 6; }

function setWidths(ws, widths) {
  widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
}

// ─── Shared: build macrozone param rows from arrays ───────────────────────────
function buildMacroParams(ctx) {
  const { filters, origenes = [], destinos = [] } = ctx;
  const hasOD = origenes.length > 0 || destinos.length > 0;
  const rows  = [];

  const mzLabel = hasOD ? "Macrozona de residencia" : "Macrozona";
  const mzValue = filters.macrozona
    ? (MACROZONA_BY_ID[filters.macrozona]?.macrozona ?? `ID ${filters.macrozona}`)
    : "Todas";
  rows.push([mzLabel, mzValue]);

  origenes.forEach((id, i) => {
    const info  = MACROZONA_BY_ID[id];
    const label = i === 0 ? `Macrozona${origenes.length > 1 ? "s" : ""} de origen` : "";
    rows.push([label, info ? `${info.municipio} — ${info.macrozona}` : `ID ${id}`]);
  });

  destinos.forEach((id, i) => {
    const info  = MACROZONA_BY_ID[id];
    const label = i === 0 ? `Macrozona${destinos.length > 1 ? "s" : ""} de destino` : "";
    rows.push([label, info ? `${info.municipio} — ${info.macrozona}` : `ID ${id}`]);
  });

  return rows;
}

// ─── Cover sheet ──────────────────────────────────────────────────────────────
async function buildCoverSheet(wb, ctx, logo) {
  const ws = wb.addWorksheet("Portada");
  const { filters, compareMode, themeName, selectedValues } = ctx;
  const now = new Date().toLocaleString("es-CO", { dateStyle:"long", timeStyle:"short" });

  setWidths(ws, [4, 28, 55, 20]);

  for (let r = 1; r <= 5; r++) {
    for (let c = 1; c <= 4; c++) {
      const cell = ws.getCell(r, c);
      cell.fill = { type:"pattern", pattern:"solid", fgColor:{ argb: P.headerDark } };
      cell.border = {};
    }
    ws.getRow(r).height = 14;
  }
  ws.getRow(3).height = 28;

  const titleCell = ws.getCell("B3");
  titleCell.value = "Encuestas Origen - Destino 2025";
  titleCell.font  = { name:"Calibri", size:22, bold:true, color:{ argb: P.white } };
  titleCell.alignment = { horizontal:"left", vertical:"middle" };
  ws.mergeCells("B3:D3");

  const subCell = ws.getCell("B4");
  subCell.value = "Informe de Indicadores de Movilidad";
  subCell.font  = { name:"Calibri", size:12, italic:true, color:{ argb: P.lightGreen } };
  subCell.alignment = { horizontal:"left", vertical:"middle" };
  ws.mergeCells("B4:D4");

  if (logo) {
    try {
      const imgId = wb.addImage({ base64: logo.b64, extension: logo.ext });
      ws.addImage(imgId, { tl:{ col:3.1, row:0.2 }, ext:{ width:100, height:100 } });
    } catch (e) { console.warn("Logo Excel:", e); }
  }

  ws.getRow(6).height = 5;
  for (let c = 1; c <= 4; c++) {
    const cell = ws.getCell(6, c);
    cell.fill = { type:"pattern", pattern:"solid", fgColor:{ argb: P.secGreen } };
    cell.border = {};
  }
  ws.getRow(7).height = 8;

  const paramTitle = ws.getCell("B8");
  sectionTitle(paramTitle, "⚙  Parámetros del informe");
  ws.mergeCells("B8:D8");
  ws.getRow(8).height = 22;
  ws.getRow(9).height = 5;

  const macroRows = buildMacroParams(ctx);
  const params = [
    ["Fecha de generación", now],
    ["Municipio",           filters.municipio || "AMVA General"],
    ["Tipo de zona",        filters.zona || "Todos"],
    ...macroRows,
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
    style(kCell, { bold: !!k, sz:10, bg: isAlt ? P.lightGreen : P.rowOdd, color: P.headerDark });
    const vCell = ws.getCell(row, 3);
    vCell.value = v;
    style(vCell, { sz:10, bg: isAlt ? P.lightGreen : P.rowOdd, color: P.darkText });
  });

  const visibleSections = EXPORT_SECTIONS.filter(
    (s) => !(s.skipInCompareMode && compareMode) && !(s.skipWithODFilter && ctx.hasODFilter)
  );

  const tocStartRow = 10 + params.length + 3;
  ws.getRow(tocStartRow - 1).height = 8;

  const tocTitle = ws.getCell(tocStartRow, 2);
  sectionTitle(tocTitle, "📋  Contenido del informe");
  ws.mergeCells(`B${tocStartRow}:D${tocStartRow}`);
  ws.getRow(tocStartRow).height = 22;
  ws.getRow(tocStartRow + 1).height = 5;

  const tcHr = tocStartRow + 2;
  colHeader(ws.getCell(tcHr, 2), "# de Hoja", P.primaryGreen, 10);
  colHeader(ws.getCell(tcHr, 3), "Sección", P.primaryGreen, 10);
  ws.getRow(tcHr).height = 18;

  visibleSections.forEach((s, i) => {
    const r = tcHr + 1 + i;
    const isAlt = i % 2 === 0;
    ws.getRow(r).height = 16;
    const numCell = ws.getCell(r, 2);
    numCell.value = i + 3;
    style(numCell, { sz:10, bg: isAlt ? P.rowAlt : P.rowOdd, halign:"center", color: P.primaryGreen, bold:true });
    const nameCell = ws.getCell(r, 3);
    nameCell.value = s.sectionLabel;
    style(nameCell, { sz:10, bg: isAlt ? P.rowAlt : P.rowOdd });
  });

  ws.views = [{ showGridLines: false }];
}

// ─── Filters sheet ────────────────────────────────────────────────────────────
function buildFiltersSheet(wb, ctx) {
  const ws = wb.addWorksheet("Filtros Aplicados");
  const { filters, compareMode, themeName, selectedValues } = ctx;

  setWidths(ws, [2, 32, 58]);

  ws.getRow(1).height = 30;
  const titleCell = ws.getCell("B1");
  titleCell.value = "Filtros aplicados al informe";
  style(titleCell, { bold:true, sz:14, bg: P.headerDark, halign:"left", wrap:false, color: P.white });
  ws.mergeCells("B1:C1");

  ws.getRow(2).height = 5;
  ws.getRow(3).height = 20;
  colHeader(ws.getCell("B3"), "Parámetro", P.primaryGreen);
  colHeader(ws.getCell("C3"), "Valor",     P.primaryGreen);

  const macroRows = buildMacroParams(ctx);
  const rows = [
    ["Municipio",         filters.municipio || "AMVA General"],
    ["Tipo de zona",      filters.zona || "Todos"],
    ...macroRows,
    ["Modo de análisis",  compareMode ? "Comparar" : "Agrupar"],
    ["Variable de comp.", themeName || "N/A"],
    ["Valores comparados", compareMode ? (selectedValues || []).join(", ") : "N/A"],
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

// ─── Section sheet renderers ──────────────────────────────────────────────────
function renderKpiTable(ws, data, startRow) {
  let r = startRow;
  const { kpis } = data;
  const inCompare = kpis.some((k) => k.comparisons?.length > 0);

  if (!inCompare) {
    ws.getRow(r).height = 20;
    colHeader(ws.getCell(r, 2), "Indicador", P.headerDark);
    colHeader(ws.getCell(r, 3), "Valor",     P.headerDark);
    r++;
    kpis.forEach((kpi, i) => {
      ws.getRow(r).height = 18;
      labelCell(ws.getCell(r, 2), kpi.label, i % 2 === 0);
      const vc = ws.getCell(r, 3);
      vc.value = kpi.value;
      style(vc, { sz:11, bg: i % 2 === 0 ? P.rowAlt : P.rowOdd, halign:"right", bold:true, color: P.darkText });
      r++;
    });
  } else {
    const allDets = [...new Set(kpis.flatMap((k) => k.comparisons.map((c) => c.detalle)))];
    ws.getRow(r).height = 20;
    colHeader(ws.getCell(r, 2), "Indicador", P.headerDark);
    allDets.forEach((d, ci) => {
      colHeader(ws.getCell(r, 3 + ci), d, COMPARE_ARGB[ci % COMPARE_ARGB.length]);
    });
    r++;
    kpis.forEach((kpi, i) => {
      ws.getRow(r).height = 18;
      labelCell(ws.getCell(r, 2), kpi.label, i % 2 === 0);
      allDets.forEach((d, ci) => {
        const found = kpi.comparisons.find((c) => c.detalle === d);
        const vc = ws.getCell(r, 3 + ci);
        vc.value = found?.value ?? "--";
        style(vc, { sz:10, bg: i % 2 === 0 ? P.rowAlt : P.rowOdd, halign:"right", color: P.darkText });
      });
      r++;
    });
  }
  return r;
}

function renderBarChart(ws, data, startRow, section) {
  let r = startRow;
  const { categories = [], values = [], series = [], compareMode, unit } = data;
  const xAxisLabel = section?.xAxisLabel || "";
  const yAxisLabel = section?.yAxisLabel || "";

  if (!compareMode) {
    ws.getRow(r).height = 20;
    colHeader(ws.getCell(r, 2), xAxisLabel || "Categoría", P.headerDark);
    colHeader(ws.getCell(r, 3), yAxisLabel || "Valor",     P.primaryGreen);
    r++;
    categories.forEach((cat, i) => {
      ws.getRow(r).height = 17;
      labelCell(ws.getCell(r, 2), cat, i % 2 === 0);
      const vc = ws.getCell(r, 3);
      vc.value = numExport(values[i] ?? 0, unit);
      style(vc, { sz:10, bg: i % 2 === 0 ? P.rowAlt : P.rowOdd, halign:"right", color: P.darkText });
      r++;
    });
  } else {
    ws.getRow(r).height = 20;
    colHeader(ws.getCell(r, 2), "Categoría", P.headerDark);
    (series || []).forEach((s, ci) => {
      const argb = hex2argb(s.color) || COMPARE_ARGB[ci % COMPARE_ARGB.length];
      colHeader(ws.getCell(r, 3 + ci), `${s.name}${unit ? " (" + unit + ")" : ""}`, argb);
    });
    r++;
    categories.forEach((cat, i) => {
      ws.getRow(r).height = 17;
      labelCell(ws.getCell(r, 2), cat, i % 2 === 0);
      (series || []).forEach((s, ci) => {
        const vc = ws.getCell(r, 3 + ci);
        vc.value = numExport(s.values[i] ?? 0, unit);
        style(vc, { sz:10, bg: i % 2 === 0 ? P.rowAlt : P.rowOdd, halign:"right", color: P.darkText });
      });
      r++;
    });
  }
  return r;
}

function renderTimeTable(ws, data, startRow) {
  let r = startRow;
  const { timeAxis, series } = data;
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
      vc.value = numExport(s.values[i] ?? 0);
      style(vc, { sz:10, bg: i % 2 === 0 ? P.rowAlt : P.rowOdd, halign:"right", color: P.darkText });
    });
    r++;
  });
  return r;
}

function renderOdTable(ws, data, startRow) {
  let r = startRow;

  const renderHalf = (rows, title, bgArgb) => {
    ws.getRow(r).height = 22;
    const titleCell = ws.getCell(r, 2);
    titleCell.value = title;
    style(titleCell, { bold:true, sz:11, bg: bgArgb, color: P.white, wrap:false });
    ws.mergeCells(r, 2, r, 6);
    r++;
    ws.getRow(r).height = 5;
    r++;

    ws.getRow(r).height = 20;
    colHeader(ws.getCell(r, 2), "Municipio",   bgArgb);
    colHeader(ws.getCell(r, 3), "Macrozona",   bgArgb);
    colHeader(ws.getCell(r, 4), "Viajes",      bgArgb);
    colHeader(ws.getCell(r, 5), "% del total", bgArgb);
    r++;

    if (!rows.length) {
      const nc = ws.getCell(r, 2);
      nc.value = "Sin datos disponibles.";
      style(nc, { italic:true, sz:10, bg: P.rowOdd });
      ws.mergeCells(r, 2, r, 5);
      r++;
      return;
    }

    rows.forEach((row, i) => {
      const isAlt = i % 2 === 0;
      ws.getRow(r).height = 17;
      labelCell(ws.getCell(r, 2), row.municipio,  isAlt);
      dataCell(ws.getCell(r, 3),  row.macrozona,  isAlt);
      const vc = ws.getCell(r, 4);
      vc.value = numExport(row.trips);
      style(vc, { sz:10, bg: isAlt ? P.rowAlt : P.rowOdd, halign:"right", color: P.darkText });
      const pc = ws.getCell(r, 5);
      pc.value = numExport(row.pct, "%");
      style(pc, { sz:10, bg: isAlt ? P.rowAlt : P.rowOdd, halign:"right", color: P.darkText });
      r++;
    });

    ws.getRow(r).height = 8;
    r++;
  };

  renderHalf(data.origin || [],      "▶  Macrozonas de Origen",  P.primaryGreen);
  renderHalf(data.destination || [], "▶  Macrozonas de Destino", P.orange);
  return r;
}

function buildSectionSheet(wb, section, ctx) {
  const ws = wb.addWorksheet(section.excelSheetName);
  const data = section.extractNormalizedData(ctx);

  setWidths(ws, [2, 40, 40, 20, 20, ...Array(15).fill(18)]);

  ws.getRow(1).height = 28;
  const titleCell = ws.getCell("B1");
  titleCell.value = section.sectionLabel;
  style(titleCell, {
    bold:true, sz:13, bg: P.headerDark, halign:"left", wrap:false, color: P.white,
    border: MEDIUM_BORDER(P.secGreen),
  });
  ws.mergeCells("B1:V1");

  ws.getRow(2).height = 8;
  for (let c = 2; c <= 22; c++) {
    const sep = ws.getCell(2, c);
    sep.fill = { type:"pattern", pattern:"solid", fgColor:{ argb: P.secGreen } };
    sep.border = {};
  }

  blankRow(ws, 3);
  let nextRow = 4;

  if (!data) {
    ws.getCell("B4").value = "Sin datos disponibles para los filtros seleccionados.";
    style(ws.getCell("B4"), { italic:true, color: P.grayText, sz:10 });
    return;
  }

  switch (data.type) {
    case "kpi_table":  nextRow = renderKpiTable(ws, data, nextRow);           break;
    case "bar_chart":  nextRow = renderBarChart(ws, data, nextRow, section);  break;
    case "time_table": nextRow = renderTimeTable(ws, data, nextRow);          break;
    case "od_table":   nextRow = renderOdTable(ws, data, nextRow);            break;
    default:
      ws.getCell("B4").value = "Tipo de sección no reconocido.";
  }

  ws.getRow(nextRow).height = 8;
  ws.views = [{ state:"frozen", ySplit:3, topLeftCell:"A4", showGridLines:false }];
}

// ─── Logo loader ──────────────────────────────────────────────────────────────
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
export async function generateExcelReport(ctx) {
  const wb = new ExcelJS.Workbook();
  wb.creator  = "Visor AMVA";
  wb.company  = "Área Metropolitana del Valle de Aburrá";
  wb.created  = new Date();
  wb.modified = new Date();

  const logo = await loadLogo(ctx.logoUrl);
  await buildCoverSheet(wb, ctx, logo);
  buildFiltersSheet(wb, ctx);

  const visibleSections = EXPORT_SECTIONS.filter(
    (s) => !(s.skipInCompareMode && ctx.compareMode) && !(s.skipWithODFilter && ctx.hasODFilter)
  );

  visibleSections.forEach((section) => buildSectionSheet(wb, section, ctx));

  const buffer   = await wb.xlsx.writeBuffer();
  const blob     = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const fileName = `Informe_Movilidad_AMVA_${new Date().toISOString().slice(0, 10)}.xlsx`;
  saveAs(blob, fileName);
}