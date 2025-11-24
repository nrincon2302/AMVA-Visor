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
}) => {
  const [selectedMetrics, setSelectedMetrics] = useState([
    "estrato",
    "edad",
    "genero",
  ]);

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
            title="Distribución de viajes según estrato"
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
            title="Distribución de viajes según edad"
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
            title="Distribución de viajes según escolaridad"
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
            title="Distribución de viajes según ingresos"
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
            title="Distribución de viajes según género"
            data={generoData}
            dataKey="value"
            nameKey="name"
          />
        );
    }
  };

  return (
    <div>
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
