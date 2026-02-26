import BarChartCard from "../components/BarChartCard";
import HourlyModeChartCard from "../components/HourlyModeChartCard";
import { SECONDARY_GREEN, TERTIARY_BLUE, TERTIARY_ORANGE, TERTIARY_PINK } from "../config/constants";
import { buildComparisonSeries, buildTransportationComparisonSeries } from "../utils/groupingFunctions";

const HOURLY_SERIES = [
  { key: "informal",     label: "Viajes en transporte informal",      color: SECONDARY_GREEN },
  { key: "public",       label: "Viajes en transporte público",       color: TERTIARY_BLUE },
  { key: "private",      label: "Viajes en transporte privado",       color: TERTIARY_ORANGE },
  { key: "nonMotorized", label: "Viajes en modos no motorizados",     color: TERTIARY_PINK },
];

export default function MobilityPatternsPanel({
  isCompareMode,
  localSelectedValues,
  selectedColorMap,
  activeThematicKey,
  detailedData,
  hourlyModeData = [],
  hourlyModeDatasets = null,
  durationHistogramData = [],
  durationByModeGroupData = [],
  tripsByEstratoData = [],
  tripFrequencyData = [],
}) {
  return (
    <section
      style={{
        marginBottom: 20,
        padding: 16,
        background: "#ffffff",
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 16 }}>Patrones de Movilidad</h3>

      <div className="chart-grid-2-mobility">
        {/* Gráfico horario — ocupa todo el ancho */}
        {!isCompareMode ? (
          <div style={{ gridColumn: "1 / -1" }}>
            <HourlyModeChartCard
              title="Distribución de viajes en un día (según hora de inicio)"
              data={hourlyModeData}
              datasets={hourlyModeDatasets}
              series={HOURLY_SERIES}
              showLegend
            />
          </div>
        ) : undefined}

        {(() => {
          const t = buildComparisonSeries(durationHistogramData, 20, localSelectedValues, selectedColorMap, activeThematicKey, detailedData);
          return (
            <BarChartCard
              title="Distribución de los viajes según su duración (% de viajes)"
              data={isCompareMode ? t.data : durationHistogramData}
              series={isCompareMode ? t.series : undefined}
              xKey="label"
              yKey="value"
              orientation="vertical"
              showPercent
              color={SECONDARY_GREEN}
              isCompareMode={isCompareMode}
              xAxisLabel="Duración en minutos"
              yAxisLabel="% de viajes"
            />
          );
        })()}

        {(() => {
          const t = buildComparisonSeries(tripFrequencyData, 21, localSelectedValues, selectedColorMap, activeThematicKey, detailedData);
          return (
            <BarChartCard
              title="Frecuencia del viaje (% de viajes)"
              data={isCompareMode ? t.data : tripFrequencyData}
              series={isCompareMode ? t.series : undefined}
              xKey="label"
              yKey="value"
              orientation="vertical"
              showPercent
              color={SECONDARY_GREEN}
              isCompareMode={isCompareMode}
              xAxisLabel="Frecuencia"
              yAxisLabel="% de viajes"
            />
          );
        })()}

        {(() => {
          const t = buildComparisonSeries(tripsByEstratoData, 22, localSelectedValues, selectedColorMap, activeThematicKey, detailedData);
          return (
            <BarChartCard
              title="Viajes diarios según estrato (% de viajes)"
              data={isCompareMode ? t.data : tripsByEstratoData}
              series={isCompareMode ? t.series : undefined}
              xKey="label"
              yKey="value"
              color={SECONDARY_GREEN}
              showPercent
              orientation="vertical"
              isCompareMode={isCompareMode}
              xAxisLabel="Estrato"
              yAxisLabel="% de viajes"
            />
          );
        })()}

        {(() => {
          const n = buildTransportationComparisonSeries(localSelectedValues, selectedColorMap, activeThematicKey, detailedData);
          return (
            <BarChartCard
              title="Tiempo promedio de viaje por modo de transporte (min)"
              data={isCompareMode ? n.data : durationByModeGroupData}
              series={isCompareMode ? n.series : undefined}
              xKey="label"
              yKey="value"
              color={SECONDARY_GREEN}
              showPercent={false}
              orientation="vertical"
              isCompareMode={isCompareMode}
              xAxisLabel="Modo"
              yAxisLabel="Tiempo (min)"
            />
          );
        })()}
      </div>
    </section>
  );
}
