import React from "react";
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
  modeData,
  purposeData,
  stageData,
  noTravelReasonData,
  populationInterestData,
  vehicleTypeData,
  vehicleModelData,
  vehicleTenureData,
  // datos detallados del backend (para modo COMPARAR)
  detailedData,
}) {
  const groupedColor = SECONDARY_GREEN;

  /**
   * Construir series para modo comparar usando datos detallados del backend
   * 
   * Estructura de comparisonData esperada:
   * comparisonData[indicador]["Campo de Gráfica"]["detailValue"].valor
   * 
   * Ejemplo:
   * comparisonData["modo_principal"]["Moto"]["12-17"].valor = 100
   */
  const buildComparisonSeries = (categoriesSource, detailedField) => {
    if (!detailedData || !detailedData.comparaciones) {
      return { data: [], series: [] };
    }

    const categories = (categoriesSource || []).map((d) => d.label || d.name || d);
    const selected = (localSelectedValues || []).slice(0, 3);
    
    const series = selected.map((val, idx) => ({
      key: sanitizeKey(String(val)),
      label: String(val),
      color: selectedColorMap?.get(val) || COMPARE_COLORS[idx] || COMPARE_COLORS[0],
      raw: val,
    }));

    // Obtener los datos de comparación del backend para el tema activo
    const comparisonData = detailedData.comparaciones[activeThematicKey];
    
    if (!comparisonData) {
      return { data: [], series: [] };
    }

    // Obtener el objeto de datos para el indicador específico
    const indicatorData = comparisonData[detailedField];
    if (!indicatorData) {
      return { data: [], series: [] };
    }

    // Construir los datos para el gráfico
    // Estructura: cada categoría es una fila, cada detalle seleccionado es una columna
    const data = categories.map((cat) => {
      const row = { label: cat };
      
      series.forEach((s) => {
        // Acceder a: indicatorData[graphField][detailValue].valor
        const value = indicatorData[cat]?.[s.raw]?.valor ?? 0;
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
              const m = buildComparisonSeries(modeData, "modo_principal");
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
              const p = buildComparisonSeries(purposeData, "motivo_viaje");
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
              const s = buildComparisonSeries(stageData, "etapas");
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
              const n = buildComparisonSeries(noTravelReasonData, "motivo_no_viaje");
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
              const pop = buildComparisonSeries(populationInterestData, "poblacion_interes");
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
            const t = buildComparisonSeries(vehicleTypeData, "tipo_vehiculo");
            return <BarChartCard title="Tipología (% de vehículos)" data={t.data} xKey="label" series={t.series} color={PRIMARY_GREEN} />;
          })()}
          {(() => {
            const vt = buildComparisonSeries(vehicleTenureData, "tenencia_vehicular");
            return <BarChartCard title="Cantidad (% de vehículos)" data={vt.data} xKey="label" series={vt.series} color={PRIMARY_GREEN} />;
          })()}
          {(() => {
            const m = buildComparisonSeries(vehicleModelData, "modelo_vehiculo");
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