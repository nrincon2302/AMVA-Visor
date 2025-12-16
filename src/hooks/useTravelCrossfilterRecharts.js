// src/hooks/useTravelCrossfilterRecharts.js
import { useCallback, useEffect, useMemo, useState } from "react";
import baseDataset from "../data/travelData.json";
import { buildSyntheticDataset, metadataConstants } from "../data/syntheticDataBuilder";

const { households, persons, trips, metadata } = buildSyntheticDataset(baseDataset);
const MACROZONAS_POR_MUNICIPIO = metadata.macrozonasPorMunicipio || {};
const MUNICIPIOS = metadata.municipios;
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
  if (!edu) return deriveCategorical(`${id}-edu`, EDUCATION_BUCKETS);

  const match = EDUCATION_BUCKETS.find(
    (item) => item.toLowerCase() === edu.toLowerCase()
  );

  if (match) return match;
  return deriveCategorical(`${edu}-${id}`, EDUCATION_BUCKETS);
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
const EDUCATION_BUCKETS = [
  "Ninguno",
  "Primaria",
  "Noveno Grado",
  "Bachillerato",
  "Educación No formal",
  "Técnico",
  "Tecnológico",
  "Universitario",
  "Posgrado",
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

function aggregatePie(data, field) {
  return aggregatePercentages(data, field).map((item) => ({
    name: item.label,
    value: item.value,
  }));
}

export function useTravelCrossfilterRecharts() {
  const [municipio, setMunicipio] = useState("AMVA General");
  const [thematicFilters, setThematicFilters] = useState({
    gender: null,
    ageRange: null,
    estrato: null,
    mode: null,
    edu: null,
    occupation: null,
    vehicleBucket: null,
    tripPurpose: null,
    stageBucket: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  const derivedHouseholds = useMemo(() => {
    return households.reduce((acc, household) => {
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
  }, []);

  const personsNormalized = useMemo(
    () =>
      persons.map((person) => {
        const household = derivedHouseholds[person.householdId];
        return {
          ...person,
          ageRange: normalizeAgeRange(person),
          edu: normalizeEducation(person.edu, person.id),
          occupation: deriveCategorical(person.id, OCCUPATIONS),
          vehicleBucket:
            household?.vehicleBucket || deriveCategorical(person.id, VEHICLE_BUCKET_OPTIONS),
          household,
        };
      }),
    [derivedHouseholds]
  );

  const personsById = useMemo(
    () => Object.fromEntries(personsNormalized.map((p) => [p.id, p])),
    [personsNormalized]
  );

  const enrichedTrips = useMemo(
    () =>
      trips.map((trip) => {
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
          destinationKey: formatMacrozonaLabel(
            trip.destinationMunicipio,
            trip.destinationMacro
          ),
          departureHour,
          departureLabel: `${departureHour.toString().padStart(2, "0")}:00`,
        };
      }),
    [personsById]
  );

  const applyFilters = useCallback(
    ({ skipThematic = null } = {}) => {
      const matchPerson = (person) => {
        if (
          skipThematic !== "gender" &&
          thematicFilters.gender &&
          person.gender !== thematicFilters.gender
        )
          return false;
        if (
          skipThematic !== "ageRange" &&
          thematicFilters.ageRange &&
          person.ageRange !== thematicFilters.ageRange
        )
          return false;
        if (
          skipThematic !== "estrato" &&
          thematicFilters.estrato &&
          person.estrato !== thematicFilters.estrato
        )
          return false;
        if (
          skipThematic !== "edu" &&
          thematicFilters.edu &&
          person.edu !== thematicFilters.edu
        )
          return false;
        if (
          skipThematic !== "vehicleBucket" &&
          thematicFilters.vehicleBucket &&
          person.vehicleBucket !== thematicFilters.vehicleBucket
        )
          return false;
        if (
          skipThematic !== "occupation" &&
          thematicFilters.occupation &&
          person.occupation !== thematicFilters.occupation
        )
          return false;
        return true;
      };

      const personsFiltered = personsNormalized.filter(matchPerson);
      const personIds = new Set(personsFiltered.map((p) => p.id));

      const matchTrip = (trip) => {
        if (!personIds.has(trip.personId)) return false;

        if (
          municipio !== "AMVA General" &&
          municipio !== "Todos" &&
          trip.originMunicipio !== municipio &&
          trip.destinationMunicipio !== municipio
        ) {
          return false;
        }

        if (
          skipThematic !== "mode" &&
          thematicFilters.mode &&
          trip.mode !== thematicFilters.mode
        )
          return false;
        if (
          skipThematic !== "tripPurpose" &&
          thematicFilters.tripPurpose &&
          trip.tripPurpose !== thematicFilters.tripPurpose
        )
          return false;
        if (
          skipThematic !== "stageBucket" &&
          thematicFilters.stageBucket &&
          trip.stageBucket !== thematicFilters.stageBucket
        )
          return false;

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
    }, [municipio, thematicFilters, personsNormalized, enrichedTrips, derivedHouseholds]
  );

  const filtered = useMemo(() => applyFilters(), [applyFilters]);

  const filteredBy = useCallback(
    (skipKey) => applyFilters({ skipThematic: skipKey }),
    [applyFilters]
  );

  const estratoData = useMemo(
    () => aggregatePercentages(filteredBy("estrato").tripsFiltered, "estrato"),
    [filteredBy]
  );
  const edadData = useMemo(
    () => aggregatePercentages(filteredBy("ageRange").tripsFiltered, "ageRange"),
    [filteredBy]
  );
  const generoData = useMemo(
    () => aggregatePie(filteredBy("gender").tripsFiltered, "gender"),
    [filteredBy]
  );
  const escolaridadData = useMemo(
    () => aggregatePercentages(filteredBy("edu").tripsFiltered, "edu"),
    [filteredBy]
  );
  const modeData = useMemo(
    () => aggregatePercentages(filteredBy("mode").tripsFiltered, "mode"),
    [filteredBy]
  );
  const stageData = useMemo(
    () => aggregatePercentages(filteredBy("stageBucket").tripsFiltered, "stageBucket"),
    [filteredBy]
  );

  const macroHeatData = useMemo(() => {
    const activeMunicipalities =
      municipio === "AMVA General" || municipio === "Todos"
        ? Object.keys(MACROZONAS_POR_MUNICIPIO)
        : [municipio];

    const originCounts = filtered.tripsForMaps.reduce((acc, trip) => {
      acc[trip.originKey] = (acc[trip.originKey] || 0) + 1;
      return acc;
    }, {});

    const destinationCounts = filtered.tripsForMaps.reduce((acc, trip) => {
      acc[trip.destinationKey] = (acc[trip.destinationKey] || 0) + 1;
      return acc;
    }, {});

    const toSeries = (counts) =>
      Object.entries(counts)
        .filter(([name]) => {
          const [muni] = name.split(" - ");
          return activeMunicipalities.includes(muni);
        })
        .map(([name, value]) => ({ name, value }));

    return {
      origin: toSeries(originCounts),
      destination: toSeries(destinationCounts),
    };
  }, [filtered.tripsForMaps, municipio]);

  const purposeData = useMemo(
    () => aggregatePercentages(filteredBy("tripPurpose").tripsFiltered, "tripPurpose"),
    [filteredBy]
  );

  const occupationData = useMemo(
    () => aggregatePercentages(filteredBy("occupation").tripsFiltered, "occupation"),
    [filteredBy]
  );

  const vehicleTenureData = useMemo(() => {
    const households = filteredBy("vehicleBucket").householdsFiltered;
    if (!households?.length) return [];
    const counts = households.reduce((acc, household) => {
      acc[household.vehicleBucket] = (acc[household.vehicleBucket] || 0) + 1;
      return acc;
    }, {});

    const total = households.length;
    return Object.entries(counts)
      .map(([label, value]) => ({
        label,
        value: Number(((value / total) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredBy]);

  const vehicleTypeData = useMemo(() => {
    const households = filtered.householdsFiltered;
    if (!households?.length) return [];

    const counts = households.reduce((acc, household) => {
      const key = household.vehicleType || "Sin vehículo";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const total = households.length;
    return Object.entries(counts)
      .map(([label, value]) => ({
        label,
        value: Number(((value / total) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.value - a.value);
  }, [filtered.householdsFiltered]);

  const hourlyTripShareData = useMemo(() => {
    if (!filtered.tripsFiltered.length) return [];

    const hours = Array.from({ length: 24 }, (_, idx) => idx);
    const countsByHour = hours.map((hour) => ({ hour, total: 0 }));

    filtered.tripsFiltered.forEach((trip) => {
      const hour = trip.departureHour;
      const record = countsByHour[hour];
      record.total += 1;
    });

    return countsByHour.map((record) => ({
      hour: `${record.hour.toString().padStart(2, "0")}:00`,
      value: Number(record.total.toFixed(1)),
    }));
  }, [filtered.tripsFiltered]);

  const filters = {
    municipio,
    thematicFilters,
  };

  const setThematicValue = (key, value) => {
    const normalizedValue = key === "estrato" && value != null ? Number(value) : value;
    setThematicFilters((prev) => ({ ...prev, [key]: normalizedValue }));
  };

  return {
    households,
    persons: personsNormalized,
    trips,
    filters,
    municipios: MUNICIPIOS,
    filteredTrips: filtered.tripsFiltered,
    filteredPersons: filtered.personsFiltered,
    filteredHouseholds: filtered.householdsFiltered,
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
    setThematicValue,
    thematicOptions: THEMATIC_OPTIONS,
  };
}
