import React from "react";
import BarChartCard from "./BarChartCard";
import PieChartCard from "./PieChartCard";

const BAR_COLORS = {
  estrato: "#66CC33",
  edad: "#66CC33",
  escolaridad: "#66CC33",
  ocupacion: "#00A7F4",
};

const GENDER_COLOR_MAP = {
  Hombre: "#00A7F4",
  Mujer: "#E770D3",
};

const PIE_COLORS = [
  "#00A7F4",
  "#E770D3",
  "#66CC33",
  "#339933",
  "#FF9000",
  "#FDEB00",
];

const TabbedChartsRecharts = ({
  estratoData = [],
  edadData = [],
  generoData = [],
  escolaridadData = [],
  occupationData = [],
  selectedFilters = {},
  onSelect,
}) => {
  const charts = [
    {
      id: "estrato",
      content: (
        <BarChartCard
          key="estrato"
          title="Estrato"
          data={estratoData}
          xKey="label"
          yKey="value"
          color={BAR_COLORS.estrato}
          highlightKey={selectedFilters.estrato}
          onSelect={(value) => onSelect?.("estrato", value)}
        />
      ),
    },
    {
      id: "edad",
      content: (
        <BarChartCard
          key="edad"
          title="Edad"
          data={edadData}
          xKey="label"
          yKey="value"
          color={BAR_COLORS.edad}
          highlightKey={selectedFilters.ageRange}
          onSelect={(value) => onSelect?.("ageRange", value)}
        />
      ),
    },
    {
      id: "escolaridad",
      content: (
        <BarChartCard
          key="escolaridad"
          title="Escolaridad"
          data={escolaridadData}
          xKey="label"
          yKey="value"
          color={BAR_COLORS.escolaridad}
          highlightKey={selectedFilters.edu}
          onSelect={(value) => onSelect?.("edu", value)}
        />
      ),
    },
    {
      id: "genero",
      content: (
        <PieChartCard
          key="genero"
          title="Género"
          data={generoData}
          dataKey="value"
          nameKey="name"
          colors={PIE_COLORS}
          colorMap={GENDER_COLOR_MAP}
          selectedKey={selectedFilters.gender}
          onSelect={(value) => onSelect?.("gender", value)}
        />
      ),
    },
    {
      id: "ocupacion",
      content: (
        <BarChartCard
          key="ocupacion"
          title="Ocupación"
          data={occupationData}
          xKey="label"
          yKey="value"
          color={BAR_COLORS.ocupacion}
          highlightKey={selectedFilters.occupation}
          onSelect={(value) => onSelect?.("occupation", value)}
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
