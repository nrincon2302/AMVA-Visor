import React, { useMemo } from "react";
import { TERTIARY_BLUE, TERTIARY_YELLOW } from "../config/constants";

const MacrozoneTable = ({ 
  data = [],
  type, // "origin" o "destination"
  selectedMacrozone, 
  onSelectMacrozone, 
  highlightedZones = [],
  headerColor = "#66CC33" // Color del header (verde para origen, naranja para destino)
}) => {
  const sortedData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    
    return [...data]
      .filter(row => row && typeof row.trips === 'number')
      .sort((a, b) => b.trips - a.trips);
  }, [data]);

  // Color tenue para el header (30% de opacidad)
  const headerBgColor = `${headerColor}30`;
  
  // Color más oscuro para el texto del header
  const headerTextColor = type === "origin" ? "#339933" : "#FF6B00";

  if (sortedData.length === 0) {
    return (
      <div style={{ 
        padding: 16,
        textAlign: "center",
        color: "#A6A6A6",
        fontSize: 11,
        border: "1px solid #e2e8f0",
        borderRadius: 8,
      }}>
        No hay datos disponibles
      </div>
    );
  }

  return (
    <div style={{ 
      maxHeight: 200, 
      overflowY: "auto", 
      border: "1px solid #e2e8f0",
      borderRadius: 8,
    }}>
      <table style={{ 
        width: "100%", 
        fontSize: 11, 
        borderCollapse: "collapse" 
      }}>
        <thead style={{ 
          position: "sticky", 
          top: 0, 
          background: headerBgColor,
          zIndex: 1 
        }}>
          <tr>
            <th style={{ 
              padding: "8px 12px", 
              textAlign: "left", 
              borderBottom: `2px solid ${headerColor}`,
              fontWeight: 700,
              color: headerTextColor,
            }}>
              Municipio - Macrozona
            </th>
            <th style={{ 
              padding: "8px 12px", 
              textAlign: "right", 
              borderBottom: `2px solid ${headerColor}`,
              fontWeight: 700,
              color: headerTextColor,
            }}>
              Viajes
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row) => {
            // Crear identificador único con formato "Municipio-Macrozona"
            const fullZoneId = `${row.municipio} - ${row.macrozona}`;
            const isSelected = selectedMacrozone === fullZoneId;
            const isHighlighted = highlightedZones.includes(fullZoneId);
            
            return (
              <tr
                key={fullZoneId}
                onClick={() => onSelectMacrozone(fullZoneId)}
                style={{
                  cursor: "pointer",
                  background: isSelected 
                    ? TERTIARY_BLUE
                    : isHighlighted 
                    ? TERTIARY_YELLOW
                    : "transparent",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected && !isHighlighted) {
                    e.currentTarget.style.background = "#f1f5f9";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected && !isHighlighted) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <td style={{ 
                  padding: "8px 12px", 
                  borderBottom: "1px solid #f1f5f9",
                  fontWeight: isSelected || isHighlighted ? 600 : 400,
                  color: isSelected ? "#ffffff" : "#0f172a",
                }}>
                  <span style={{ fontWeight: 600 }}>{row.municipio}</span>
                  <span style={{ color: isSelected ? "#ffffff" : "#64748b" }}> - </span>
                  <span>{row.macrozona}</span>
                </td>
                <td style={{ 
                  padding: "8px 12px", 
                  textAlign: "right",
                  borderBottom: "1px solid #f1f5f9",
                  fontWeight: isSelected || isHighlighted ? 600 : 400,
                  color: isSelected ? "#ffffff" : "#0f172a",
                }}>
                  {(row.trips || 0).toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MacrozoneTable;
