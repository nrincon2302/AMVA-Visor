import React from "react";
import {
  BarChart,
  Bar,
  Cell,
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
  actions,
  data,
  xKey,
  yKey,
  color = "#22c55e",
  orientation = "vertical",
  showPercent = true,
  highlightKey,
  highlightColor = "#7AC143",
}) => {
  const formatValue = (value) =>
    showPercent ? `${value}%` : value.toLocaleString("es-CO");

  const isHorizontal = orientation === "horizontal";
  const categoryTickStyle = {
    fontSize: 12,
    fill: "#0f172a",
    angle: isHorizontal ? 0 : -22,
    textAnchor: isHorizontal ? "end" : "end",
    dy: isHorizontal ? 0 : 8,
  };

  return (
    <ChartCard title={title} actions={actions}>
      <ResponsiveContainer width="100%" height={isHorizontal ? 360 : 320}>
        <BarChart
          data={data}
          layout={isHorizontal ? "vertical" : "horizontal"}
          margin={{ top: 20, right: 18, left: isHorizontal ? 12 : 0, bottom: 12 }}
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
              tick={{ fontSize: 12, fill: "#0f172a" }}
            />
          ) : (
            <XAxis
              dataKey={xKey}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              tick={categoryTickStyle}
              interval={0}
              height={isHorizontal ? undefined : 70}
            />
          )}
          {isHorizontal ? (
            <YAxis
              dataKey={xKey}
              type="category"
              width={200}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              tick={categoryTickStyle}
            />
          ) : (
            <YAxis
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              tickFormatter={formatValue}
              domain={showPercent ? [0, 100] : ["dataMin", "auto"]}
              tick={{ fontSize: 12, fill: "#0f172a" }}
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
            {data?.map((entry) => (
              <Cell
                key={entry[xKey]}
                fill={
                  highlightKey && entry[xKey] === highlightKey
                    ? highlightColor
                    : color
                }
                opacity={highlightKey && entry[xKey] !== highlightKey ? 0.45 : 1}
              />
            ))}
            <LabelList
              dataKey={yKey}
              position={isHorizontal ? "right" : "top"}
              style={{ fontSize: 12, fill: "#0f172a" }}
              formatter={formatValue}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default BarChartCard;
