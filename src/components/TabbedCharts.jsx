import React, { useState } from "react";
import BarChartCard from "./BarChartCard";
import PieChartCard from "./PieChartCard";

const tabs = [
  "Género",
  "Edad",
  "Escolaridad",
  "Estrato",
  "Nivel de Ingresos",
];

const TabbedCharts = ({
  estratoData,
  edadData,
  generoData,
  escolaridadData,
  ingresosData,
}) => {
  const [activeTab, setActiveTab] = useState("Género");

  const renderContent = () => {
    switch (activeTab) {
      case "Género":
        return (
          <>
            <BarChartCard
              title="Estrato"
              data={estratoData}
              xKey="label"
              yKey="value"
              color="#22c55e"
            />
            <BarChartCard
              title="Edad"
              data={edadData}
              xKey="label"
              yKey="value"
              color="#3b82f6"
            />
            <PieChartCard
              title="Género"
              data={generoData}
              nameKey="name"
              dataKey="value"
            />
          </>
        );
      case "Edad":
        return (
          <>
            <BarChartCard
              title="Distribución por Edad"
              data={edadData}
              xKey="label"
              yKey="value"
              color="#3b82f6"
            />
            <PieChartCard
              title="Género"
              data={generoData}
              nameKey="name"
              dataKey="value"
            />
            <BarChartCard
              title="Nivel de Ingresos"
              data={ingresosData}
              xKey="label"
              yKey="value"
              color="#6366f1"
            />
          </>
        );
      case "Escolaridad":
        return (
          <>
            <BarChartCard
              title="Escolaridad"
              data={escolaridadData}
              xKey="label"
              yKey="value"
              color="#22c55e"
            />
            <BarChartCard
              title="Estrato"
              data={estratoData}
              xKey="label"
              yKey="value"
              color="#16a34a"
            />
            <PieChartCard
              title="Género"
              data={generoData}
              nameKey="name"
              dataKey="value"
            />
          </>
        );
      case "Estrato":
        return (
          <>
            <BarChartCard
              title="Estrato"
              data={estratoData}
              xKey="label"
              yKey="value"
              color="#22c55e"
            />
            <BarChartCard
              title="Nivel de Ingresos"
              data={ingresosData}
              xKey="label"
              yKey="value"
              color="#6366f1"
            />
            <PieChartCard
              title="Género"
              data={generoData}
              nameKey="name"
              dataKey="value"
            />
          </>
        );
      case "Nivel de Ingresos":
      default:
        return (
          <>
            <BarChartCard
              title="Nivel de Ingresos"
              data={ingresosData}
              xKey="label"
              yKey="value"
              color="#6366f1"
            />
            <BarChartCard
              title="Escolaridad"
              data={escolaridadData}
              xKey="label"
              yKey="value"
              color="#22c55e"
            />
            <PieChartCard
              title="Género"
              data={generoData}
              nameKey="name"
              dataKey="value"
            />
          </>
        );
    }
  };

  return (
    <div>
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          borderBottom: "1px solid #e5e7eb",
          marginBottom: 12,
          overflowX: "auto",
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
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
              {tab}
            </button>
          );
        })}
      </div>

      {/* Charts dentro de los tabs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default TabbedCharts;