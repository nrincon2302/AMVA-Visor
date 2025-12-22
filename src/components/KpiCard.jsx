import React from "react";

const KpiCard = ({
  label,
  value,
  subLabel,
  headerColor = "#66CC33",
  headerTextColor = "#ffffff",
  contextLines = [],
}) => {
  return (
    <div
      style={{
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
        border: "1px solid #e5e7eb",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          background: headerColor,
          color: headerTextColor,
          padding: "8px 14px",
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1.1,
            }}
          >
            {value}
          </div>
          {subLabel && (
            <div
              style={{
                fontSize: "11pt",
                color: "#6b7280",
                marginTop: 4,
              }}
            >
              {subLabel}
            </div>
          )}
          {contextLines.length > 0 && (
            <ul
              style={{
                margin: "6px 0 0",
                paddingLeft: 14,
                color: "#475569",
                fontSize: "11pt",
                lineHeight: 1.4,
              }}
            >
              {contextLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
