import BarChartCard from "../components/BarChartCard";
import { PRIMARY_GREEN, SECONDARY_GREEN } from "../config/constants";
import { buildComparisonSeries } from "../utils/groupingFunctions";

const toLabelValue = (arr) =>
  (arr || []).map((d) => ({ label: d.label || d.name || d[0], value: d.value || d[1] || 0 }));

export default function SociodemographicPanel({
  isCompareMode,
  localSelectedValues,
  selectedColorMap,
  activeThematicKey,
  socioData1 = [],
  socioData2 = [],
  socioData3 = [],
  socioData4 = [],
  detailedData,
}) {
  const groupedColor = SECONDARY_GREEN;

  const chartsContent = (
    <div className="analysis-grid-sociodemographic">
      {isCompareMode ? (
        <>
          <div>
            {(() => {
              const d1 = buildComparisonSeries(socioData1, 42, localSelectedValues, selectedColorMap, activeThematicKey, detailedData);
              return (
                <BarChartCard
                  title="Población por edad"
                  data={d1.data}
                  xKey="label"
                  series={d1.series}
                  color={PRIMARY_GREEN}
                  orientation="vertical"
                  chartHeight={360}
                  isCompareMode={isCompareMode}
                  xAxisLabel="Edad"
                  yAxisLabel="% de personas encuestadas"
                />
              );
            })()}
          </div>

          <div>
            {(() => {
              const d2 = buildComparisonSeries(socioData2, 43, localSelectedValues, selectedColorMap, activeThematicKey, detailedData);
              return (
                <BarChartCard
                  title="Población por género"
                  data={d2.data}
                  xKey="label"
                  series={d2.series}
                  color={PRIMARY_GREEN}
                  orientation="vertical"
                  chartHeight={360}
                  isCompareMode={isCompareMode}
                  xAxisLabel="Género"
                  yAxisLabel="% de personas encuestadas"
                />
              );
            })()}
          </div>

          <div>
            {(() => {
              const d3 = buildComparisonSeries(socioData3, 44, localSelectedValues, selectedColorMap, activeThematicKey, detailedData);
              return (
                <BarChartCard
                  title="Población por ocupación"
                  data={d3.data}
                  xKey="label"
                  series={d3.series}
                  color={PRIMARY_GREEN}
                  orientation="vertical"
                  chartHeight={360}
                  isCompareMode={isCompareMode}
                  xAxisLabel="Ocupación"
                  yAxisLabel="% de personas encuestadas"
                />
              );
            })()}
          </div>

          <div>
            {(() => {
              const d4 = buildComparisonSeries(socioData4, 45, localSelectedValues, selectedColorMap, activeThematicKey, detailedData);
              return (
                <BarChartCard
                  title="Población por escolaridad"
                  data={d4.data}
                  xKey="label"
                  series={d4.series}
                  color={PRIMARY_GREEN}
                  orientation="vertical"
                  chartHeight={360}
                  isCompareMode={isCompareMode}
                  xAxisLabel="Escolaridad"
                  yAxisLabel="% de personas encuestadas"
                />
              );
            })()}
          </div>
        </>
      ) : (
        <>
          <BarChartCard
            title="Población por edad"
            data={toLabelValue(socioData1)}
            xKey="label"
            yKey="value"
            color={groupedColor}
            orientation="vertical"
            chartHeight={360}
            xAxisLabel="Edad"
            yAxisLabel="% de personas encuestadas"
          />
          <BarChartCard
            title="Población por género"
            data={toLabelValue(socioData2)}
            xKey="label"
            yKey="value"
            color={groupedColor}
            orientation="vertical"
            chartHeight={360}
            xAxisLabel="Género"
            yAxisLabel="% de personas encuestadas"
          />
          <BarChartCard
            title="Población por ocupación"
            data={toLabelValue(socioData3)}
            xKey="label"
            yKey="value"
            color={groupedColor}
            orientation="vertical"
            chartHeight={360}
            xAxisLabel="Ocupación"
            yAxisLabel="% de personas encuestadas"
          />
          <BarChartCard
            title="Población por escolaridad"
            data={toLabelValue(socioData4)}
            xKey="label"
            yKey="value"
            color={groupedColor}
            orientation="vertical"
            chartHeight={360}
            xAxisLabel="Escolaridad"
            yAxisLabel="% de personas encuestadas"
          />
        </>
      )}
    </div>
  );

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
        <h2 style={{ margin: 0, fontSize: 16 }}>Caracterización Socioeconómica</h2>
      </div>
      {chartsContent}
    </section>
  );
}
