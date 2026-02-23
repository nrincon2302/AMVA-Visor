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
  series,
  color = "#66CC33",
  orientation = "horizontal",
  showPercent = true,
  chartHeight,
  highlightKey,
  highlightColor,
  onSelect,
  isCompareMode = false,
}) => {
  const extractValues = () => {
    if (!data?.length) return [];
    if (series?.length) {
      return data.flatMap((row) =>
        series.map((entry) => row?.[entry.key]).filter((val) => Number.isFinite(val))
      );
    }
    return data
      .map((row) => row?.[yKey])
      .filter((val) => Number.isFinite(val));
  };

  const numericValues = extractValues();
  const isIntegerData =
    !showPercent &&
    numericValues.length > 0 &&
    numericValues.every((val) => Number.isInteger(val));

  const formatPercent = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return value;
    const rounded = Math.round(numeric * 10) / 10;
    const formatted = Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1);
    return `${formatted}%`;
  };

  const formatNumber = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return value;
    if (isIntegerData) {
      return Math.round(numeric).toLocaleString("es-CO");
    }
    return numeric.toLocaleString("es-CO", { maximumFractionDigits: 2 });
  };

  const formatValue = (value) => (showPercent ? formatPercent(value) : formatNumber(value));

  const isHorizontal = orientation === "horizontal";
  const resolvedHighlightColor = highlightColor || color;
  const categoryTickStyle = {
    fontSize: "9pt",
    fill: TEXT_COLOR,
    angle: isHorizontal ? 0 : -22,
    textAnchor: isHorizontal ? "end" : "end",
    dy: isHorizontal ? 0 : 2,
  };

  const numericDomain = showPercent
    ? [0, 100]
    : [
        (dataMin) => {
          const pad = Math.abs(dataMin) * 0.05 || 1;
          return dataMin - pad;
        },
        (dataMax) => {
          const pad = Math.abs(dataMax) * 0.05 || 1;
          return dataMax + pad;
        },
      ];

  return (
    <ChartCard title={title} actions={actions}>
      <ResponsiveContainer
        width="100%"
        height={chartHeight ?? (isHorizontal ? 360 : 320)}
        minHeight={320}
      >
        <BarChart
          data={data}
          layout={isHorizontal ? "vertical" : "horizontal"}
          margin={{ top: 20, right: 40, left: isHorizontal ? 32 : 6, bottom: 8 }}
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
              domain={numericDomain}
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
              width={120}
              tickLine={false}
              axisLine={{ stroke: AXIS_COLOR }}
              tick={categoryTickStyle}
            />
          ) : (
            <YAxis
              tickLine={false}
              axisLine={{ stroke: AXIS_COLOR }}
              tickFormatter={formatValue}
              domain={numericDomain}
              tick={{ fontSize: "10pt", fill: TEXT_COLOR }}
            />
          )}
          <Tooltip
            cursor={{ fill: "rgba(148,163,184,0.15)" }}
            contentStyle={{ borderRadius: 8, border: "none" }}
            formatter={(value, name) => {
              // En modo comparación, mostrar el nombre de la serie en lugar de "Valor" o "Participación"
              if (isCompareMode && series?.length) {
                return [formatValue(value), name];
              }
              return [formatValue(value), showPercent ? "Participación" : "Valor"];
            }}
          />
          {series?.length ? (
            series.map((entry) => (
              <Bar
                key={entry.key}
                dataKey={entry.key}
                name={entry.label}
                radius={isHorizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]}
                fill={entry.color}
                maxBarSize={36}
              >
                {!isCompareMode && (
                  <LabelList
                    dataKey={entry.key}
                    position={isHorizontal ? "right" : "top"}
                    style={{ fontSize: "10pt", fill: "#0f172a" }}
                    formatter={formatValue}
                  />
                )}
              </Bar>
            ))
          ) : (
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
          )}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default BarChartCard;
