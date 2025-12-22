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

const GRID_COLOR = "#BFBFBF";
const AXIS_COLOR = "#A6A6A6";
const TEXT_COLOR = "#0f172a";

const BarChartCard = ({
  title,
  actions,
  data,
  xKey,
  yKey,
  color = "#66CC33",
  orientation = "horizontal",
  showPercent = true,
  highlightKey,
  highlightColor,
  onSelect,
}) => {
  const formatValue = (value) =>
    showPercent ? `${value}%` : value.toLocaleString("es-CO");

  const isHorizontal = orientation === "horizontal";
  const resolvedHighlightColor = highlightColor || color;
  const categoryTickStyle = {
    fontSize: "10pt",
    fill: TEXT_COLOR,
    angle: isHorizontal ? 0 : -22,
    textAnchor: isHorizontal ? "end" : "end",
    dy: isHorizontal ? 0 : 2,
  };

  return (
    <ChartCard title={title} actions={actions}>
      <ResponsiveContainer width="100%" height={isHorizontal ? 360 : 320}>
        <BarChart
          data={data}
          layout={isHorizontal ? "vertical" : "horizontal"}
          margin={{ top: 20, right: 40, left: isHorizontal ? 26 : 12, bottom: 8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={GRID_COLOR}
            vertical={!isHorizontal}
            horizontal={isHorizontal}
          />
          {isHorizontal ? (
            <XAxis
              type="number"
              tickLine={false}
              axisLine={{ stroke: AXIS_COLOR }}
              tickFormatter={formatValue}
              tick={{ fontSize: "10pt", fill: TEXT_COLOR }}
            />
          ) : (
            <XAxis
              dataKey={xKey}
              tickLine={false}
              axisLine={{ stroke: AXIS_COLOR }}
              tick={categoryTickStyle}
              interval={0}
              height={isHorizontal ? undefined : 70}
            />
          )}
          {isHorizontal ? (
            <YAxis
              dataKey={xKey}
              type="category"
              width={100}
              tickLine={false}
              axisLine={{ stroke: AXIS_COLOR }}
              tick={categoryTickStyle}
            />
          ) : (
            <YAxis
              tickLine={false}
              axisLine={{ stroke: AXIS_COLOR }}
              tickFormatter={formatValue}
              domain={showPercent ? [0, 100] : ["dataMin", "auto"]}
              tick={{ fontSize: "10pt", fill: TEXT_COLOR }}
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
            onClick={(data) => onSelect?.(data?.payload?.[xKey])}
          >
            {data?.map((entry) => (
              <Cell
                key={entry[xKey]}
                fill={
                  highlightKey && entry[xKey] === highlightKey
                    ? resolvedHighlightColor
                    : color
                }
                stroke={
                  highlightKey && entry[xKey] === highlightKey
                    ? resolvedHighlightColor
                    : "none"
                }
                strokeWidth={highlightKey && entry[xKey] === highlightKey ? 2 : 0}
                opacity={highlightKey && entry[xKey] !== highlightKey ? 0.25 : 1}
              />
            ))}
            <LabelList
              dataKey={yKey}
              position={isHorizontal ? "right" : "top"}
              style={{ fontSize: "10pt", fill: "#0f172a" }}
              formatter={formatValue}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default BarChartCard;
