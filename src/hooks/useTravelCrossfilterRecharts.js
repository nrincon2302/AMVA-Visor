// src/hooks/useTravelCrossfilterRecharts.js
import { useMemo, useState } from "react";

const households = [
  { id: "H1", municipio: "Medellín", macrozona: "Centro", size: 3 },
  { id: "H2", municipio: "Medellín", macrozona: "Sur", size: 4 },
  { id: "H3", municipio: "Medellín", macrozona: "Norte", size: 2 },
  { id: "H4", municipio: "Medellín", macrozona: "Occidente", size: 5 },
  { id: "H5", municipio: "Medellín", macrozona: "Centro", size: 2 },
  { id: "H6", municipio: "Medellín", macrozona: "Sur", size: 3 },
];

const persons = [
  {
    id: "P1",
    householdId: "H1",
    municipio: "Medellín",
    macrozona: "Centro",
    ageRange: "18–25",
    gender: "Mujer",
    estrato: 2,
    income: "1–2 SM",
    edu: "Secundaria",
  },
  {
    id: "P2",
    householdId: "H1",
    municipio: "Medellín",
    macrozona: "Centro",
    ageRange: "26–35",
    gender: "Hombre",
    estrato: 3,
    income: "2–4 SM",
    edu: "Técnica",
  },
  {
    id: "P3",
    householdId: "H2",
    municipio: "Medellín",
    macrozona: "Sur",
    ageRange: "26–35",
    gender: "Mujer",
    estrato: 3,
    income: "2–4 SM",
    edu: "Universitaria",
  },
  {
    id: "P4",
    householdId: "H2",
    municipio: "Medellín",
    macrozona: "Sur",
    ageRange: "36–45",
    gender: "Hombre",
    estrato: 4,
    income: "4–6 SM",
    edu: "Universitaria",
  },
  {
    id: "P5",
    householdId: "H3",
    municipio: "Medellín",
    macrozona: "Norte",
    ageRange: "18–25",
    gender: "Hombre",
    estrato: 2,
    income: "1–2 SM",
    edu: "Secundaria",
  },
  {
    id: "P6",
    householdId: "H3",
    municipio: "Medellín",
    macrozona: "Norte",
    ageRange: "36–45",
    gender: "Mujer",
    estrato: 3,
    income: "2–4 SM",
    edu: "Posgrado",
  },
  {
    id: "P7",
    householdId: "H4",
    municipio: "Medellín",
    macrozona: "Occidente",
    ageRange: "46–60",
    gender: "Mujer",
    estrato: 2,
    income: "0–1 SM",
    edu: "Primaria",
  },
  {
    id: "P8",
    householdId: "H4",
    municipio: "Medellín",
    macrozona: "Occidente",
    ageRange: "26–35",
    gender: "Hombre",
    estrato: 3,
    income: "2–4 SM",
    edu: "Universitaria",
  },
  {
    id: "P9",
    householdId: "H5",
    municipio: "Medellín",
    macrozona: "Centro",
    ageRange: "18–25",
    gender: "Mujer",
    estrato: 1,
    income: "0–1 SM",
    edu: "Primaria",
  },
  {
    id: "P10",
    householdId: "H6",
    municipio: "Medellín",
    macrozona: "Sur",
    ageRange: "46–60",
    gender: "Hombre",
    estrato: 4,
    income: "4–6 SM",
    edu: "Posgrado",
  },
];

const trips = [
  {
    id: "T1",
    personId: "P1",
    originMacro: "Centro",
    destinationMacro: "Sur",
    distanceKm: 4.2,
    durationMin: 28,
    mode: "Metro",
  },
  {
    id: "T2",
    personId: "P1",
    originMacro: "Centro",
    destinationMacro: "Centro",
    distanceKm: 1.4,
    durationMin: 12,
    mode: "Caminata",
  },
  {
    id: "T3",
    personId: "P2",
    originMacro: "Centro",
    destinationMacro: "Sur",
    distanceKm: 5.1,
    durationMin: 32,
    mode: "Metro",
  },
  {
    id: "T4",
    personId: "P3",
    originMacro: "Sur",
    destinationMacro: "Centro",
    distanceKm: 6.3,
    durationMin: 35,
    mode: "Bus",
  },
  {
    id: "T5",
    personId: "P4",
    originMacro: "Sur",
    destinationMacro: "Sur",
    distanceKm: 3.2,
    durationMin: 22,
    mode: "Moto",
  },
  {
    id: "T6",
    personId: "P5",
    originMacro: "Norte",
    destinationMacro: "Centro",
    distanceKm: 5.7,
    durationMin: 30,
    mode: "Bus",
  },
  {
    id: "T7",
    personId: "P6",
    originMacro: "Norte",
    destinationMacro: "Norte",
    distanceKm: 2.9,
    durationMin: 18,
    mode: "Bicicleta",
  },
  {
    id: "T8",
    personId: "P7",
    originMacro: "Occidente",
    destinationMacro: "Centro",
    distanceKm: 7.2,
    durationMin: 42,
    mode: "Bus",
  },
  {
    id: "T9",
    personId: "P8",
    originMacro: "Occidente",
    destinationMacro: "Sur",
    distanceKm: 4.4,
    durationMin: 26,
    mode: "Carro",
  },
  {
    id: "T10",
    personId: "P9",
    originMacro: "Centro",
    destinationMacro: "Centro",
    distanceKm: 1.0,
    durationMin: 10,
    mode: "Caminata",
  },
  {
    id: "T11",
    personId: "P10",
    originMacro: "Sur",
    destinationMacro: "Centro",
    distanceKm: 6.7,
    durationMin: 34,
    mode: "Carro",
  },
];

const MACROZONAS_POR_MUNICIPIO = {
  Medellín: ["Centro", "Sur", "Norte", "Occidente"],
};

const THEMATIC_OPTIONS = {
  gender: ["Hombre", "Mujer"],
  ageRange: ["18–25", "26–35", "36–45", "46–60"],
  estrato: [1, 2, 3, 4],
  income: ["0–1 SM", "1–2 SM", "2–4 SM", "4–6 SM"],
  mode: ["Metro", "Bus", "Moto", "Carro", "Bicicleta", "Caminata"],
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
  const [municipio, setMunicipio] = useState("Medellín");
  const [macrozona, setMacrozona] = useState("Todas");
  const [thematicFilters, setThematicFilters] = useState({
    gender: [],
    ageRange: [],
    estrato: [],
    income: [],
    mode: [],
  });

  const macrozones = MACROZONAS_POR_MUNICIPIO[municipio] || [];

  const filtered = useMemo(() => {
    const personsFiltered = persons.filter((person) => {
      const matchesMunicipio = municipio === "Todos" || person.municipio === municipio;
      const matchesMacrozona =
        macrozona === "Todas" || macrozona === "" || person.macrozona === macrozona;

      const thematicChecks = Object.entries(thematicFilters).every(([key, values]) => {
        if (!values.length) return true;
        return values.includes(person[key]);
      });

      return matchesMunicipio && matchesMacrozona && thematicChecks;
    });

    const personIds = new Set(personsFiltered.map((p) => p.id));

    const tripsFiltered = trips.filter((trip) => {
      if (!personIds.has(trip.personId)) return false;
      if (thematicFilters.mode.length && !thematicFilters.mode.includes(trip.mode)) {
        return false;
      }
      return true;
    });

    const enrichedTrips = tripsFiltered.map((trip) => {
      const person = persons.find((p) => p.id === trip.personId);
      return { ...trip, ...person };
    });

    return { personsFiltered, tripsFiltered: enrichedTrips };
  }, [municipio, macrozona, thematicFilters]);

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
    () => aggregateHeat(filtered.tripsFiltered, "originMacro"),
    [filtered.tripsFiltered]
  );
  const destinationHeatData = useMemo(
    () => aggregateHeat(filtered.tripsFiltered, "destinationMacro"),
    [filtered.tripsFiltered]
  );

  const filters = {
    municipio,
    macrozona,
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
    macrozones,
    filteredTrips: filtered.tripsFiltered,
    filteredPersons: filtered.personsFiltered,
    estratoData,
    edadData,
    generoData,
    escolaridadData,
    ingresosData,
    modeData,
    originHeatData,
    destinationHeatData,
    setMunicipio,
    setMacrozona,
    setThematicValue,
    thematicOptions: THEMATIC_OPTIONS,
  };
}
