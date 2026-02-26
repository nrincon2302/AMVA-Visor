import { useState, useMemo } from "react";
import MapCardWithHeader from "../components/MapCardWithHeader";
import HighchartsMapCard from "../components/HighchartsMapCard";
import MacrozoneTable from "../components/MacrozoneTable";
import { SECONDARY_GREEN, TERTIARY_ORANGE } from "../config/constants";
import { getMacroInfo, getMacroDisplayName } from "../config/geoLookup";

export default function MapsPanel({
  macroHeatData = {},
  municipios = [],
  isCompareMode,
}) {
  /* ── Selección de macrozona por clic en tabla ── */
  const [selectedOrigin,      setSelectedOrigin]      = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [expandedMap, setExpandedMap] = useState(null);

  /* ── Filtros locales de municipio (solo afectan este panel) ── */
  const [originMunicipio,      setOriginMunicipio]      = useState("AMVA General");
  const [destinationMunicipio, setDestinationMunicipio] = useState("AMVA General");

  const matriz = macroHeatData?.data;

  /* ── Totales globales por ID ── */
  const globalData = useMemo(() => {
    const originMap      = new Map();
    const destinationMap = new Map();

    matriz.forEach(({ agrupa_mz_origen, agrupa_mz_destino, valor }) => {
      const oid = Number(agrupa_mz_origen);
      const did = Number(agrupa_mz_destino);
      originMap.set(oid,      (originMap.get(oid)      || 0) + valor);
      destinationMap.set(did, (destinationMap.get(did) || 0) + valor);
    });

    const toArr = (map) =>
      Array.from(map.entries()).map(([id, value]) => {
        const { municipio, macrozona } = getMacroInfo(id);
        return { id, municipio, macrozona, name: getMacroDisplayName(id), trips: Math.round(value), value };
      });

    return { origin: toArr(originMap), destination: toArr(destinationMap) };
  }, [matriz]);

  /* ── Orígenes: filtrados por destino seleccionado Y municipio de destino ──
     El municipio de destino hace una pre-selección cruzada sobre orígenes.      */
  const originData = useMemo(() => {
    const hasDestMunFilter =
      destinationMunicipio && destinationMunicipio !== "Todos" && destinationMunicipio !== "AMVA General";

    if (selectedDestination === null && !hasDestMunFilter) return globalData.origin;

    const map = new Map();
    matriz.forEach(({ agrupa_mz_origen, agrupa_mz_destino, valor }) => {
      const oid = Number(agrupa_mz_origen);
      const did = Number(agrupa_mz_destino);
      if (selectedDestination !== null && did !== selectedDestination) return;
      if (hasDestMunFilter && getMacroInfo(did).municipio !== destinationMunicipio) return;
      map.set(oid, (map.get(oid) || 0) + valor);
    });

    return Array.from(map.entries()).map(([id, value]) => {
      const { municipio, macrozona } = getMacroInfo(id);
      return { id, municipio, macrozona, name: getMacroDisplayName(id), trips: Math.round(value), value };
    });
  }, [selectedDestination, destinationMunicipio, matriz, globalData.origin]);

  /* ── Destinos: filtrados por origen seleccionado Y municipio de origen ──
     El municipio de origen hace una pre-selección cruzada sobre destinos.      */
  const destinationData = useMemo(() => {
    const hasOriginMunFilter =
      originMunicipio && originMunicipio !== "Todos" && originMunicipio !== "AMVA General";

    if (selectedOrigin === null && !hasOriginMunFilter) return globalData.destination;

    const map = new Map();
    matriz.forEach(({ agrupa_mz_origen, agrupa_mz_destino, valor }) => {
      const oid = Number(agrupa_mz_origen);
      const did = Number(agrupa_mz_destino);
      if (selectedOrigin !== null && oid !== selectedOrigin) return;
      if (hasOriginMunFilter && getMacroInfo(oid).municipio !== originMunicipio) return;
      map.set(did, (map.get(did) || 0) + valor);
    });

    return Array.from(map.entries()).map(([id, value]) => {
      const { municipio, macrozona } = getMacroInfo(id);
      return { id, municipio, macrozona, name: getMacroDisplayName(id), trips: Math.round(value), value };
    });
  }, [selectedOrigin, originMunicipio, matriz, globalData.destination]);

  /* ── IDs a iluminar en tablas cruzadas ── */
  const highlightedDestinations = useMemo(
    () => selectedOrigin === null ? [] : destinationData.map((d) => d.id),
    [selectedOrigin, destinationData]
  );
  const highlightedOrigins = useMemo(
    () => selectedDestination === null ? [] : originData.map((o) => o.id),
    [selectedDestination, originData]
  );

  /* ── Filtro visual adicional por municipio sobre los datos ya cruzados ── */
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

  /* ── Handlers ── */
  const handleOriginSelect = (id) => {
    setSelectedOrigin(id === selectedOrigin ? null : id);
    setSelectedDestination(null);
  };
  const handleDestinationSelect = (id) => {
    setSelectedDestination(id === selectedDestination ? null : id);
    setSelectedOrigin(null);
  };

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
      <h3 style={{ marginTop: 0, marginBottom: 16 }}>
        Distribución geográfica de los viajes (Origen - Destino)
      </h3>

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

      {/* ── Mapas ── */}
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

      {/* ── Tablas ── */}
      <div className="map-grid-2">
        <MacrozoneTable
          data={filteredOriginByMunicipio}
          type="origin"
          selectedId={selectedOrigin}
          onSelectId={handleOriginSelect}
          highlightedIds={highlightedOrigins}
          headerColor={SECONDARY_GREEN}
          municipios={municipios}
          selectedMunicipio={originMunicipio}
          onMunicipioChange={setOriginMunicipio}
        />
        <MacrozoneTable
          data={filteredDestinationByMunicipio}
          type="destination"
          selectedId={selectedDestination}
          onSelectId={handleDestinationSelect}
          highlightedIds={highlightedDestinations}
          headerColor={TERTIARY_ORANGE}
          municipios={municipios}
          selectedMunicipio={destinationMunicipio}
          onMunicipioChange={setDestinationMunicipio}
        />
      </div>

      {/* ── Modal expandido ── */}
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
                onClick={() => setExpandedMap(null)}
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