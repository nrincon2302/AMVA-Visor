import React, { useState, useMemo } from "react";
import MapCardWithHeader from "../components/MapCardWithHeader";
import MacrozoneTable from "../components/MacrozoneTable";
import { 
  transformToMacroHeatData, 
  getRelatedZones, 
  filterByMunicipio 
} from "../utils/macroHeatDataTransformer";
import { PRIMARY_GREEN, SECONDARY_GREEN, TERTIARY_ORANGE } from "../config/constants";

export default function MapsPanel({ 
  macroHeatData = {}, 
  filteredTrips = [],
  filters = {} // Para obtener el municipio actual
}) {
  const [selectedOrigin, setSelectedOrigin] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);

  // Transformar datos si vienen en formato diferente
  const transformedData = useMemo(() => {
    if (macroHeatData?.origin && Array.isArray(macroHeatData.origin) && 
        macroHeatData.origin.length > 0 && 
        macroHeatData.origin[0]?.zone && 
        typeof macroHeatData.origin[0]?.trips === 'number') {
      return macroHeatData;
    }
    
    return transformToMacroHeatData(filteredTrips);
  }, [macroHeatData, filteredTrips]);

  // Datos completos (para mapas)
  const originData = useMemo(() => transformedData?.origin || [], [transformedData]);
  const destinationData = useMemo(() => transformedData?.destination || [], [transformedData]);

  // Datos filtrados por municipio (para tablas)
  const filteredOriginData = useMemo(() => {
    const municipioOrigen = filters?.municipio;
    if (!municipioOrigen || municipioOrigen === "Todos") return originData;
    return filterByMunicipio(originData, municipioOrigen);
  }, [originData, filters?.municipio]);

  const filteredDestinationData = useMemo(() => {
    const municipioDestino = filters?.destinationMunicipio;
    if (!municipioDestino || municipioDestino === "Todos") return destinationData;
    return filterByMunicipio(destinationData, municipioDestino);
  }, [destinationData, filters?.destinationMunicipio]);

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
      background: "#fff", 
      borderRadius: 12,
      marginBottom: 20,
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
          data={originData} 
          palette="green"
          selectedMacrozone={selectedOrigin}
        />
        <MapCardWithHeader 
          title="Destinos de viajes" 
          data={destinationData} 
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