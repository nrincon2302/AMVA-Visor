// src/hooks/useTravelCrossfilterRecharts.js
import { useMemo, useState } from "react";
import dataset from "../data/travelData.json";

const households = dataset.households;
const persons = dataset.persons;
const trips = dataset.trips;
const MACROZONAS_POR_MUNICIPIO = dataset.metadata.macrozonasPorMunicipio;
const MUNICIPIOS = dataset.metadata.municipios;

const THEMATIC_OPTIONS = {
  gender: ["Hombre", "Mujer"],
  ageRange: ["18–25", "26–35", "36–45", "46–60", "60+"],
  estrato: [1, 2, 3, 4, 5, 6],
  income: ["0–1 SM", "1–2 SM", "2–4 SM", "4–6 SM", "6+ SM"],
  mode: ["Metro", "Bus", "Moto", "Carro", "Bicicleta", "Caminata", "Taxi", "Tranvía"],
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
  const [municipio, setMunicipio] = useState("AMVA General");
  const [macrozona, setMacrozona] = useState("Todas");
  const [thematicFilters, setThematicFilters] = useState({
    gender: [],
    ageRange: [],
    estrato: [],
    income: [],
    mode: [],
  });

  const macrozones =
    municipio === "AMVA General"
      ? ["AMVA General"]
      : MACROZONAS_POR_MUNICIPIO[municipio] || [];

  const filtered = useMemo(() => {
    const personsFiltered = persons.filter((person) => {
      const matchesMunicipio =
        municipio === "AMVA General" || municipio === "Todos" || person.municipio === municipio;
      const matchesMacrozona =
        macrozona === "Todas" || municipio === "AMVA General" || person.macrozona === macrozona;

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
    municipios: MUNICIPIOS,
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
