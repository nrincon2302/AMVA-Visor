import BarChartCard from "../components/BarChartCard";
import { PRIMARY_GREEN, SECONDARY_GREEN } from "../config/constants";
import { buildComparisonSeries, buildPopulationComparisonSeries } from "../utils/groupingFunctions";

const toLabelValue = (arr) => (arr || []).map((d) => ({ label: d.label || d.name || d[0], value: d.value || d[1] || 0 }));

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

  // Grid layout: 3 columns, 2 rows
  const viajesCharts = (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "auto auto", gap: 16 }}>
      {isCompareMode ? (
        <>
          <div style={{ gridColumn: "1 / 2", gridRow: "1 / span 2" }}>
            {(() => {
              const m = buildComparisonSeries(modeData, 27, localSelectedValues, selectedColorMap, activeThematicKey, detailedData);
              return (
                <BarChartCard
                  title="Modo principal (% de viajes)"
                  data={m.data}
                  xKey="label"
                  series={m.series}
                  color={PRIMARY_GREEN}
                  orientation="horizontal"
                  chartHeight={720}
                  isCompareMode={isCompareMode}
                />
              );
            })()}
          </div>

          <div style={{ gridColumn: "2 / 3", gridRow: "1 / 2" }}>
            {(() => {
              const p = buildComparisonSeries(purposeData, 28, localSelectedValues, selectedColorMap, activeThematicKey, detailedData);
              return (
                <BarChartCard
                  title="Motivo de viaje (% de viajes)"
                  data={p.data}
                  xKey="label"
                  series={p.series}
                  color={PRIMARY_GREEN}
                  orientation="horizontal"
                  chartHeight={360}
                  isCompareMode={isCompareMode}
                />
              );
            })()}
          </div>

          <div style={{ gridColumn: "3 / 4", gridRow: "1 / 2" }}>
            {(() => {
              const s = buildComparisonSeries(stageData, 29, localSelectedValues, selectedColorMap, activeThematicKey, detailedData);
              return (
                <BarChartCard
                  title="Etapas (% de viajes)"
                  data={s.data}
                  xKey="label"
                  series={s.series}
                  color={PRIMARY_GREEN}
                  orientation="horizontal"
                  chartHeight={360}
                  isCompareMode={isCompareMode}
                />
              );
            })()}
          </div>

          <div style={{ gridColumn: "2 / 3", gridRow: "2 / 3" }}>
            {(() => {
              const n = buildComparisonSeries(noTravelReasonData, 30, localSelectedValues, selectedColorMap, activeThematicKey, detailedData);
              return (
                <BarChartCard
                  title="Motivo de no viaje (% de personas que no viajan)"
                  data={n.data}
                  xKey="label"
                  series={n.series}
                  color={PRIMARY_GREEN}
                  orientation="horizontal"
                  chartHeight={360}
                  isCompareMode={isCompareMode}
                />
              );
            })()}
          </div>
          <div style={{ gridColumn: "3 / 4", gridRow: "2 / 3" }}>
            {(() => {
              // CASO ESPECIAL: Compendio de indicadores
              const pop = buildPopulationComparisonSeries(localSelectedValues, selectedColorMap, activeThematicKey, detailedData);
              return (
                <BarChartCard
                  title="% de personas que sí viajan en grupos poblacionales de interés"
                  data={pop.data}
                  xKey="label"
                  series={pop.series}
                  color={PRIMARY_GREEN}
                  orientation="horizontal"
                  chartHeight={360}
                  isCompareMode={isCompareMode}
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
            const t = buildComparisonSeries(vehicleTypeData, 36, localSelectedValues, selectedColorMap, activeThematicKey, detailedData);
            return <BarChartCard title="Tipología (% de vehículos)" data={t.data} xKey="label" series={t.series} color={PRIMARY_GREEN} isCompareMode={isCompareMode} />;
          })()}
          {(() => {
            const vt = buildComparisonSeries(vehicleTenureData, 37, localSelectedValues, selectedColorMap, activeThematicKey, detailedData);
            return <BarChartCard title="Cantidad (% de vehículos)" data={vt.data} xKey="label" series={vt.series} color={PRIMARY_GREEN} isCompareMode={isCompareMode} />;
          })()}
          {(() => {
            const m = buildComparisonSeries(vehicleModelData, 38, localSelectedValues, selectedColorMap, activeThematicKey, detailedData);
            return <BarChartCard title="Modelo (% de vehículos)" data={m.data} xKey="label" series={m.series} color={PRIMARY_GREEN} isCompareMode={isCompareMode} />;
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