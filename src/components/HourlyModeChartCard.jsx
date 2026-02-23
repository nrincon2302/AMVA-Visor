import {
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine,
  Legend,
  Label,
} from "recharts";
import { useEffect, useState } from "react";
import ChartCard from "./ChartCard";

const GRID_COLOR = "#BFBFBF";
const AXIS_COLOR = "#A6A6A6";
const DEFAULT_LINE_COLOR = "#00A7F4";
const DOT_STROKE = "#339933";

const HourlyModeChartCard = ({
  title,
  data = [],          // modo simple
  datasets = null,    // modo comparar [{ nombre, data }]
  series,
  lineColor,
  showLegend = false,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const isComparison = Array.isArray(datasets) && datasets.length > 0;

  useEffect(() => {
    setSelectedIndex(0);
  }, [datasets]);

  const activeData = isComparison
    ? datasets[selectedIndex]?.data ?? []
    : data;

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString("es-CO");

  return (
    <ChartCard title={title}>
      {/* Selector tipo viñetas */}
      {isComparison && datasets.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          {datasets.map((item, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                border:
                  index === selectedIndex
                    ? "2px solid #0f172a"
                    : "1px solid #cbd5e1",
                background:
                  index === selectedIndex
                    ? "#f1f5f9"
                    : "#ffffff",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              {item.nombre}
            </button>
          ))}
        </div>
      )}

      <ResponsiveContainer width="100%" height={360}>
        <LineChart
          data={activeData}
          margin={{ top: 20, right: 24, left: 10, bottom: 32 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />

          <XAxis
            dataKey="hour"
            tickLine={false}
            axisLine={{ stroke: AXIS_COLOR }}
            tick={{
              fontSize: "10pt",
              fill: "#0f172a",
              angle: -35,
              textAnchor: "end",
            }}
            interval={0}
            height={64}>
            <Label value="Hora de inicio del viaje" position="bottom" offset={20} />
          </XAxis>

          <YAxis
            tickFormatter={formatNumber}
            tickLine={false}
            axisLine={{ stroke: AXIS_COLOR }}
            tick={{ fontSize: "10pt", fill: "#0f172a" }}
            allowDecimals={false}
          >
            <Label value="Cantidad de viajes" angle={-90} position="left" offset={0} />
          </YAxis>

          <Tooltip
            contentStyle={{ borderRadius: 8, border: "none" }}
            formatter={(value) => [formatNumber(value), "Viajes"]}
          />

          <ReferenceLine y={0} stroke={AXIS_COLOR} />
          {showLegend && <Legend verticalAlign="top" height={24} />}

          {series?.length ? (
            series.map((entry) => (
              <Line
                key={entry.key}
                type="monotone"
                dataKey={entry.key}
                name={entry.label}
                stroke={
                  entry.color ||
                  lineColor ||
                  DEFAULT_LINE_COLOR
                }
                strokeWidth={2.6}
                dot={{
                  r: 3.2,
                  strokeWidth: 1.4,
                  stroke:
                    entry.color ||
                    lineColor ||
                    DEFAULT_LINE_COLOR,
                  fill: "#ffffff",
                }}
                activeDot={{ r: 5 }}
              />
            ))
          ) : (
            <Line
              type="monotone"
              dataKey="value"
              name="Viajes"
              stroke={lineColor || DEFAULT_LINE_COLOR}
              strokeWidth={2.6}
              dot={{
                r: 3.6,
                strokeWidth: 1.4,
                stroke: DOT_STROKE,
                fill: "#ffffff",
              }}
              activeDot={{ r: 5 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default HourlyModeChartCard;