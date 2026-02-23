import { COMPARE_COLORS } from "../config/constants";

const sanitizeKey = (v) => String(v).replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");

export const buildComparisonSeries = (_, indicatorKey,
  localSelectedValues,
  selectedColorMap,
  activeThematicKey,
  detailedData
) => {
if (!detailedData?.comparaciones?.[activeThematicKey]) {
    return { data: [], series: [] };
}

const indicatorData =
    detailedData.comparaciones[activeThematicKey][indicatorKey];

if (!indicatorData) {
    return { data: [], series: [] };
}

const selected = (localSelectedValues || []).slice(0, 3);

const series = selected.map((val, idx) => ({
    key: sanitizeKey(String(val)),
    label: String(val),
    color:
    selectedColorMap?.get(val) ||
    COMPARE_COLORS[idx] ||
    COMPARE_COLORS[0],
    raw: val,
}));

// ----------------------------------------------------
// CASO AGRUPADO (comparativo_agrupado)
// ----------------------------------------------------
if (indicatorData.grupos) {
    const data = indicatorData.grupos.map((grupoObj) => {
    // Indicador 22 (tripsByEstratoData): agregar prefijo "Estrato "
    const label = indicatorKey === 22 ? "Estrato " + grupoObj.grupo : grupoObj.grupo;
    const row = { label };

    series.forEach((s) => {
        const found = grupoObj.comparativo?.find(
        (c) => String(c.detalle) === String(s.raw)
        );

        let value =
        found?.value ??
        found?.valor ??
        0;

        if (value > 0 && value <= 1) {
        value *= 100;
        }

        row[s.key] = value;
    });

    return row;
    });

    return { data, series };
}

// ----------------------------------------------------
// CASO SIMPLE (comparativo_simple)
// ----------------------------------------------------
if (indicatorData.comparativo) {
    const row = { label: indicatorData.nombre || "Valor" };

    series.forEach((s) => {
    const found = indicatorData.comparativo?.find(
        (c) => String(c.detalle) === String(s.raw)
    );

    let value =
        found?.value ??
        found?.valor ??
        0;

    if (value > 0 && value <= 1) {
        value *= 100;
    }

    row[s.key] = value;
    });

    return { data: [row], series };
}

return { data: [], series: [] };
};

export const buildPopulationComparisonSeries = (
    localSelectedValues,
    selectedColorMap,
    activeThematicKey,
    detailedData
) => {
if (!detailedData?.comparaciones?.[activeThematicKey]) {
    return { data: [], series: [] };
}

const selected = (localSelectedValues || []).slice(0, 3);

const series = selected.map((val, idx) => ({
    key: sanitizeKey(String(val)),
    label: String(val),
    color:
    selectedColorMap?.get(val) ||
    COMPARE_COLORS[idx] ||
    COMPARE_COLORS[0],
    raw: val,
}));

const populationIds = [31, 32, 33, 34, 35];

const populationLabels = [
    "Cuidador",
    "Extranjero (residente permanente)",
    "Madre cabeza de familia",
    "Persona en situación de discapacidad",
    "Ninguna",
];

const data = populationIds.map((id, index) => {
    const indicator =
    detailedData.comparaciones[activeThematicKey][id];

    const row = { label: populationLabels[index] };

    series.forEach((s) => {
    const found = indicator?.comparativo?.find(
        (c) => String(c.detalle) === String(s.raw)
    );

    let value =
        found?.value ??
        found?.valor ??
        0;

    if (value > 0 && value <= 1) {
        value *= 100;
    }

    row[s.key] = value;
    });

    return row;
});

return { data, series };
};

export const buildTransportationComparisonSeries = (
    localSelectedValues,
    selectedColorMap,
    activeThematicKey,
    detailedData
) => {
if (!detailedData?.comparaciones?.[activeThematicKey]) {
    return { data: [], series: [] };
}

const selected = (localSelectedValues || []).slice(0, 3);

const series = selected.map((val, idx) => ({
    key: sanitizeKey(String(val)),
    label: String(val),
    color:
    selectedColorMap?.get(val) ||
    COMPARE_COLORS[idx] ||
    COMPARE_COLORS[0],
    raw: val,
}));

const transportationIds = [23, 24, 25, 26];

const transportationLabels = [
    "Transporte público",
    "Transporte privado",
    "Transporte informal",
    "Modo no motorizado",
];

const data = transportationIds.map((id, index) => {
    const indicator =
    detailedData.comparaciones[activeThematicKey][id];

    const row = { label: transportationLabels[index] };

    series.forEach((s) => {
    const found = indicator?.comparativo?.find(
        (c) => String(c.detalle) === String(s.raw)
    );

    let value =
        found?.value ??
        found?.valor ??
        0;

    if (value > 0 && value <= 1) {
        value *= 100;
    }

    row[s.key] = value;
    });

    return row;
});

return { data, series };
};