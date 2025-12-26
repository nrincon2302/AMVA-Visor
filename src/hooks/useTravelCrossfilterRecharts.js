// src/hooks/useTravelCrossfilterRecharts.js
import { useEffect, useState } from "react";
import baseDataset from "../data/travelData.json";
import { metadataConstants } from "../utils/syntheticDataBuilder";

const MACROZONAS_POR_MUNICIPIO = baseDataset.metadata?.macrozonasPorMunicipio || {};
const MUNICIPIOS = baseDataset.metadata?.municipios || [];
// Reduce el tamaño por defecto para evitar consumir demasiada memoria en dev
const TARGET_TRIPS = 50_000;
const formatMacrozonaLabel = (municipio, macrozona) =>
  `${municipio} - ${macrozona}`;

const MODE_OPTIONS = [
  "Metro",
  "Cable",
  "Metroplús",
  "Tranvía",
  "Bus / Buseta / Microbús urbano o metropolitano (1)",
  "Ruta integrada o alimentador C3 y C6",
  "Bus / Buseta / Microbús intermunicipal (1)",
  "Taxi individual (amarillo)",
  "Taxi colectivo (amarillo)",
  "Taxi intermunicipal o colectivo (blanco)",
  "Transporte informal o particular",
  "Vehículo de pago por plataforma",
  "Auto particular (conductor)",
  "Auto particular (acompañante)",
  "Escolar",
  "Vehículo empresarial",
  "Moto (conductor)",
  "Moto (acompañante)",
  "Mototaxi",
  "Motocarro",
  "Bicicleta propia",
  "Bicicleta pública",
  "Patineta eléctrica",
  "A pie",
];

const MODE_DISTRIBUTION = [
  { value: "Metro", weight: 18 },
  { value: "Cable", weight: 6 },
  { value: "Metroplús", weight: 7 },
  { value: "Tranvía", weight: 4 },
  { value: "Bus / Buseta / Microbús urbano o metropolitano (1)", weight: 28 },
  { value: "Ruta integrada o alimentador C3 y C6", weight: 16 },
  { value: "Bus / Buseta / Microbús intermunicipal (1)", weight: 8 },
  { value: "Taxi individual (amarillo)", weight: 6 },
  { value: "Taxi colectivo (amarillo)", weight: 4 },
  { value: "Taxi intermunicipal o colectivo (blanco)", weight: 3 },
  { value: "Transporte informal o particular", weight: 4 },
  { value: "Vehículo de pago por plataforma", weight: 5 },
  { value: "Auto particular (conductor)", weight: 18 },
  { value: "Auto particular (acompañante)", weight: 9 },
  { value: "Escolar", weight: 3 },
  { value: "Vehículo empresarial", weight: 2 },
  { value: "Moto (conductor)", weight: 14 },
  { value: "Moto (acompañante)", weight: 6 },
  { value: "Mototaxi", weight: 2 },
  { value: "Motocarro", weight: 2 },
  { value: "Bicicleta propia", weight: 6 },
  { value: "Bicicleta pública", weight: 2 },
  { value: "Patineta eléctrica", weight: 1 },
  { value: "A pie", weight: 20 },
];

const THEMATIC_OPTIONS = {
  gender: ["Hombre", "Mujer"],
  ageRange: [
    "5-11",
    "12-17",
    "18-25",
    "26-35",
    "36-45",
    "46-60",
    "60+",
  ],
  estrato: [1, 2, 3, 4, 5, 6],
  mode: MODE_OPTIONS,
  edu: [
    "Ninguno",
    "Primaria",
    "Noveno Grado",
    "Bachillerato",
    "Educación No formal",
    "Técnico",
    "Tecnológico",
    "Universitario",
    "Posgrado",
  ],
  occupation: [
    "Trabajador dependiente o empleado",
    "Trabajador independiente",
    "Estudiante",
    "Ama de casa",
    "Desempleado",
    "Trabajador y estudiante",
    "Jubilado",
    "Jubilado y trabajador",
    "Jubilado y estudiante",
    "Ama de casa y estudiante",
    "Ninguna",
  ],
};

const hashString = (value) =>
  value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

const deriveCategorical = (seedValue, options) => {
  if (!options?.length) return null;

  const normalizedSeed = Math.abs(hashString(seedValue));
  const asWeightedObjects =
    typeof options[0] === "object" && Object.prototype.hasOwnProperty.call(options[0], "value");

  if (asWeightedObjects) {
    const totalWeight = options.reduce((acc, item) => acc + (item.weight || 1), 0);
    let cursor = normalizedSeed % totalWeight || totalWeight;

    for (const item of options) {
      cursor -= item.weight || 1;
      if (cursor <= 0) return item.value;
    }

    return options[options.length - 1].value;
  }

  return options[normalizedSeed % options.length];
};

const normalizeMode = (mode, id) => {
  const baseMap = {
    Metro: "Metro",
    Bus: "Bus / Buseta / Microbús urbano o metropolitano (1)",
    "Bus urbano/metropolitano": "Bus / Buseta / Microbús urbano o metropolitano (1)",
    "Bus intermunicipal": "Bus / Buseta / Microbús intermunicipal (1)",
    Moto: "Moto (conductor)",
    Carro: "Auto particular (conductor)",
    Bicicleta: "Bicicleta propia",
    "Bicicleta pública": "Bicicleta pública",
    Caminata: "A pie",
    Taxi: "Taxi individual (amarillo)",
    "Taxi individual": "Taxi individual (amarillo)",
    "Taxi colectivo": "Taxi colectivo (amarillo)",
    "Taxi intermunicipal": "Taxi intermunicipal o colectivo (blanco)",
    "Ruta integrada": "Ruta integrada o alimentador C3 y C6",
    "Ruta integrada/Alimentador C3-C6": "Ruta integrada o alimentador C3 y C6",
    Tranvía: "Tranvía",
    "Transporte informal en calle": "Transporte informal o particular",
    "Plataforma (Uber/Cabify/etc.)": "Vehículo de pago por plataforma",
  };

  if (baseMap[mode]) return baseMap[mode];
  return deriveCategorical(`${mode}-${id}`, MODE_OPTIONS);
};

const normalizeEducation = (edu, id) => {
  if (!edu) return deriveCategorical(`${id}-edu`, THEMATIC_OPTIONS.edu);

  const match = THEMATIC_OPTIONS.edu.find(
    (item) => item.toLowerCase() === edu.toLowerCase()
  );

  if (match) return match;
  return deriveCategorical(`${edu}-${id}`, THEMATIC_OPTIONS.edu);
};

const normalizeAgeRange = (person) => {
  if (person.ageRange === "5-11" || person.ageRange === "12-17") {
    return person.ageRange;
  }

  const seed = hashString(person.id) % 10;
  if (seed === 0 || seed === 1) return "5-11";
  if (seed === 2 || seed === 3) return "12-17";

  return person.ageRange;
};

const VEHICLE_BUCKETS = metadataConstants.VEHICLE_BUCKETS;
const VEHICLE_TYPES = metadataConstants.VEHICLE_TYPES;
const VEHICLE_MODELS = metadataConstants.VEHICLE_MODELS;
const PURPOSES = [
  { value: "Trabajo", weight: 38 },
  { value: "Regreso al hogar", weight: 30 },
  { value: "Estudio", weight: 22 },
  { value: "Visitar a un amigo", weight: 10 },
];

const OCCUPATIONS = [
  { value: "Trabajador dependiente o empleado", weight: 32 },
  { value: "Trabajador independiente", weight: 22 },
  { value: "Estudiante", weight: 14 },
  { value: "Ama de casa", weight: 9 },
  { value: "Desempleado", weight: 8 },
  { value: "Trabajador y estudiante", weight: 6 },
  { value: "Jubilado", weight: 4 },
  { value: "Jubilado y trabajador", weight: 3 },
  { value: "Jubilado y estudiante", weight: 2 },
  { value: "Ama de casa y estudiante", weight: 2 },
  { value: "Ninguna", weight: 4 },
];
const STAGE_BUCKETS = [
  { value: "1 etapa", weight: 64 },
  { value: "2 etapas", weight: 22 },
  { value: "3 etapas", weight: 9 },
  { value: "4 o más etapas", weight: 5 },
];
const VEHICLE_BUCKET_OPTIONS = [
  { value: "Sin vehículo", weight: 35 },
  { value: "1 vehículo", weight: 45 },
  { value: "2+ vehículos", weight: 20 },
];

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickFromMap = (map, key, fallback = []) => {
  const list = map?.[key] || fallback;
  return list.length ? pickRandom(list) : null;
};
const pickWeighted = (options) => {
  const total = options.reduce((acc, item) => acc + (item.weight || 1), 0);
  let cursor = Math.random() * total;
  for (const item of options) {
    cursor -= item.weight || 1;
    if (cursor <= 0) return item.value;
  }
  return options[options.length - 1].value;
};

const DEFAULT_THEMATIC_FILTERS = {
  gender: THEMATIC_OPTIONS.gender,
  ageRange: THEMATIC_OPTIONS.ageRange,
  estrato: THEMATIC_OPTIONS.estrato,
  mode: MODE_OPTIONS,
  edu: THEMATIC_OPTIONS.edu,
  occupation: OCCUPATIONS.map((item) => item.value),
  vehicleBucket: VEHICLE_BUCKET_OPTIONS.map((item) => item.value),
  tripPurpose: PURPOSES.map((item) => item.value),
  stageBucket: STAGE_BUCKETS.map((item) => item.value),
};

function aggregatePercentages(data, field) {
  if (!data.length) return [];
  const counts = data.reduce((acc, item) => {
    const key = item[field];
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([label, value]) => ({
      label,
      value: Number(((value / data.length) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.value - a.value);
}

export function useTravelCrossfilterRecharts() {
  const [municipio, setMunicipio] = useState("AMVA General");
  const [destinationMunicipio, setDestinationMunicipio] = useState("AMVA General");
  const [thematicFilters, setThematicFilters] = useState(DEFAULT_THEMATIC_FILTERS);
  const [isLoading, setIsLoading] = useState(true);

  const [households, setHouseholds] = useState([]);
  const [persons, setPersons] = useState([]);
  const [trips, setTrips] = useState([]);
  const [derivedHouseholds, setDerivedHouseholds] = useState({});
  const [personsNormalized, setPersonsNormalized] = useState([]);
  const [enrichedTrips, setEnrichedTrips] = useState([]);

  const [filteredTrips, setFilteredTrips] = useState([]);
  const [filteredPersons, setFilteredPersons] = useState([]);
  const [filteredHouseholds, setFilteredHouseholds] = useState([]);

  const [estratoData, setEstratoData] = useState([]);
  const [edadData, setEdadData] = useState([]);
  const [generoData, setGeneroData] = useState([]);
  const [escolaridadData, setEscolaridadData] = useState([]);
  const [modeData, setModeData] = useState([]);
  const [stageData, setStageData] = useState([]);
  const [purposeData, setPurposeData] = useState([]);
  const [occupationData, setOccupationData] = useState([]);
  const [vehicleTenureData, setVehicleTenureData] = useState([]);
  const [vehicleTypeData, setVehicleTypeData] = useState([]);
  const [vehicleModelData, setVehicleModelData] = useState([]);
  const [hourlyTripShareData, setHourlyTripShareData] = useState([]);
  const [macroHeatData, setMacroHeatData] = useState({ origin: [], destination: [] });

  useEffect(() => {
    setIsLoading(true);
    setHouseholds(baseDataset.households || []);
    setPersons(baseDataset.persons || []);
    setTimeout(() => {
      const baseTrips = baseDataset.trips || [];
      if (!baseTrips.length) {
        setTrips([]);
        return;
      }

      const multiplier = Math.ceil(TARGET_TRIPS / baseTrips.length);
      const expanded = [];
      let idCounter = 1;

      for (let i = 0; i < multiplier; i += 1) {
        for (let j = 0; j < baseTrips.length && expanded.length < TARGET_TRIPS; j += 1) {
          const trip = baseTrips[j];
          const destinationMunicipio = pickRandom(
            MUNICIPIOS.filter((item) => item && item !== "AMVA General")
          );
          const originMunicipio = trip.originMunicipio || destinationMunicipio;
          const originMacro = pickFromMap(MACROZONAS_POR_MUNICIPIO, originMunicipio, [
            "Urbana",
          ]);
          const destinationMacro = pickFromMap(
            MACROZONAS_POR_MUNICIPIO,
            destinationMunicipio,
            ["Urbana"]
          );
          expanded.push({
            ...trip,
            id: `T${idCounter}`,
            mode: pickWeighted(MODE_DISTRIBUTION),
            tripPurpose: pickWeighted(PURPOSES),
            stageBucket: pickWeighted(STAGE_BUCKETS),
            distanceKm: Number((Math.random() ** 0.8 * 32 + 0.3).toFixed(1)),
            durationMin: Math.max(5, Math.round(Math.random() ** 0.7 * 120) + 6),
            originMunicipio,
            destinationMunicipio,
            originMacro,
            destinationMacro,
          });
          idCounter += 1;
        }
      }

      setTrips(expanded);
    }, 0);
  }, []);

  useEffect(() => {
    const nextDerived = households.reduce((acc, household) => {
      const vehicleSeed = `${household.id}-${household.size}-${household.municipio}`;
      const vehicleBucket =
        household.vehicleBucket || deriveCategorical(vehicleSeed, VEHICLE_BUCKET_OPTIONS);
      const vehicleType =
        household.vehicleType || deriveCategorical(`${vehicleSeed}-type`, VEHICLE_TYPES);
      const vehicleModel =
        household.vehicleModel || deriveCategorical(`${vehicleSeed}-model`, VEHICLE_MODELS);

      acc[household.id] = {
        ...household,
        vehicleBucket,
        vehicleType,
        vehicleModel,
        vehicleCount:
          vehicleBucket === "Sin vehículo"
            ? 0
            : vehicleBucket === "1 vehículo"
            ? 1
            : 2,
      };
      return acc;
    }, {});
    setDerivedHouseholds(nextDerived);
  }, [households]);

  useEffect(() => {
    const normalized = persons.map((person) => {
      const household = derivedHouseholds[person.householdId];
      return {
        ...person,
        ageRange: normalizeAgeRange(person),
        edu: normalizeEducation(person.edu, person.id),
        occupation: deriveCategorical(person.id, OCCUPATIONS),
        vehicleBucket:
          household?.vehicleBucket || deriveCategorical(person.id, VEHICLE_BUCKET_OPTIONS),
        vehicleType:
          household?.vehicleType || deriveCategorical(`${person.id}-type`, VEHICLE_TYPES),
        vehicleModel:
          household?.vehicleModel || deriveCategorical(`${person.id}-model`, VEHICLE_MODELS),
        household,
        macrozonaKey: formatMacrozonaLabel(person.municipio, person.macrozona),
      };
    });
    setPersonsNormalized(normalized);
  }, [persons, derivedHouseholds]);

  useEffect(() => {
    const personsById = Object.fromEntries(personsNormalized.map((p) => [p.id, p]));
    const enriched = trips.map((trip) => {
      const person = personsById[trip.personId];
      const originMunicipio = person?.municipio || "AMVA General";
      const departureHour = hashString(trip.id) % 24;
      const normalizedMode = normalizeMode(trip.mode, trip.id);
      const purpose = trip.tripPurpose || deriveCategorical(trip.id, PURPOSES);
      const stageBucket = trip.stageBucket || deriveCategorical(`${trip.id}-stage`, STAGE_BUCKETS);

      return {
        ...trip,
        ...person,
        mode: normalizedMode,
        tripPurpose: purpose,
        stageBucket,
        originMunicipio,
        originKey: formatMacrozonaLabel(originMunicipio, trip.originMacro),
        destinationKey: formatMacrozonaLabel(trip.destinationMunicipio, trip.destinationMacro),
        departureHour,
        departureLabel: `${departureHour.toString().padStart(2, "0")}:00`,
      };
    });
    setEnrichedTrips(enriched);
  }, [trips, personsNormalized]);

  useEffect(() => {
    if (!enrichedTrips.length || !personsNormalized.length) return;

    const buildFilteredData = (skipThematic = null) => {
      const matchPerson = (person) => {
        if (municipio !== "AMVA General" && municipio !== "Todos") {
          if (person.municipio !== municipio) return false;
        }

        if (skipThematic !== "gender" && thematicFilters.gender.length) {
          if (!thematicFilters.gender.includes(person.gender)) return false;
        }
        if (skipThematic !== "ageRange" && thematicFilters.ageRange.length) {
          if (!thematicFilters.ageRange.includes(person.ageRange)) return false;
        }
        if (skipThematic !== "estrato" && thematicFilters.estrato.length) {
          if (!thematicFilters.estrato.includes(person.estrato)) return false;
        }
        if (skipThematic !== "edu" && thematicFilters.edu.length) {
          if (!thematicFilters.edu.includes(person.edu)) return false;
        }
        if (skipThematic !== "vehicleBucket" && thematicFilters.vehicleBucket.length) {
          if (!thematicFilters.vehicleBucket.includes(person.vehicleBucket)) return false;
        }
        if (skipThematic !== "occupation" && thematicFilters.occupation.length) {
          if (!thematicFilters.occupation.includes(person.occupation)) return false;
        }
        return true;
      };

      const personsFiltered = personsNormalized.filter(matchPerson);
      const personIds = new Set(personsFiltered.map((p) => p.id));

      const matchTrip = (trip) => {
        if (!personIds.has(trip.personId)) return false;

        if (
          municipio !== "AMVA General" &&
          municipio !== "Todos" &&
          trip.originMunicipio !== municipio
        ) {
          return false;
        }
        if (
          destinationMunicipio !== "AMVA General" &&
          destinationMunicipio !== "Todos" &&
          trip.destinationMunicipio !== destinationMunicipio
        ) {
          return false;
        }

        if (skipThematic !== "mode" && thematicFilters.mode.length) {
          if (!thematicFilters.mode.includes(trip.mode)) return false;
        }
        if (skipThematic !== "tripPurpose" && thematicFilters.tripPurpose.length) {
          if (!thematicFilters.tripPurpose.includes(trip.tripPurpose)) return false;
        }
        if (skipThematic !== "stageBucket" && thematicFilters.stageBucket.length) {
          if (!thematicFilters.stageBucket.includes(trip.stageBucket)) return false;
        }

        return true;
      };

      const tripsForCharts = enrichedTrips.filter((trip) => matchTrip(trip));
      const tripsForMaps = tripsForCharts;

      const activePersonIds = new Set(tripsForCharts.map((trip) => trip.personId));
      const personsWithTrips = personsFiltered.filter((person) =>
        activePersonIds.has(person.id)
      );

      const activeHouseholdIds = new Set(
        personsWithTrips.map((person) => person.householdId)
      );

      const householdsWithTrips = households
        .map((household) => derivedHouseholds[household.id])
        .filter((household) => activeHouseholdIds.has(household.id));

      return {
        personsFiltered: personsWithTrips,
        tripsFiltered: tripsForCharts,
        tripsForMaps,
        householdsFiltered: householdsWithTrips,
      };
    };

    const filtered = buildFilteredData(null);

    setFilteredTrips(filtered.tripsFiltered);
    setFilteredPersons(filtered.personsFiltered);
    setFilteredHouseholds(filtered.householdsFiltered);

    setEstratoData(aggregatePercentages(buildFilteredData("estrato").tripsFiltered, "estrato"));
    setEdadData(aggregatePercentages(buildFilteredData("ageRange").tripsFiltered, "ageRange"));
    const genero = aggregatePercentages(buildFilteredData("gender").tripsFiltered, "gender").map(
      (item) => ({ name: item.label, value: item.value })
    );
    setGeneroData(genero);
    setEscolaridadData(
      aggregatePercentages(buildFilteredData("edu").tripsFiltered, "edu")
    );
    setModeData(aggregatePercentages(buildFilteredData("mode").tripsFiltered, "mode"));
    setStageData(
      aggregatePercentages(buildFilteredData("stageBucket").tripsFiltered, "stageBucket")
    );
    setPurposeData(
      aggregatePercentages(buildFilteredData("tripPurpose").tripsFiltered, "tripPurpose")
    );
    setOccupationData(
      aggregatePercentages(buildFilteredData("occupation").tripsFiltered, "occupation")
    );

    const vehicleHouseholds = buildFilteredData("vehicleBucket").householdsFiltered;
    if (vehicleHouseholds?.length) {
      const counts = vehicleHouseholds.reduce((acc, household) => {
        acc[household.vehicleBucket] = (acc[household.vehicleBucket] || 0) + 1;
        return acc;
      }, {});

      const total = vehicleHouseholds.length;
      const vehicleTenure = Object.entries(counts)
        .map(([label, value]) => ({
          label,
          value: Number(((value / total) * 100).toFixed(1)),
        }))
        .sort((a, b) => b.value - a.value);
      setVehicleTenureData(vehicleTenure);
    } else {
      setVehicleTenureData([]);
    }

    if (filtered.householdsFiltered?.length) {
      const typeCounts = filtered.householdsFiltered.reduce((acc, household) => {
        const key = household.vehicleType || "Otro";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      const modelCounts = filtered.householdsFiltered.reduce((acc, household) => {
        const key = household.vehicleModel || "(En blanco)";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      const total = filtered.householdsFiltered.length;
      const vehicleTypes = Object.entries(typeCounts)
        .map(([label, value]) => ({
          label,
          value: Number(((value / total) * 100).toFixed(1)),
        }))
        .sort((a, b) => b.value - a.value);
      const vehicleModels = Object.entries(modelCounts)
        .map(([label, value]) => ({
          label,
          value: Number(((value / total) * 100).toFixed(1)),
        }))
        .sort((a, b) => b.value - a.value);
      setVehicleTypeData(vehicleTypes);
      setVehicleModelData(vehicleModels);
    } else {
      setVehicleTypeData([]);
      setVehicleModelData([]);
    }

    const originCounts = filtered.tripsForMaps.reduce((acc, trip) => {
      acc[trip.originKey] = (acc[trip.originKey] || 0) + 1;
      return acc;
    }, {});

    const destinationCounts = filtered.tripsForMaps.reduce((acc, trip) => {
      acc[trip.destinationKey] = (acc[trip.destinationKey] || 0) + 1;
      return acc;
    }, {});

    const toSeries = (counts) =>
      Object.entries(counts).map(([name, value]) => ({ name, value }));

    setMacroHeatData({
      origin: toSeries(originCounts),
      destination: toSeries(destinationCounts),
    });

    const hours = Array.from({ length: 24 }, (_, idx) => idx);
    const countsByHour = hours.map((hour) => ({ hour, total: 0 }));

    filtered.tripsFiltered.forEach((trip) => {
      const hour = trip.departureHour;
      const record = countsByHour[hour];
      record.total += 1;
    });

    const hourly = countsByHour.map((record) => ({
      hour: `${record.hour.toString().padStart(2, "0")}:00`,
      value: Number(record.total.toFixed(1)),
    }));

    setHourlyTripShareData(hourly);
    setIsLoading(false);
  }, [
    enrichedTrips,
    personsNormalized,
    households,
    derivedHouseholds,
    municipio,
    destinationMunicipio,
    thematicFilters,
  ]);

  const filters = {
    municipio,
    destinationMunicipio,
    thematicFilters,
  };

  const setThematicValues = (key, values) => {
    const normalizedValues =
      key === "estrato" ? values.map((value) => Number(value)) : values;
    setThematicFilters((prev) => ({ ...prev, [key]: normalizedValues }));
  };

  const setExclusiveThematicValues = (key, values) => {
    const normalizedValues =
      key === "estrato" ? values.map((value) => Number(value)) : values;
    setThematicFilters((prev) => {
      const cleared = Object.fromEntries(Object.keys(prev).map((k) => [k, []]));
      return { ...cleared, [key]: normalizedValues };
    });
  };

  return {
    households,
    persons: personsNormalized,
    trips,
    filters,
    municipios: MUNICIPIOS,
    filteredTrips,
    filteredPersons,
    filteredHouseholds,
    estratoData,
    edadData,
    generoData,
    escolaridadData,
    modeData,
    stageData,
    purposeData,
    occupationData,
    vehicleTenureData,
    vehicleTypeData,
    vehicleModelData,
    hourlyTripShareData,
    macroHeatData,
    isLoading,
    setMunicipio,
    setDestinationMunicipio,
    setThematicValues,
    setExclusiveThematicValues,
    thematicOptions: THEMATIC_OPTIONS,
  };
}
