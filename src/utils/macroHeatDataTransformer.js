/**
 * Transforma los datos de viajes filtrados en formato macroHeatData
 * Incluye información del municipio para cada macrozona
 */
export function transformToMacroHeatData(filteredTrips = []) {
  if (!Array.isArray(filteredTrips) || filteredTrips.length === 0) {
    return {
      origin: [],
      destination: []
    };
  }

  // Contar viajes por macrozona de origen
  // Estructura: { "Municipio-Macrozona": { municipio, macrozona, trips } }
  const originCounts = {};
  filteredTrips.forEach(trip => {
    const municipio = trip.originMunicipio || trip.origin_municipio || 'Sin especificar';
    const macrozona = trip.originMacro || trip.origin_macrozone || 'Sin especificar';
    const key = `${municipio}-${macrozona}`;
    
    if (!originCounts[key]) {
      originCounts[key] = {
        municipio,
        macrozona,
        zone: macrozona, // Para compatibilidad con código existente
        trips: 0
      };
    }
    originCounts[key].trips++;
  });

  // Contar viajes por macrozona de destino
  const destinationCounts = {};
  filteredTrips.forEach(trip => {
    const municipio = trip.destinationMunicipio || trip.destination_municipio || 'Sin especificar';
    const macrozona = trip.destinationMacro || trip.destination_macrozone || 'Sin especificar';
    const key = `${municipio}-${macrozona}`;
    
    if (!destinationCounts[key]) {
      destinationCounts[key] = {
        municipio,
        macrozona,
        zone: macrozona, // Para compatibilidad
        trips: 0
      };
    }
    destinationCounts[key].trips++;
  });

  // Convertir a arrays y normalizar formato para Highcharts (name/value)
  const origin = Object.values(originCounts).map(item => ({
    municipio: item.municipio,
    macrozona: item.macrozona,
    // nombre exactamente igual al usado en el GeoJSON: "Municipio - Macrozona"
    name: `${item.municipio} - ${item.macrozona}`,
    value: item.trips,
    trips: item.trips,
  }));

  const destination = Object.values(destinationCounts).map(item => ({
    municipio: item.municipio,
    macrozona: item.macrozona,
    name: `${item.municipio} - ${item.macrozona}`,
    value: item.trips,
    trips: item.trips,
  }));

  return {
    origin,
    destination
  };
}

/**
 * Filtra datos por municipio
 */
export function filterByMunicipio(data, municipio) {
  if (!municipio || municipio === "Todos" || municipio === "AMVA General") return data;
  return data.filter(item => item.municipio === municipio);
}

/**
 * Obtiene zonas relacionadas basándose en los viajes filtrados
 * @param {string} selectedZone - La zona seleccionada (formato "Macrozona" o "Municipio-Macrozona")
 * @param {boolean} isOrigin - true si es origen, false si es destino
 * @param {Array} filteredTrips - Los viajes filtrados
 * @returns {Array} Array de zonas relacionadas (formato "Municipio-Macrozona")
 */
export function getRelatedZones(selectedZone, isOrigin, filteredTrips = []) {
  if (!selectedZone || !Array.isArray(filteredTrips)) return [];

  // Extraer solo la macrozona si viene en formato "Municipio - Macrozona" o "Municipio-Macrozona"
  let zoneName = selectedZone;
  if (selectedZone.includes(' - ')) {
    zoneName = selectedZone.split(' - ')[1];
  } else if (selectedZone.includes('-')) {
    const parts = selectedZone.split('-');
    zoneName = parts.slice(1).join('-').trim();
  }

  const relatedZones = new Set();

  filteredTrips.forEach(trip => {
    if (isOrigin) {
      // Si estamos buscando destinos relacionados a un origen
      const origin = trip.originMacro || trip.origin_macrozone;
      if (origin === zoneName) {
        const destMunicipio = trip.destinationMunicipio || trip.destination_municipio || 'Sin especificar';
        const destination = trip.destinationMacro || trip.destination_macrozone;
        if (destination) {
          relatedZones.add(`${destMunicipio}-${destination}`);
        }
      }
    } else {
      // Si estamos buscando orígenes relacionados a un destino
      const destination = trip.destinationMacro || trip.destination_macrozone;
      if (destination === zoneName) {
        const origMunicipio = trip.originMunicipio || trip.origin_municipio || 'Sin especificar';
        const origin = trip.originMacro || trip.origin_macrozone;
        if (origin) {
          relatedZones.add(`${origMunicipio}-${origin}`);
        }
      }
    }
  });

  return Array.from(relatedZones);
}

/**
 * Calcula matriz de flujo origen-destino
 */
export function calculateODMatrix(filteredTrips = []) {
  const matrix = {};

  filteredTrips.forEach(trip => {
    const origMunicipio = trip.originMunicipio || trip.origin_municipio || 'Sin especificar';
    const origin = trip.originMacro || trip.origin_macrozone || 'Sin especificar';
    const originKey = `${origMunicipio}-${origin}`;
    
    const destMunicipio = trip.destinationMunicipio || trip.destination_municipio || 'Sin especificar';
    const destination = trip.destinationMacro || trip.destination_macrozone || 'Sin especificar';
    const destKey = `${destMunicipio}-${destination}`;
    
    if (!matrix[originKey]) {
      matrix[originKey] = {};
    }
    
    if (!matrix[originKey][destKey]) {
      matrix[originKey][destKey] = 0;
    }
    
    matrix[originKey][destKey]++;
  });

  return matrix;
}
