import React from "react";

const ChartCard = ({ title, actions, children }) => {
  return (
    <div
      className="chart-card"
      data-title={title || "Visualización"}
      style={{
        background: "#ffffff",
        borderRadius: "14px",
        padding: "16px 20px",
        boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid #e5e7eb",
        overflow: "visible",
      }}
    >
      {title && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "12pt",
              fontWeight: 600,
              color: "#111827",
            }}
          >
            {title}
          </h3>
          {actions}
        </div>
      )}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "100%", height: "100%" }}>{children}</div>
      </div>
    </div>
  );
};

export default ChartCard;
