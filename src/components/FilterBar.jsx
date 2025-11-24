import React from "react";

const FilterBar = ({ departamentoFilter, onDepartamentoChange }) => {
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
      </div>
        gap: 12,
        alignItems: "center",
        marginTop: 8,
        marginBottom: 16,
        flexWrap: "wrap",
      }}
    >
      {/* Primer select lo dejo mock, podrías luego usarlo para "ámbito" */}
      <select
        value="Departamento"
        style={{
          borderRadius: 9999,
          border: "1px solid #d1d5db",
          padding: "6px 12px",
          fontSize: 13,
          color: "#374151",
          background: "#ffffff",
        }}
        readOnly
      >
        <option>Departamento</option>
      </select>

      {/* Select de departamento REAL que filtra Crossfilter */}
      <select
        value={departamentoFilter}
        onChange={(e) => onDepartamentoChange(e.target.value)}
        style={{
          borderRadius: 9999,
          border: "1px solid #d1d5db",
          padding: "6px 12px",
          fontSize: 13,
          color: "#374151",
          background: "#ffffff",
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
        <option value="Todos">Todos</option>
        <option value="Antioquia">Antioquia</option>
        <option value="Bolívar">Bolívar</option>
        <option value="Nariño">Nariño</option>
        <option value="Norte de Santander">Norte de Santander</option>
        <option value="Amazonas">Amazonas</option>
        <option value="Arauca">Arauca</option>
        <option value="Atlántico">Atlántico</option>
        <option value="Boyacá">Boyacá</option>
        <option value="Caldas">Caldas</option>
        <option value="Caquetá">Caquetá</option>
        <option value="Casanare">Casanare</option>
        <option value="Cauca">Cauca</option>
        <option value="Cesar">Cesar</option>
        <option value="Chocó">Chocó</option>
        <option value="Córdoba">Córdoba</option>
        <option value="Cundinamarca">Cundinamarca</option>
        <option value="Guainía">Guainía</option>
        <option value="Guaviare">Guaviare</option>
        <option value="Huila">Huila</option>
        <option value="La Guajira">La Guajira</option>
        <option value="Magdalena">Magdalena</option>
        <option value="Meta">Meta</option>
        <option value="Putumayo">Putumayo</option>
        <option value="Quindío">Quindío</option>
        <option value="Risaralda">Risaralda</option>
        <option value="San Andrés y Providencia">San Andrés y Providencia</option>
        <option value="Santander">Santander</option>
        <option value="Sucre">Sucre</option>
        <option value="Tolima">Tolima</option>
        <option value="Valle del Cauca">Valle del Cauca</option>
        <option value="Vaupés">Vaupés</option>
        <option value="Vichada">Vichada</option>
      </select>
    </div>
  );
};

export default FilterBar;
