import React from "react";

const FilterBar = ({
  municipio,
  macrozona,
  macrozonaScope,
  macrozones = [],
  municipios = [],
  thematicFilters,
  thematicOptions,
  onMunicipioChange,
  onMacrozonaChange,
  onMacrozonaScopeChange,
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
        display: "grid",
        gridTemplateColumns: "minmax(280px, 1fr)",
        gap: 12,
        marginTop: 8,
        marginBottom: 20,
        background: "#f8fafc",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "12px 14px",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.03)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <label style={{ fontSize: "10pt", fontWeight: 600, color: "#0f172a" }}>
          Municipio
          <select
            value={municipio}
            onChange={(e) => onMunicipioChange(e.target.value)}
            style={{
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              padding: "6px 10px",
              fontSize: 10,
              color: "#0f172a",
              background: "#ffffff",
              marginLeft: 8,
              boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
            }}
          >
            {municipios.map((muni) => (
              <option key={muni} value={muni}>
                {muni}
              </option>
            ))}
          </select>
        </label>

        <label style={{ fontSize: "10pt", fontWeight: 600, color: "#0f172a" }}>
          Macrozona
          <select
            value={macrozona}
            onChange={(e) => onMacrozonaChange(e.target.value)}
            style={{
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              padding: "6px 10px",
              fontSize: 10,
              color: "#0f172a",
              background: "#ffffff",
              marginLeft: 8,
              boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
            }}
          >
            <option value="Todas">Todas las macrozonas</option>
            {macrozones.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </label>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: "10pt", fontWeight: 600, color: "#0f172a" }}>
            Aplicar macrozona a
          </span>
          {[{ key: "ambos", label: "Origen y destino" }, { key: "origen", label: "Solo origen" }, { key: "destino", label: "Solo destino" }].map(
            (opt) => (
              <label
                key={opt.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: "10pt",
                }}
              >
                <input
                  type="radio"
                  name="macrozonaScope"
                  value={opt.key}
                  checked={macrozonaScope === opt.key}
                  onChange={(e) => onMacrozonaScopeChange(e.target.value)}
                />
                {opt.label}
              </label>
            )
          )}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 12,
        }}
      >
        {[
          { key: "gender", label: "Género" },
          { key: "ageRange", label: "Edad" },
          { key: "estrato", label: "Estrato" },
          { key: "mode", label: "Modo principal" },
        ].map((group) => (
          <div
            key={group.key}
            style={{
              minWidth: 0,
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: 10,
              boxShadow: "0 6px 16px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: "10pt", marginBottom: 8 }}>
              {group.label}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(thematicOptions[group.key] || []).map((opt) => {
                const active = thematicFilters[group.key]?.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => handleMultiSelect(group.key, opt)}
                    style={{
                      borderRadius: 9999,
                      border: active ? "1px solid #2563eb" : "1px solid #e2e8f0",
                      background: active
                        ? "linear-gradient(120deg, #dbeafe, #eef2ff)"
                        : "#f1f5f9",
                      color: "#0f172a",
                      fontSize: "10pt",
                      padding: "5px 9px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      boxShadow: active ? "0 6px 18px rgba(37, 99, 235, 0.18)" : "none",
                      transition: "all 120ms ease-in-out",
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
