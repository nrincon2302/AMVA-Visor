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
  colors = ["#22c55e", "#3b82f6", "#f97316", "#a855f7", "#eab308", "#ef4444"],
}) => {
  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="120%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={105}
            innerRadius={58}
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
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: 12, fill: "#111827" }}
                  >
                  </text>
                );
              }}
            />
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "none" }}
            formatter={(entry, value) => [`${value}:\n ${entry}%`]}
          />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingLeft: 12, fontSize: 12, width: 180 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default PieChartCard;
