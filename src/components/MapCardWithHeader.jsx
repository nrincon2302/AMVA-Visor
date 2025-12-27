import React from "react";
import HighchartsMapCard from "./HighchartsMapCard";
import { 
  PRIMARY_GREEN, 
  SECONDARY_GREEN, 
  TERTIARY_ORANGE, 
  BANNER_IMAGE_URL 
} from "../config/constants";

const MapCardWithHeader = ({ 
  title, 
  data, 
  palette, 
  selectedMacrozone 
}) => {
  const headerGradient = palette === "green" 
    ? `linear-gradient(135deg, ${PRIMARY_GREEN} 0%, ${SECONDARY_GREEN} 100%)`
    : `linear-gradient(135deg, ${TERTIARY_ORANGE} 0%, #FF6B00 100%)`;

  return (
    <div style={{ 
      borderRadius: 12,
      overflow: "hidden",
      border: "1px solid #e2e8f0",
      background: "#fff",
    }}>
      {/* Header con imagen de fondo */}
      <div style={{
        position: "relative",
        padding: "16px 20px",
        background: headerGradient,
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${BANNER_IMAGE_URL})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
        }} />
        <div style={{
          position: "relative",
          fontSize: 14,
          fontWeight: 700,
          color: "#ffffff",
          textShadow: "0 1px 2px rgba(0,0,0,0.1)",
        }}>
          {title}
        </div>
      </div>

      {/* Mapa */}
      <div style={{ padding: 12 }}>
        <HighchartsMapCard 
          title={null}
          data={data}
          palette={palette}
          selectedMacrozone={selectedMacrozone}
        />
      </div>
    </div>
  );
};

export default MapCardWithHeader;