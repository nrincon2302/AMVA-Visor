import React, { useState } from "react";
import BarChartCard from "./BarChartCard";
import PieChartCard from "./PieChartCard";

// Definimos las métricas que existen y el tipo de gráfica
const METRICS = [
  { id: "genero", label: "Género", type: "pie" },
  { id: "edad", label: "Edad", type: "bar" },
  { id: "escolaridad", label: "Escolaridad", type: "bar" },
  { id: "estrato", label: "Estrato", type: "bar" },
  { id: "ingresos", label: "Nivel de Ingresos", type: "bar" },
];

const TabbedChartsRecharts = ({
  estratoData = [],
  edadData = [],
  generoData = [],
  escolaridadData = [],
  ingresosData = [],
}) => {
  // arr de ids de métricas visibles (máx 3)
  const [selectedMetrics, setSelectedMetrics] = useState([
    "estrato",
    "edad",
    "genero",
  ]);

  const handleMetricClick = (metricId) => {
    setSelectedMetrics((prev) => {
      // si ya está seleccionada, no hacemos nada (puedes cambiar esto si quieres toggle)
      if (prev.includes(metricId)) return prev;

      // si hay menos de 3, simplemente la agregamos
      if (prev.length < 3) {
        return [...prev, metricId];
      }

      // si ya hay 3, sacamos la más vieja (posición 0) y metemos la nueva al final
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

      {/* Grid de gráficas seleccionadas */}
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