import React, { useMemo } from "react";

/**
 * MacrozoneTable
 *
 * Tabla de macrozonas con highlights por color según el tipo de tabla:
 *   - type="origin"      → fila seleccionada en verde tenue
 *   - type="destination" → fila seleccionada en naranja tenue
 *
 * Las filas iluminadas por la selección cruzada (highlightedIds) usan
 * el mismo color pero más suave, indicando "estas zonas están relacionadas
 * con la selección de la otra tabla".
 *
 * Props:
 *   data          — array de { id, municipio, macrozona, name, trips, value }
 *   type          — "origin" | "destination"
 *   selectedId    — ID numérico seleccionado, o null
 *   onSelectId    — callback(id: number)
 *   highlightedIds — array de IDs a iluminar suavemente
 *   headerColor   — color del encabezado
 */

const ORIGIN_SELECTED_BG    = "rgba(51, 153, 51, 0.15)";   // verde medio suave
const ORIGIN_SELECTED_BORDER = "rgba(51, 153, 51, 0.55)";
const ORIGIN_HIGHLIGHT_BG   = "rgba(51, 153, 51, 0.07)";   // verde muy suave

const DEST_SELECTED_BG    = "rgba(255, 144, 0, 0.14)";     // naranja suave
const DEST_SELECTED_BORDER = "rgba(255, 144, 0, 0.55)";
const DEST_HIGHLIGHT_BG   = "rgba(255, 144, 0, 0.07)";     // naranja muy suave

const formatNumber = (n) =>
  new Intl.NumberFormat("es-CO", { style: "decimal", maximumFractionDigits: 0 }).format(n);

export default function MacrozoneTable({
  data = [],
  type = "origin",
  selectedId = null,
  onSelectId,
  highlightedIds = [],
  headerColor = "#339933",
}) {
  const isOrigin = type === "origin";

  // Calcular el máximo de viajes para la barra proporcional
  const maxTrips = useMemo(
    () => Math.max(1, ...data.map((d) => d.trips)),
    [data]
  );

  const selectedBg     = isOrigin ? ORIGIN_SELECTED_BG     : DEST_SELECTED_BG;
  const selectedBorder = isOrigin ? ORIGIN_SELECTED_BORDER : DEST_SELECTED_BORDER;
  const highlightBg    = isOrigin ? ORIGIN_HIGHLIGHT_BG    : DEST_HIGHLIGHT_BG;

  if (!data.length) {
    return (
      <div style={{
        border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden",
        background: "#fff", fontSize: 13,
      }}>
        <div style={{
          padding: "10px 14px", background: headerColor, color: "#fff",
          fontWeight: 700, fontSize: 13,
        }}>
          {isOrigin ? "Top orígenes" : "Top destinos"}
        </div>
        <div style={{ padding: 16, color: "#9ca3af", textAlign: "center" }}>
          Sin datos para el filtro actual
        </div>
      </div>
    );
  }

  // Ordenar por viajes desc
  const sorted = [...data].sort((a, b) => b.trips - a.trips);

  return (
    <div style={{
      border: "1px solid #e2e8f0", borderRadius: 10, height: 250,
      overflow: "hidden", background: "#fff",
      fontSize: 13, userSelect: "none",
    }}>
      {/* Encabezado */}
      <div style={{
        padding: "10px 14px", background: headerColor, color: "#fff",
        fontWeight: 700, fontSize: 13, display: "flex",
        justifyContent: "space-between", alignItems: "center",
      }}>
        <span>{isOrigin ? "Macrozonas de origen" : "Macrozonas de destino"}</span>
      </div>

      {/* Filas */}
      <div style={{ maxHeight: 340, overflowY: "auto" }}>
        {sorted.map((row, idx) => {
          const isSelected   = row.id === selectedId;
          const isHighlighted = !isSelected && highlightedIds.includes(row.id);
          const barPct       = (row.trips / maxTrips) * 100;

          let rowBg = idx % 2 === 0 ? "#fafafa" : "#ffffff";
          if (isSelected)    rowBg = selectedBg;
          if (isHighlighted) rowBg = highlightBg;

          return (
            <div
              key={row.id}
              onClick={() => onSelectId?.(row.id)}
              style={{
                display: "flex", alignItems: "center",
                padding: "7px 14px", cursor: "pointer",
                background: rowBg,
                borderLeft: isSelected
                  ? `3px solid ${selectedBorder}`
                  : "3px solid transparent",
                transition: "background 0.15s ease",
                gap: 8,
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.background = highlightBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = rowBg;
              }}
            >
              {/* Nombre de la zona */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? "#1a3a12" : "#1e293b",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  fontSize: 12,
                }}>
                  {row.macrozona}
                </div>
                <div style={{ fontSize: 10, color: "#6b7280", marginTop: 1 }}>
                  {row.municipio}
                </div>
              </div>

              {/* Barra proporcional + valor */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <div style={{
                  width: 60, height: 5, borderRadius: 3,
                  background: "#f1f5f9", overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", borderRadius: 3,
                    width: `${barPct}%`,
                    background: isSelected ? selectedBorder : headerColor,
                    opacity: isSelected ? 1 : 0.55,
                    transition: "width 0.3s ease",
                  }} />
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: isSelected ? "#1a3a12" : "#374151",
                  minWidth: 48, textAlign: "right",
                }}>
                  {formatNumber(row.trips)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pie: hint cuando hay selección */}
      {selectedId !== null && (
        <div style={{
          padding: "6px 14px", borderTop: "1px solid #f1f5f9",
          fontSize: 11, color: "#6b7280", fontStyle: "italic",
        }}>
          {isOrigin
            ? "La tabla de destinos muestra solo los destinos de esta zona"
            : "La tabla de orígenes muestra solo los orígenes hacia esta zona"}
        </div>
      )}
    </div>
  );
}