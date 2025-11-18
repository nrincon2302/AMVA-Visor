import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={45}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell
                key={`slice-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 8, border: "none" }} />
          <Legend verticalAlign="bottom" height={24} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default PieChartCard;