import { useMemo, useState, useEffect } from "react";
import MapCardWithHeader from "../components/MapCardWithHeader";
import HighchartsMapCard from "../components/HighchartsMapCard";
import MacrozoneTable from "../components/MacrozoneTable";
import { SECONDARY_GREEN, TERTIARY_ORANGE } from "../config/constants";
import { getMacroInfo, getMacroDisplayName } from "../config/geoLookup";

export default function MapsPanel({
  macroHeatData = {},
  municipios = [],
  isCompareMode,
  // Selecciones APLICADAS (committed → activas en el API)
  selectedOrigins = [],
  selectedDestinations = [],
  onOriginSelect,       // (array) => void
  onDestinationSelect,  // (array) => void
  originMunicipio,
  destinationMunicipio,
  onOriginMunicipioChange,
  onDestinationMunicipioChange,
  expandedMap,
  onExpandedMapChange,
}) {
  const matriz = macroHeatData?.data ?? [];

  // ── Selecciones pendientes (staging) ─────────────────────────────────────
  // Se inicializan con lo que esté aplicado; al clicar una fila se toglea aquí,
  // y solo al pulsar "Aplicar filtro" se llama onOriginSelect/onDestinationSelect.
  const [pendingOrigins,      setPendingOrigins]      = useState(selectedOrigins);
  const [pendingDestinations, setPendingDestinations] = useState(selectedDestinations);

  // Si el padre limpia las selecciones (p.ej. botón global "Limpiar"), sincronizar pending.
  useEffect(() => { setPendingOrigins(selectedOrigins);      }, [selectedOrigins]);
  useEffect(() => { setPendingDestinations(selectedDestinations); }, [selectedDestinations]);

  const hasPendingChanges =
    JSON.stringify([...pendingOrigins].sort())      !== JSON.stringify([...selectedOrigins].sort()) ||
    JSON.stringify([...pendingDestinations].sort()) !== JSON.stringify([...selectedDestinations].sort());

  const handleApply = () => {
    onOriginSelect(pendingOrigins);
    onDestinationSelect(pendingDestinations);
  };

  const handleClearAll = () => {
    setPendingOrigins([]);
    setPendingDestinations([]);
    onOriginSelect([]);
    onDestinationSelect([]);
  };

  const togglePendingOrigin = (id) => {
    setPendingOrigins((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const togglePendingDestination = (id) => {
    setPendingDestinations((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  /* ── Global totals ─────────────────────────────────────────────────────── */
  const globalData = useMemo(() => {
    const originMap = new Map();
    const destinationMap = new Map();
    matriz.forEach(({ agrupa_mz_origen, agrupa_mz_destino, valor }) => {
      const oid = Number(agrupa_mz_origen);
      const did = Number(agrupa_mz_destino);
      originMap.set(oid, (originMap.get(oid) || 0) + valor);
      destinationMap.set(did, (destinationMap.get(did) || 0) + valor);
    });
    const toArr = (map) =>
      Array.from(map.entries()).map(([id, value]) => {
        const { municipio, macrozona } = getMacroInfo(id);
        return { id, municipio, macrozona, name: getMacroDisplayName(id), trips: Math.round(value), value };
      });
    return { origin: toArr(originMap), destination: toArr(destinationMap) };
  }, [matriz]);

  /* ── Cross-filter usa selecciones APLICADAS (no pending) ─────────────── */
  const originData = useMemo(() => {
    const hasDestMunFilter = destinationMunicipio && destinationMunicipio !== "Todos" && destinationMunicipio !== "AMVA General";
    if (!selectedDestinations.length && !hasDestMunFilter) return globalData.origin;
    const map = new Map();
    matriz.forEach(({ agrupa_mz_origen, agrupa_mz_destino, valor }) => {
      const oid = Number(agrupa_mz_origen);
      const did = Number(agrupa_mz_destino);
      if (selectedDestinations.length > 0 && !selectedDestinations.includes(did)) return;
      if (hasDestMunFilter && getMacroInfo(did).municipio !== destinationMunicipio) return;
      map.set(oid, (map.get(oid) || 0) + valor);
    });
    return Array.from(map.entries()).map(([id, value]) => {
      const { municipio, macrozona } = getMacroInfo(id);
      return { id, municipio, macrozona, name: getMacroDisplayName(id), trips: Math.round(value), value };
    });
  }, [selectedDestinations, destinationMunicipio, matriz, globalData.origin]);

  const destinationData = useMemo(() => {
    const hasOriginMunFilter = originMunicipio && originMunicipio !== "Todos" && originMunicipio !== "AMVA General";
    if (!selectedOrigins.length && !hasOriginMunFilter) return globalData.destination;
    const map = new Map();
    matriz.forEach(({ agrupa_mz_origen, agrupa_mz_destino, valor }) => {
      const oid = Number(agrupa_mz_origen);
      const did = Number(agrupa_mz_destino);
      if (selectedOrigins.length > 0 && !selectedOrigins.includes(oid)) return;
      if (hasOriginMunFilter && getMacroInfo(oid).municipio !== originMunicipio) return;
      map.set(did, (map.get(did) || 0) + valor);
    });
    return Array.from(map.entries()).map(([id, value]) => {
      const { municipio, macrozona } = getMacroInfo(id);
      return { id, municipio, macrozona, name: getMacroDisplayName(id), trips: Math.round(value), value };
    });
  }, [selectedOrigins, originMunicipio, matriz, globalData.destination]);

  /* ── Highlighted IDs ─────────────────────────────────────────────────── */
  const highlightedDestinations = useMemo(
    () => (!selectedOrigins.length ? [] : destinationData.map((d) => d.id)),
    [selectedOrigins, destinationData]
  );
  const highlightedOrigins = useMemo(
    () => (!selectedDestinations.length ? [] : originData.map((o) => o.id)),
    [selectedDestinations, originData]
  );

  /* ── Filtro de municipio en vista ─────────────────────────────────────── */
  const filteredOriginByMunicipio = useMemo(() => {
    if (!originMunicipio || originMunicipio === "Todos" || originMunicipio === "AMVA General")
      return originData;
    return originData.filter((item) => item.municipio === originMunicipio);
  }, [originData, originMunicipio]);

  const filteredDestinationByMunicipio = useMemo(() => {
    if (!destinationMunicipio || destinationMunicipio === "Todos" || destinationMunicipio === "AMVA General")
      return destinationData;
    return destinationData.filter((item) => item.municipio === destinationMunicipio);
  }, [destinationData, destinationMunicipio]);

  // Para el highlight del mapa (Highcharts solo acepta 1 zona)
  const mapSelectedOrigin      = selectedOrigins.length === 1 ? selectedOrigins[0] : null;
  const mapSelectedDestination = selectedDestinations.length === 1 ? selectedDestinations[0] : null;

  const hasODFilter = selectedOrigins.length > 0 || selectedDestinations.length > 0;

  return (
    <section
      style={{
        padding: 16,
        background: "#ffffff",
        borderRadius: 12,
        marginBottom: 20,
        border: "1px solid #e2e8f0",
        boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
      }}
    >
      {/* ── Cabecera ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <h3 style={{ margin: 0 }}>
          Distribución geográfica de los viajes (Origen - Destino)
        </h3>

        {/* Badge de filtro aplicado */}
        {hasODFilter && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "6px 12px",
            borderRadius: 20,
            background: "linear-gradient(135deg, rgba(51,153,51,0.12) 0%, rgba(255,144,0,0.10) 100%)",
            border: "1px solid rgba(51,153,51,0.3)",
            fontSize: 12, fontWeight: 600, color: "#1a3a12",
          }}>
            <span style={{ fontSize: 14 }}>🔍</span>
            <span>
              Filtro activo:{" "}
              {selectedOrigins.length > 0 && (
                <span style={{ color: SECONDARY_GREEN }}>
                  {selectedOrigins.length} origen{selectedOrigins.length !== 1 ? "es" : ""}
                </span>
              )}
              {selectedOrigins.length > 0 && selectedDestinations.length > 0 && (
                <span style={{ color: "#6b7280", margin: "0 4px" }}>→</span>
              )}
              {selectedDestinations.length > 0 && (
                <span style={{ color: TERTIARY_ORANGE }}>
                  {selectedDestinations.length} destino{selectedDestinations.length !== 1 ? "s" : ""}
                </span>
              )}
            </span>
            <button
              onClick={handleClearAll}
              title="Limpiar filtros OD"
              style={{
                background: "none", border: "1px solid rgba(51,153,51,0.4)", borderRadius: "50%",
                width: 20, height: 20, cursor: "pointer", fontSize: 11, color: "#374151",
                display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0,
              }}
            >✕</button>
          </div>
        )}
      </div>

      {isCompareMode && (
        <div style={{
          padding: 12, marginBottom: 16, backgroundColor: "#f3f4f6",
          borderRadius: 8, border: "1px solid #e5e7eb",
          fontSize: 13, lineHeight: 1.5, color: "#4b5563",
        }}>
          <strong>Importante:</strong> Los mapas muestran la información agregada de los detalles
          seleccionados. La comparación detallada no está disponible en esta visualización geográfica.
        </div>
      )}

      {/* Mapas */}
      <div className="map-grid-2" style={{ marginBottom: 20 }}>
        <MapCardWithHeader
          title="Orígenes de viajes"
          data={filteredOriginByMunicipio}
          palette="green"
          selectedMacrozone={mapSelectedOrigin}
          onExpand={() => onExpandedMapChange("origin")}
          onSelect={(id) => {
            if (id === null) return;
            togglePendingOrigin(id);
          }}
        />
        <MapCardWithHeader
          title="Destinos de viajes"
          data={filteredDestinationByMunicipio}
          palette="orange"
          selectedMacrozone={mapSelectedDestination}
          onExpand={() => onExpandedMapChange("destination")}
          onSelect={(id) => {
            if (id === null) return;
            togglePendingDestination(id);
          }}
        />
      </div>

      {/* Tablas */}
      <div className="map-grid-2" style={{ marginBottom: 14 }}>
        <MacrozoneTable
          data={filteredOriginByMunicipio}
          type="origin"
          pendingIds={pendingOrigins}
          appliedIds={selectedOrigins}
          onToggleId={togglePendingOrigin}
          highlightedIds={highlightedOrigins}
          headerColor={SECONDARY_GREEN}
          municipios={municipios}
          selectedMunicipio={originMunicipio}
          onMunicipioChange={onOriginMunicipioChange}
        />
        <MacrozoneTable
          data={filteredDestinationByMunicipio}
          type="destination"
          pendingIds={pendingDestinations}
          appliedIds={selectedDestinations}
          onToggleId={togglePendingDestination}
          highlightedIds={highlightedDestinations}
          headerColor={TERTIARY_ORANGE}
          municipios={municipios}
          selectedMunicipio={destinationMunicipio}
          onMunicipioChange={onDestinationMunicipioChange}
        />
      </div>

      {/* ── Barra de acción ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 10,
        padding: "10px 4px 2px",
        borderTop: "1px solid #e5e7eb",
      }}>
        {/* Resumen de marcaciones pendientes */}
        {(pendingOrigins.length > 0 || pendingDestinations.length > 0) && (
          <span style={{ fontSize: 12, color: "#6b7280", flex: 1 }}>
            {[
              pendingOrigins.length > 0 && `${pendingOrigins.length} origen${pendingOrigins.length !== 1 ? "es" : ""}`,
              pendingDestinations.length > 0 && `${pendingDestinations.length} destino${pendingDestinations.length !== 1 ? "s" : ""}`,
            ].filter(Boolean).join(" · ")} marcado{(pendingOrigins.length + pendingDestinations.length) !== 1 ? "s" : ""}
          </span>
        )}

        {/* Botón limpiar marcaciones */}
        {(pendingOrigins.length > 0 || pendingDestinations.length > 0) && (
          <button
            onClick={() => { setPendingOrigins([]); setPendingDestinations([]); }}
            style={{
              padding: "7px 16px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              background: "#ffffff",
              color: "#6b7280",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#f9fafb"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; }}
          >
            Limpiar selección
          </button>
        )}

        {/* Botón Aplicar — solo visible cuando hay cambios pendientes */}
        {hasPendingChanges && (
          <button
            onClick={handleApply}
            style={{
              padding: "7px 20px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #7CB928 0%, #339933 100%)",
              color: "#ffffff",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(51,153,51,0.35)",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 7 5 11 12 2" />
            </svg>
            Aplicar filtro
          </button>
        )}

        {/* Botón limpiar TODO (aplicado + pending) cuando hay filtro activo pero nada pendiente */}
        {hasODFilter && !hasPendingChanges && (
          <button
            onClick={handleClearAll}
            style={{
              padding: "7px 16px",
              borderRadius: 8,
              border: "1px solid #fca5a5",
              background: "#fff1f2",
              color: "#dc2626",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#fff1f2"; }}
          >
            Quitar filtro OD
          </button>
        )}
      </div>

      {/* Expanded modal */}
      {expandedMap && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: 20,
        }}>
          <div style={{
            backgroundColor: "#ffffff", borderRadius: 12,
            width: "90%", maxWidth: 1000, maxHeight: "90vh",
            display: "flex", flexDirection: "column",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)", overflow: "hidden",
          }}>
            <div style={{
              padding: "16px 20px", borderBottom: "1px solid #e5e7eb",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                {expandedMap === "origin" ? "Orígenes de viajes" : "Destinos de viajes"}
              </h3>
              <button
                onClick={() => onExpandedMapChange(null)}
                style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#6b7280", padding: 0, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}
              >✕</button>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
              <HighchartsMapCard
                title={null}
                data={expandedMap === "origin" ? filteredOriginByMunicipio : filteredDestinationByMunicipio}
                palette={expandedMap === "origin" ? "green" : "orange"}
                selectedMacrozone={expandedMap === "origin" ? mapSelectedOrigin : mapSelectedDestination}
                expandedHeight={500}
                onSelect={expandedMap === "origin"
                  ? (id) => { if (id !== null) togglePendingOrigin(id); }
                  : (id) => { if (id !== null) togglePendingDestination(id); }
                }
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}