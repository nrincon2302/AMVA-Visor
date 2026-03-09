import { useMemo } from "react";
import MapCardWithHeader from "../components/MapCardWithHeader";
import HighchartsMapCard from "../components/HighchartsMapCard";
import MacrozoneTable from "../components/MacrozoneTable";
import { SECONDARY_GREEN, TERTIARY_ORANGE } from "../config/constants";
import { getMacroInfo, getMacroDisplayName } from "../config/geoLookup";

export default function MapsPanel({
  macroHeatData = {},
  municipios = [],
  isCompareMode,
  // OD selection — arrays para multi-selección
  selectedOrigins = [],
  selectedDestinations = [],
  onOriginSelect,
  onDestinationSelect,
  // local municipio filters (display only, no API recalc)
  originMunicipio,
  destinationMunicipio,
  onOriginMunicipioChange,
  onDestinationMunicipioChange,
  // expand modal state
  expandedMap,
  onExpandedMapChange,
}) {
  const matriz = macroHeatData?.data;

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

  /* ── Cross-filter: origin data filtered by destination selections ─────── */
  const originData = useMemo(() => {
    const hasDestMunFilter =
      destinationMunicipio && destinationMunicipio !== "Todos" && destinationMunicipio !== "AMVA General";
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

  /* ── Cross-filter: destination data filtered by origin selections ──────── */
  const destinationData = useMemo(() => {
    const hasOriginMunFilter =
      originMunicipio && originMunicipio !== "Todos" && originMunicipio !== "AMVA General";
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

  /* ── Highlighted IDs in cross tables ─────────────────────────────────── */
  const highlightedDestinations = useMemo(
    () => (!selectedOrigins.length ? [] : destinationData.map((d) => d.id)),
    [selectedOrigins, destinationData]
  );
  const highlightedOrigins = useMemo(
    () => (!selectedDestinations.length ? [] : originData.map((o) => o.id)),
    [selectedDestinations, originData]
  );

  /* ── Apply municipio display filter on top of cross-filter data ────── */
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

  /* ── Datos del mapa: la primera selección se usa para el highlight del mapa ── */
  // Para el mapa Highcharts, usamos la primera macrozona seleccionada como highlight
  // (el mapa no soporta multi-highlight nativo, pero el click sigue funcionando)
  const mapSelectedOrigin      = selectedOrigins.length === 1 ? selectedOrigins[0] : null;
  const mapSelectedDestination = selectedDestinations.length === 1 ? selectedDestinations[0] : null;

  /* ── Active filter badge ─────────────────────────────────────────────── */
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <h3 style={{ margin: 0 }}>
          Distribución geográfica de los viajes (Origen - Destino)
        </h3>

        {/* Active OD filter badge + clear button */}
        {hasODFilter && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 12px",
            borderRadius: 20,
            background: "linear-gradient(135deg, rgba(51,153,51,0.12) 0%, rgba(255,144,0,0.10) 100%)",
            border: "1px solid rgba(51,153,51,0.3)",
            fontSize: 12,
            fontWeight: 600,
            color: "#1a3a12",
          }}>
            <span style={{ fontSize: 14 }}>🔍</span>
            <span>
              Filtro aplicado:{" "}
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
              <span style={{ color: "#6b7280", marginLeft: 4, fontSize: 11, fontWeight: 400 }}>
                — Mostrando solo indicadores de viajes
              </span>
            </span>
            <button
              onClick={() => { onOriginSelect([]); onDestinationSelect([]); }}
              title="Limpiar filtros OD"
              style={{
                background: "none",
                border: "1px solid rgba(51,153,51,0.4)",
                borderRadius: "50%",
                width: 20, height: 20,
                cursor: "pointer",
                fontSize: 11,
                color: "#374151",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                flexShrink: 0,
              }}
            >
              ✕
            </button>
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
          seleccionados. La comparación detallada por aspecto específico no está disponible en
          esta visualización geográfica.
        </div>
      )}

      {/* Maps */}
      <div className="map-grid-2" style={{ marginBottom: 20 }}>
        <MapCardWithHeader
          title="Orígenes de viajes"
          data={filteredOriginByMunicipio}
          palette="green"
          selectedMacrozone={mapSelectedOrigin}
          onExpand={() => onExpandedMapChange("origin")}
          onSelect={onOriginSelect}
        />
        <MapCardWithHeader
          title="Destinos de viajes"
          data={filteredDestinationByMunicipio}
          palette="orange"
          selectedMacrozone={mapSelectedDestination}
          onExpand={() => onExpandedMapChange("destination")}
          onSelect={onDestinationSelect}
        />
      </div>

      {/* Tables */}
      <div className="map-grid-2">
        <MacrozoneTable
          data={filteredOriginByMunicipio}
          type="origin"
          selectedIds={selectedOrigins}
          onSelectId={onOriginSelect}
          highlightedIds={highlightedOrigins}
          headerColor={SECONDARY_GREEN}
          municipios={municipios}
          selectedMunicipio={originMunicipio}
          onMunicipioChange={onOriginMunicipioChange}
        />
        <MacrozoneTable
          data={filteredDestinationByMunicipio}
          type="destination"
          selectedIds={selectedDestinations}
          onSelectId={onDestinationSelect}
          highlightedIds={highlightedDestinations}
          headerColor={TERTIARY_ORANGE}
          municipios={municipios}
          selectedMunicipio={destinationMunicipio}
          onMunicipioChange={onDestinationMunicipioChange}
        />
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
                style={{
                  background: "none", border: "none", fontSize: 24,
                  cursor: "pointer", color: "#6b7280",
                  padding: 0, width: 32, height: 32,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >✕</button>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
              <HighchartsMapCard
                title={null}
                data={expandedMap === "origin" ? filteredOriginByMunicipio : filteredDestinationByMunicipio}
                palette={expandedMap === "origin" ? "green" : "orange"}
                selectedMacrozone={expandedMap === "origin" ? mapSelectedOrigin : mapSelectedDestination}
                expandedHeight={500}
                onSelect={expandedMap === "origin" ? onOriginSelect : onDestinationSelect}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}