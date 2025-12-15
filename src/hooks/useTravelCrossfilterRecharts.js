// src/hooks/useTravelCrossfilterRecharts.js
import { useCallback, useMemo, useState } from "react";
import dataset from "../data/travelData.json";

const households = dataset.households;
const persons = dataset.persons;
const trips = dataset.trips;
const MACROZONAS_POR_MUNICIPIO = dataset.metadata.macrozonasPorMunicipio;
const MUNICIPIOS = dataset.metadata.municipios;
const formatMacrozonaLabel = (municipio, macrozona) =>
  `${municipio} - ${macrozona}`;

const ALL_MACROZONAS = Object.entries(MACROZONAS_POR_MUNICIPIO)
  .filter(([municipio]) => municipio !== "Zona Externa" && municipio !== "AMVA General")
  .flatMap(([municipio, macros]) =>
    macros.map((macro) => formatMacrozonaLabel(municipio, macro))
  );

const MODE_OPTIONS = [
  "Metro",
  "Cable",
  "Metroplús",
  "Tranvía",
  "Bus urbano/metropolitano",
  "Ruta integrada/Alimentador C3-C6",
  "Bus intermunicipal",
  "Taxi individual",
  "Taxi colectivo",
  "Taxi intermunicipal",
  "Transporte informal en calle",
  "Plataforma (Uber/Cabify/etc.)",
  "Auto particular (conductor)",
  "Auto particular (acompañante)",
  "Escolar",
  "Vehículo empresa (especial)",
  "Moto (conductor)",
  "Moto (acompañante)",
  "Mototaxi",
  "Motocarro",
  "Bicicleta propia",
  "Bicicleta pública",
  "Patineta eléctrica",
  "A pie",
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
};

const hashString = (value) =>
  value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

const deriveCategorical = (seedValue, options) => {
  const seed = hashString(seedValue);
  return options[seed % options.length];
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

const VEHICLE_BUCKETS = ["Sin vehículo", "1 vehículo", "2+ vehículos"];
const PURPOSES = ["Estudio", "Visitar a un amigo", "Trabajo", "Regreso al hogar"];
const OCCUPATIONS = [
  "Ama de casa",
  "Jubilado",
  "Estudiante",
  "Trabajador independiente",
  "Trabajador dependiente o empleado",
  "Desempleado",
  "Jubilado y estudiante",
  "Jubilado y trabajador",
  "Ama de casa y estudiante",
  "Trabajador y estudiante",
  "Ninguna",
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
const STAGE_BUCKETS = ["1 etapa", "2 etapas", "3 etapas", "4 o más etapas"];

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

function aggregateHeat(data, field) {
  const counts = data.reduce((acc, item) => {
    const key = item[field];
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export function useTravelCrossfilterRecharts() {
  const [municipio, setMunicipio] = useState("AMVA General");
  const [macrozona, setMacrozona] = useState(null);
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

  const macrozones = useMemo(
    () =>
      municipio === "AMVA General" || municipio === "Todos"
        ? ALL_MACROZONAS
        : (MACROZONAS_POR_MUNICIPIO[municipio] || []).map((macro) =>
            formatMacrozonaLabel(municipio, macro)
          ),
    [municipio]
  );

  const derivedHouseholds = useMemo(() => {
    return households.reduce((acc, household) => {
      const vehicleSeed = `${household.id}-${household.size}-${household.municipio}`;
      const vehicleBucket = deriveCategorical(vehicleSeed, VEHICLE_BUCKETS);

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
          vehicleBucket: household?.vehicleBucket || deriveCategorical(person.id, VEHICLE_BUCKETS),
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
        const purpose = deriveCategorical(trip.id, PURPOSES);
        const stageSeed = hashString(`${trip.id}-stage`) % STAGE_BUCKETS.length;
        const stageBucket = STAGE_BUCKETS[stageSeed];

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
    ({ skipThematic = null, ignoreMacrozona = false } = {}) => {
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

      const matchTrip = (trip, applyMacrozona = true) => {
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
        if (applyMacrozona && !ignoreMacrozona && macrozona) {
          return (
            trip.originKey === macrozona || trip.destinationKey === macrozona
          );
        }

        return true;
      };

      const tripsForCharts = enrichedTrips.filter((trip) => matchTrip(trip, true));
      const tripsForMaps = enrichedTrips.filter((trip) => matchTrip(trip, false));

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
    }, [
      municipio,
      macrozona,
      thematicFilters,
      personsNormalized,
      enrichedTrips,
      derivedHouseholds,
    ]
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

    return {
      origin: toSeries(originCounts),
      destination: toSeries(destinationCounts),
    };
  }, [filtered.tripsForMaps]);

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
    macrozona,
    thematicFilters,
  };

  const setThematicValue = (key, value) => {
    setThematicFilters((prev) => ({ ...prev, [key]: value }));
  };

  return {
    households,
    persons: personsNormalized,
    trips,
    filters,
    macrozones,
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
    hourlyTripShareData,
    macroHeatData,
    setMunicipio,
    setMacrozona,
    setThematicValue,
    thematicOptions: THEMATIC_OPTIONS,
  };
}
