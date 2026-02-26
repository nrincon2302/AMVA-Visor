/**
 * exportExcel.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Generador de Excel con formato para el visor de movilidad AMVA.
 * Usa SheetJS (xlsx) — npm install xlsx
 *
 * Para agregar/quitar indicadores: edita SOLO exportConfig.js → EXPORT_SECTIONS.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import * as XLSX from "xlsx";
import { EXPORT_SECTIONS, COLORS, HOURLY_SERIES_META } from "./exportConfig";

// ─── Helpers de estilo ────────────────────────────────────────────────────────
// NOTA: xlsx community edition no soporta estilos nativamente.
// Usamos xlsx-js-style (npm install xlsx-js-style) que es compatible.
// Si no está disponible, cae al xlsx plano (sin colores pero con datos completos).

let XLSXStyled;
try {
  XLSXStyled = require("xlsx-js-style");
} catch {
  XLSXStyled = null;
}
const WB = XLSXStyled || XLSX;

/** Convierte hex "#RRGGBB" → "RRGGBB" (para xlsx-js-style) */
const hex2argb = (hex) => hex.replace("#", "").toUpperCase().padStart(6, "0");

const mkStyle = (overrides = {}) => ({
  font:      { name: "Calibri", sz: 11, ...overrides.font },
  fill:      overrides.fill || { patternType: "none" },
  border: {
    top:    { style: "thin", color: { rgb: "D0D0D0" } },
    bottom: { style: "thin", color: { rgb: "D0D0D0" } },
    left:   { style: "thin", color: { rgb: "D0D0D0" } },
    right:  { style: "thin", color: { rgb: "D0D0D0" } },
    ...overrides.border,
  },
  alignment: { wrapText: true, vertical: "center", ...overrides.alignment },
});

const headerStyle = (bgHex = COLORS.headerBg) => mkStyle({
  font:  { name: "Calibri", sz: 12, bold: true, color: { rgb: "FFFFFF" } },
  fill:  { patternType: "solid", fgColor: { rgb: hex2argb(bgHex) } },
  alignment: { horizontal: "center", vertical: "center", wrapText: false },
});

const subHeaderStyle = (bgHex = COLORS.primaryGreen) => mkStyle({
  font:  { name: "Calibri", sz: 11, bold: true, color: { rgb: "FFFFFF" } },
  fill:  { patternType: "solid", fgColor: { rgb: hex2argb(bgHex) } },
  alignment: { horizontal: "center", vertical: "center" },
});

const titleCellStyle = () => mkStyle({
  font:  { name: "Calibri", sz: 13, bold: true, color: { rgb: hex2argb(COLORS.headerBg) } },
  fill:  { patternType: "solid", fgColor: { rgb: hex2argb(COLORS.lightGreen) } },
  border: {
    bottom: { style: "medium", color: { rgb: hex2argb(COLORS.primaryGreen) } },
    top: { style: "none" }, left: { style: "none" }, right: { style: "none" },
  },
  alignment: { horizontal: "left", vertical: "center" },
});

const labelStyle = () => mkStyle({
  font: { name: "Calibri", sz: 11, bold: true, color: { rgb: "374151" } },
  fill: { patternType: "solid", fgColor: { rgb: "F9FAFB" } },
  alignment: { horizontal: "left" },
});

const valueStyle = () => mkStyle({
  font: { name: "Calibri", sz: 11 },
  alignment: { horizontal: "right" },
});

const altRowStyle = () => mkStyle({
  fill: { patternType: "solid", fgColor: { rgb: hex2argb(COLORS.rowAlt) } },
});

/** Crea celda con estilo compatible con xlsx-js-style */
const sc = (value, style) =>
  XLSXStyled ? { v: value ?? "", s: style } : value ?? "";

// ─── Utilidades de hoja ───────────────────────────────────────────────────────
function colLetter(n) {
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function aoa2ws(aoa) {
  return XLSX.utils.aoa_to_sheet(aoa);
}

function setColWidths(ws, widths) {
  ws["!cols"] = widths.map((w) => ({ wch: w }));
}

function mergeRange(ws, r1c1, r1c2, r2c1, r2c2) {
  ws["!merges"] = ws["!merges"] || [];
  ws["!merges"].push({
    s: { r: r1c1, c: r1c2 },
    e: { r: r2c1, c: r2c2 },
  });
}

// ─── Hoja: Portada ────────────────────────────────────────────────────────────
function buildCoverSheet(ctx) {
  const { filters, compareMode, themeName, selectedValues } = ctx;
  const now = new Date().toLocaleString("es-CO", {
    dateStyle: "long", timeStyle: "short",
  });

  const rows = [
    [sc("VISOR DE MOVILIDAD AMVA", headerStyle())],
    [sc("Informe de Indicadores de Movilidad", subHeaderStyle(COLORS.primaryGreen))],
    [""],
    [sc("Generado el:", labelStyle()), sc(now, valueStyle())],
    [sc("Municipio:", labelStyle()), sc(filters.municipio || "AMVA General", valueStyle())],
    [sc("Tipo de zona:", labelStyle()), sc(filters.zona || "Todos", valueStyle())],
    [sc("Macrozona:", labelStyle()), sc(filters.macrozona ? `ID ${filters.macrozona}` : "Todas", valueStyle())],
    [sc("Modo:", labelStyle()), sc(compareMode ? "Comparar" : "Agrupar", valueStyle())],
    [sc("Variable de comparación:", labelStyle()), sc(themeName || "N/A", valueStyle())],
    ...(compareMode && selectedValues?.length
      ? [[sc("Valores seleccionados:", labelStyle()), sc(selectedValues.join(", "), valueStyle())]]
      : []),
    [""],
    [sc("Secciones incluidas en este informe:", titleCellStyle())],
    ...EXPORT_SECTIONS.map((s, i) =>
      [sc(`${i + 1}.`, valueStyle()), sc(s.sectionLabel, labelStyle())]
    ),
  ];

  const ws = aoa2ws(rows);
  setColWidths(ws, [28, 60]);

  // Título principal: merge A1 a B1, A2 a B2
  mergeRange(ws, 0, 0, 0, 1);
  mergeRange(ws, 1, 0, 1, 1);

  ws["!rows"] = [{ hpt: 36 }, { hpt: 28 }];
  return ws;
}

// ─── Hoja: Filtros activos ────────────────────────────────────────────────────
function buildFiltersSheet(ctx) {
  const { filters, compareMode, themeName, selectedValues } = ctx;

  const filterRows = [
    ["Parámetro", "Valor"],
    ["Municipio origen", filters.municipio || "AMVA General"],
    ["Tipo de zona", filters.zona || "Todos"],
    ["Macrozona", filters.macrozona ? `ID ${filters.macrozona}` : "Todas"],
    ["Modo de visualización", compareMode ? "Comparar" : "Agrupar"],
    ["Variable de comparación", themeName || "N/A"],
    ["Valores comparados", compareMode ? (selectedValues || []).join(", ") : "N/A"],
  ];

  // Añadir filtros temáticos adicionales si existen
  const tf = filters.temasFiltros || {};
  Object.entries(tf).forEach(([tema, vals]) => {
    if (vals?.length) filterRows.push([`Filtro temático: ${tema}`, vals.join(", ")]);
  });

  const wsRows = filterRows.map((row, i) => {
    if (i === 0) return row.map((v) => sc(v, headerStyle()));
    return [sc(row[0], labelStyle()), sc(row[1], i % 2 === 0 ? altRowStyle() : valueStyle())];
  });

  const ws = aoa2ws(wsRows);
  setColWidths(ws, [32, 55]);
  return ws;
}

// ─── Renderers por tipo ───────────────────────────────────────────────────────

function renderKpiTable(data, ws_rows) {
  const { kpis } = data;
  const inCompare = kpis.some((k) => k.comparisons?.length > 0);

  if (!inCompare) {
    ws_rows.push([sc("Indicador", headerStyle()), sc("Valor", headerStyle())]);
    kpis.forEach((k, i) => {
      ws_rows.push([
        sc(k.label, i % 2 === 0 ? labelStyle() : mkStyle()),
        sc(k.value, i % 2 === 0 ? altRowStyle() : valueStyle()),
      ]);
    });
  } else {
    const allDetalles = [...new Set(kpis.flatMap((k) => k.comparisons.map((c) => c.detalle)))];
    ws_rows.push([
      sc("Indicador", headerStyle()),
      ...allDetalles.map((d) => sc(d, headerStyle(COLORS.tertiaryBlue))),
    ]);
    kpis.forEach((k, i) => {
      ws_rows.push([
        sc(k.label, i % 2 === 0 ? labelStyle() : mkStyle()),
        ...allDetalles.map((d) => {
          const found = k.comparisons.find((c) => c.detalle === d);
          return sc(found?.value ?? "--", i % 2 === 0 ? altRowStyle() : valueStyle());
        }),
      ]);
    });
  }
}

function renderBarChart(data, ws_rows) {
  if (!data.compareMode) {
    ws_rows.push([sc("Categoría", headerStyle()), sc(`Valor ${data.unit ? `(${data.unit})` : ""}`, headerStyle())]);
    data.categories.forEach((cat, i) => {
      ws_rows.push([
        sc(cat, i % 2 === 0 ? labelStyle() : mkStyle()),
        sc(data.values[i] ?? 0, i % 2 === 0 ? altRowStyle() : valueStyle()),
      ]);
    });
  } else {
    // Encabezado: Categoría + una columna por serie de comparación
    ws_rows.push([
      sc("Categoría", headerStyle()),
      ...(data.series || []).map((s) => sc(`${s.name} ${data.unit ? `(${data.unit})` : ""}`, headerStyle(COLORS.tertiaryBlue))),
    ]);
    data.categories.forEach((cat, i) => {
      ws_rows.push([
        sc(cat, i % 2 === 0 ? labelStyle() : mkStyle()),
        ...(data.series || []).map((s) => sc(s.values[i] ?? 0, i % 2 === 0 ? altRowStyle() : valueStyle())),
      ]);
    });
  }
}

function renderTimeTable(data, ws_rows, ws, startRow) {
  const { timeAxis, series, compareMode } = data;

  if (!compareMode) {
    // Modo agrupar: Hora | Serie1 | Serie2 | Serie3 | Serie4
    ws_rows.push([
      sc("Hora", headerStyle()),
      ...series.map((s) => sc(s.name, headerStyle(s.color))),
    ]);
    timeAxis.forEach((hour, i) => {
      ws_rows.push([
        sc(hour, i % 2 === 0 ? labelStyle() : mkStyle()),
        ...series.map((s) => sc(s.values[i] ?? 0, i % 2 === 0 ? altRowStyle() : valueStyle())),
      ]);
    });
  } else {
    // Modo comparar: encabezados agrupados
    // Fila 1: Hora | SerieA (N celdas merge) | SerieB (N celdas merge) | ...
    // Fila 2:        Detalle1 Detalle2 ... | Detalle1 Detalle2 ...
    const detalles = series[0]?.subSeries?.map((ss) => ss.detalle) || [];
    const nDet = detalles.length;

    // Fila de serie (agrupada)
    const row1 = [sc("Hora", headerStyle())];
    series.forEach((s) => {
      row1.push(sc(s.name, headerStyle(s.color)));
      for (let d = 1; d < nDet; d++) row1.push(sc("", headerStyle(s.color)));
    });
    ws_rows.push(row1);

    // Fila de subencabezados
    const row2 = [sc("", labelStyle())];
    series.forEach(() => {
      detalles.forEach((d) => row2.push(sc(d, subHeaderStyle(COLORS.tertiaryBlue))));
    });
    ws_rows.push(row2);

    // Registrar merges para los headers de serie
    const baseRow = startRow; // 0-indexed desde el inicio de la hoja
    series.forEach((_, si) => {
      const colStart = 1 + si * nDet;
      if (nDet > 1) {
        ws["!merges"] = ws["!merges"] || [];
        ws["!merges"].push({
          s: { r: baseRow, c: colStart },
          e: { r: baseRow, c: colStart + nDet - 1 },
        });
      }
    });

    // Filas de datos
    timeAxis.forEach((hour, i) => {
      const row = [sc(hour, i % 2 === 0 ? labelStyle() : mkStyle())];
      series.forEach((s) => {
        (s.subSeries || []).forEach((ss) => {
          row.push(sc(ss.values[i] ?? 0, i % 2 === 0 ? altRowStyle() : valueStyle()));
        });
      });
      ws_rows.push(row);
    });
  }
}

// ─── Construir hoja por sección ───────────────────────────────────────────────
function buildSectionSheet(section, ctx) {
  const data = section.extractNormalizedData(ctx);
  if (!data) return aoa2ws([["Sin datos disponibles"]]);

  const ws_rows = [];
  const ws = { "!merges": [] };

  // Título de la sección
  ws_rows.push([sc(section.sectionLabel, titleCellStyle())]);
  ws_rows.push([sc("", mkStyle())]);

  switch (data.type) {
    case "kpi_table":
      renderKpiTable(data, ws_rows);
      break;
    case "bar_chart":
      renderBarChart(data, ws_rows);
      break;
    case "time_table":
      renderTimeTable(data, ws_rows, ws, ws_rows.length);
      break;
    default:
      ws_rows.push(["Tipo de sección desconocido"]);
  }

  // Convertir a worksheet
  const rawSheet = aoa2ws(ws_rows);
  // Copiar merges generados durante renderTimeTable
  if (ws["!merges"]?.length) {
    rawSheet["!merges"] = [...(rawSheet["!merges"] || []), ...ws["!merges"]];
  }

  // Ajustar anchos de columna automáticamente
  const maxCols = ws_rows.reduce((m, r) => Math.max(m, r.length), 0);
  setColWidths(rawSheet, [
    32, // primera columna (categorías)
    ...Array(Math.max(0, maxCols - 1)).fill(18),
  ]);

  return rawSheet;
}

// ─── API pública ──────────────────────────────────────────────────────────────
/**
 * generateExcelReport(ctx)
 * ctx = { filters, compareMode, selectedValues, themeName,
 *         indicadoresData, analysisViewsData, mobilityPatternsData }
 */
export function generateExcelReport(ctx) {
  const wb = WB.utils.book_new();
  wb.Props = {
    Title:   "Informe de Movilidad AMVA",
    Author:  "Visor AMVA",
    Company: "AMVA",
    CreatedDate: new Date(),
  };

  // Portada
  WB.utils.book_append_sheet(wb, buildCoverSheet(ctx), "Portada");

  // Filtros
  WB.utils.book_append_sheet(wb, buildFiltersSheet(ctx), "Filtros Aplicados");

  // Una hoja por sección
  EXPORT_SECTIONS.forEach((section) => {
    const ws = buildSectionSheet(section, ctx);
    WB.utils.book_append_sheet(wb, ws, section.excelSheetName);
  });

  // Descargar
  const fileName = `Informe_Movilidad_AMVA_${new Date().toISOString().slice(0,10)}.xlsx`;
  WB.writeFile(wb, fileName);
}