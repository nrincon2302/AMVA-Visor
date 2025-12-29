import React from "react";
import BarChartCard from "../components/BarChartCard";
import { PRIMARY_GREEN, COMPARE_COLORS, SECONDARY_GREEN } from "../config/constants";

const toLabelValue = (arr) => (arr || []).map((d) => ({ label: d.label || d.name || d[0], value: d.value || d[1] || 0 }));
const sanitizeKey = (v) => String(v).replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");

const MODE_CATEGORY_GROUPS = {
  bicycle: new Set(["Bicicleta propia", "Bicicleta pública"]),
  taxi: new Set([
    "Taxi individual (amarillo)",
    "Taxi colectivo (amarillo)",
    "Taxi intermunicipal o colectivo (blanco)",
  ]),
  moto: new Set(["Moto (conductor)", "Moto (acompañante)", "Mototaxi"]),
  auto: new Set(["Auto particular (conductor)", "Auto particular (acompañante)"]),
};

const OTHER_MODES = new Set([
  "Vehículo empresarial",
  "Motocarro",
  "Vehículo de pago por plataforma",
  "Patineta eléctrica",
  "Transporte informal o particular",
]);

const groupModeLabel = (mode) => {
  if (OTHER_MODES.has(mode)) return "Otros Modos";
  if (mode === "Escolar") return "Transporte Escolar";
  if (mode === "Bus / Buseta / Microbús intermunicipal (1)") {
    return "Transporte intermunicipal";
  }
  if (mode === "Bus / Buseta / Microbús urbano o metropolitano (1)") {
    return "Transporte urbano o metropolitano";
  }
  if (MODE_CATEGORY_GROUPS.bicycle.has(mode)) return "Bicicleta";
  if (MODE_CATEGORY_GROUPS.taxi.has(mode)) return "Taxi";
  if (MODE_CATEGORY_GROUPS.moto.has(mode)) return "Moto";
  if (MODE_CATEGORY_GROUPS.auto.has(mode)) return "Auto particular";
  return mode;
};

export default function AnalysisViewsPanel({
  analysisView,
  isCompareMode,
  localSelectedValues,
  selectedColorMap,
  activeThematicKey,
  // data from hook
  modeData,
  purposeData,
  stageData,
  noTravelReasonData,
  populationInterestData,
  vehicleTypeData,
  vehicleModelData,
  vehicleTenureData,
  filteredTrips,
  filteredPersonsBase,
}) {
  const getCategories = (arr) => (arr || []).map((d) => d.label || d.name || d);
  const groupedColor = SECONDARY_GREEN;

  const buildMultiSeries = (targetField, categoriesSource) => {
    const categories = getCategories(categoriesSource);
    const selected = (localSelectedValues || []).slice(0, 3);
    const series = selected.map((val, idx) => ({
      key: sanitizeKey(String(val)),
      label: String(val),
      color: selectedColorMap?.get(val) || COMPARE_COLORS[idx] || COMPARE_COLORS[0],
      raw: val,
    }));
    const mapValue = targetField === "mode" ? groupModeLabel : (value) => value;

    const totals = series.reduce((acc, s) => {
      const total = filteredTrips.filter((t) => String(t[activeThematicKey]) === String(s.raw)).length;
      acc[s.key] = total;
      return acc;
    }, {});

    const data = categories.map((cat) => {
      const row = { label: cat };
      series.forEach((s) => {
        const matches = filteredTrips.filter(
          (t) =>
            String(mapValue(t[targetField])) === String(cat) &&
            String(t[activeThematicKey]) === String(s.raw)
        ).length;
        row[s.key] = totals[s.key] ? Number(((matches / totals[s.key]) * 100).toFixed(1)) : 0;
      });
      return row;
    });

    return { data, series };
  };

  const buildMultiSeriesFromPersons = (
    targetField,
    categoriesSource,
    persons,
    { filterByValue = false } = {}
  ) => {
    const categories = getCategories(categoriesSource);
    const selected = (localSelectedValues || []).slice(0, 3);
    const series = selected.map((val, idx) => ({
      key: sanitizeKey(String(val)),
      label: String(val),
      color: selectedColorMap?.get(val) || COMPARE_COLORS[idx] || COMPARE_COLORS[0],
      raw: val,
    }));

    const basePersons = filterByValue ? persons.filter((p) => p[targetField]) : persons;
    const totals = series.reduce((acc, s) => {
      const total = basePersons.filter((p) => String(p[activeThematicKey]) === String(s.raw)).length;
      acc[s.key] = total;
      return acc;
    }, {});

    const data = categories.map((cat) => {
      const row = { label: cat };
      series.forEach((s) => {
        const matches = basePersons.filter(
          (p) =>
            String(p[targetField]) === String(cat) &&
            String(p[activeThematicKey]) === String(s.raw)
        ).length;
        row[s.key] = totals[s.key] ? Number(((matches / totals[s.key]) * 100).toFixed(1)) : 0;
      });
      return row;
    });

    return { data, series };
  };

  // Grid layout: 3 columns, 2 rows
  // Modo principal occupies left column and spans 2 rows
  // Motivo and Etapas occupy top row columns 2 and 3
  // Horaria occupies bottom row across columns 2-3
  const viajesCharts = (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "auto auto", gap: 16 }}>
      {isCompareMode ? (
        <>
          <div style={{ gridColumn: "1 / 2", gridRow: "1 / span 2" }}>
            {(() => {
              const m = buildMultiSeries("mode", modeData);
              return (
                <BarChartCard
                  title="Modo principal (% de viajes)"
                  data={m.data}
                  xKey="label"
                  series={m.series}
                  color={PRIMARY_GREEN}
                  orientation="horizontal"
                  chartHeight={720}
                />
              );
            })()}
          </div>

          <div style={{ gridColumn: "2 / 3", gridRow: "1 / 2" }}>
            {(() => {
              const p = buildMultiSeries("tripPurpose", purposeData);
              return (
                <BarChartCard
                  title="Motivo de viaje (% de viajes)"
                  data={p.data}
                  xKey="label"
                  series={p.series}
                  color={PRIMARY_GREEN}
                  orientation="horizontal"
                  chartHeight={360}
                />
              );
            })()}
          </div>

          <div style={{ gridColumn: "3 / 4", gridRow: "1 / 2" }}>
            {(() => {
              const s = buildMultiSeries("stageBucket", stageData);
              return (
                <BarChartCard
                  title="Etapas (% de viajes)"
                  data={s.data}
                  xKey="label"
                  series={s.series}
                  color={PRIMARY_GREEN}
                  orientation="horizontal"
                  chartHeight={360}
                />
              );
            })()}
          </div>

          <div style={{ gridColumn: "2 / 3", gridRow: "2 / 3" }}>
            {(() => {
              const n = buildMultiSeriesFromPersons(
                "noTravelReason",
                noTravelReasonData,
                filteredPersonsBase || [],
                { filterByValue: true }
              );
              return (
                <BarChartCard
                  title="Motivo de no viaje (% de viajes)"
                  data={n.data}
                  xKey="label"
                  series={n.series}
                  color={PRIMARY_GREEN}
                  orientation="horizontal"
                  chartHeight={360}
                />
              );
            })()}
          </div>
          <div style={{ gridColumn: "3 / 4", gridRow: "2 / 3" }}>
            {(() => {
              const pop = buildMultiSeries("populationInterest", populationInterestData);
              return (
                <BarChartCard
                  title="Poblaciones de interés (% de viajes)"
                  data={pop.data}
                  xKey="label"
                  series={pop.series}
                  color={PRIMARY_GREEN}
                  orientation="horizontal"
                  chartHeight={360}
                />
              );
            })()}
          </div>
        </>
      ) : (
        <>
          <div style={{ gridColumn: "1 / 2", gridRow: "1 / span 2" }}>
            <BarChartCard
              title="Modo principal (% de viajes)"
              data={toLabelValue(modeData)}
              xKey="label"
              yKey="value"
              color={groupedColor}
              orientation="horizontal"
              chartHeight={720}
            />
          </div>

          <div style={{ gridColumn: "2 / 3", gridRow: "1 / 2" }}>
            <BarChartCard
              title="Motivo de viaje (% de viajes)"
              data={toLabelValue(purposeData)}
              xKey="label"
              yKey="value"
              color={groupedColor}
              orientation="horizontal"
              chartHeight={360}
            />
          </div>

          <div style={{ gridColumn: "3 / 4", gridRow: "1 / 2" }}>
            <BarChartCard
              title="Etapas (% de viajes)"
              data={toLabelValue(stageData)}
              xKey="label"
              yKey="value"
              color={groupedColor}
              orientation="horizontal"
              chartHeight={360}
            />
          </div>

          <div style={{ gridColumn: "2 / 3", gridRow: "2 / 3" }}>
            <BarChartCard
              title="Motivo de no viaje (% de viajes)"
              data={toLabelValue(noTravelReasonData)}
              xKey="label"
              yKey="value"
              color={groupedColor}
              orientation="horizontal"
              chartHeight={360}
            />
          </div>
          <div style={{ gridColumn: "3 / 4", gridRow: "2 / 3" }}>
            <BarChartCard
              title="Poblaciones de interés (% de viajes)"
              data={toLabelValue(populationInterestData)}
              xKey="label"
              yKey="value"
              color={groupedColor}
              orientation="horizontal"
              chartHeight={360}
            />
          </div>
        </>
      )}
    </div>
  );

  const vehicularCharts = (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
      {isCompareMode ? (
        <>
          {(() => {
            const t = buildMultiSeries("vehicleType", vehicleTypeData);
            return <BarChartCard title="Tipología (% de vehículos)" data={t.data} xKey="label" series={t.series} color={PRIMARY_GREEN} />;
          })()}
          {(() => {
            const vt = buildMultiSeries("vehicleBucket", vehicleTenureData);
            return <BarChartCard title="Cantidad (% de vehículos)" data={vt.data} xKey="label" series={vt.series} color={PRIMARY_GREEN} />;
          })()}
          {(() => {
            const m = buildMultiSeries("vehicleModel", vehicleModelData);
            return <BarChartCard title="Modelo (% de vehículos)" data={m.data} xKey="label" series={m.series} color={PRIMARY_GREEN} />;
          })()}
        </>
      ) : (
        <>
          <BarChartCard title="Tipología (% de vehículos)" data={toLabelValue(vehicleTypeData)} xKey="label" yKey="value" color={groupedColor} />
          <BarChartCard title="Cantidad (% de vehículos)" data={toLabelValue(vehicleTenureData)} xKey="label" yKey="value" color={groupedColor} />
          <BarChartCard title="Modelo (% de vehículos)" data={toLabelValue(vehicleModelData)} xKey="label" yKey="value" color={groupedColor} />
        </>
      )}
    </div>
  );

  const titleMap = {
    viajes: "Análisis de viajes",
    vehicular: "Vehículos por Hogar",
  };

  return (
    <section
      style={{
        marginTop: 18,
        padding: 16,
        background: "#ffffff",
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 16 }}>{titleMap[analysisView] || "Análisis"}</h2>
      </div>
      {analysisView === "viajes" && viajesCharts}
      {analysisView === "vehicular" && vehicularCharts}
    </section>
  );
}
