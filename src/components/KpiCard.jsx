import React from "react";

const KpiCard = ({
  label,
  value,
  subLabel,
  headerColor = "#66CC33",
  headerTextColor = "#ffffff",
  bannerImageUrl,
  contextLines = [],
}) => {
  const headerBackgroundStyle = bannerImageUrl
    ? {
        backgroundImage: `linear-gradient(90deg, ${headerColor} 0%, ${headerColor} 45%, rgba(255,255,255,0.08) 100%), url('${bannerImageUrl}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : { background: headerColor };

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
          ...headerBackgroundStyle,
          color: headerTextColor,
          padding: "8px 14px",
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: 0.2,
          height: 48,
          display: "flex",
          alignItems: "center",
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
              color: headerColor,
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
