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
    municipio === "AMVA General" || municipio === "Todos"
      ? ALL_MACROZONAS
      : (MACROZONAS_POR_MUNICIPIO[municipio] || []).map((macro) =>
          formatMacrozonaLabel(municipio, macro)
        );

  const personsById = useMemo(
    () => Object.fromEntries(persons.map((p) => [p.id, p])),
    []
  );

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

      const matchesMacrozona =
        macrozona === "Todas" ||
        originKey === macrozona ||
        destinationKey === macrozona;

      if (!matchesMunicipio || !matchesMacrozona) return false;

      if (thematicFilters.mode.length && !thematicFilters.mode.includes(trip.mode)) {
        return false;
      }

      return true;
    });

    const enrichedTrips = tripsFiltered.map((trip) => {
      const person = personsById[trip.personId];
      const originMunicipio = person?.municipio || "AMVA General";

      return {
        ...trip,
        ...person,
        originMunicipio,
        originKey: formatMacrozonaLabel(originMunicipio, trip.originMacro),
        destinationKey: formatMacrozonaLabel(
          trip.destinationMunicipio,
          trip.destinationMacro
        ),
      };
    });

    const activePersonIds = new Set(enrichedTrips.map((trip) => trip.personId));
    const personsWithTrips = personsFiltered.filter((person) => activePersonIds.has(person.id));

    return { personsFiltered: personsWithTrips, tripsFiltered: enrichedTrips };
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
