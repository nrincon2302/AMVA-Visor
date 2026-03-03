import React from "react";
import HighchartsMapCard from "./HighchartsMapCard";
import {
  PRIMARY_GREEN,
  SECONDARY_GREEN,
  TERTIARY_ORANGE,
  BANNER_IMAGE_URL,
} from "../config/constants";

const MapCardWithHeader = ({
  title,
  data,
  palette,
  selectedMacrozone,
  onExpand,
  onSelect,
}) => {
  const headerGradient =
    palette === "green"
      ? `linear-gradient(135deg, ${PRIMARY_GREEN} 0%, ${SECONDARY_GREEN} 100%)`
      : `linear-gradient(135deg, ${TERTIARY_ORANGE} 0%, #FF6B00 100%)`;

  return (
    <div
      style={{
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        background: "#fff",
      }}
    >
      <div
        style={{
          position: "relative",
          padding: "16px 20px",
          background: headerGradient,
          overflow: "hidden",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url(${BANNER_IMAGE_URL})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
          }}
        />
        <div
          style={{
            position: "relative",
            fontSize: 14,
            fontWeight: 700,
            color: "#ffffff",
            textShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          {title}
        </div>
        <div
          style={{
            position: "relative",
            fontSize: 11,
            color: "rgba(255,255,255,0.8)",
            fontStyle: "italic",
            whiteSpace: "nowrap",
          }}
        >
          Click en una zona para seleccionar
        </div>
        {onExpand && (
          <button
            className="map-expand-btn"
            onClick={onExpand}
            style={{
              position: "relative",
              background: "rgba(255, 255, 255, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "#ffffff",
              padding: "6px 10px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              transition: "all 0.2s ease",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
            }}
          >
            <span>Expandir</span>
          </button>
        )}
      </div>
      <div style={{ padding: 12 }}>
        <HighchartsMapCard
          title={null}
          data={data}
          palette={palette}
          selectedMacrozone={selectedMacrozone}
          onSelect={onSelect}
        />
      </div>
    </div>
  );
};

export default MapCardWithHeader;