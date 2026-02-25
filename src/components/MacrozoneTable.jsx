import { useState, useEffect, useRef, useMemo } from "react";
import { formateo } from "../config/constants";
import { SECONDARY_GREEN } from "../config/constants";

const ORIGIN_SELECTED_BG     = "rgba(51, 153, 51, 0.15)";
const ORIGIN_SELECTED_BORDER = "rgba(51, 153, 51, 0.55)";
const ORIGIN_HIGHLIGHT_BG    = "rgba(51, 153, 51, 0.07)";

const DEST_SELECTED_BG     = "rgba(255, 144, 0, 0.14)";
const DEST_SELECTED_BORDER = "rgba(255, 144, 0, 0.55)";
const DEST_HIGHLIGHT_BG    = "rgba(255, 144, 0, 0.07)";

const fmtPct = (v) => `${formateo(v)} %`;

export default function MacrozoneTable({
  data = [],
  type = "origin",
  selectedId = null,
  onSelectId,
  highlightedIds = [],
  headerColor = SECONDARY_GREEN,
  municipios = [],
  filters = {},
  onDestinationMunicipioChange,
}) {
  const isOrigin = type === "origin";

  const selectedBg     = isOrigin ? ORIGIN_SELECTED_BG     : DEST_SELECTED_BG;
  const selectedBorder = isOrigin ? ORIGIN_SELECTED_BORDER : DEST_SELECTED_BORDER;
  const highlightBg    = isOrigin ? ORIGIN_HIGHLIGHT_BG    : DEST_HIGHLIGHT_BG;

  const [showInfo, setShowInfo] = useState(false);
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    setShowInfo(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setShowInfo(false);
      }, 5000); // se oculta después de 5s
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowInfo(false);
  };

  const showWithTimeout = () => {
    setShowInfo(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setShowInfo(false);
    }, 5000);
  };

  const handleClick = (e) => {
    // Para móvil (o cualquier dispositivo sin hover)
    if (!window.matchMedia("(hover: hover)").matches) {
      e.stopPropagation();
      if (showInfo) {
        setShowInfo(false);
      } else {
        showWithTimeout();
      }
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowInfo(false);
      }
    };

    if (showInfo) {
      document.addEventListener("click", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [showInfo]);

  // Ordenar por viajes desc
  const sorted = useMemo(() => {
    const arr = [...data].sort((a, b) => b.trips - a.trips);
    // Si hay selección, mostrar solo la fila seleccionada
    if (selectedId !== null) {
      return arr.filter(row => row.id === selectedId);
    }
    return arr;
  }, [data, selectedId]);

  // Porcentaje: relativo al seleccionado si hay selección, si no al total
  const dataForPercent = useMemo(() => {
    if (selectedId !== null) {
      // Cuando hay selección, la fila seleccionada es 100%
      return selectedId !== null
        ? (data.find((d) => d.id === selectedId)?.trips ?? 1)
        : 1;
    }
    return data.reduce((s, d) => s + d.trips, 0) || 1;
  }, [data, selectedId]);

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
          {isOrigin ? "Macrozonas de origen" : "Macrozonas de destino"}
        </div>
        <div style={{ padding: 16, color: "#9ca3af", textAlign: "center" }}>
          Sin datos para el filtro actual
        </div>
      </div>
    );
  }

  return (
    <div style={{
      border: "1px solid #e2e8f0", borderRadius: 10,
      overflow: "hidden", background: "#fff",
      fontSize: 13, userSelect: "none",
    }}>

      {/* Encabezado de color */}
      <div style={{
        padding: "10px 14px", background: headerColor, color: "#fff",
        fontWeight: 700, fontSize: 14,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
      <span>{isOrigin ? "Macrozonas de origen" : "Macrozonas de destino"}</span>
      {/* Selector de municipio destino o mensaje de que el filtro viene del panel en origenes */}
      {!isOrigin ? (
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 4 }}>
          <p style={{ marginRight: 4, fontSize: 11 }}>Ver municipio:</p>
          <div>
            <select
              value={filters?.destinationMunicipio || ""}
              onChange={(e) => onDestinationMunicipioChange?.(e.target.value)}
              style={{width: "100%", borderRadius: 8,
                border: "1px solid #cbd5e1", padding: "4px 8px",
                background: "#fff", fontSize: 11,
              }}
            >
              {municipios?.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          style={{ position: "relative", display: "inline-block" }}
          onMouseEnter={handleMouseEnter} 
          onMouseLeave={handleMouseLeave} 
          onClick={handleClick}
        >
          <span
            style={{display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 20, height: 20, borderRadius: "50%", background: "#fff",
              color: headerColor, fontSize: 13, fontWeight: "bold", cursor: "pointer",
            }}>i</span>

          {showInfo && (
            <div
              style={{
                position: "absolute",
                top: "130%",
                left: "50%",
                transform: "translateX(-100%)",
                width: 215,
                backgroundColor: "#fff",
                color: "#111",
                border: `1px solid ${headerColor}`,
                borderRadius: 8,
                padding: "10px 10px",
                fontSize: 11,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                zIndex: 10,
              }}>
              Se muestran las macrozonas de origen asociadas al municipio seleccionado
              en el panel de filtros
            </div>
          )}
        </div>
      )}
      </div>

      {/* Rótulos de columna */}
      <div style={{
        display: "flex", alignItems: "center",
        padding: "4px 14px",
        background: "#f8fafc",
        borderBottom: "1px solid #e5e7eb",
        fontSize: 10, fontWeight: 700, color: "#6b7280",
        letterSpacing: 0.3, textTransform: "uppercase",
      }}>
        <span style={{ flex: 1 }}>Municipio — Macrozona</span>
        <span style={{ flexShrink: 0, minWidth: 80, textAlign: "right" }}>
          % del total
        </span>
      </div>

      {/* Filas */}
      <div style={{ maxHeight: 200, overflowY: "auto" }}>
        {sorted.map((row, idx) => {
          const isSelected    = row.id === selectedId;
          const isHighlighted = !isSelected && highlightedIds.includes(row.id);

          // Cuando hay selección, la fila seleccionada es 100%
          const pct = selectedId !== null
            ? 100  // Si hay selección, mostrar 100%
            : (row.trips / dataForPercent) * 100;

          const barPct = Math.min(pct, 100);

          let rowBg = idx % 2 === 0 ? "#fafafa" : "#ffffff";
          if (isSelected)    rowBg = selectedBg;
          if (isHighlighted) rowBg = highlightBg;

          return (
            <div
              key={row.id}
              onClick={() => onSelectId?.(row.id)}
              style={{
                display: "flex", alignItems: "center",
                padding: "6px 14px", cursor: "pointer",
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
              {/* Nombre + municipio */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? "#1a3a12" : "#1e293b",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  fontSize: 13, lineHeight: 1.3,
                }}>
                  {row.macrozona}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 1 }}>
                  {row.municipio}
                </div>
              </div>

              {/* Barra porcentual + valor */}
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
                  fontSize: 13, fontWeight: 600,
                  color: isSelected ? "#1a3a12" : "#374151",
                  minWidth: 42, textAlign: "right",
                }}>
                  {fmtPct(pct)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pie informativo */}
      {selectedId !== null && (
        <div style={{
          padding: "5px 14px", borderTop: "1px solid #f1f5f9",
          fontSize: 10, color: "#9ca3af", fontStyle: "italic",
        }}>
          {isOrigin
            ? "Destinos filtrados por esta zona · La tabla de destinos muestra solo los destinos de esta zona"
            : "Orígenes filtrados por esta zona · La tabla de orígenes muestra solo los orígenes hacia esta zona"}
        </div>
      )}
    </div>
  );
}