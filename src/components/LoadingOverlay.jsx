import React from "react";

const overlayStyle = {
  position: "absolute",
  inset: 0,
  background: "rgba(255,255,255,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 50,
  borderRadius: 12,
};

export default function LoadingOverlay({ visible, label = "Actualizando..." }) {
  if (!visible) return null;
  return (
    <div style={overlayStyle} aria-hidden={!visible}>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            border: "6px solid rgba(0,0,0,0.08)",
            borderTopColor: "#1f6feb",
            animation: "spin 1s linear infinite",
            margin: "0 auto 8px",
          }}
        />
        <div style={{ fontWeight: 600 }}>{label}</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
