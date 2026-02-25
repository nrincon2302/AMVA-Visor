import React, { useEffect } from "react";
import AnalysisSelector from "../pages/AnalysisSelector";
import SectionIndex from "./SectionIndex";

const FilterDrawer = ({
  isOpen,
  onClose,
  // props del panel de filtros
  municipios,
  filters,
  setMunicipio,
  setDestinationMunicipio,
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
  // Bloquear scroll del body mientras el drawer está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Cerrar con tecla Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Cerrar al navegar a una sección
  const handleSectionChange = (key) => {
    onSectionChange(key);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`drawer-backdrop${isOpen ? " is-visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel deslizante */}
      <div
        className={`filters-drawer${isOpen ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Panel de filtros"
      >
        {/* Cabecera del drawer */}
        <div className="filters-drawer-header">
          <h2>Filtros y opciones</h2>
          <button
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Cerrar filtros"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo con el mismo contenido que el sidebar desktop */}
        <div className="filters-drawer-body">
          <SectionIndex
            sectionOptions={sectionOptions}
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />

          <div style={{ height: 1, background: "#e2e8f0" }} />

          {/* Variables geográficas */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8 }}>
              Variables geográficas
            </div>
            <label style={{ fontSize: 11, fontWeight: 600 }}>
              Municipio
              <select
                value={filters.municipio}
                onChange={(e) => setMunicipio(e.target.value)}
                style={{
                  marginTop: 6, width: "100%", borderRadius: 10,
                  border: "1px solid #cbd5e1", padding: "6px 10px",
                  background: "#fff", fontSize: 11,
                }}
              >
                {municipios.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </label>
            <label style={{ fontSize: 11, fontWeight: 600, display: "block", marginTop: 10 }}>
              Municipio destino
              <select
                value={filters.destinationMunicipio}
                onChange={(e) => setDestinationMunicipio(e.target.value)}
                style={{
                  marginTop: 6, width: "100%", borderRadius: 10,
                  border: "1px solid #cbd5e1", padding: "6px 10px",
                  background: "#fff", fontSize: 11,
                }}
              >
                {municipios.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
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
        </div>
      </div>
    </>
  );
};

export default FilterDrawer;