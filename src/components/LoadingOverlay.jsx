import React from "react";
import { PRIMARY_GREEN } from "../config/constants";
import logoAmva from "../assets/logo-area.png";

const overlayStyle = {
  position: "absolute",
  inset: 0,
  background: PRIMARY_GREEN,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 50,
  borderRadius: 12,
  color: "#ffffff",
};

export default function LoadingOverlay({ visible, label = "Actualizando..." }) {
  if (!visible) return null;
  return (
    <div style={overlayStyle} aria-hidden={!visible}>
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <img src={logoAmva} alt="Cargando" style={{ width: 96, height: 96, objectFit: "contain" }} />
        <div style={{ fontWeight: 700, fontSize: 14 }}>{label}</div>
      </div>
    </div>
  );
}
