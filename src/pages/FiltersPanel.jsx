import React, { useState, useEffect } from "react";
import AnalysisSelector from "./AnalysisSelector";
import SectionIndex from "../components/SectionIndex";

// ── Estilos globales inyectados: pulse del FAB + landscape móvil ─────────────
const INJECTED_STYLES = `
  /* ── Animación de pulso para el FAB ── */
  @keyframes fab-pulse {
    0%   { box-shadow: 0 4px 14px rgba(124,185,40,0.55), 0 0 0 0   rgba(124,185,40,0.45); }
    60%  { box-shadow: 0 4px 18px rgba(124,185,40,0.40), 0 0 0 10px rgba(124,185,40,0); }
    100% { box-shadow: 0 4px 14px rgba(124,185,40,0.55), 0 0 0 0   rgba(124,185,40,0); }
  }

  .filters-fab:not(.is-open) {
    animation: fab-pulse 2.2s ease-out infinite;
  }

  /* ── En landscape móvil: ocultar sidebar, mostrar FAB/drawer, ancho completo ── */
  /*    Cubre teléfonos en horizontal (alto < 540 px) pero no laptops ni tablets grandes */
  @media (orientation: landscape) and (max-height: 540px) {
    .dashboard-sidebar {
      display: none !important;
    }
    /* Mismo aspecto y posición que en portrait: redondo, verde, fijo abajo-derecha */
    .filters-fab {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      top: auto !important;
      left: auto !important;
      width: 52px !important;
      height: 52px !important;
      border-radius: 50% !important;
      background: #7CB928 !important;
      color: #ffffff !important;
      border: none !important;
      padding: 0 !important;
      aspect-ratio: 1 !important;
      z-index: 900 !important;
    }
    /* El grid pierde la columna del sidebar: el contenido ocupa todo el ancho */
    .dashboard-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;

// Inyectar hoja de estilos una sola vez en el <head>
let stylesInjected = false;
function ensureStylesInjected() {
  if (stylesInjected) return;
  stylesInjected = true;
  const el = document.createElement("style");
  el.setAttribute("data-fab-styles", "true");
  el.textContent = INJECTED_STYLES;
  document.head.appendChild(el);
}

const ZONA_OPTIONS = [
  { value: "",       label: "Todos"  },
  { value: "Urbano", label: "Urbano" },
  { value: "Rural",  label: "Rural"  },
];

/* ============================================================
   FilterContent — contenido compartido entre sidebar y drawer
   ============================================================ */
const FilterContent = ({
  municipios,
  macrozonas,
  filters,
  setMunicipio,
  setZona,
  setMacrozona,
  thematicConfig,
  activeThematicKey,
  handleThematicKeyChange,
  activeThematic,
  isCompareMode,
  onModeChange,
  localSelectedValues,
  toggleThematicValue,
  selectedColorMap,
  onSelectAll,
  sectionOptions,
  activeSection,
  onSectionChange,
  exportActions,
}) => {
  const selectStyle = {
    marginTop: 6,
    width: "100%",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    padding: "6px 10px",
    background: "#fff",
    fontSize: 11,
  };

  return (
    <>
      <SectionIndex
        sectionOptions={sectionOptions}
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />

      <div style={{ height: 1, background: "#e2e8f0" }} />

      {/* ── Variables geográficas ── */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8 }}>
          Variables geográficas
        </div>

        {/* Municipio */}
        <label style={{ fontSize: 11, fontWeight: 600 }}>
          Municipio de residencia
          <select
            value={filters.municipio}
            onChange={(e) => setMunicipio(e.target.value)}
            style={selectStyle}
          >
            {municipios.map((muni) => (
              <option key={muni} value={muni}>{muni}</option>
            ))}
          </select>
        </label>

        {/* Macrozona — visible solo cuando hay municipio específico */}
        {filters.municipio !== "AMVA General" && macrozonas.length > 0 && (
          <label style={{ fontSize: 11, fontWeight: 600, display: "block", marginTop: 10 }}>
            Macrozona de residencia
            <select
              value={filters.macrozona ?? ""}
              onChange={(e) => {
                const raw = e.target.value;
                setMacrozona(raw === "" ? "" : (isNaN(Number(raw)) ? raw : Number(raw)));
              }}
              style={selectStyle}
            >
              <option value="">Todas</option>
              {macrozonas.map(({ id, nombre }) => (
                <option key={id} value={id}>{nombre}</option>
              ))}
            </select>
          </label>
        )}

        {/* Tipo de zona */}
        <label style={{ fontSize: 11, fontWeight: 600, display: "block", marginTop: 10 }}>
          Tipo de zona de residencia
          <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
            {ZONA_OPTIONS.map(({ value, label }) => {
              const active = (filters.zona ?? "") === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setZona?.(value)}
                  style={{
                    flex: 1,
                    padding: "5px 0",
                    borderRadius: 8,
                    border: active ? "1.5px solid #339933" : "1px solid #cbd5e1",
                    background: active ? "rgba(51,153,51,0.12)" : "#fff",
                    color: active ? "#1a5c1a" : "#374151",
                    fontSize: 11,
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </label>
      </div>

      <div style={{ height: 1, background: "#e2e8f0" }} />

      <AnalysisSelector
        thematicConfig={thematicConfig}
        activeThematicKey={activeThematicKey}
        handleThematicKeyChange={handleThematicKeyChange}
        activeThematic={activeThematic}
        isCompareMode={isCompareMode}
        onModeChange={onModeChange}
        localSelectedValues={localSelectedValues}
        toggleThematicValue={toggleThematicValue}
        selectedColorMap={selectedColorMap}
        onSelectAll={onSelectAll}
      />

      <div style={{ height: 1, background: "#e2e8f0" }} />

      <div>
        <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8 }}>
          Exportaciones
        </div>
        {exportActions}
      </div>
    </>
  );
};

/* ============================================================
   FiltersPanel — unifica sidebar desktop + drawer + FAB móvil
   ============================================================ */
const FiltersPanel = (props) => {
  const { onSectionChange } = props;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Inyectar estilos al montar el componente
  useEffect(() => {
    ensureStylesInjected();
  }, []);

  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isDrawerOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setIsDrawerOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSectionChange = (key) => {
    onSectionChange?.(key);
    setIsDrawerOpen(false);
  };

  const contentProps = { ...props, onSectionChange: handleSectionChange };

  return (
    <>
      {/* ── DESKTOP: sidebar lateral ── */}
      <aside
        className="dashboard-sidebar"
        style={{
          borderRadius: 16,
          border: "1px solid #e5e7eb",
          background: "#f8fafc",
          padding: 12,
          boxShadow: "0 12px 24px rgba(15,23,42,0.08)",
          display: "grid",
          gap: 12,
        }}
      >
        <FilterContent {...contentProps} />
      </aside>

      {/* ── MÓVIL: FAB ── */}
      <button
        className={`filters-fab${isDrawerOpen ? " is-open" : ""}`}
        onClick={() => setIsDrawerOpen((prev) => !prev)}
        aria-label={isDrawerOpen ? "Cerrar filtros" : "Abrir filtros"}
        aria-expanded={isDrawerOpen}
      >
        {isDrawerOpen ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
               stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="4" y1="4"  x2="16" y2="16" />
            <line x1="16" y1="4" x2="4"  y2="16" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
               stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="5"  x2="17" y2="5"  />
            <line x1="3" y1="10" x2="17" y2="10" />
            <line x1="3" y1="15" x2="17" y2="15" />
          </svg>
        )}
      </button>

      {/* ── MÓVIL: backdrop ── */}
      <div
        className={`drawer-backdrop${isDrawerOpen ? " is-visible" : ""}`}
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* ── MÓVIL: drawer ── */}
      <div
        className={`filters-drawer${isDrawerOpen ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Panel de filtros"
      >
        <div className="filters-drawer-header">
          <h2>Filtros y opciones</h2>
          <button
            className="drawer-close-btn"
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Cerrar filtros"
          >
            ✕
          </button>
        </div>
        <div className="filters-drawer-body">
          <FilterContent {...contentProps} />
        </div>
      </div>
    </>
  );
};

export default FiltersPanel;