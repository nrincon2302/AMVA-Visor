import React from "react";

const ChartCard = ({ title, children }) => {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "14px",
        padding: "16px 20px",
        boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid #e5e7eb",
      }}
    >
      {title && (
        <h3
          style={{
            margin: 0,
            marginBottom: "12px",
            fontSize: "15px",
            fontWeight: 600,
            color: "#111827",
          }}
        >
          {title}
        </h3>
      )}
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
};

export default ChartCard;