import React from "react";
import AnalysisSelector from "./AnalysisSelector";
import SectionIndex from "../components/SectionIndex";

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
  isCompareMode,
  onModeChange,
  localSelectedValues,
  toggleThematicValue,
  selectedColorMap,
  sectionOptions,
  activeSection,
  onSectionChange,
  exportActions,
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
        padding: 12,
        boxShadow: "0 12px 24px rgba(15,23,42,0.08)",
        display: "grid",
        gap: 12,
      }}
    >
      <SectionIndex
        sectionOptions={sectionOptions}
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />

      {/* Línea divisoria */}
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
              marginTop: 6,
              width: "100%",
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              padding: "6px 10px",
              background: "#fff",
              fontSize: 11,
            }}
          >
            {municipios.map((muni) => (
              <option key={muni} value={muni}>
                {muni}
              </option>
            ))}
          </select>
        </label>
        <label style={{ fontSize: 11, fontWeight: 600, display: "block", marginTop: 10 }}>
          Municipio destino
          <select
            value={filters.destinationMunicipio}
            onChange={(e) => setDestinationMunicipio(e.target.value)}
            style={{
              marginTop: 6,
              width: "100%",
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              padding: "6px 10px",
              background: "#fff",
              fontSize: 11,
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
        isCompareMode={isCompareMode}
        onModeChange={onModeChange}
        localSelectedValues={localSelectedValues}
        toggleThematicValue={toggleThematicValue}
        selectedColorMap={selectedColorMap}
      />

      {/* Línea divisoria */}
      <div style={{ height: 1, background: "#e2e8f0" }} />

      {/* Exportaciones */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8 }}>
          Exportaciones
        </div>
        {exportActions}
      </div>
    </aside>
  );
};

export default FiltersPanel;
