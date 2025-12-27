import React from "react";
import BarChartCard from "../components/BarChartCard";
import HourlyModeChartCard from "../components/HourlyModeChartCard";
import { SECONDARY_GREEN, TERTIARY_BLUE, TERTIARY_ORANGE, TERTIARY_YELLOW } from "../config/constants";

const HOURLY_SERIES = [
  { key: "total", label: "Total", color: SECONDARY_GREEN },
  { key: "public", label: "Público", color: TERTIARY_BLUE },
  { key: "private", label: "Privado", color: TERTIARY_ORANGE },
  { key: "nonMotorized", label: "No motorizado", color: TERTIARY_YELLOW },
  { key: "other", label: "Otros", color: "#64748b" },
];

export default function MobilityPatternsPanel({
  hourlyModeData = [],
  durationHistogramData = [],
  tripsByEstratoData = [],
}) {
  return (
    <section
      style={{
        marginBottom: 20,
        padding: 16,
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 16 }}>Patrones de movilidad</h3>
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
          title="Duración de viajes (min)"
          data={durationHistogramData}
          xKey="label"
          yKey="value"
          orientation="vertical"
          showPercent={false}
          color={SECONDARY_GREEN}
        />
        <BarChartCard
          title="Viajes por estrato"
          data={tripsByEstratoData}
          xKey="label"
          yKey="value"
          color={SECONDARY_GREEN}
          showPercent={false}
        />
      </div>
    </section>
  );
}
