import { useState } from "react";

const BTN_BASE = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  width: "100%",
  padding: "7px 12px",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 600,
  transition: "all 0.15s ease",
  marginBottom: 6,
};

const Spinner = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
       style={{ animation: "spin 0.8s linear infinite" }}>
    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="2" strokeDasharray="18 8" />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </svg>
);

const PdfIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="9" y1="13" x2="15" y2="13"/>
    <line x1="9" y1="17" x2="13" y2="17"/>
  </svg>
);

const ExcelIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M9 3v18M3 9h18M3 15h18"/>
  </svg>
);

function ExportButton({ label, icon: Icon, onClick, color, disabled }) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const handleClick = async () => {
    if (loading || disabled) return;
    setError(null);
    setLoading(true);
    try {
      await Promise.resolve(onClick());
    } catch (e) {
      console.error("Export error:", e);
      setError("Error al exportar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading || disabled}
        style={{
          ...BTN_BASE,
          background: disabled ? "#e5e7eb" : color,
          color: disabled ? "#9ca3af" : "#fff",
          opacity: loading ? 0.85 : 1,
          boxShadow: disabled ? "none" : "0 2px 6px rgba(0,0,0,0.15)",
        }}
        title={disabled ? "Espera a que carguen los datos" : label}
      >
        {loading ? <Spinner /> : <Icon />}
        <span>{loading ? "Generando…" : label}</span>
      </button>
      {error && (
        <div style={{
          fontSize: 10, color: "#dc2626", marginTop: -3, marginBottom: 4, paddingLeft: 4,
        }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default function ExportActions({ onExportPdf, onExportExcel, isDisabled }) {
  return (
    <div>
      <ExportButton
        label="Exportar PDF"
        icon={PdfIcon}
        onClick={onExportPdf}
        color="#1B3A2D"
        disabled={isDisabled}
      />
      <ExportButton
        label="Exportar Excel"
        icon={ExcelIcon}
        onClick={onExportExcel}
        color="#1B7A3E"
        disabled={isDisabled}
      />
      <p style={{
        fontSize: 9.5, color: "#94a3b8", marginTop: 2, lineHeight: 1.4,
        paddingLeft: 2,
      }}>
        El PDF incluye gráficas y tablas.<br />
        El Excel incluye una hoja por indicador.
      </p>
    </div>
  );
}