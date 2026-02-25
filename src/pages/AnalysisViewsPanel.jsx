import BarChartCard from "../components/BarChartCard";
import { PRIMARY_GREEN, SECONDARY_GREEN } from "../config/constants";
import { buildComparisonSeries, buildPopulationComparisonSeries } from "../utils/groupingFunctions";

const toLabelValue = (arr) =>
  (arr || []).map((d) => ({ label: d.label || d.name || d[0], value: d.value || d[1] || 0 }));

export default function AnalysisViewsPanel({
  analysisView,
  isCompareMode,
  localSelectedValues,
  selectedColorMap,
  activeThematicKey,
  modeData = [],
  purposeData = [],
  stageData = [],
  populationInterestData = [],
  vehicleTypeData = [],
  vehicleModelData = [],
  vehicleTenureData = [],
  vehicleStratumData = [],
  detailedData,
}) {
  const groupedColor = SECONDARY_GREEN;

  /* ─── VIAJES ─────────────────────────────────────────── */
  const viajesCharts = (
    <div className="analysis-grid-viajes">
      {isCompareMode ? (
        <>
          <div>
            {(() => {
              const m = buildComparisonSeries(modeData, 27, localSelectedValues, selectedColorMap, activeThematicKey, detailedData);
              return <BarChartCard 
                title="Modo principal (% de viajes)" 
                data={m.data} 
                xKey="label" 
                series={m.series} 
                color={PRIMARY_GREEN} 
                orientation="horizontal" 
                chartHeight={360} 
                isCompareMode={isCompareMode} 
                xAxisLabel="Modo" 
                yAxisLabel="% de viajes" 
              />;
            })()}
          </div>

          <div>
            {(() => {
              const p = buildComparisonSeries(purposeData, 28, localSelectedValues, selectedColorMap, activeThematicKey, detailedData);
              return <BarChartCard 
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
              />;
            })()}
          </div>

          <div>
            {(() => {
              const s = buildComparisonSeries(stageData, 29, localSelectedValues, selectedColorMap, activeThematicKey, detailedData);
              return <BarChartCard 
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
              />;
            })()}
          </div>

          <div>
            {(() => {
              const pop = buildPopulationComparisonSeries(localSelectedValues, selectedColorMap, activeThematicKey, detailedData);
              return <BarChartCard 
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
              />;
            })()}
          </div>
        </>
      ) : (
        <>
          <div>
            <BarChartCard 
              title="Modo principal (% de viajes)" 
              data={toLabelValue(modeData)} 
              xKey="label" 
              yKey="value" 
              color={groupedColor} 
              orientation="horizontal" 
              chartHeight={360} 
              xAxisLabel="Modo" 
              yAxisLabel="% de viajes" 
            />
          </div>
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
        </>
      )}
    </div>
  );

  /* ─── VEHICULAR ───────────────────────────────────────── */
  const vehicularCharts = (
    <div className="analysis-grid-vehicular">
      {isCompareMode ? (
        <>
          {(() => { const t = buildComparisonSeries(vehicleTypeData, 36, localSelectedValues, selectedColorMap, activeThematicKey, detailedData); return <BarChartCard title="Tipología (% de vehículos)" data={t.data} xKey="label" series={t.series} color={PRIMARY_GREEN} isCompareMode={isCompareMode} xAxisLabel="% de vehículos" yAxisLabel="Tipología" />; })()}
          {(() => { const vt = buildComparisonSeries(vehicleTenureData, 37, localSelectedValues, selectedColorMap, activeThematicKey, detailedData); return <BarChartCard title="Cantidad (% de vehículos)" data={vt.data} xKey="label" series={vt.series} color={PRIMARY_GREEN} isCompareMode={isCompareMode} xAxisLabel="% de vehículos" yAxisLabel="Cantidad" />; })()}
          {(() => { const m = buildComparisonSeries(vehicleModelData, 38, localSelectedValues, selectedColorMap, activeThematicKey, detailedData); return <BarChartCard title="Modelo (% de vehículos)" data={m.data} xKey="label" series={m.series} color={PRIMARY_GREEN} isCompareMode={isCompareMode} xAxisLabel="% de vehículos" yAxisLabel="Modelo" />; })()}
          {(() => { const m = buildComparisonSeries(vehicleStratumData, 39, localSelectedValues, selectedColorMap, activeThematicKey, detailedData); return <BarChartCard title="Vehículos por Estrato (% de vehículos)" data={m.data} xKey="label" series={m.series} color={PRIMARY_GREEN} isCompareMode={isCompareMode} xAxisLabel="% de vehículos" yAxisLabel="Estrato" />; })()}
        </>
      ) : (
        <>
          <BarChartCard 
            title="Tipología (% de vehículos)" 
            data={toLabelValue(vehicleTypeData)} 
            xKey="label" 
            yKey="value" 
            color={groupedColor} 
            xAxisLabel="% de vehículos" 
            yAxisLabel="Tipología" 
          />
          <BarChartCard 
            title="Cantidad (% de vehículos)" 
            data={toLabelValue(vehicleTenureData)} 
            xKey="label" 
            yKey="value" 
            color={groupedColor} 
            xAxisLabel="% de vehículos" 
            yAxisLabel="Cantidad" 
          />
          <BarChartCard 
            title="Modelo (% de vehículos)" 
            data={toLabelValue(vehicleModelData)} 
            xKey="label" 
            yKey="value" 
            color={groupedColor} 
            xAxisLabel="% de vehículos" 
            yAxisLabel="Modelo" 
          />
          <BarChartCard 
            title="Vehículos por Estrato (% de vehículos)" 
            data={toLabelValue(vehicleStratumData)} 
            xKey="label" 
            yKey="value" 
            color={groupedColor} 
            xAxisLabel="% de vehículos" 
            yAxisLabel="Estrato" 
          />
        </>
      )}
    </div>
  );

  const titleMap = { viajes: "Características de los viajes", vehicular: "Vehículos por Hogar" };

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
      {analysisView === "viajes"    && viajesCharts}
      {analysisView === "vehicular" && vehicularCharts}
    </section>
  );
}
