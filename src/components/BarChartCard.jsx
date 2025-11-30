import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from "recharts";
import ChartCard from "./ChartCard";

const BarChartCard = ({
  title,
  data,
  xKey,
  yKey,
  color = "#22c55e",
  orientation = "vertical",
  showPercent = true,
}) => {
  const formatValue = (value) =>
    showPercent ? `${value}%` : value.toLocaleString("es-CO");

  const isHorizontal = orientation === "horizontal";

  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={isHorizontal ? 320 : 280}>
        <BarChart
          data={data}
          layout={isHorizontal ? "vertical" : "horizontal"}
          margin={{ top: 20, right: 12, left: 0, bottom: 12 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={!isHorizontal}
            horizontal={isHorizontal}
          />
          {isHorizontal ? (
            <XAxis
              type="number"
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              tickFormatter={formatValue}
            />
          ) : (
            <XAxis
              dataKey={xKey}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
            />
          )}
          {isHorizontal ? (
            <YAxis
              dataKey={xKey}
              type="category"
              width={150}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
            />
          ) : (
            <YAxis
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              tickFormatter={formatValue}
              domain={showPercent ? [0, 100] : ["dataMin", "auto"]}
            />
          )}
          <Tooltip
            cursor={{ fill: "rgba(148,163,184,0.15)" }}
            contentStyle={{ borderRadius: 8, border: "none" }}
            formatter={(value) => [formatValue(value), showPercent ? "Participación" : "Valor"]}
          />
          <Bar
            dataKey={yKey}
            radius={isHorizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]}
            fill={color}
            maxBarSize={48}
          >
            <LabelList
              dataKey={yKey}
              position={isHorizontal ? "right" : "top"}
              formatter={formatValue}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default BarChartCard;
