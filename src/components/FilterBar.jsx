import React from "react";

const FilterBar = ({ departamentoFilter, onDepartamentoChange }) => {
  return (
    <div
      style={{
        display: "flex",
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
