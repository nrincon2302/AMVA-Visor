import React from "react";
import AnalysisSelector from "./AnalysisSelector";
import SectionIndex from "../components/SectionIndex";

const ZONA_OPTIONS = [
  { value: "",        label: "Todos" },
  { value: "Urbano",  label: "Urbano" },
  { value: "Rural",   label: "Rural"  },
];

const FiltersPanel = ({
  municipios,
  filters,
  setMunicipio,
  setZona,           // nuevo — invoca ?zona=Urbano|Rural
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
  return (
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
      <SectionIndex
        sectionOptions={sectionOptions}
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />

      <div style={{ height: 1, background: "#e2e8f0" }} />

      {/* Variables geográficas */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8 }}>
          Variables geográficas
        </div>

        {/* Municipio origen */}
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
            {municipios.map((muni) => (
              <option key={muni} value={muni}>{muni}</option>
            ))}
          </select>
        </label>

        {/* Tipo de zona (Urbano / Rural) */}
        <label style={{ fontSize: 11, fontWeight: 600, display: "block", marginTop: 10 }}>
          Tipo de zona
          <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
            {ZONA_OPTIONS.map(({ value, label }) => {
              const active = (filters.zona ?? "") === value;
              return (
                <button
                  key={value}
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