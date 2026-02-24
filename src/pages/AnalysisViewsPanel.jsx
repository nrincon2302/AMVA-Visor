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
  vehicleStratumData = [],
  // datos detallados del backend (para modo COMPARAR)
  detailedData,
}) {
  const groupedColor = SECONDARY_GREEN;

  // Grid layout: 2 columnas
  const viajesCharts = (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {isCompareMode ? (
        <>
          <div style={{ gridColumn: "1 / -1", gridRow: "1 / 2" }}>
            {(() => {
              const m = buildComparisonSeries(modeData, 27, localSelectedValues, selectedColorMap, activeThematicKey, detailedData);
              return (
                <BarChartCard
                  title="Modo principal (% de viajes)"
                  data={m.data}
                  xKey="label"
                  series={m.series}
                  color={PRIMARY_GREEN}
                  orientation="vertical"
                  chartHeight={320}
                  isCompareMode={isCompareMode}
                  xAxisLabel="Modo"
                  yAxisLabel="% de viajes"
                />
              );
            })()}
          </div>

          <div style={{ gridColumn: "1 / 2", gridRow: "2 / 3" }}>
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
                  xAxisLabel="% de viajes"
                  yAxisLabel="Motivo"
                />
              );
            })()}
          </div>

          <div style={{ gridColumn: "2 / 3", gridRow: "2 / 3" }}>
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
                  xAxisLabel="% de viajes"
                  yAxisLabel="Etapas"
                />
              );
            })()}
          </div>

          <div style={{ gridColumn: "1 / 2", gridRow: "3 / 4" }}>
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
                  xAxisLabel="% de personas"
                  yAxisLabel="Motivo"
                />
              );
            })()}
          </div>
          <div style={{ gridColumn: "2 / 3", gridRow: "3 / 4" }}>
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
                  xAxisLabel="% de personas"
                  yAxisLabel="Grupo poblacional"
                />
              );
            })()}
          </div>
        </>
      ) : (
        <>
          <div style={{ gridColumn: "1 / -1", gridRow: "1 / 2" }}>
            <BarChartCard
              title="Modo principal (% de viajes)"
              data={toLabelValue(modeData)}
              xKey="label"
              yKey="value"
              color={groupedColor}
              orientation="vertical"
              chartHeight={320}
              xAxisLabel="Modo"
              yAxisLabel="% de viajes"
            />
          </div>

          <div style={{ gridColumn: "1 / 2", gridRow: "2 / 3" }}>
            <BarChartCard
              title="Motivo de viaje (% de viajes)"
              data={toLabelValue(purposeData)}
              xKey="label"
              yKey="value"
              color={groupedColor}
              orientation="horizontal"
              chartHeight={360}
              xAxisLabel="% de viajes"
              yAxisLabel="Motivo"
            />
          </div>

          <div style={{ gridColumn: "2 / 3", gridRow: "2 / 3" }}>
            <BarChartCard
              title="Etapas (% de viajes)"
              data={toLabelValue(stageData)}
              xKey="label"
              yKey="value"
              color={groupedColor}
              orientation="horizontal"
              chartHeight={360}
              xAxisLabel="% de viajes"
              yAxisLabel="Etapas"
            />
          </div>

          <div style={{ gridColumn: "1 / 2", gridRow: "3 / 4" }}>
            <BarChartCard
              title="Motivo de no viaje (% de personas que no viajan)"
              data={toLabelValue(noTravelReasonData)}
              xKey="label"
              yKey="value"
              color={groupedColor}
              orientation="horizontal"
              chartHeight={360}
              xAxisLabel="% de personas"
              yAxisLabel="Motivo"
            />
          </div>
          <div style={{ gridColumn: "2 / 3", gridRow: "3 / 4" }}>
            <BarChartCard
              title="% de personas que sí viajan en grupos poblacionales de interés"
              data={toLabelValue(populationInterestData)}
              xKey="label"
              yKey="value"
              color={groupedColor}
              orientation="horizontal"
              chartHeight={360}
              xAxisLabel="% de personas"
              yAxisLabel="Grupo poblacional"
            />
          </div>
        </>
      )}
    </div>
  );

  const vehicularCharts = (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
      {isCompareMode ? (
        <>
          {(() => {
            const t = buildComparisonSeries(vehicleTypeData, 36, localSelectedValues, selectedColorMap, activeThematicKey, detailedData);
            return <BarChartCard title="Tipología (% de vehículos)" data={t.data} xKey="label" series={t.series} color={PRIMARY_GREEN} isCompareMode={isCompareMode} xAxisLabel="% de vehículos" yAxisLabel="Tipología" />;
          })()}
          {(() => {
            const vt = buildComparisonSeries(vehicleTenureData, 37, localSelectedValues, selectedColorMap, activeThematicKey, detailedData);
            return <BarChartCard title="Cantidad (% de vehículos)" data={vt.data} xKey="label" series={vt.series} color={PRIMARY_GREEN} isCompareMode={isCompareMode} xAxisLabel="% de vehículos" yAxisLabel="Cantidad" />;
          })()}
          {(() => {
            const m = buildComparisonSeries(vehicleModelData, 38, localSelectedValues, selectedColorMap, activeThematicKey, detailedData);
            return <BarChartCard title="Modelo (% de vehículos)" data={m.data} xKey="label" series={m.series} color={PRIMARY_GREEN} isCompareMode={isCompareMode} xAxisLabel="% de vehículos" yAxisLabel="Modelo" />;
          })()}
          {(() => {
            const m = buildComparisonSeries(vehicleStratumData, 39, localSelectedValues, selectedColorMap, activeThematicKey, detailedData);
            return <BarChartCard title="Vehículos por Estrato (% de vehículos)" data={m.data} xKey="label" series={m.series} color={PRIMARY_GREEN} isCompareMode={isCompareMode} xAxisLabel="% de vehículos" yAxisLabel="Estrato" />;
          })()}
        </>
      ) : (
        <>
          <BarChartCard title="Tipología (% de vehículos)" data={toLabelValue(vehicleTypeData)} xKey="label" yKey="value" color={groupedColor} xAxisLabel="% de vehículos" yAxisLabel="Tipología" />
          <BarChartCard title="Cantidad (% de vehículos)" data={toLabelValue(vehicleTenureData)} xKey="label" yKey="value" color={groupedColor} xAxisLabel="% de vehículos" yAxisLabel="Cantidad" />
          <BarChartCard title="Modelo (% de vehículos)" data={toLabelValue(vehicleModelData)} xKey="label" yKey="value" color={groupedColor} xAxisLabel="% de vehículos" yAxisLabel="Modelo" />
          <BarChartCard title="Vehículos por Estrato (% de vehículos)" data={toLabelValue(vehicleStratumData)} xKey="label" yKey="value" color={groupedColor} xAxisLabel="% de vehículos" yAxisLabel="Estrato" />
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