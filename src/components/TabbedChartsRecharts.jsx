import React from "react";
import BarChartCard from "./BarChartCard";
import PieChartCard from "./PieChartCard";

const TabbedChartsRecharts = ({
  estratoData = [],
  edadData = [],
  generoData = [],
  escolaridadData = [],
  ingresosData = [],
}) => {
  const charts = [
    {
      id: "estrato",
      content: (
        <BarChartCard
          key="estrato"
          title="Distribución de viajes según estrato"
          data={estratoData}
          xKey="label"
          yKey="value"
        />
      ),
    },
    {
      id: "edad",
      content: (
        <BarChartCard
          key="edad"
          title="Distribución de viajes según edad"
          data={edadData}
          xKey="label"
          yKey="value"
        />
      ),
    },
    {
      id: "escolaridad",
      content: (
        <BarChartCard
          key="escolaridad"
          title="Distribución de viajes según escolaridad"
          data={escolaridadData}
          xKey="label"
          yKey="value"
        />
      ),
    },
    {
      id: "ingresos",
      content: (
        <BarChartCard
          key="ingresos"
          title="Distribución de viajes según ingresos"
          data={ingresosData}
          xKey="label"
          yKey="value"
        />
      ),
    },
    {
      id: "genero",
      content: (
        <PieChartCard
          key="genero"
          title="Distribución de viajes según género"
          data={generoData}
          dataKey="value"
          nameKey="name"
        />
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 24,
          paddingBottom: 24,
        }}
      >
        {charts.map((chart) => (
          <div key={chart.id}>{chart.content}</div>
        ))}
      </div>
    </div>
  );
};

export default TabbedChartsRecharts;
