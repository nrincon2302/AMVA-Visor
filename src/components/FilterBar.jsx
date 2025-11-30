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
        display: "flex",
        flexDirection: "column",
        gap: 16,
        marginTop: 8,
        marginBottom: 20,
        background: "linear-gradient(120deg, #f8fafc, #eef2ff)",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: "14px 16px",
        boxShadow: "0 10px 40px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <label style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
          Municipio
          <select
            value={municipio}
            onChange={(e) => onMunicipioChange(e.target.value)}
            style={{
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              padding: "8px 12px",
              fontSize: 13,
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

        <label style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
          Macrozona
          <select
            value={macrozona}
            onChange={(e) => onMacrozonaChange(e.target.value)}
            style={{
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              padding: "8px 12px",
              fontSize: 13,
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
          <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
            Aplicar macrozona a
          </span>
          {[{ key: "ambos", label: "Origen y destino" }, { key: "origen", label: "Solo origen" }, { key: "destino", label: "Solo destino" }].map(
            (opt) => (
              <label
                key={opt.key}
                style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}
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
          <div
            key={group.key}
            style={{
              minWidth: 180,
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 12,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8 }}>
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
                      border: active ? "1px solid #2563eb" : "1px solid #e2e8f0",
                      background: active
                        ? "linear-gradient(120deg, #dbeafe, #eef2ff)"
                        : "#f8fafc",
                      color: "#0f172a",
                      fontSize: 11,
                      padding: "6px 10px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      boxShadow: active ? "0 6px 18px rgba(37, 99, 235, 0.25)" : "none",
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
