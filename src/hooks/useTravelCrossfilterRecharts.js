// src/hooks/useTravelCrossfilterRecharts.js
import { useEffect, useState } from "react";
import baseDataset from "../data/travelData.json";
import { metadataConstants } from "../data/syntheticDataBuilder";

const MACROZONAS_POR_MUNICIPIO = baseDataset.metadata?.macrozonasPorMunicipio || {};
const MUNICIPIOS = baseDataset.metadata?.municipios || [];
const formatMacrozonaLabel = (municipio, macrozona) =>
  `${municipio} - ${macrozona}`;

const MODE_OPTIONS = metadataConstants.MODES;

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
    Bus: "Bus urbano/metropolitano",
    Moto: "Moto (conductor)",
    Carro: "Auto particular (conductor)",
    Bicicleta: "Bicicleta propia",
    Caminata: "A pie",
    Taxi: "Taxi individual",
    "Ruta integrada": "Ruta integrada/Alimentador C3-C6",
    Tranvía: "Tranvía",
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
  const [thematicFilters, setThematicFilters] = useState({
    gender: [],
    ageRange: [],
    estrato: [],
    mode: [],
    edu: [],
    occupation: [],
    vehicleBucket: [],
    tripPurpose: [],
    stageBucket: [],
  });
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
  const [hourlyTripShareData, setHourlyTripShareData] = useState([]);
  const [macroHeatData, setMacroHeatData] = useState({ origin: [], destination: [] });

  useEffect(() => {
    setIsLoading(true);
    setHouseholds(baseDataset.households || []);
    setPersons(baseDataset.persons || []);
    setTrips(baseDataset.trips || []);
  }, []);

  useEffect(() => {
    const nextDerived = households.reduce((acc, household) => {
      const vehicleSeed = `${household.id}-${household.size}-${household.municipio}`;
      const vehicleBucket =
        household.vehicleBucket || deriveCategorical(vehicleSeed, VEHICLE_BUCKET_OPTIONS);

      acc[household.id] = {
        ...household,
        vehicleBucket,
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
      const counts = filtered.householdsFiltered.reduce((acc, household) => {
        const key = household.vehicleType || "Sin vehículo";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      const total = filtered.householdsFiltered.length;
      const vehicleTypes = Object.entries(counts)
        .map(([label, value]) => ({
          label,
          value: Number(((value / total) * 100).toFixed(1)),
        }))
        .sort((a, b) => b.value - a.value);
      setVehicleTypeData(vehicleTypes);
    } else {
      setVehicleTypeData([]);
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
    thematicFilters,
  ]);

  const filters = {
    municipio,
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
    hourlyTripShareData,
    macroHeatData,
    isLoading,
    setMunicipio,
    setThematicValues,
    setExclusiveThematicValues,
    thematicOptions: THEMATIC_OPTIONS,
  };
}
