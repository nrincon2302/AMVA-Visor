import { useState, useMemo } from "react";
import MapCardWithHeader from "../components/MapCardWithHeader";
import HighchartsMapCard from "../components/HighchartsMapCard";
import MacrozoneTable from "../components/MacrozoneTable";
import { SECONDARY_GREEN, TERTIARY_ORANGE } from "../config/constants";
import { MUNICIPIO_MACROZONA_HIERARCHY } from "../config/geoHierarchy";

export default function MapsPanel({
  macroHeatData = {},
  filters = {},
  isCompareMode,
}) {
  const [selectedOrigin, setSelectedOrigin] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [expandedMap, setExpandedMap] = useState(null); // "origin" | "destination" | null

  const matriz = macroHeatData?.data;

  /* ====================================================
     UTIL: encontrar municipio por macrozona
  ==================================================== */
  const getMunicipioFromMacro = (macrozona) => {
    for (const mun in MUNICIPIO_MACROZONA_HIERARCHY) {
      if (MUNICIPIO_MACROZONA_HIERARCHY[mun].includes(macrozona)) {
        return mun;
      }
    }
    return "";
  };

  /* ====================================================
     Totales globales (sin selección)
  ==================================================== */
  const globalData = useMemo(() => {
    const originMap = new Map();
    const destinationMap = new Map();

    matriz.forEach(row => {
      const { agrupa_mz_origen, agrupa_mz_destino, valor } = row;

      originMap.set(
        agrupa_mz_origen,
        (originMap.get(agrupa_mz_origen) || 0) + valor
      );

      destinationMap.set(
        agrupa_mz_destino,
        (destinationMap.get(agrupa_mz_destino) || 0) + valor
      );
    });

    const origin = Array.from(originMap.entries()).map(([name, value]) => ({
      municipio: getMunicipioFromMacro(name),
      macrozona: name,
      name: `${getMunicipioFromMacro(name)} - ${name}`,
      trips: Math.round(value),
      value
    }));

    const destination = Array.from(destinationMap.entries()).map(([name, value]) => ({
      municipio: getMunicipioFromMacro(name),
      macrozona: name,
      name: `${getMunicipioFromMacro(name)} - ${name}`,
      trips: Math.round(value),
      value
    }));

    return { origin, destination };
  }, [matriz]);

  /* ====================================================
     Datos dinámicos según selección
  ==================================================== */
  const originData = useMemo(() => {
    const municipioDestino = filters?.destinationMunicipio;

    // Si no hay selección ni filtro → global
    if (!selectedDestination && 
        (!municipioDestino || municipioDestino === "Todos" || municipioDestino === "AMVA General")) {
      return globalData.origin;
    }

    const map = new Map();

    matriz.forEach(row => {

      // filtro por macrozona destino seleccionada
      if (selectedDestination) {
        const macrozonaDestino = selectedDestination.split(" - ").pop();
        if (row.agrupa_mz_destino !== macrozonaDestino) return;
      }

      // filtro por municipio destino
      if (municipioDestino &&
          municipioDestino !== "Todos" &&
          municipioDestino !== "AMVA General") {

        const munDestino = getMunicipioFromMacro(row.agrupa_mz_destino);
        if (munDestino !== municipioDestino) return;
      }

      map.set(
        row.agrupa_mz_origen,
        (map.get(row.agrupa_mz_origen) || 0) + row.valor
      );
    });

    return Array.from(map.entries()).map(([name, value]) => ({
      municipio: getMunicipioFromMacro(name),
      macrozona: name,
      name: `${getMunicipioFromMacro(name)} - ${name}`,
      trips: Math.round(value),
      value
    }));

  }, [selectedDestination, filters?.destinationMunicipio, matriz, globalData.origin]);

  const destinationData = useMemo(() => {
    if (!selectedOrigin) return globalData.destination;

    const macrozonaOrigen = selectedOrigin.split(" - ").pop();
    const map = new Map();

    matriz.forEach(row => {
      if (row.agrupa_mz_origen === macrozonaOrigen) {
        map.set(
          row.agrupa_mz_destino,
          (map.get(row.agrupa_mz_destino) || 0) + row.valor
        );
      }
    });

    return Array.from(map.entries()).map(([name, value]) => ({
      municipio: getMunicipioFromMacro(name),
      macrozona: name,
      name: `${getMunicipioFromMacro(name)} - ${name}`,
      trips: Math.round(value),
      value
    }));

  }, [selectedOrigin, matriz, globalData.destination]);

  /* ====================================================
     Highlight dinámico
  ==================================================== */
  const highlightedDestinations = useMemo(() => {
    if (!selectedOrigin) return [];
    return destinationData.map(d => d.name);
  }, [selectedOrigin, destinationData]);

  const highlightedOrigins = useMemo(() => {
    if (!selectedDestination) return [];
    return originData.map(o => o.name);
  }, [selectedDestination, originData]);

  const filteredOriginByMunicipio = useMemo(() => {
    const municipio = filters?.municipio;
    if (!municipio || municipio === "Todos" || municipio === "AMVA General") {
      return originData;
    }
    return originData.filter(item => item.municipio === municipio);
  }, [originData, filters?.municipio]);


  const filteredDestinationByMunicipio = useMemo(() => {
    const municipio = filters?.destinationMunicipio;
    if (!municipio || municipio === "Todos" || municipio === "AMVA General") {
      return destinationData;
    }
    return destinationData.filter(item => item.municipio === municipio);
  }, [destinationData, filters?.destinationMunicipio]);

  /* ====================================================
     Handlers
  ==================================================== */
  const handleOriginSelect = (zoneId) => {
    const newSelection = zoneId === selectedOrigin ? null : zoneId;
    setSelectedOrigin(newSelection);
    setSelectedDestination(null);
  };

  const handleDestinationSelect = (zoneId) => {
    const newSelection = zoneId === selectedDestination ? null : zoneId;
    setSelectedDestination(newSelection);
    setSelectedOrigin(null);
  };

  /* ====================================================
     Render
  ==================================================== */
  return (
    <section style={{
      padding: 16,
      background: "#ffffff",
      borderRadius: 12,
      marginBottom: 20,
      border: "1px solid #e2e8f0",
      boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
    }}>
      <h3 style={{ marginTop: 0, marginBottom: 16 }}>
        Distribución geográfica de los viajes (Origen - Destino)
      </h3>

      {/* Aviso para modo comparación */}
      {isCompareMode && (
        <div style={{
          padding: 12,
          marginBottom: 16,
          backgroundColor: "#f3f4f6",
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          fontSize: 13,
          lineHeight: 1.5,
          color: "#4b5563",
        }}>
          <strong>Importante:</strong> Los mapas muestran la información agregada de los detalles seleccionados en el filtro. <br></br> La comparación detallada por aspecto específico no está disponible en esta visualización geográfica.
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
        marginBottom: 20
      }}>
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

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16
      }}>
        <MacrozoneTable
          data={filteredOriginByMunicipio}
          type="origin"
          selectedMacrozone={selectedOrigin}
          onSelectMacrozone={handleOriginSelect}
          highlightedZones={highlightedOrigins}
          headerColor={SECONDARY_GREEN}
        />

        <MacrozoneTable
          data={filteredDestinationByMunicipio}
          type="destination"
          selectedMacrozone={selectedDestination}
          onSelectMacrozone={handleDestinationSelect}
          highlightedZones={highlightedDestinations}
          headerColor={TERTIARY_ORANGE}
        />
      </div>

      {/* Modal para mapa expandido */}
      {expandedMap && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 20,
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: 12,
            width: "90%",
            maxWidth: 1000,
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            overflow: "hidden",
          }}>
            {/* Header del modal */}
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                {expandedMap === "origin" ? "Orígenes de viajes" : "Destinos de viajes"}
              </h3>
              <button
                onClick={() => setExpandedMap(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer",
                  color: "#6b7280",
                  padding: 0,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Contenido del mapa expandido */}
            <div style={{
              flex: 1,
              overflow: "auto",
              padding: 16,
            }}>
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