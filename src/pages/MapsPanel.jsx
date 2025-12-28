import React, { useState, useMemo } from "react";
import MapCardWithHeader from "../components/MapCardWithHeader";
import MacrozoneTable from "../components/MacrozoneTable";
import { 
  transformToMacroHeatData, 
  getRelatedZones 
} from "../utils/macroHeatDataTransformer";
import { SECONDARY_GREEN, TERTIARY_ORANGE } from "../config/constants";
import { MUNICIPIO_MACROZONA_HIERARCHY } from "../config/geoHierarchy";

export default function MapsPanel({ 
  macroHeatData = {}, 
  filteredTrips = [],
  filters = {} // Para obtener el municipio actual
}) {
  const [selectedOrigin, setSelectedOrigin] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const parseZoneId = (zoneId = "") => {
    if (!zoneId) return { municipio: null, macrozona: null };
    if (zoneId.includes(" - ")) {
      const [municipio, ...rest] = zoneId.split(" - ");
      return { municipio: municipio.trim(), macrozona: rest.join(" - ").trim() };
    }
    if (zoneId.includes("-")) {
      const [municipio, ...rest] = zoneId.split("-");
      return { municipio: municipio.trim(), macrozona: rest.join("-").trim() };
    }
    return { municipio: null, macrozona: zoneId.trim() };
  };

  const matchesSelection = (trip, selection, type) => {
    if (!selection) return true;
    const { municipio, macrozona } = parseZoneId(selection);
    if (type === "origin") {
      return (
        (!municipio || trip.originMunicipio === municipio) &&
        (!macrozona || trip.originMacro === macrozona)
      );
    }
    return (
      (!municipio || trip.destinationMunicipio === municipio) &&
      (!macrozona || trip.destinationMacro === macrozona)
    );
  };
  const macrozonesByMunicipio = useMemo(() => {
    return MUNICIPIO_MACROZONA_HIERARCHY;
  }, []);

  // Transformar datos si vienen en formato diferente
  const originTripsForSelection = useMemo(() => {
    return selectedDestination
      ? filteredTrips.filter((trip) => matchesSelection(trip, selectedDestination, "destination"))
      : filteredTrips;
  }, [filteredTrips, selectedDestination]);

  const destinationTripsForSelection = useMemo(() => {
    return selectedOrigin
      ? filteredTrips.filter((trip) => matchesSelection(trip, selectedOrigin, "origin"))
      : filteredTrips;
  }, [filteredTrips, selectedOrigin]);

  const transformedOriginData = useMemo(
    () => transformToMacroHeatData(originTripsForSelection),
    [originTripsForSelection]
  );

  const transformedDestinationData = useMemo(
    () => transformToMacroHeatData(destinationTripsForSelection),
    [destinationTripsForSelection]
  );

  // Datos completos (para mapas)
  const originData = useMemo(() => {
    const arr = transformedOriginData?.origin || [];
    return arr
      .map((item) => {
        // If item already has municipio/macrozona/trips, keep it
        if (item.municipio && item.macrozona && typeof item.trips === "number") return item;
      // If item has name/value, parse name "Municipio - Macrozona"
      const name = item.name || item.zone || "";
      let municipio = "";
      let macrozona = "";
      if (name.includes(" - ")) {
        const parts = name.split(" - ");
        municipio = parts[0].trim();
        macrozona = parts.slice(1).join(" - ").trim();
      } else if (name.includes("-")) {
        const parts = name.split("-");
        municipio = parts[0].trim();
        macrozona = parts.slice(1).join("-").trim();
      } else {
        macrozona = name;
      }
      return {
        municipio,
        macrozona,
        name: `${municipio} - ${macrozona}`,
        value: typeof item.value === "number" ? item.value : item.trips || 0,
        trips: typeof item.trips === "number" ? item.trips : item.value || 0,
      };
      })
      .filter((item) => {
        const validMacrozonas = macrozonesByMunicipio[item.municipio];
        return validMacrozonas?.includes(item.macrozona);
      });
  }, [transformedOriginData, macrozonesByMunicipio]);

  const destinationData = useMemo(() => {
    const arr = transformedDestinationData?.destination || [];
    return arr
      .map((item) => {
      if (item.municipio && item.macrozona && typeof item.trips === "number") return item;
      const name = item.name || item.zone || "";
      let municipio = "";
      let macrozona = "";
      if (name.includes(" - ")) {
        const parts = name.split(" - ");
        municipio = parts[0].trim();
        macrozona = parts.slice(1).join(" - ").trim();
      } else if (name.includes("-")) {
        const parts = name.split("-");
        municipio = parts[0].trim();
        macrozona = parts.slice(1).join("-").trim();
      } else {
        macrozona = name;
      }
      return {
        municipio,
        macrozona,
        name: `${municipio} - ${macrozona}`,
        value: typeof item.value === "number" ? item.value : item.trips || 0,
        trips: typeof item.trips === "number" ? item.trips : item.value || 0,
      };
      })
      .filter((item) => {
        const validMacrozonas = macrozonesByMunicipio[item.municipio];
        return validMacrozonas?.includes(item.macrozona);
      });
  }, [transformedDestinationData, macrozonesByMunicipio]);

  const originMapData = useMemo(() => {
    if (!selectedOrigin) return originData;
    const exists = originData.some((item) => item.name === selectedOrigin);
    if (exists) return originData;
    return [...originData, { name: selectedOrigin, value: 0, trips: 0 }];
  }, [originData, selectedOrigin]);

  const destinationMapData = useMemo(() => {
    if (!selectedDestination) return destinationData;
    const exists = destinationData.some((item) => item.name === selectedDestination);
    if (exists) return destinationData;
    return [...destinationData, { name: selectedDestination, value: 0, trips: 0 }];
  }, [destinationData, selectedDestination]);

  // Datos filtrados por municipio (para tablas)
  const filteredOriginData = useMemo(() => {
    const municipioOrigen = filters?.municipio;
    const municipioIsAll = !municipioOrigen || municipioOrigen === "Todos" || municipioOrigen === "AMVA General";
    if (selectedDestination) {
      return municipioIsAll
        ? originData
        : originData.filter((item) => item.municipio === municipioOrigen);
    }
    const targetMunicipios = municipioIsAll ? Object.keys(macrozonesByMunicipio) : [municipioOrigen];
    const dataMap = new Map(
      originData.map((item) => [`${item.municipio}-${item.macrozona}`, { ...item, trips: item.trips ?? item.value ?? 0 }])
    );
    const rows = [];
    const expandedKeys = new Set();

    targetMunicipios.forEach((mun) => {
      const zones = macrozonesByMunicipio[mun] || [];
      zones.forEach((zone) => {
        const key = `${mun}-${zone}`;
        const existing = dataMap.get(key);
        rows.push(
          existing
            ? { ...existing, municipio: mun, macrozona: zone, name: `${mun} - ${zone}` }
            : { municipio: mun, macrozona: zone, name: `${mun} - ${zone}`, trips: 0, value: 0 }
        );
        expandedKeys.add(key);
      });
    });

    originData.forEach((item) => {
      const key = `${item.municipio}-${item.macrozona}`;
      if (expandedKeys.has(key)) return;
      if (!municipioIsAll && item.municipio !== municipioOrigen) return;
      rows.push({ ...item, trips: item.trips ?? item.value ?? 0 });
    });

    return rows;
  }, [originData, filters?.municipio, macrozonesByMunicipio, selectedDestination]);

  const filteredDestinationData = useMemo(() => {
    const municipioDestino = filters?.destinationMunicipio;
    const municipioIsAll = !municipioDestino || municipioDestino === "Todos" || municipioDestino === "AMVA General";
    if (selectedOrigin) {
      return municipioIsAll
        ? destinationData
        : destinationData.filter((item) => item.municipio === municipioDestino);
    }
    const targetMunicipios = municipioIsAll ? Object.keys(macrozonesByMunicipio) : [municipioDestino];
    const dataMap = new Map(
      destinationData.map((item) => [`${item.municipio}-${item.macrozona}`, { ...item, trips: item.trips ?? item.value ?? 0 }])
    );
    const rows = [];
    const expandedKeys = new Set();

    targetMunicipios.forEach((mun) => {
      const zones = macrozonesByMunicipio[mun] || [];
      zones.forEach((zone) => {
        const key = `${mun}-${zone}`;
        const existing = dataMap.get(key);
        rows.push(
          existing
            ? { ...existing, municipio: mun, macrozona: zone, name: `${mun} - ${zone}` }
            : { municipio: mun, macrozona: zone, name: `${mun} - ${zone}`, trips: 0, value: 0 }
        );
        expandedKeys.add(key);
      });
    });

    destinationData.forEach((item) => {
      const key = `${item.municipio}-${item.macrozona}`;
      if (expandedKeys.has(key)) return;
      if (!municipioIsAll && item.municipio !== municipioDestino) return;
      rows.push({ ...item, trips: item.trips ?? item.value ?? 0 });
    });

    return rows;
  }, [destinationData, filters?.destinationMunicipio, macrozonesByMunicipio, selectedOrigin]);

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

  // Calcular zonas resaltadas basadas en la selección
  const highlightedDestinations = useMemo(() => 
    selectedOrigin ? getRelatedZones(selectedOrigin, true, filteredTrips) : [],
    [selectedOrigin, filteredTrips]
  );
    
  const highlightedOrigins = useMemo(() =>
    selectedDestination ? getRelatedZones(selectedDestination, false, filteredTrips) : [],
    [selectedDestination, filteredTrips]
  );

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
        Distribución geográfica
      </h3>
      
      {/* Mapas */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: 16, 
        marginBottom: 20 
      }}>
        <MapCardWithHeader 
          title="Orígenes de viajes" 
          data={originMapData} 
          palette="green"
          selectedMacrozone={selectedOrigin}
        />
        <MapCardWithHeader 
          title="Destinos de viajes" 
          data={destinationMapData} 
          palette="orange"
          selectedMacrozone={selectedDestination}
        />
      </div>

      {/* Tablas de resumen - FILTRADAS por municipio */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: 16 
      }}>
        <div>
          <div style={{ 
            fontWeight: 700, 
            fontSize: 12, 
            marginBottom: 8,
            color: "#0f172a",
          }}>
            Macrozonas de Origen
            {filters?.municipio && filters.municipio !== "Todos" && (
              <span style={{ 
                fontWeight: 400, 
                fontSize: 11, 
                color: "#64748b",
                marginLeft: 8 
              }}>
                ({filters.municipio})
              </span>
            )}
          </div>
          <MacrozoneTable
            data={filteredOriginData}
            type="origin"
            selectedMacrozone={selectedOrigin}
            onSelectMacrozone={handleOriginSelect}
            highlightedZones={highlightedOrigins}
            headerColor={SECONDARY_GREEN} // Verde para origen
          />
        </div>
        <div>
          <div style={{ 
            fontWeight: 700, 
            fontSize: 12, 
            marginBottom: 8,
            color: "#0f172a",
          }}>
            Macrozonas de Destino
            {filters?.destinationMunicipio && filters.destinationMunicipio !== "Todos" && (
              <span style={{ 
                fontWeight: 400, 
                fontSize: 11, 
                color: "#64748b",
                marginLeft: 8 
              }}>
                ({filters.destinationMunicipio})
              </span>
            )}
          </div>
          <MacrozoneTable
            data={filteredDestinationData}
            type="destination"
            selectedMacrozone={selectedDestination}
            onSelectMacrozone={handleDestinationSelect}
            highlightedZones={highlightedDestinations}
            headerColor={TERTIARY_ORANGE} // Naranja para destino
          />
        </div>
      </div>
    </section>
  );
}
