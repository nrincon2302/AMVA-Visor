import React from "react";
import ChartCard from "./ChartCard";

const KpiCard = ({
  label,
  value,
  subLabel,
  accentColor = "#66CC33",
  contextLines = [],
}) => {
  return (
    <ChartCard title={null}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div
          style={{
            width: 6,
            alignSelf: "stretch",
            borderRadius: 9999,
            background: accentColor,
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 500,
              color: "#6b7280",
              marginBottom: 4,
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#111827",
              lineHeight: 1.1,
            }}
          >
            {value}
          </div>
          {subLabel && (
            <div
              style={{
                fontSize: "10pt",
                color: "#9ca3af",
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
                fontSize: "10pt",
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
    </ChartCard>
  );
};

export default KpiCard;