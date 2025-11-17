import React from "react";
import ChartCard from "./ChartCard";

const MapCard = ({ title }) => {
  return (
    <ChartCard title={title}>
      <div
        style={{
          borderRadius: 12,
          height: 260,
          background:
            "linear-gradient(135deg, #ecfdf3 0%, #d1fae5 40%, #bfdbfe 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(#ffffff22 1px, transparent 1px), linear-gradient(90deg, #ffffff22 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <span
          style={{
            position: "absolute",
            left: 12,
            bottom: 12,
            fontSize: 11,
            color: "#374151",
            background: "rgba(255,255,255,0.8)",
            padding: "4px 8px",
            borderRadius: 9999,
          }}
        >
          Mapa de ejemplo (mock)
        </span>
      </div>
    </ChartCard>
  );
};

export default MapCard