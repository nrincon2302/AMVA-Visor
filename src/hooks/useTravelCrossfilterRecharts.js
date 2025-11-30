// src/hooks/useTravelCrossfilterRecharts.js
import { useMemo, useState } from "react";
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

const THEMATIC_OPTIONS = {
  gender: ["Hombre", "Mujer"],
  ageRange: ["18–25", "26–35", "36–45", "46–60", "60+"],
  estrato: [1, 2, 3, 4, 5, 6],
  income: ["0–1 SM", "1–2 SM", "2–4 SM", "4–6 SM", "6+ SM"],
  mode: ["Metro", "Bus", "Moto", "Carro", "Bicicleta", "Caminata", "Taxi", "Tranvía"],
};

const PERSON_THEMATIC_KEYS = Object.keys(THEMATIC_OPTIONS).filter(
  (key) => key !== "mode"
);

const hashString = (value) =>
  value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

const deriveCategorical = (seedValue, options) => {
  const seed = hashString(seedValue);
  return options[seed % options.length];
};

const VEHICLE_BUCKETS = ["Sin vehículo", "1 vehículo", "2+ vehículos"];
const PURPOSES = ["Trabajo", "Estudio", "Compras", "Gestiones", "Ocio"];
const OCCUPATIONS = [
  "Empleado",
  "Estudiante",
  "Independiente",
  "Hogar",
  "Desempleado",
];

const COLORS = [
  "#0ea5e9",
  "#16a34a",
  "#f97316",
  "#6366f1",
  "#f43f5e",
  "#22c55e",
  "#8b5cf6",
  "#eab308",
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
  const [macrozona, setMacrozona] = useState("Todas");
  const [macrozonaScope, setMacrozonaScope] = useState("ambos");
  const [thematicFilters, setThematicFilters] = useState({
    gender: [],
    ageRange: [],
    estrato: [],
    income: [],
    mode: [],
  });

  const macrozones =
    municipio === "AMVA General" || municipio === "Todos"
      ? ALL_MACROZONAS
      : (MACROZONAS_POR_MUNICIPIO[municipio] || []).map((macro) =>
          formatMacrozonaLabel(municipio, macro)
        );

  const personsById = useMemo(
    () => Object.fromEntries(persons.map((p) => [p.id, p])),
    []
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

  const filtered = useMemo(() => {
    const thematicMatch = (person) =>
      PERSON_THEMATIC_KEYS.every((key) => {
        const values = thematicFilters[key];
        if (!values?.length) return true;
        return values.includes(person[key]);
      });

    const personsFiltered = persons.filter(thematicMatch);
    const thematicPersonIds = new Set(personsFiltered.map((p) => p.id));

    const tripsFiltered = trips.filter((trip) => {
      if (!thematicPersonIds.has(trip.personId)) return false;

      const person = personsById[trip.personId];
      const originMunicipio = person?.municipio || "AMVA General";
      const originKey = formatMacrozonaLabel(originMunicipio, trip.originMacro);
      const destinationKey = formatMacrozonaLabel(
        trip.destinationMunicipio,
        trip.destinationMacro
      );

      const matchesMunicipio =
        municipio === "AMVA General" ||
        municipio === "Todos" ||
        originMunicipio === municipio ||
        trip.destinationMunicipio === municipio;

      const matchesMacrozona = (() => {
        if (macrozona === "Todas") return true;
        if (macrozonaScope === "origen") return originKey === macrozona;
        if (macrozonaScope === "destino") return destinationKey === macrozona;
        return originKey === macrozona || destinationKey === macrozona;
      })();

      if (!matchesMunicipio || !matchesMacrozona) return false;

      if (thematicFilters.mode.length && !thematicFilters.mode.includes(trip.mode)) {
        return false;
      }

      return true;
    });

    const enrichedTrips = tripsFiltered.map((trip) => {
      const person = personsById[trip.personId];
      const originMunicipio = person?.municipio || "AMVA General";
      const household = person ? derivedHouseholds[person.householdId] : null;

      const departureHour = hashString(trip.id) % 24;
      const purpose = deriveCategorical(trip.id, PURPOSES);

      return {
        ...trip,
        ...person,
        household,
        originMunicipio,
        originKey: formatMacrozonaLabel(originMunicipio, trip.originMacro),
        destinationKey: formatMacrozonaLabel(
          trip.destinationMunicipio,
          trip.destinationMacro
        ),
        tripPurpose: purpose,
        departureHour,
        departureLabel: `${departureHour.toString().padStart(2, "0")}:00`,
      };
    });

    const activePersonIds = new Set(enrichedTrips.map((trip) => trip.personId));
    const personsWithTrips = personsFiltered
      .filter((person) => activePersonIds.has(person.id))
      .map((person) => ({
        ...person,
        household: derivedHouseholds[person.householdId],
      }));

    const activeHouseholdIds = new Set(
      personsWithTrips.map((person) => person.householdId)
    );

    const householdsWithTrips = households
      .map((household) => derivedHouseholds[household.id])
      .filter((household) => activeHouseholdIds.has(household.id));

    return {
      personsFiltered: personsWithTrips,
      tripsFiltered: enrichedTrips,
      householdsFiltered: householdsWithTrips,
    };
  }, [
    municipio,
    macrozona,
    macrozonaScope,
    thematicFilters,
    personsById,
    derivedHouseholds,
  ]);

  const estratoData = useMemo(
    () => aggregatePercentages(filtered.tripsFiltered, "estrato"),
    [filtered.tripsFiltered]
  );
  const edadData = useMemo(
    () => aggregatePercentages(filtered.tripsFiltered, "ageRange"),
    [filtered.tripsFiltered]
  );
  const generoData = useMemo(
    () => aggregatePie(filtered.tripsFiltered, "gender"),
    [filtered.tripsFiltered]
  );
  const escolaridadData = useMemo(
    () => aggregatePercentages(filtered.tripsFiltered, "edu"),
    [filtered.tripsFiltered]
  );
  const ingresosData = useMemo(
    () => aggregatePercentages(filtered.tripsFiltered, "income"),
    [filtered.tripsFiltered]
  );
  const modeData = useMemo(
    () => aggregatePercentages(filtered.tripsFiltered, "mode"),
    [filtered.tripsFiltered]
  );

  const originHeatData = useMemo(
    () => {
      const heat = aggregateHeat(filtered.tripsFiltered, "originKey");

      if (municipio === "AMVA General" || municipio === "Todos") {
        return heat;
      }

      return heat.filter((item) => item.name?.startsWith(`${municipio} - `));
    },
    [filtered.tripsFiltered, municipio]
  );
  const destinationHeatData = useMemo(
    () => {
      const heat = aggregateHeat(filtered.tripsFiltered, "destinationKey");

      if (municipio === "AMVA General" || municipio === "Todos") {
        return heat;
      }

      return heat.filter((item) => item.name?.startsWith(`${municipio} - `));
    },
    [filtered.tripsFiltered, municipio]
  );

  const purposeData = useMemo(
    () => aggregatePercentages(filtered.tripsFiltered, "tripPurpose"),
    [filtered.tripsFiltered]
  );

  const occupationData = useMemo(() => {
    const persons = filtered.personsFiltered.map((person) => ({
      ...person,
      occupation: deriveCategorical(person.id, OCCUPATIONS),
    }));
    return aggregatePercentages(persons, "occupation");
  }, [filtered.personsFiltered]);

  const vehicleTenureData = useMemo(() => {
    const households = filtered.householdsFiltered;
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
  }, [filtered.householdsFiltered]);

  const hourlyModeData = useMemo(() => {
    if (!filtered.tripsFiltered.length) return [];

    const hours = Array.from({ length: 24 }, (_, idx) => idx);
    const countsByHour = hours.map((hour) => ({ hour, total: 0 }));
    const modeTotals = {};

    filtered.tripsFiltered.forEach((trip) => {
      const hour = trip.departureHour;
      const mode = trip.mode;
      const record = countsByHour[hour];
      record[mode] = (record[mode] || 0) + 1;
      record.total += 1;
      modeTotals[mode] = (modeTotals[mode] || 0) + 1;
    });

    const topModes = Object.entries(modeTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([mode]) => mode);

    return countsByHour.map((record) => {
      const total = record.total || 1;
      const hourLabel = `${record.hour.toString().padStart(2, "0")}:00`;
      const modeShares = topModes.reduce((acc, mode, index) => {
        acc[mode] = Number((((record[mode] || 0) / total) * 100).toFixed(1));
        acc[`${mode}Color`] = COLORS[index % COLORS.length];
        return acc;
      }, {});

      return { hour: hourLabel, ...modeShares };
    });
  }, [filtered.tripsFiltered]);

  const originRanking = useMemo(() => {
    const base = aggregateHeat(filtered.tripsFiltered, "originKey");
    return base.sort((a, b) => b.value - a.value).slice(0, 3);
  }, [filtered.tripsFiltered]);

  const destinationRanking = useMemo(() => {
    const base = aggregateHeat(filtered.tripsFiltered, "destinationKey");
    return base.sort((a, b) => b.value - a.value).slice(0, 3);
  }, [filtered.tripsFiltered]);

  const filters = {
    municipio,
    macrozona,
    macrozonaScope,
    thematicFilters,
  };

  const setThematicValue = (key, values) => {
    setThematicFilters((prev) => ({ ...prev, [key]: values }));
  };

  return {
    households,
    persons,
    trips,
    filters,
    macrozonaScope,
    setMacrozonaScope,
    macrozones,
    municipios: MUNICIPIOS,
    filteredTrips: filtered.tripsFiltered,
    filteredPersons: filtered.personsFiltered,
    filteredHouseholds: filtered.householdsFiltered,
    estratoData,
    edadData,
    generoData,
    escolaridadData,
    ingresosData,
    modeData,
    purposeData,
    occupationData,
    vehicleTenureData,
    hourlyModeData,
    originRanking,
    destinationRanking,
    originHeatData,
    destinationHeatData,
    setMunicipio,
    setMacrozona,
    setThematicValue,
    thematicOptions: THEMATIC_OPTIONS,
  };
}
