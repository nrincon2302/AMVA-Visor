import React from "react";
import { SECONDARY_GREEN, BANNER_IMAGE_URL } from "../config/constants";

const KpiCard = ({
  label,
  value,
  subLabel,
  headerColor = SECONDARY_GREEN,
  headerTextColor = "#ffffff",
  bannerImageUrl = BANNER_IMAGE_URL
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
                fontSize: "9pt",
                color: "#6b7280",
                marginTop: 4,
              }}
            >
              {subLabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
