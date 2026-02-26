/**
 * exportConfig.js
 * ─────────────────────────────────────────────────────────────────────────────
 * ÚNICA fuente de verdad para los exportables (PDF y Excel).
 *
 * ┌─ PARA AGREGAR UNA NUEVA SECCIÓN ───────────────────────────────────────┐
 * │  1. Añade una entrada al array EXPORT_SECTIONS (ver ejemplos abajo).   │
 * │  2. Implementa su extractNormalizedData que devuelve un NormalizedData  │
 * │     del tipo correcto (ver tipos: kpi_table, bar_chart, time_table).    │
 * │  El PDF y Excel la incluirán automáticamente.                           │
 * └────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─ PARA ELIMINAR ─────────────────────────────────────────────────────────┐
 * │  Borra la entrada del array EXPORT_SECTIONS. Nada más cambia.           │
 * └────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─ TIPOS DE SECCIÓN (pdfType) ────────────────────────────────────────────┐
 * │  'kpi_table'  → cuadrícula de tarjetas KPI (etiqueta + valor)           │
 * │  'bar_chart'  → barras horizontales (una o varias series en comparar)   │
 * │  'time_table' → tabla temporal (horas × series, con sub-series)         │
 * └────────────────────────────────────────────────────────────────────────┘
 */

// ── Paleta de colores del proyecto ──────────────────────────────────────────
// Edita aquí si cambias los colores en constants.js
export const COLORS = {
  primaryGreen:   "#1B7A3E",
  secondaryGreen: "#339933",
  tertiaryBlue:   "#2563EB",
  tertiaryOrange: "#EA580C",
  tertiaryPink:   "#DB2777",
  lightGreen:     "#D1FAE5",
  lightBlue:      "#DBEAFE",
  lightOrange:    "#FED7AA",
  headerBg:       "#1B3A2D",   // fondo encabezado PDF/Excel
  rowAlt:         "#F0FDF4",   // fila alternada
  compareColors: [
    "#2563EB","#EA580C","#DB2777","#7C3AED","#0891B2",
    "#65A30D","#D97706","#BE185D","#4F46E5","#0F766E",
  ],
};

// ── Helpers internos ─────────────────────────────────────────────────────────
const scaleIfPct = (v, unit) =>
  unit === "%" && typeof v === "number" && v > 0 && v <= 1 ? +(v * 100).toFixed(2) : +(v ?? 0);

const fmtKpi = (value, unit) => {
  if (typeof value !== "number") return "--";
  if (unit === "%") return `${(value * 100).toFixed(1)} %`;
  if (unit === "min") return `${value.toFixed(1)} min`;
  return Number.isInteger(value) ? value.toLocaleString("es-CO") : value.toFixed(2);
};

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

function buildKpiSection({ ids, unitMap, indicadoresData, compareMode, selectedValues }) {
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

  /* ── 3. Distribución horaria ── */
  {
    key:            "hourly",
    sectionLabel:   "Distribución de Viajes por Hora de Inicio",
    excelSheetName: "Distribución Horaria",
    pdfType:        "time_table",
    extractNormalizedData: ({ mobilityPatternsData, compareMode }) => {
      if (!compareMode) {
        const data = mobilityPatternsData?.hourlyModeData || [];
        return {
          type: "time_table", compareMode: false,
          timeAxis: data.map((d) => d.hour),
          series: HOURLY_SERIES_META.map((s) => ({
            ...s, values: data.map((d) => d[s.key] || 0),
          })),
        };
      }
      const datasets = mobilityPatternsData?.hourlyModeDatasets || [];
      const timeAxis = datasets[0]?.data.map((d) => d.hour) || [];
      return {
        type: "time_table", compareMode: true, timeAxis,
        series: HOURLY_SERIES_META.map((s) => ({
          ...s,
          subSeries: datasets.map((ds) => ({
            detalle: ds.nombre,
            values: ds.data.map((d) => d[s.key] || 0),
          })),
        })),
      };
    },
  },

  /* ── 4. Duración del viaje ── */
  {
    key:            "duration",
    sectionLabel:   "Distribución de Viajes según Duración",
    excelSheetName: "Duración de Viajes",
    pdfType:        "bar_chart",
    extractNormalizedData: (ctx) =>
      buildBarSection({
        simpleData: ctx.mobilityPatternsData?.durationHistogramData,
        rawIndicator: ctx.indicadoresData?.[20],
        compareMode: ctx.compareMode, selectedValues: ctx.selectedValues, unit: "%",
      }),
  },

  /* ── 5. Frecuencia del viaje ── */
  {
    key:            "frequency",
    sectionLabel:   "Frecuencia del Viaje",
    excelSheetName: "Frecuencia de Viajes",
    pdfType:        "bar_chart",
    extractNormalizedData: (ctx) =>
      buildBarSection({
        simpleData: ctx.mobilityPatternsData?.tripFrequencyData,
        rawIndicator: ctx.indicadoresData?.[21],
        compareMode: ctx.compareMode, selectedValues: ctx.selectedValues, unit: "%",
      }),
  },

  /* ── 6. Viajes por estrato ── */
  {
    key:            "by_strato",
    sectionLabel:   "Viajes Diarios según Estrato Socioeconómico",
    excelSheetName: "Viajes por Estrato",
    pdfType:        "bar_chart",
    extractNormalizedData: (ctx) =>
      buildBarSection({
        simpleData: ctx.mobilityPatternsData?.tripsByEstratoData,
        rawIndicator: ctx.indicadoresData?.[22],
        compareMode: ctx.compareMode, selectedValues: ctx.selectedValues, unit: "%",
      }),
  },

  /* ── 7. Tiempo promedio por modo ── */
  {
    key:            "duration_by_mode",
    sectionLabel:   "Tiempo Promedio de Viaje por Modo de Transporte",
    excelSheetName: "Tiempo por Modo",
    pdfType:        "bar_chart",
    extractNormalizedData: (ctx) =>
      buildMultiIdBarSection({
        ids: [23,24,25,26],
        labels: ["Transporte público","Transporte privado","Transporte informal","No motorizado"],
        indicadoresData: ctx.indicadoresData,
        compareMode: ctx.compareMode, selectedValues: ctx.selectedValues, unit: "min",
      }),
  },

  /* ── 8. Modo principal ── */
  {
    key:            "mode",
    sectionLabel:   "Modo Principal de Transporte",
    excelSheetName: "Modo Principal",
    pdfType:        "bar_chart",
    extractNormalizedData: (ctx) =>
      buildBarSection({
        simpleData: ctx.analysisViewsData?.modeData,
        rawIndicator: ctx.indicadoresData?.[27],
        compareMode: ctx.compareMode, selectedValues: ctx.selectedValues, unit: "%",
      }),
  },

  /* ── 9. Motivo del viaje ── */
  {
    key:            "purpose",
    sectionLabel:   "Motivo del Viaje",
    excelSheetName: "Motivo de Viaje",
    pdfType:        "bar_chart",
    extractNormalizedData: (ctx) =>
      buildBarSection({
        simpleData: ctx.analysisViewsData?.purposeData,
        rawIndicator: ctx.indicadoresData?.[28],
        compareMode: ctx.compareMode, selectedValues: ctx.selectedValues, unit: "%",
      }),
  },

  /* ── 10. Etapas del viaje ── */
  {
    key:            "stages",
    sectionLabel:   "Etapas del Viaje",
    excelSheetName: "Etapas del Viaje",
    pdfType:        "bar_chart",
    extractNormalizedData: (ctx) =>
      buildBarSection({
        simpleData: ctx.analysisViewsData?.stageData,
        rawIndicator: ctx.indicadoresData?.[29],
        compareMode: ctx.compareMode, selectedValues: ctx.selectedValues, unit: "%",
      }),
  },

  /* ── 11. Grupos poblacionales ── */
  {
    key:            "population",
    sectionLabel:   "Grupos Poblacionales de Interés",
    excelSheetName: "Grupos Poblacionales",
    pdfType:        "bar_chart",
    extractNormalizedData: (ctx) =>
      buildMultiIdBarSection({
        ids: [31,32,33,34,35],
        labels: ["Cuidador","Extranjero (residente permanente)","Madre cabeza de familia","Persona en situación de discapacidad","Ninguna"],
        indicadoresData: ctx.indicadoresData,
        compareMode: ctx.compareMode, selectedValues: ctx.selectedValues, unit: "%",
      }),
  },

  /* ── 12. Tipología vehicular ── */
  {
    key:            "vehicle_type",
    sectionLabel:   "Tipología de Vehículos",
    excelSheetName: "Tipología Vehicular",
    pdfType:        "bar_chart",
    extractNormalizedData: (ctx) =>
      buildBarSection({
        simpleData: ctx.analysisViewsData?.vehicleTypeData,
        rawIndicator: ctx.indicadoresData?.[36],
        compareMode: ctx.compareMode, selectedValues: ctx.selectedValues, unit: "%",
      }),
  },

  /* ── 13. Cantidad de vehículos por hogar ── */
  {
    key:            "vehicle_tenure",
    sectionLabel:   "Cantidad de Vehículos por Hogar",
    excelSheetName: "Cantidad Vehículos",
    pdfType:        "bar_chart",
    extractNormalizedData: (ctx) =>
      buildBarSection({
        simpleData: ctx.analysisViewsData?.vehicleTenureData,
        rawIndicator: ctx.indicadoresData?.[37],
        compareMode: ctx.compareMode, selectedValues: ctx.selectedValues, unit: "%",
      }),
  },

  /* ── 14. Modelo de vehículos ── */
  {
    key:            "vehicle_model",
    sectionLabel:   "Modelo de Vehículos",
    excelSheetName: "Modelo Vehicular",
    pdfType:        "bar_chart",
    extractNormalizedData: (ctx) =>
      buildBarSection({
        simpleData: ctx.analysisViewsData?.vehicleModelData,
        rawIndicator: ctx.indicadoresData?.[38],
        compareMode: ctx.compareMode, selectedValues: ctx.selectedValues, unit: "%",
      }),
  },

  /* ── 15. Vehículos por estrato ── */
  {
    key:            "vehicle_strato",
    sectionLabel:   "Vehículos por Estrato Socioeconómico",
    excelSheetName: "Vehículos por Estrato",
    pdfType:        "bar_chart",
    extractNormalizedData: (ctx) =>
      buildBarSection({
        simpleData: ctx.analysisViewsData?.vehicleStratumData,
        rawIndicator: ctx.indicadoresData?.[39],
        compareMode: ctx.compareMode, selectedValues: ctx.selectedValues, unit: "%",
      }),
  },
];