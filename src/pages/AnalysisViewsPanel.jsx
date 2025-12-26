import React from "react";
import BarChartCard from "../components/BarChartCard";
import HourlyModeChartCard from "../components/HourlyModeChartCard";
import { PRIMARY_GREEN, COMPARE_COLORS, SECONDARY_GREEN } from "../config/constants";

const toLabelValue = (arr) => (arr || []).map((d) => ({ label: d.label || d.name || d[0], value: d.value || d[1] || 0 }));
const sanitizeKey = (v) => String(v).replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\-]/g, "");

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
  hourlyTripShareData,
  estratoData,
  edadData,
  generoData,
  escolaridadData,
  occupationData,
  vehicleTypeData,
  vehicleModelData,
  vehicleTenureData,
  filteredTrips,
}) {
  const getCategories = (arr) => (arr || []).map((d) => d.label || d.name || d);

  const buildMultiSeries = (targetField, categoriesSource) => {
    const categories = getCategories(categoriesSource);
    const selected = (localSelectedValues || []).slice(0, 3);
    const series = selected.map((val, idx) => ({
      key: sanitizeKey(String(val)),
      label: String(val),
      color: selectedColorMap?.get(val) || COMPARE_COLORS[idx] || COMPARE_COLORS[0],
      raw: val,
    }));

    const totals = series.reduce((acc, s) => {
      const total = filteredTrips.filter((t) => String(t[activeThematicKey]) === String(s.raw)).length;
      acc[s.key] = total;
      return acc;
    }, {});

    const data = categories.map((cat) => {
      const row = { label: cat };
      series.forEach((s) => {
        const matches = filteredTrips.filter(
          (t) => String(t[targetField]) === String(cat) && String(t[activeThematicKey]) === String(s.raw)
        ).length;
        row[s.key] = totals[s.key] ? Number(((matches / totals[s.key]) * 100).toFixed(1)) : 0;
      });
      return row;
    });

    return { data, series };
  };

  const buildHourlyMultiSeries = () => {
    const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);
    const selected = (localSelectedValues || []).slice(0, 3);
    const series = selected.map((val, idx) => ({
      key: sanitizeKey(String(val)),
      label: String(val),
      color: selectedColorMap?.get(val) || COMPARE_COLORS[idx] || COMPARE_COLORS[0],
      raw: val,
    }));

    const data = hours.map((hour) => {
      const row = { hour };
      series.forEach((s) => {
        const matches = filteredTrips.filter(
          (t) => String(t.departureLabel) === hour && String(t[activeThematicKey]) === String(s.raw)
        ).length;
        row[s.key] = matches;
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
                  title="Motivo (% de viajes)"
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

          <div style={{ gridColumn: "2 / 4", gridRow: "2 / 3" }}>
            {(() => {
              const h = buildHourlyMultiSeries();
              return <HourlyModeChartCard title="Distribución de viajes en un día (según hora de inicio)" data={h.data} series={h.series} />;
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
              color={PRIMARY_GREEN}
              orientation="horizontal"
              chartHeight={720}
            />
          </div>

          <div style={{ gridColumn: "2 / 3", gridRow: "1 / 2" }}>
            <BarChartCard
              title="Motivo (% de viajes)"
              data={toLabelValue(purposeData)}
              xKey="label"
              yKey="value"
              color={PRIMARY_GREEN}
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
              color={PRIMARY_GREEN}
              orientation="horizontal"
              chartHeight={360}
            />
          </div>

          <div style={{ gridColumn: "2 / 4", gridRow: "2 / 3" }}>
            <HourlyModeChartCard title="Distribución de viajes en un día (según hora de inicio)" data={hourlyTripShareData} lineColor={SECONDARY_GREEN} />
          </div>
        </>
      )}
    </div>
  );

  const socioCharts = (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
      {isCompareMode ? (
        <>
          {(() => {
            const e = buildMultiSeries("edu", escolaridadData);
            return <BarChartCard title="Escolaridad" data={e.data} xKey="label" series={e.series} color={PRIMARY_GREEN} />;
          })()}
          {(() => {
            const g = buildMultiSeries("gender", generoData);
            return <BarChartCard title="Género" data={g.data} xKey="label" series={g.series} color={PRIMARY_GREEN} />;
          })()}
          {(() => {
            const o = buildMultiSeries("occupation", occupationData);
            return <BarChartCard title="Ocupación" data={o.data} xKey="label" series={o.series} color={PRIMARY_GREEN} />;
          })()}
          {(() => {
            const ag = buildMultiSeries("ageRange", edadData);
            return <BarChartCard title="Edad" data={ag.data} xKey="label" series={ag.series} color={PRIMARY_GREEN} />;
          })()}
          {(() => {
            const es = buildMultiSeries("estrato", estratoData);
            return <BarChartCard title="Estrato" data={es.data} xKey="label" series={es.series} color={PRIMARY_GREEN} />;
          })()}
        </>
      ) : (
        <>
          <BarChartCard title="Escolaridad" data={toLabelValue(escolaridadData)} xKey="label" yKey="value" color={PRIMARY_GREEN} />
          <BarChartCard title="Género" data={toLabelValue(generoData)} xKey="label" yKey="value" color={PRIMARY_GREEN} />
          <BarChartCard title="Ocupación" data={toLabelValue(occupationData)} xKey="label" yKey="value" color={PRIMARY_GREEN} />
          <BarChartCard title="Edad" data={toLabelValue(edadData)} xKey="label" yKey="value" color={PRIMARY_GREEN} />
          <BarChartCard title="Estrato" data={toLabelValue(estratoData)} xKey="label" yKey="value" color={PRIMARY_GREEN} />
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
          <BarChartCard title="Tipología (% de vehículos)" data={toLabelValue(vehicleTypeData)} xKey="label" yKey="value" color={PRIMARY_GREEN} />
          <BarChartCard title="Cantidad (% de vehículos)" data={toLabelValue(vehicleTenureData)} xKey="label" yKey="value" color={PRIMARY_GREEN} />
          <BarChartCard title="Modelo (% de vehículos)" data={toLabelValue(vehicleModelData)} xKey="label" yKey="value" color={PRIMARY_GREEN} />
        </>
      )}
    </div>
  );

  const titleMap = {
    viajes: "Análisis de viajes",
    socio: "Análisis socioeconómico",
    vehicular: "Vehículos por Hogar",
  };

  return (
    <section style={{ marginTop: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 16 }}>{titleMap[analysisView] || "Análisis"}</h2>
      </div>
      {analysisView === "viajes" && viajesCharts}
      {analysisView === "socio" && socioCharts}
      {analysisView === "vehicular" && vehicularCharts}
    </section>
  );
}
