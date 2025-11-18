import React, { useState } from "react";
import BarChartCard from "./BarChartCard";
import PieChartCard from "./PieChartCard";

const METRICS = [
  { id: "genero", label: "Género" },
  { id: "edad", label: "Edad" },
  { id: "escolaridad", label: "Escolaridad" },
  { id: "estrato", label: "Estrato" },
  { id: "ingresos", label: "Nivel de Ingresos" },
];

const TabbedChartsRecharts = ({
  estratoData = [],
  edadData = [],
  generoData = [],
  escolaridadData = [],
  ingresosData = [],
  filters,
  onGenderFilterChange,
}) => {
  const [selectedMetrics, setSelectedMetrics] = useState([
    "estrato",
    "edad",
    "genero",
  ]);

  const currentGender = filters?.gender ?? "Todos";

  const handleMetricClick = (metricId) => {
    setSelectedMetrics((prev) => {
      if (prev.includes(metricId)) return prev;
      if (prev.length < 3) return [...prev, metricId];
      return [...prev.slice(1), metricId];
    });
  };

  const renderChartForMetric = (metricId) => {
    switch (metricId) {
      case "estrato":
        return (
          <BarChartCard
            key="estrato"
            title="Estrato"
            data={estratoData}
            xKey="label"
            yKey="value"
            color="#22c55e"
          />
        );
      case "edad":
        return (
          <BarChartCard
            key="edad"
            title="Edad"
            data={edadData}
            xKey="label"
            yKey="value"
            color="#3b82f6"
          />
        );
      case "escolaridad":
        return (
          <BarChartCard
            key="escolaridad"
            title="Escolaridad"
            data={escolaridadData}
            xKey="label"
            yKey="value"
            color="#22c55e"
          />
        );
      case "ingresos":
        return (
          <BarChartCard
            key="ingresos"
            title="Nivel de Ingresos"
            data={ingresosData}
            xKey="label"
            yKey="value"
            color="#6366f1"
          />
        );
      case "genero":
      default:
        return (
          <PieChartCard
            key="genero"
            title="Género"
            data={generoData}
            dataKey="value"
            nameKey="name"
          />
        );
    }
  };

  return (
    <div>
      {/* Filtro por género */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 12,
          fontSize: 12,
        }}
      >
        <span style={{ color: "#6b7280" }}>Filtro por género:</span>
        {["Todos", "Hombre", "Mujer"].map((g) => {
          const active = currentGender === g;
          return (
            <button
              key={g}
              onClick={() =>
                onGenderFilterChange && onGenderFilterChange(g)
              }
              style={{
                borderRadius: 9999,
                border: active ? "1px solid #16a34a" : "1px solid #d1d5db",
                background: active ? "#ecfdf3" : "#ffffff",
                fontSize: 11,
                padding: "4px 10px",
                cursor: "pointer",
              }}
            >
              {g}
            </button>
          );
        })}
      </div>

      {/* Tabs de métricas */}
      <div
        style={{
          display: "flex",
          gap: 8,
          borderBottom: "1px solid #e5e7eb",
          marginBottom: 12,
          overflowX: "auto",
        }}
      >
        {METRICS.map((metric) => {
          const isActive = selectedMetrics.includes(metric.id);
          return (
            <button
              key={metric.id}
              onClick={() => handleMetricClick(metric.id)}
              style={{
                border: "none",
                background: isActive ? "#16a34a" : "transparent",
                color: isActive ? "#ffffff" : "#4b5563",
                padding: "6px 12px",
                borderRadius: 9999,
                fontSize: 13,
                fontWeight: isActive ? 600 : 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {metric.label}
            </button>
          );
        })}
      </div>

      {/* Gráficos */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 24,
          paddingBottom: 24,
        }}
      >
        {selectedMetrics.map((metricId) => renderChartForMetric(metricId))}
      </div>
    </div>
  );
};

export default TabbedChartsRecharts;