import React from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";
import ChartCard from "./ChartCard";

const GRID_COLOR = "#BFBFBF";
const AXIS_COLOR = "#A6A6A6";
const LINE_COLOR = "#00A7F4";
const DOT_STROKE = "#339933";

const HourlyModeChartCard = ({ title, data = [] }) => {
  const formatNumber = (value) => Number(value || 0).toLocaleString("es-CO");

  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={data} margin={{ top: 20, right: 24, left: 4, bottom: 32 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
          <XAxis
            dataKey="hour"
            tickLine={false}
            axisLine={{ stroke: AXIS_COLOR }}
            tick={{ fontSize: "8pt", fill: "#0f172a", angle: -35, textAnchor: "end" }}
            interval={0}
            height={64}
          />
          <YAxis
            tickFormatter={formatNumber}
            tickLine={false}
            axisLine={{ stroke: AXIS_COLOR }}
            tick={{ fontSize: "8pt", fill: "#0f172a" }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "none" }}
            formatter={(value) => [formatNumber(value), "Viajes"]}
          />
          <ReferenceLine y={0} stroke={AXIS_COLOR} />
          <Line
            type="monotone"
            dataKey="value"
            name="Viajes"
            stroke={LINE_COLOR}
            strokeWidth={2.6}
            dot={{ r: 3.6, strokeWidth: 1.4, stroke: DOT_STROKE, fill: "#ffffff" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default HourlyModeChartCard;
