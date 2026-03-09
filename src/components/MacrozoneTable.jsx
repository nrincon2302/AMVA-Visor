import { useMemo } from "react";
import { formateo } from "../config/constants";
import { SECONDARY_GREEN } from "../config/constants";

const ORIGIN_SELECTED_BG     = "rgba(51, 153, 51, 0.18)";
const ORIGIN_SELECTED_BORDER = "rgba(51, 153, 51, 0.65)";
const ORIGIN_APPLIED_BG      = "rgba(51, 153, 51, 0.08)";
const ORIGIN_HIGHLIGHT_BG    = "rgba(51, 153, 51, 0.07)";

const DEST_SELECTED_BG     = "rgba(255, 144, 0, 0.18)";
const DEST_SELECTED_BORDER = "rgba(255, 144, 0, 0.65)";
const DEST_APPLIED_BG      = "rgba(255, 144, 0, 0.08)";
const DEST_HIGHLIGHT_BG    = "rgba(255, 144, 0, 0.07)";

const fmtPct = (v) => `${formateo(v)} %`;

/**
 * pendingIds  — selección local aún no enviada al API (checkboxes activos)
 * appliedIds  — selección confirmada (la que está filtrando el API)
 * highlightedIds — filas con flujo hacia/desde la selección aplicada del otro lado
 */
export default function MacrozoneTable({
  data = [],
  type = "origin",
  pendingIds = [],
  appliedIds = [],
  onToggleId,
  highlightedIds = [],
  headerColor = SECONDARY_GREEN,
  municipios = [],
  selectedMunicipio = "AMVA General",
  onMunicipioChange,
}) {
  const isOrigin = type === "origin";

  const selectedBg     = isOrigin ? ORIGIN_SELECTED_BG     : DEST_SELECTED_BG;
  const selectedBorder = isOrigin ? ORIGIN_SELECTED_BORDER : DEST_SELECTED_BORDER;
  const appliedBg      = isOrigin ? ORIGIN_APPLIED_BG      : DEST_APPLIED_BG;
  const highlightBg    = isOrigin ? ORIGIN_HIGHLIGHT_BG    : DEST_HIGHLIGHT_BG;

  const sorted = useMemo(() => [...data].sort((a, b) => b.trips - a.trips), [data]);
  const dataForPercent = useMemo(() => data.reduce((s, d) => s + d.trips, 0) || 1, [data]);

  const pendingTotal = useMemo(
    () => data.filter((r) => pendingIds.includes(r.id)).reduce((s, d) => s + d.trips, 0),
    [data, pendingIds]
  );

  const municipioSelector = municipios.length > 0 && (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <p style={{ margin: 0, fontSize: 11 }}>Ver municipio:</p>
      <select
        value={selectedMunicipio || "AMVA General"}
        onChange={(e) => onMunicipioChange?.(e.target.value)}
        style={{
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.4)",
          padding: "3px 8px",
          background: "rgba(255,255,255,0.15)",
          color: "#ffffff",
          fontSize: 11,
          cursor: "pointer",
          outline: "none",
        }}
      >
        {municipios.map((m) => (
          <option key={m} value={m} style={{ color: "#111", background: "#fff" }}>{m}</option>
        ))}
      </select>
    </div>
  );

  if (!data.length) {
    return (
      <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", background: "#fff", fontSize: 13 }}>
        <div style={{ padding: "10px 14px", background: headerColor, color: "#fff", fontWeight: 700, fontSize: 13 }}>
          {isOrigin ? "Macrozonas de origen" : "Macrozonas de destino"}
        </div>
        <div style={{ padding: 16, color: "#9ca3af", textAlign: "center" }}>
          Sin datos para el filtro actual
        </div>
      </div>
    );
  }

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", background: "#fff", fontSize: 13, userSelect: "none" }}>
      {/* ── Encabezado ── */}
      <div
        style={{
          padding: "10px 14px",
          background: headerColor,
          color: "#fff",
          fontWeight: 700,
          fontSize: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <span>
          {isOrigin ? "Macrozonas de origen" : "Macrozonas de destino"}
          {pendingIds.length > 0 && (
            <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, background: "rgba(255,255,255,0.22)", borderRadius: 10, padding: "1px 8px" }}>
              {pendingIds.length} marcada{pendingIds.length !== 1 ? "s" : ""}
            </span>
          )}
        </span>
        {municipioSelector}
      </div>

      {/* ── Rótulos de columna ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "4px 14px",
          background: "#f8fafc",
          borderBottom: "1px solid #e5e7eb",
          fontSize: 10,
          fontWeight: 700,
          color: "#6b7280",
          letterSpacing: 0.3,
          textTransform: "uppercase",
        }}
      >
        <span style={{ width: 20, flexShrink: 0 }} />
        <span style={{ flex: 1 }}>Macrozona</span>
        <span style={{ flexShrink: 0, minWidth: 68, textAlign: "right" }}>% del total</span>
        <span style={{ flexShrink: 0, minWidth: 72, textAlign: "right", marginLeft: 8 }}>Viajes</span>
      </div>

      {/* ── Filas ── */}
      <div style={{ maxHeight: 220, overflowY: "auto" }}>
        {sorted.map((row, idx) => {
          const isPending     = pendingIds.includes(row.id);
          // "applied but not currently in pending" — shows dimmed tick
          const isApplied     = appliedIds.includes(row.id) && !isPending;
          const isHighlighted = !isPending && !isApplied && highlightedIds.includes(row.id);

          const pct    = (row.trips / dataForPercent) * 100;
          const barPct = Math.min(pct, 100);

          let rowBg = idx % 2 === 0 ? "#fafafa" : "#ffffff";
          if (isPending)      rowBg = selectedBg;
          else if (isApplied) rowBg = appliedBg;
          else if (isHighlighted) rowBg = highlightBg;

          return (
            <div
              key={row.id}
              onClick={() => onToggleId?.(row.id)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 14px",
                cursor: "pointer",
                background: rowBg,
                borderLeft: isPending
                  ? `3px solid ${selectedBorder}`
                  : isApplied
                  ? `3px solid ${selectedBorder}66`
                  : "3px solid transparent",
                transition: "background 0.12s ease",
                gap: 8,
              }}
              onMouseEnter={(e) => { if (!isPending && !isApplied) e.currentTarget.style.background = highlightBg; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = rowBg; }}
            >
              {/* Checkbox visual */}
              <div
                style={{
                  width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                  border: isPending
                    ? `2px solid ${selectedBorder}`
                    : isApplied
                    ? `2px solid ${selectedBorder}88`
                    : "2px solid #cbd5e1",
                  background: isPending ? selectedBorder : isApplied ? `${selectedBorder}44` : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, color: "#fff", fontWeight: 800,
                }}
              >
                {isPending ? "✓" : isApplied ? "●" : ""}
              </div>

              {/* Nombre + municipio */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: isPending || isApplied ? 700 : 500,
                  color: isPending ? "#1a3a12" : isApplied ? "#2d5a1a" : "#1e293b",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  fontSize: 13, lineHeight: 1.3,
                }}>
                  {row.macrozona}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 1 }}>{row.municipio}</div>
              </div>

              {/* Barra + porcentaje */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <div style={{ width: 44, height: 5, borderRadius: 3, background: "#f1f5f9", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 3, width: `${barPct}%`,
                    background: isPending ? selectedBorder : headerColor,
                    opacity: isPending ? 1 : 0.45,
                    transition: "width 0.3s ease",
                  }} />
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  color: isPending ? "#1a3a12" : "#374151",
                  minWidth: 44, textAlign: "right",
                }}>
                  {fmtPct(pct)}
                </span>
              </div>

              {/* Viajes */}
              <span style={{
                fontSize: 12, fontWeight: isPending || isApplied ? 700 : 500,
                color: isPending ? "#1a3a12" : "#374151",
                minWidth: 72, textAlign: "right", flexShrink: 0, marginLeft: 2,
                fontVariantNumeric: "tabular-nums",
              }}>
                {formateo(row.trips)}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Pie ── */}
      <div style={{
        padding: "5px 14px",
        borderTop: "1px solid #f1f5f9",
        fontSize: 10,
        color: "#9ca3af",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: 24,
      }}>
        {pendingIds.length > 0 ? (
          <>
            <span style={{ color: "#6b7280", fontStyle: "normal" }}>
              {pendingIds.length} zona{pendingIds.length !== 1 ? "s" : ""} marcada{pendingIds.length !== 1 ? "s" : ""} — presiona <strong>Aplicar filtro</strong>
            </span>
            <span style={{ fontVariantNumeric: "tabular-nums", color: "#6b7280", fontWeight: 600 }}>
              {formateo(pendingTotal)} viajes
            </span>
          </>
        ) : appliedIds.length > 0 ? (
          <span style={{ fontStyle: "italic" }}>Filtro activo: {appliedIds.length} zona{appliedIds.length !== 1 ? "s" : ""}</span>
        ) : (
          <span style={{ fontStyle: "italic" }}>Selecciona zonas y presiona Aplicar filtro</span>
        )}
      </div>
    </div>
  );
}