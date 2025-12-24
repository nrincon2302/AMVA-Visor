import React from "react";
import AnalysisSelector from "./AnalysisSelector";

const FiltersPanel = ({
  municipios,
  filters,
  setMunicipio,
  setDestinationMunicipio,
  thematicConfig,
  activeThematicKey,
  handleThematicKeyChange,
  activeThematic,
  isAllSelected,
  SECONDARY_GREEN,
  isCompareMode,
  setIsCompareMode,
  setLocalSelectedValues,
  localSelectedValues,
  setThematicValues,
  comparisonDefaults,
  toggleThematicValue,
  selectedColorMap,
  analysisView,
  setAnalysisView,
  exportReport,
}) => {
  return (
    <aside
      style={{
        position: "sticky",
        top: 24,
        alignSelf: "start",
        borderRadius: 16,
        border: "1px solid #e5e7eb",
        background: "#f8fafc",
        padding: 16,
        boxShadow: "0 12px 24px rgba(15,23,42,0.08)",
        display: "grid",
        gap: 16,
      }}
    >
      {/* Variables geográficas */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>
          Variables geográficas
        </div>
        <label style={{ fontSize: 12, fontWeight: 600 }}>
          Municipio
          <select
            value={filters.municipio}
            onChange={(e) => setMunicipio(e.target.value)}
            style={{
              marginTop: 6,
              width: "100%",
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              padding: "8px 10px",
              background: "#fff",
              fontSize: 12,
            }}
          >
            {municipios.map((muni) => (
              <option key={muni} value={muni}>
                {muni}
              </option>
            ))}
          </select>
        </label>
        <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginTop: 12 }}>
          Municipio destino
          <select
            value={filters.destinationMunicipio}
            onChange={(e) => setDestinationMunicipio(e.target.value)}
            style={{
              marginTop: 6,
              width: "100%",
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              padding: "8px 10px",
              background: "#fff",
              fontSize: 12,
            }}
          >
            {municipios.map((muni) => (
              <option key={muni} value={muni}>
                {muni}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Línea divisoria */}
      <div style={{ height: 1, background: "#e2e8f0" }} />

      <AnalysisSelector
        thematicConfig={thematicConfig}
        activeThematicKey={activeThematicKey}
        handleThematicKeyChange={handleThematicKeyChange}
        activeThematic={activeThematic}
        isAllSelected={isAllSelected}
        SECONDARY_GREEN={SECONDARY_GREEN}
        isCompareMode={isCompareMode}
        setIsCompareMode={setIsCompareMode}
        setLocalSelectedValues={setLocalSelectedValues}
        localSelectedValues={localSelectedValues}
        setThematicValues={setThematicValues}
        comparisonDefaults={comparisonDefaults}
        toggleThematicValue={toggleThematicValue}
        selectedColorMap={selectedColorMap}
        analysisView={analysisView}
        setAnalysisView={setAnalysisView}
      />

      {/* Línea divisoria */}
      <div style={{ height: 1, background: "#e2e8f0" }} />

      {/* Exportaciones */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>
          Exportaciones
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          <button
            onClick={() => exportReport("pdf")}
            style={{
              border: "none",
              background: SECONDARY_GREEN,
              borderRadius: 10,
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              color: "#ffffff",
            }}
          >
            Exportar PDF
          </button>
          <button
            onClick={() => exportReport("excel")}
            style={{
              border: "none",
              background: "#66CC33",
              borderRadius: 10,
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              color: "#ffffff",
            }}
          >
            Exportar Excel
          </button>
        </div>
      </div>
    </aside>
  );
};

export default FiltersPanel;