import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ChartCard from "./ChartCard";

const StackedAreaChartCard = ({ title, data = [], modes = [] }) => {
  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={340}>
        <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="hour"
            tickLine={false}
            tick={{ fontSize: 12, fill: "#0f172a", angle: -20, textAnchor: "end", dy: 8 }}
            height={70}
          />
          <YAxis
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: "#0f172a" }}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, "Participación" ]}
            contentStyle={{ borderRadius: 8, border: "none" }}
          />
          <Legend />
          {modes.map((mode) => (
            <Area
              key={mode}
              type="monotone"
              dataKey={mode}
              stackId="1"
              stroke={data[0]?.[`${mode}Color`] || "#0ea5e9"}
              fill={data[0]?.[`${mode}Color`] || "#0ea5e9"}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default StackedAreaChartCard;
