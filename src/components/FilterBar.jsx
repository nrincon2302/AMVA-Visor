import React from "react";

const FilterBar = ({
  municipio,
  macrozona,
  macrozones = [],
  municipios = [],
  thematicFilters,
  thematicOptions,
  onMunicipioChange,
  onMacrozonaChange,
  onThematicChange,
}) => {
  const handleMultiSelect = (key, value) => {
    const current = thematicFilters[key] || [];
    const exists = current.includes(value);
    const updated = exists ? current.filter((v) => v !== value) : [...current, value];
    onThematicChange(key, updated);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        marginTop: 8,
        marginBottom: 16,
      }}
    >
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <select
          value={municipio}
          onChange={(e) => onMunicipioChange(e.target.value)}
          style={{
            borderRadius: 9999,
            border: "1px solid #d1d5db",
            padding: "6px 12px",
            fontSize: 13,
            color: "#374151",
            background: "#ffffff",
          }}
        >
          {municipios.map((muni) => (
            <option key={muni} value={muni}>
              {muni}
            </option>
          ))}
        </select>

        <select
          value={macrozona}
          onChange={(e) => onMacrozonaChange(e.target.value)}
          style={{
            borderRadius: 9999,
            border: "1px solid #d1d5db",
            padding: "6px 12px",
            fontSize: 13,
            color: "#374151",
            background: "#ffffff",
          }}
        >
          <option value="Todas">Todas las macrozonas</option>
          {macrozones.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        {[
          { key: "gender", label: "Género" },
          { key: "ageRange", label: "Edad" },
          { key: "estrato", label: "Estrato" },
          { key: "income", label: "Ingresos" },
          { key: "mode", label: "Modo" },
        ].map((group) => (
          <div key={group.key} style={{ minWidth: 160 }}>
            <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 6 }}>
              {group.label}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(thematicOptions[group.key] || []).map((opt) => {
                const active = thematicFilters[group.key]?.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => handleMultiSelect(group.key, opt)}
                    style={{
                      borderRadius: 9999,
                      border: active ? "1px solid #16a34a" : "1px solid #d1d5db",
                      background: active ? "#ecfdf3" : "#ffffff",
                      color: "#111827",
                      fontSize: 11,
                      padding: "4px 10px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
