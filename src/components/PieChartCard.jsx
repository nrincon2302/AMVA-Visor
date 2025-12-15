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
  colors = ["#66CC33", "#339933", "#FF9000", "#E770D3", "#00A7F4", "#FDEB00"],
  colorMap,
  onSelect,
  selectedKey,
}) => {
  const getSliceColor = (entry, index) =>
    colorMap?.[entry[nameKey]] || colors[index % colors.length];

  const renderLabel = (props) => {
    const RADIAN = Math.PI / 180;
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      percent,
      index,
      payload,
    } = props;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.65;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const fill = getSliceColor(payload, index);
    const value = `${(percent * 100).toFixed(1)}%`;

    return (
      <text
        x={x}
        y={y}
        fill={fill}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="8pt"
      >
        {value}
      </text>
    );
  };

  return (
    <ChartCard title={title}>
      <div style={{ width: "100%", height: 320, overflow: "visible", paddingLeft: 32 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="55%"
              cy="50%"
              outerRadius={105}
              innerRadius={58}
              paddingAngle={2}
              labelLine={false}
              label={renderLabel}
              onClick={(entry) => onSelect?.(entry?.name)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`slice-${index}`}
                  fill={getSliceColor(entry, index)}
                  opacity={
                    selectedKey && selectedKey !== entry[nameKey] ? 0.4 : 1
                  }
                />
              ))}
            </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "none" }}
            formatter={(value, name) => [`${value}%`, name]}
          />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingLeft: 12, fontSize: "8pt", width: 180 }}
          />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default PieChartCard;
