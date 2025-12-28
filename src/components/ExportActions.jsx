import React from "react";

export default function ExportActions({ onExportPdf, onExportExcel, isDisabled }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <button
        onClick={onExportPdf}
        disabled={isDisabled}
        style={{
          border: "none",
          background: "#339933",
          borderRadius: 10,
          padding: "6px 10px",
          cursor: isDisabled ? "not-allowed" : "pointer",
          fontSize: 11,
          fontWeight: 600,
          color: "#ffffff",
          opacity: isDisabled ? 0.6 : 1,
        }}
      >
        Exportar PDF
      </button>
      <button
        onClick={onExportExcel}
        disabled={isDisabled}
        style={{
          border: "none",
          background: "#66CC33",
          borderRadius: 10,
          padding: "6px 10px",
          cursor: isDisabled ? "not-allowed" : "pointer",
          fontSize: 11,
          fontWeight: 600,
          color: "#ffffff",
          opacity: isDisabled ? 0.6 : 1,
        }}
      >
        Exportar Excel
      </button>
    </div>
  );
}
