import BarChartCard from "../components/BarChartCard";
import { PRIMARY_GREEN, COMPARE_COLORS, SECONDARY_GREEN } from "../config/constants";

const toLabelValue = (arr) => (arr || []).map((d) => ({ label: d.label || d.name || d[0], value: d.value || d[1] || 0 }));
const sanitizeKey = (v) => String(v).replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");

export default function AnalysisViewsPanel({
  analysisView,
  isCompareMode,
  localSelectedValues,
  selectedColorMap,
  activeThematicKey,
  // data from hook (agregados)
  modeData = [],
  purposeData = [],
  stageData = [],
  noTravelReasonData = [],
  populationInterestData = [],
  vehicleTypeData = [],
  vehicleModelData = [],
  vehicleTenureData = [],
  // datos detallados del backend (para modo COMPARAR)
  detailedData,
}) {
  const groupedColor = SECONDARY_GREEN;

  const buildComparisonSeries = (_, indicatorKey) => {
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
        const row = { label: grupoObj.grupo };

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

  const buildPopulationComparisonSeries = () => {
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

  // Grid layout: 3 columns, 2 rows
  const viajesCharts = (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "auto auto", gap: 16 }}>
      {isCompareMode ? (
        <>
          <div style={{ gridColumn: "1 / 2", gridRow: "1 / span 2" }}>
            {(() => {
              const m = buildComparisonSeries(modeData, 27);
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
              const p = buildComparisonSeries(purposeData, 28);
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
              const s = buildComparisonSeries(stageData, 29);
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
              const n = buildComparisonSeries(noTravelReasonData, 30);
              return (
                <BarChartCard
                  title="Motivo de no viaje (% de personas que no viajan)"
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
              // CASO ESPECIAL: Compendio de indicadores
              const pop = buildPopulationComparisonSeries();
              return (
                <BarChartCard
                  title="% de personas que sí viajan en grupos poblacionales de interés"
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
              title="Motivo de no viaje (% de personas que no viajan)"
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
              title="% de personas que sí viajan en grupos poblacionales de interés"
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
            const t = buildComparisonSeries(vehicleTypeData, 36);
            return <BarChartCard title="Tipología (% de vehículos)" data={t.data} xKey="label" series={t.series} color={PRIMARY_GREEN} />;
          })()}
          {(() => {
            const vt = buildComparisonSeries(vehicleTenureData, 37);
            return <BarChartCard title="Cantidad (% de vehículos)" data={vt.data} xKey="label" series={vt.series} color={PRIMARY_GREEN} />;
          })()}
          {(() => {
            const m = buildComparisonSeries(vehicleModelData, 38);
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
    viajes: "Características de los viajes",
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