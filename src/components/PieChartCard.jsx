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

  const renderLabelOutside = (props) => {
    const RADIAN = Math.PI / 180;
    const {
      cx,
      cy,
      midAngle,
      outerRadius,
      percent,
      index,
      payload,
    } = props;

    // Empuja el texto fuera del pastel (ajusta si quieres más lejos)
    const offset = 18;
    const radius = outerRadius + offset;

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
      <div style={{ width: "100%", height: 320, overflow: "visible", paddingLeft: 20 }}>
        <ResponsiveContainer width="120%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              outerRadius={95}
              innerRadius={50}
              paddingAngle={2}
              labelLine={true}
              label={renderLabelOutside}
              onClick={(entry) => onSelect?.(entry?.name)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`slice-${index}`}
                  fill={getSliceColor(entry, index)}
                  opacity={selectedKey && selectedKey !== entry[nameKey] ? 0.4 : 1}
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
              wrapperStyle={{ fontSize: "8pt", width: 200 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
};

export default PieChartCard;
