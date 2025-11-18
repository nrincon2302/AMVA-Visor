import React from "react";

const FilterBar = () => {
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
      <select
        defaultValue="Municipio"
        style={{
          borderRadius: 9999,
          border: "1px solid #d1d5db",
          padding: "6px 12px",
          fontSize: 13,
          color: "#374151",
          background: "#ffffff",
        }}
      >
        <option>Municipio</option>
        <option>Área Metropolitana</option>
      </select>

      <select
        defaultValue="Caldas"
        style={{
          borderRadius: 9999,
          border: "1px solid #d1d5db",
          padding: "6px 12px",
          fontSize: 13,
          color: "#374151",
          background: "#ffffff",
        }}
      >
        <option>Caldas</option>
        <option>Medellín</option>
        <option>Envigado</option>
      </select>
    </div>
  );
};

export default FilterBar;