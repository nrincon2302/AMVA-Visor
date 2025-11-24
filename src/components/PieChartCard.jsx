import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Label,
} from "recharts";
import ChartCard from "./ChartCard";

const PieChartCard = ({
  title,
  data,
  dataKey,
  nameKey,
  colors = ["#22c55e", "#3b82f6", "#f97316", "#a855f7"],
}) => {
  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={95}
            innerRadius={52}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell
                key={`slice-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
            <Label
              position="center"
              content={({ viewBox }) => {
                const total = data.reduce((acc, item) => acc + (item[dataKey] || 0), 0);
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: 12, fill: "#111827" }}
                  >
                    {total ? "100%" : "Sin datos"}
                  </text>
                );
              }}
            />
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "none" }}
            formatter={(value) => [`${value}%`, "Participación"]}
          />
          <Legend verticalAlign="bottom" height={24} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default PieChartCard;
