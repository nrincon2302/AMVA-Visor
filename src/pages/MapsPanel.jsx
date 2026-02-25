import { useState, useMemo } from "react";
import MapCardWithHeader from "../components/MapCardWithHeader";
import HighchartsMapCard from "../components/HighchartsMapCard";
import MacrozoneTable from "../components/MacrozoneTable";
import { SECONDARY_GREEN, TERTIARY_ORANGE } from "../config/constants";
import { getMacroInfo, getMacroDisplayName } from "../config/geoLookup";

export default function MapsPanel({
  macroHeatData = {},
  filters = {},
  isCompareMode,
  municipios = [],
  onDestinationMunicipiChange,
}) {
  const [selectedOrigin,      setSelectedOrigin]      = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [expandedMap, setExpandedMap] = useState(null);

  const matriz = macroHeatData?.data;

  /* ── Totales globales por ID ── */
  const globalData = useMemo(() => {
    const originMap      = new Map();
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

  /* ── Orígenes filtrados por destino seleccionado ── */
  const originData = useMemo(() => {
    const munDest = filters?.destinationMunicipio;
    const hasDestFilter = munDest && munDest !== "Todos" && munDest !== "AMVA General";

    if (selectedDestination === null && !hasDestFilter) return globalData.origin;

    const map = new Map();
    matriz.forEach(({ agrupa_mz_origen, agrupa_mz_destino, valor }) => {
      const oid = Number(agrupa_mz_origen);
      const did = Number(agrupa_mz_destino);
      if (selectedDestination !== null && did !== selectedDestination) return;
      if (hasDestFilter && getMacroInfo(did).municipio !== munDest) return;
      map.set(oid, (map.get(oid) || 0) + valor);
    });

    return Array.from(map.entries()).map(([id, value]) => {
      const { municipio, macrozona } = getMacroInfo(id);
      return { id, municipio, macrozona, name: getMacroDisplayName(id), trips: Math.round(value), value };
    });
  }, [selectedDestination, filters?.destinationMunicipio, matriz, globalData.origin]);

  /* ── Destinos filtrados por origen seleccionado ── */
  const destinationData = useMemo(() => {
    if (selectedOrigin === null) return globalData.destination;

    const map = new Map();
    matriz.forEach(({ agrupa_mz_origen, agrupa_mz_destino, valor }) => {
      if (Number(agrupa_mz_origen) !== selectedOrigin) return;
      const did = Number(agrupa_mz_destino);
      map.set(did, (map.get(did) || 0) + valor);
    });

    return Array.from(map.entries()).map(([id, value]) => {
      const { municipio, macrozona } = getMacroInfo(id);
      return { id, municipio, macrozona, name: getMacroDisplayName(id), trips: Math.round(value), value };
    });
  }, [selectedOrigin, matriz, globalData.destination]);

  /* ── IDs a iluminar en la tabla cruzada ── */
  const highlightedDestinations = useMemo(
    () => (selectedOrigin === null ? [] : destinationData.map((d) => d.id)),
    [selectedOrigin, destinationData]
  );
  const highlightedOrigins = useMemo(
    () => (selectedDestination === null ? [] : originData.map((o) => o.id)),
    [selectedDestination, originData]
  );

  /* ── Filtro adicional por municipio del sidebar ── */
  const filteredOriginByMunicipio = useMemo(() => {
    const mun = filters?.municipio;
    if (!mun || mun === "Todos" || mun === "AMVA General") return originData;
    return originData.filter((item) => item.municipio === mun);
  }, [originData, filters?.municipio]);

  const filteredDestinationByMunicipio = useMemo(() => {
    const mun = filters?.destinationMunicipio;
    if (!mun || mun === "Todos" || mun === "AMVA General") return destinationData;
    return destinationData.filter((item) => item.municipio === mun);
  }, [destinationData, filters?.destinationMunicipio]);

  const handleOriginSelect = (id) => {
    setSelectedOrigin(id === selectedOrigin ? null : id);
    setSelectedDestination(null);
  };

  const handleDestinationSelect = (id) => {
    setSelectedDestination(id === selectedDestination ? null : id);
    setSelectedOrigin(null);
  };

  return (
    <section style={{
      padding: 16, background: "#ffffff", borderRadius: 12,
      marginBottom: 20, border: "1px solid #e2e8f0",
      boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
    }}>
      <h3 style={{ marginTop: 0, marginBottom: 16 }}>
        Distribución geográfica de los viajes (Origen - Destino)
      </h3>

      {isCompareMode && (
        <div style={{
          padding: 12, marginBottom: 16, backgroundColor: "#f3f4f6",
          borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13, lineHeight: 1.5, color: "#4b5563",
        }}>
          <strong>Importante:</strong> Los mapas muestran la información agregada de los detalles
          seleccionados en el filtro.{" "}
          La comparación detallada por aspecto específico no está disponible en esta visualización geográfica.
        </div>
      )}

      <div className="map-grid-2" style={{ marginBottom: 20 }}>
        <MapCardWithHeader
          title="Orígenes de viajes"
          data={filteredOriginByMunicipio}
          palette="green"
          selectedMacrozone={selectedOrigin}
          onExpand={() => setExpandedMap("origin")}
        />
        <MapCardWithHeader
          title="Destinos de viajes"
          data={filteredDestinationByMunicipio}
          palette="orange"
          selectedMacrozone={selectedDestination}
          onExpand={() => setExpandedMap("destination")}
        />
      </div>

      <div className="map-grid-2">
        <MacrozoneTable
          data={filteredOriginByMunicipio}
          type="origin"
          selectedId={selectedOrigin}
          onSelectId={handleOriginSelect}
          highlightedIds={highlightedOrigins}
          headerColor={SECONDARY_GREEN}
          municipios={municipios}
          filters={filters}
          onDestinationMunicipiChange={onDestinationMunicipiChange}
        />
        <MacrozoneTable
          data={filteredDestinationByMunicipio}
          type="destination"
          selectedId={selectedDestination}
          onSelectId={handleDestinationSelect}
          highlightedIds={highlightedDestinations}
          headerColor={TERTIARY_ORANGE}
          municipios={municipios}
          filters={filters}
          onDestinationMunicipiChange={onDestinationMunicipiChange}
        />
      </div>

      {expandedMap && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.7)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20,
        }}>
          <div style={{
            backgroundColor: "#ffffff", borderRadius: 12, width: "90%", maxWidth: 1000,
            maxHeight: "90vh", display: "flex", flexDirection: "column",
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
                onClick={() => setExpandedMap(null)}
                style={{
                  background: "none", border: "none", fontSize: 24, cursor: "pointer",
                  color: "#6b7280", padding: 0, width: 32, height: 32,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >✕</button>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
              <HighchartsMapCard
                title={null}
                data={expandedMap === "origin" ? filteredOriginByMunicipio : filteredDestinationByMunicipio}
                palette={expandedMap === "origin" ? "green" : "orange"}
                selectedMacrozone={expandedMap === "origin" ? selectedOrigin : selectedDestination}
                expandedHeight={500}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}