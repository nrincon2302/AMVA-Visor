/**
 * exportConfig.js
 * ─────────────────────────────────────────────────────────────────────────────
 * ÚNICA fuente de verdad para los exportables (PDF y Excel).
 *
 * TODOS los colores se centralizan aquí importándolos desde constants.js.
 * exportPDF.js y exportExcel.js NO definen colores propios.
 *
 * ┌─ PARA AGREGAR UNA NUEVA SECCIÓN ───────────────────────────────────────┐
 * │  1. Añade una entrada al array EXPORT_SECTIONS (ver ejemplos abajo).   │
 * │  2. Implementa su extractNormalizedData que devuelve un NormalizedData  │
 * │     del tipo correcto (ver tipos: kpi_table, bar_chart, time_table,    │
 * │     od_table).                                                          │
 * │  El PDF y Excel la incluirán automáticamente.                           │
 * └────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─ TIPOS DE SECCIÓN (pdfType) ────────────────────────────────────────────┐
 * │  'kpi_table'  → cuadrícula de tarjetas KPI (etiqueta + valor)           │
 * │  'bar_chart'  → barras horizontales (una o varias series en comparar)   │
 * │  'time_table' → tabla temporal (horas × series, con sub-series)         │
 * │  'od_table'   → tablas de macrozonas origen / destino                   │
 * └────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─ FLAGS ESPECIALES ──────────────────────────────────────────────────────┐
 * │  skipInCompareMode: true → la sección se omite en modo COMPARAR        │
 * └────────────────────────────────────────────────────────────────────────┘
 */

import {
  PRIMARY_GREEN,
  SECONDARY_GREEN,
  TERTIARY_BLUE,
  TERTIARY_ORANGE,
  TERTIARY_PINK,
  COMPARE_COLORS,
  EXPORT_HEADER_BG,
  EXPORT_ROW_ALT,
  EXPORT_ROW_ODD,
  EXPORT_LIGHT_GREEN,
  EXPORT_LIGHT_BLUE,
  EXPORT_LIGHT_ORANGE,
  EXPORT_DARK_TEXT,
  EXPORT_GRAY_TEXT,
  EXPORT_BORDER_COLOR,
} from "../config/constants";

// ═══════════════════════════════════════════════════════════════════════════
//   PALETA CENTRAL — única fuente de colores para PDF y Excel
// ═══════════════════════════════════════════════════════════════════════════
export const COLORS = {
  primaryGreen:   PRIMARY_GREEN,
  secondaryGreen: SECONDARY_GREEN,
  tertiaryBlue:   TERTIARY_BLUE,
  tertiaryOrange: TERTIARY_ORANGE,
  tertiaryPink:   TERTIARY_PINK,
  lightGreen:     EXPORT_LIGHT_GREEN,
  lightBlue:      EXPORT_LIGHT_BLUE,
  lightOrange:    EXPORT_LIGHT_ORANGE,
  headerBg:       EXPORT_HEADER_BG,
  rowAlt:         EXPORT_ROW_ALT,
  rowOdd:         EXPORT_ROW_ODD,
  darkText:       EXPORT_DARK_TEXT,
  grayText:       EXPORT_GRAY_TEXT,
  borderColor:    EXPORT_BORDER_COLOR,
  compareColors:  COMPARE_COLORS,
};

// ═══════════════════════════════════════════════════════════════════════════
//   FORMATO NUMÉRICO COMPARTIDO (PDF + Excel)
//   Enteros: sin decimales. Decimales: máx 2 cifras. Locale es-CO.
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Formatea un número al estilo es-CO (. miles, , decimal, máx 2 dec).
 * Para celdas de string (PDF o texto en Excel).
 * @param {number} v   – valor numérico
 * @param {string} unit – "" | "%" | "min"
 */
export function fmtExport(v, unit = "") {
  if (typeof v !== "number" || !Number.isFinite(v)) return String(v ?? "--");
  const rounded = parseFloat(v.toFixed(2));
  const str = rounded.toLocaleString("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return str + (unit === "%" ? " %" : unit === "min" ? " min" : "");
}

/**
 * Devuelve el número listo para celda Excel (valor real, sin unidad).
 * Excel formatea con su propio número de formato.
 */
export function numExport(v, unit = "") {
  if (typeof v !== "number" || !Number.isFinite(v)) return 0;
  if (unit === "%" || unit === "min") return parseFloat(v.toFixed(2));
  return Math.round(v);
}

// ── Helpers internos ─────────────────────────────────────────────────────────
const scaleIfPct = (v, unit) =>
  unit === "%" && typeof v === "number" && v > 0 && v <= 1 ? +(v * 100).toFixed(2) : +(v ?? 0);

function fmtKpi(value, unit) {
  if (typeof value !== "number") return "--";
  if (unit === "%") return fmtExport(value * 100, "%");
  if (unit === "min") return fmtExport(value, "min");
  return fmtExport(Math.round(value));
}

function buildBarSection({ simpleData, rawIndicator, compareMode, selectedValues, unit }) {
  if (!compareMode) {
    const data = simpleData || [];
    return {
      type: "bar_chart", compareMode: false, unit,
      categories: data.map((d) => d.label),
      values: data.map((d) => +(d.value ?? 0)),
    };
  }
  if (rawIndicator?.tipo === "comparativo_agrupado") {
    const selected = selectedValues || [];
    return {
      type: "bar_chart", compareMode: true, unit,
      categories: rawIndicator.grupos.map((g) => g.grupo),
      series: selected.map((val, i) => ({
        name: String(val),
        color: COLORS.compareColors[i % COLORS.compareColors.length],
        values: rawIndicator.grupos.map((g) => {
          const found = g.comparativo?.find((c) => String(c.detalle) === String(val));
          return scaleIfPct(found?.value ?? 0, unit);
        }),
      })),
    };
  }
  return buildBarSection({ simpleData, compareMode: false, unit });
}

function buildMultiIdBarSection({ ids, labels, indicadoresData, compareMode, selectedValues, unit }) {
  if (!compareMode) {
    return {
      type: "bar_chart", compareMode: false, unit,
      categories: labels,
      values: ids.map((id) => scaleIfPct(indicadoresData?.[id]?.value, unit)),
    };
  }
  const selected = selectedValues || [];
  return {
    type: "bar_chart", compareMode: true, unit,
    categories: labels,
    series: selected.map((val, i) => ({
      name: String(val),
      color: COLORS.compareColors[i % COLORS.compareColors.length],
      values: ids.map((id) => {
        const ind = indicadoresData?.[id];
        if (ind?.tipo !== "comparativo_simple") return 0;
        const found = ind.comparativo?.find((c) => String(c.detalle) === String(val));
        return scaleIfPct(found?.value, unit);
      }),
    })),
  };
}

function buildKpiSection({ ids, unitMap, indicadoresData, compareMode }) {
  return {
    type: "kpi_table",
    kpis: ids.map((id) => {
      const ind = indicadoresData?.[id];
      const unit = unitMap[id] || "";
      const label = ind?.nombre || `Indicador ${id}`;
      if (!ind) return { label, value: "--", comparisons: [] };
      if (!compareMode || ind.tipo === "simple")
        return { label, value: fmtKpi(ind.value, unit), comparisons: [] };
      if (ind.tipo === "comparativo_simple")
        return {
          label,
          value: fmtKpi(ind.comparativo?.[0]?.value, unit),
          comparisons: (ind.comparativo || []).map((c) => ({
            detalle: String(c.detalle), value: fmtKpi(c.value, unit),
          })),
        };
      return { label, value: "--", comparisons: [] };
    }),
  };
}

// Series horarias (shared entre PDF y Excel)
export const HOURLY_SERIES_META = [
  { key: "informal",     name: "Transporte Informal",  color: COLORS.secondaryGreen },
  { key: "public",       name: "Transporte Público",   color: COLORS.tertiaryBlue   },
  { key: "private",      name: "Transporte Privado",   color: COLORS.tertiaryOrange },
  { key: "nonMotorized", name: "No Motorizado",        color: COLORS.tertiaryPink   },
];

// ═══════════════════════════════════════════════════════════════════════════
//   EXPORT_SECTIONS  ← edita aquí para agregar/quitar/reordenar secciones
// ═══════════════════════════════════════════════════════════════════════════
export const EXPORT_SECTIONS = [

  /* ── 1. KPIs Generales ── */
  {
    key:            "kpis_general",
    sectionLabel:   "Estadísticas Generales",
    excelSheetName: "KPIs Generales",
    pdfType:        "kpi_table",
    extractNormalizedData: (ctx) =>
      buildKpiSection({
        ids: [1,2,3,4,5,6,7,8],
        unitMap: { 2: "%", 3: "min" },
        indicadoresData: ctx.indicadoresData,
        compareMode: ctx.compareMode,
        selectedValues: ctx.selectedValues,
      }),
  },

  /* ── 2. KPIs Motorización ── */
  {
    key:            "kpis_motor",
    sectionLabel:   "Indicadores de Motorización",
    excelSheetName: "KPIs Motorización",
    pdfType:        "kpi_table",
    extractNormalizedData: (ctx) =>
      buildKpiSection({
        ids: [9,10,11,12,13,14],
        unitMap: { 11: "%" },
        indicadoresData: ctx.indicadoresData,
        compareMode: ctx.compareMode,
        selectedValues: ctx.selectedValues,
      }),
  },

  /* ── 3. Macrozonas Origen–Destino (solo modo AGRUPAR) ── */
  {
    key:             "macrozones",
    sectionLabel:    "Distribución Geográfica (Origen – Destino)",
    excelSheetName:  "Macrozonas OD",
    pdfType:         "od_table",
    skipInCompareMode: true,
    extractNormalizedData: (ctx) => {
      if (!ctx.macrozoneData) return null;
      const { origin = [], destination = [] } = ctx.macrozoneData;
      const totalO = origin.reduce((s, r) => s + r.trips, 0) || 1;
      const totalD = destination.reduce((s, r) => s + r.trips, 0) || 1;
      return {
        type: "od_table",
        origin:      origin.map((r) => ({ ...r, pct: (r.trips / totalO) * 100 })),
        destination: destination.map((r) => ({ ...r, pct: (r.trips / totalD) * 100 })),
      };
    },
  },

  /* ── 4. Distribución horaria (solo modo AGRUPAR) ── */
  {
    key:             "hourly",
    sectionLabel:    "Distribución de Viajes por Hora de Inicio",
    excelSheetName:  "Distribución Horaria",
    pdfType:         "time_table",
    skipInCompareMode: true,
    extractNormalizedData: ({ mobilityPatternsData }) => {
      const data = mobilityPatternsData?.hourlyModeData || [];
      return {
        type: "time_table", compareMode: false,
        timeAxis: data.map((d) => d.hour),
        series: HOURLY_SERIES_META.map((s) => ({
          ...s, values: data.map((d) => d[s.key] || 0),
        })),
      };
    },
  },

  /* ── 5. Duración del viaje ── */
  {
    key:            "duration",
    sectionLabel:   "Distribución de Viajes según Duración",
    excelSheetName: "Duración de Viajes",
    pdfType:        "bar_chart",
    xAxisLabel:     "Duración (minutos)",
    yAxisLabel:     "% de viajes",
    extractNormalizedData: (ctx) =>
      buildBarSection({
        simpleData: ctx.mobilityPatternsData?.durationHistogramData,
        rawIndicator: ctx.indicadoresData?.[20],
        compareMode: ctx.compareMode, selectedValues: ctx.selectedValues, unit: "%",
      }),
  },

  /* ── 6. Frecuencia del viaje ── */
  {
    key:            "frequency",
    sectionLabel:   "Frecuencia del Viaje",
    excelSheetName: "Frecuencia de Viajes",
    pdfType:        "bar_chart",
    xAxisLabel:     "Frecuencia",
    yAxisLabel:     "% de viajes",
    extractNormalizedData: (ctx) =>
      buildBarSection({
        simpleData: ctx.mobilityPatternsData?.tripFrequencyData,
        rawIndicator: ctx.indicadoresData?.[21],
        compareMode: ctx.compareMode, selectedValues: ctx.selectedValues, unit: "%",
      }),
  },

  /* ── 7. Viajes por estrato ── */
  {
    key:            "by_strato",
    sectionLabel:   "Viajes Diarios según Estrato Socioeconómico",
    excelSheetName: "Viajes por Estrato",
    pdfType:        "bar_chart",
    xAxisLabel:     "Estrato socioeconómico",
    yAxisLabel:     "% de viajes",
    extractNormalizedData: (ctx) =>
      buildBarSection({
        simpleData: ctx.mobilityPatternsData?.tripsByEstratoData,
        rawIndicator: ctx.indicadoresData?.[22],
        compareMode: ctx.compareMode, selectedValues: ctx.selectedValues, unit: "%",
      }),
  },

  /* ── 8. Tiempo promedio por modo ── */
  {
    key:            "duration_by_mode",
    sectionLabel:   "Tiempo Promedio de Viaje por Modo de Transporte",
    excelSheetName: "Tiempo por Modo",
    pdfType:        "bar_chart",
    xAxisLabel:     "Modo de transporte",
    yAxisLabel:     "Tiempo promedio (min)",
    extractNormalizedData: (ctx) =>
      buildMultiIdBarSection({
        ids: [23,24,25,26],
        labels: ["Transporte público","Transporte privado","Transporte informal","No motorizado"],
        indicadoresData: ctx.indicadoresData,
        compareMode: ctx.compareMode, selectedValues: ctx.selectedValues, unit: "min",
      }),
  },

  /* ── 9. Modo principal ── */
  {
    key:            "mode",
    sectionLabel:   "Modo Principal de Transporte",
    excelSheetName: "Modo Principal",
    pdfType:        "bar_chart",
    xAxisLabel:     "Modo de transporte",
    yAxisLabel:     "% de viajes",
    extractNormalizedData: (ctx) =>
      buildBarSection({
        simpleData: ctx.analysisViewsData?.modeData,
        rawIndicator: ctx.indicadoresData?.[27],
        compareMode: ctx.compareMode, selectedValues: ctx.selectedValues, unit: "%",
      }),
  },

  /* ── 10. Motivo del viaje ── */
  {
    key:            "purpose",
    sectionLabel:   "Motivo del Viaje",
    excelSheetName: "Motivo de Viaje",
    pdfType:        "bar_chart",
    xAxisLabel:     "Motivo",
    yAxisLabel:     "% de viajes",
    extractNormalizedData: (ctx) =>
      buildBarSection({
        simpleData: ctx.analysisViewsData?.purposeData,
        rawIndicator: ctx.indicadoresData?.[28],
        compareMode: ctx.compareMode, selectedValues: ctx.selectedValues, unit: "%",
      }),
  },

  /* ── 11. Etapas del viaje ── */
  {
    key:            "stages",
    sectionLabel:   "Etapas del Viaje",
    excelSheetName: "Etapas del Viaje",
    pdfType:        "bar_chart",
    xAxisLabel:     "Número de etapas",
    yAxisLabel:     "% de viajes",
    extractNormalizedData: (ctx) =>
      buildBarSection({
        simpleData: ctx.analysisViewsData?.stageData,
        rawIndicator: ctx.indicadoresData?.[29],
        compareMode: ctx.compareMode, selectedValues: ctx.selectedValues, unit: "%",
      }),
  },

  /* ── 12. Grupos poblacionales ── */
  {
    key:            "population",
    sectionLabel:   "Grupos Poblacionales de Interés",
    excelSheetName: "Grupos Poblacionales",
    pdfType:        "bar_chart",
    xAxisLabel:     "Grupo poblacional",
    yAxisLabel:     "% de personas que sí viajan",
    extractNormalizedData: (ctx) =>
      buildMultiIdBarSection({
        ids: [31,32,33,34,35],
        labels: ["Cuidador","Extranjero (residente permanente)","Madre cabeza de familia","Persona en situación de discapacidad","Ninguna"],
        indicadoresData: ctx.indicadoresData,
        compareMode: ctx.compareMode, selectedValues: ctx.selectedValues, unit: "%",
      }),
  },

  /* ── 13. Tipología vehicular ── */
  {
    key:            "vehicle_type",
    sectionLabel:   "Tipología de Vehículos",
    excelSheetName: "Tipología Vehicular",
    pdfType:        "bar_chart",
    xAxisLabel:     "Tipo de vehículo",
    yAxisLabel:     "% de vehículos",
    extractNormalizedData: (ctx) =>
      buildBarSection({
        simpleData: ctx.analysisViewsData?.vehicleTypeData,
        rawIndicator: ctx.indicadoresData?.[36],
        compareMode: ctx.compareMode, selectedValues: ctx.selectedValues, unit: "%",
      }),
  },

  /* ── 14. Cantidad de vehículos por hogar ── */
  {
    key:            "vehicle_tenure",
    sectionLabel:   "Cantidad de Vehículos por Hogar",
    excelSheetName: "Cantidad Vehículos",
    pdfType:        "bar_chart",
    xAxisLabel:     "Cantidad de vehículos",
    yAxisLabel:     "% de hogares",
    extractNormalizedData: (ctx) =>
      buildBarSection({
        simpleData: ctx.analysisViewsData?.vehicleTenureData,
        rawIndicator: ctx.indicadoresData?.[37],
        compareMode: ctx.compareMode, selectedValues: ctx.selectedValues, unit: "%",
      }),
  },

  /* ── 15. Modelo de vehículos ── */
  {
    key:            "vehicle_model",
    sectionLabel:   "Modelo de Vehículos",
    excelSheetName: "Modelo Vehicular",
    pdfType:        "bar_chart",
    xAxisLabel:     "Año del modelo",
    yAxisLabel:     "% de vehículos",
    extractNormalizedData: (ctx) =>
      buildBarSection({
        simpleData: ctx.analysisViewsData?.vehicleModelData,
        rawIndicator: ctx.indicadoresData?.[38],
        compareMode: ctx.compareMode, selectedValues: ctx.selectedValues, unit: "%",
      }),
  },

  /* ── 16. Vehículos por estrato ── */
  {
    key:            "vehicle_strato",
    sectionLabel:   "Vehículos por Estrato Socioeconómico",
    excelSheetName: "Vehículos por Estrato",
    pdfType:        "bar_chart",
    xAxisLabel:     "Estrato socioeconómico",
    yAxisLabel:     "% de vehículos",
    extractNormalizedData: (ctx) =>
      buildBarSection({
        simpleData: ctx.analysisViewsData?.vehicleStratumData,
        rawIndicator: ctx.indicadoresData?.[39],
        compareMode: ctx.compareMode, selectedValues: ctx.selectedValues, unit: "%",
      }),
  },

  /* ── 17. Población por edad ── */
  {
    key:            "socio_age",
    sectionLabel:   "Caracterización Socioeconómica — Edad",
    excelSheetName: "Socio Edad",
    pdfType:        "bar_chart",
    xAxisLabel:     "Grupos de edad",
    yAxisLabel:     "% de personas encuestadas",
    extractNormalizedData: (ctx) =>
      buildBarSection({
        simpleData: ctx.analysisViewsData?.socioData1,
        rawIndicator: ctx.indicadoresData?.[42],
        compareMode: ctx.compareMode, selectedValues: ctx.selectedValues, unit: "%",
      }),
  },

  /* ── 18. Población por género ── */
  {
    key:            "socio_gender",
    sectionLabel:   "Caracterización Socioeconómica — Género",
    excelSheetName: "Socio Género",
    pdfType:        "bar_chart",
    xAxisLabel:     "Género",
    yAxisLabel:     "% de personas encuestadas",
    extractNormalizedData: (ctx) =>
      buildBarSection({
        simpleData: ctx.analysisViewsData?.socioData2,
        rawIndicator: ctx.indicadoresData?.[43],
        compareMode: ctx.compareMode, selectedValues: ctx.selectedValues, unit: "%",
      }),
  },

  /* ── 19. Población por ocupación ── */
  {
    key:            "socio_occupation",
    sectionLabel:   "Caracterización Socioeconómica — Ocupación",
    excelSheetName: "Socio Ocupación",
    pdfType:        "bar_chart",
    xAxisLabel:     "Ocupación",
    yAxisLabel:     "% de personas encuestadas",
    extractNormalizedData: (ctx) =>
      buildBarSection({
        simpleData: ctx.analysisViewsData?.socioData3,
        rawIndicator: ctx.indicadoresData?.[44],
        compareMode: ctx.compareMode, selectedValues: ctx.selectedValues, unit: "%",
      }),
  },

  /* ── 20. Población por escolaridad ── */
  {
    key:            "socio_education",
    sectionLabel:   "Caracterización Socioeconómica — Escolaridad",
    excelSheetName: "Socio Escolaridad",
    pdfType:        "bar_chart",
    xAxisLabel:     "Nivel de escolaridad",
    yAxisLabel:     "% de personas encuestadas",
    extractNormalizedData: (ctx) =>
      buildBarSection({
        simpleData: ctx.analysisViewsData?.socioData4,
        rawIndicator: ctx.indicadoresData?.[45],
        compareMode: ctx.compareMode, selectedValues: ctx.selectedValues, unit: "%",
      }),
  },
];