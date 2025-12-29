import React from "react";
import BarChartCard from "../components/BarChartCard";
import HourlyModeChartCard from "../components/HourlyModeChartCard";
import { SECONDARY_GREEN, TERTIARY_BLUE, TERTIARY_ORANGE, TERTIARY_YELLOW } from "../config/constants";

const HOURLY_SERIES = [
  { key: "total", label: "Total", color: SECONDARY_GREEN },
  { key: "public", label: "Viajes en transporte público", color: TERTIARY_BLUE },
  { key: "private", label: "Viajes en transporte privado", color: TERTIARY_ORANGE },
  { key: "nonMotorized", label: "Viajes en modos no motorizados", color: TERTIARY_YELLOW },
];

export default function MobilityPatternsPanel({
  hourlyModeData = [],
  durationHistogramData = [],
  durationByModeGroupData = [],
  tripsByEstratoData = [],
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
      <h3 style={{ marginTop: 0, marginBottom: 16 }}>
        Características de los viajes y patrones de movilidad
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <HourlyModeChartCard
            title="Distribución de viajes en un día (según hora de inicio)"
            data={hourlyModeData}
            series={HOURLY_SERIES}
            showLegend
          />
        </div>
        <BarChartCard
          title="Duración de los viajes (en min)"
          data={durationHistogramData}
          xKey="label"
          yKey="value"
          orientation="vertical"
          showPercent={false}
          color={SECONDARY_GREEN}
        />
        <BarChartCard
          title="Viajes diarios según estrato (% de viajes)"
          data={tripsByEstratoData}
          xKey="label"
          yKey="value"
          color={SECONDARY_GREEN}
          showPercent={false}
          orientation="vertical"
        />
        <BarChartCard
          title="Tiempo promedio de viaje por modo de transporte (min)"
          data={durationByModeGroupData}
          xKey="label"
          yKey="value"
          color={SECONDARY_GREEN}
          showPercent={false}
          orientation="vertical"
        />
      </div>
    </section>
  );
}
