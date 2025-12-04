import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";
import ChartCard from "./ChartCard";

const MODE_COLORS = {
  Metro: "#2563eb",
  Bus: "#22c55e",
  Moto: "#06b6d4",
  Carro: "#f97316",
  Bicicleta: "#a855f7",
  Caminata: "#0ea5e9",
  Taxi: "#e11d48",
  Tranvía: "#facc15",
};

const HourlyModeChartCard = ({
  title,
  data = [],
  modes = [],
  selectedModes = [],
}) => {
  const [activeModes, setActiveModes] = useState([]);

  useEffect(() => {
    if (selectedModes?.length) {
      setActiveModes(selectedModes);
    } else {
      setActiveModes(modes);
    }
  }, [modes, selectedModes]);

  const formatNumber = (value) => Number(value || 0).toLocaleString("es-CO");

  const handleLegendClick = (payload) => {
    const mode = payload?.value;
    setActiveModes((prev) =>
      prev.includes(mode) ? prev.filter((item) => item !== mode) : [...prev, mode]
    );
  };

  const legendPayload = useMemo(
    () =>
      modes.map((mode) => ({
        id: mode,
        type: "square",
        value: mode,
        color: MODE_COLORS[mode] || "#2563eb",
      })),
    [modes]
  );

  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={data} margin={{ top: 20, right: 24, left: 4, bottom: 28 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="hour"
            tickLine={false}
            axisLine={{ stroke: "#e5e7eb" }}
            tick={{ fontSize: 12, fill: "#0f172a", angle: -35, textAnchor: "end" }}
            interval={0}
            height={58}
          />
          <YAxis
            tickFormatter={formatNumber}
            tickLine={false}
            axisLine={{ stroke: "#e5e7eb" }}
            tick={{ fontSize: 12, fill: "#0f172a" }}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(148,163,184,0.15)" }}
            contentStyle={{ borderRadius: 8, border: "none" }}
            formatter={(value, name) => [formatNumber(value), name]}
          />
          <Legend
            payload={legendPayload}
            onClick={handleLegendClick}
            wrapperStyle={{ paddingTop: 8, fontSize: 12, cursor: "pointer" }}
          />
          {modes.map((mode) => (
            <Bar
              key={mode}
              dataKey={mode}
              name={mode}
              fill={MODE_COLORS[mode] || "#2563eb"}
              stackId="modes"
              radius={[6, 6, 0, 0]}
              hide={!activeModes.includes(mode)}
              maxBarSize={42}
            >
              <LabelList
                position="top"
                formatter={formatNumber}
                style={{ fontSize: 11, fill: "#0f172a" }}
              />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default HourlyModeChartCard;
