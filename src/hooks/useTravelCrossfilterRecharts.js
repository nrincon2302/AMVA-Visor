// src/hooks/useTravelCrossfilterRecharts.js
import { useMemo, useState } from "react";

const households = [
  { id: "H1", municipio: "AMVA General", macrozona: "AMVA General", size: 4 },
  { id: "H2", municipio: "Medellín", macrozona: "El Poblado", size: 3 },
  { id: "H3", municipio: "Medellín", macrozona: "Belén", size: 2 },
  { id: "H4", municipio: "Medellín", macrozona: "Robledo", size: 4 },
  { id: "H5", municipio: "Bello", macrozona: "Niquía", size: 4 },
  { id: "H6", municipio: "Envigado", macrozona: "Las Vegas", size: 3 },
  { id: "H7", municipio: "Itagüí", macrozona: "San Pio", size: 3 },
  { id: "H8", municipio: "Sabaneta", macrozona: "Urbana", size: 2 },
  { id: "H9", municipio: "Caldas", macrozona: "Rural", size: 3 },
  { id: "H10", municipio: "Copacabana", macrozona: "Urbana", size: 3 },
  { id: "H11", municipio: "La Estrella", macrozona: "Urbana", size: 2 },
  { id: "H12", municipio: "Barbosa", macrozona: "Urbana", size: 3 },
];

const persons = [
  {
    id: "P1",
    householdId: "H1",
    municipio: "AMVA General",
    macrozona: "AMVA General",
    ageRange: "26–35",
    gender: "Mujer",
    estrato: 3,
    income: "2–4 SM",
    edu: "Universitaria",
  },
  {
    id: "P2",
    householdId: "H2",
    municipio: "Medellín",
    macrozona: "El Poblado",
    ageRange: "26–35",
    gender: "Hombre",
    estrato: 5,
    income: "4–6 SM",
    edu: "Universitaria",
  },
  {
    id: "P3",
    householdId: "H2",
    municipio: "Medellín",
    macrozona: "El Poblado",
    ageRange: "36–45",
    gender: "Mujer",
    estrato: 5,
    income: "4–6 SM",
    edu: "Posgrado",
  },
  {
    id: "P4",
    householdId: "H3",
    municipio: "Medellín",
    macrozona: "Belén",
    ageRange: "18–25",
    gender: "Hombre",
    estrato: 3,
    income: "1–2 SM",
    edu: "Secundaria",
  },
  {
    id: "P5",
    householdId: "H4",
    municipio: "Medellín",
    macrozona: "Robledo",
    ageRange: "36–45",
    gender: "Mujer",
    estrato: 2,
    income: "0–1 SM",
    edu: "Primaria",
  },
  {
    id: "P6",
    householdId: "H5",
    municipio: "Bello",
    macrozona: "Niquía",
    ageRange: "26–35",
    gender: "Hombre",
    estrato: 3,
    income: "2–4 SM",
    edu: "Universitaria",
  },
  {
    id: "P7",
    householdId: "H6",
    municipio: "Envigado",
    macrozona: "Las Vegas",
    ageRange: "36–45",
    gender: "Mujer",
    estrato: 4,
    income: "4–6 SM",
    edu: "Posgrado",
  },
  {
    id: "P8",
    householdId: "H7",
    municipio: "Itagüí",
    macrozona: "San Pio",
    ageRange: "18–25",
    gender: "Hombre",
    estrato: 2,
    income: "1–2 SM",
    edu: "Técnica",
  },
  {
    id: "P9",
    householdId: "H8",
    municipio: "Sabaneta",
    macrozona: "Urbana",
    ageRange: "26–35",
    gender: "Mujer",
    estrato: 3,
    income: "2–4 SM",
    edu: "Universitaria",
  },
  {
    id: "P10",
    householdId: "H9",
    municipio: "Caldas",
    macrozona: "Rural",
    ageRange: "46–60",
    gender: "Hombre",
    estrato: 2,
    income: "1–2 SM",
    edu: "Primaria",
  },
  {
    id: "P11",
    householdId: "H10",
    municipio: "Copacabana",
    macrozona: "Urbana",
    ageRange: "36–45",
    gender: "Mujer",
    estrato: 3,
    income: "2–4 SM",
    edu: "Universitaria",
  },
  {
    id: "P12",
    householdId: "H11",
    municipio: "La Estrella",
    macrozona: "Urbana",
    ageRange: "18–25",
    gender: "Hombre",
    estrato: 3,
    income: "1–2 SM",
    edu: "Secundaria",
  },
  {
    id: "P13",
    householdId: "H12",
    municipio: "Barbosa",
    macrozona: "Urbana",
    ageRange: "36–45",
    gender: "Mujer",
    estrato: 2,
    income: "0–1 SM",
    edu: "Primaria",
  },
];

const trips = [
  {
    id: "T1",
    personId: "P1",
    originMacro: "AMVA General",
    destinationMacro: "AMVA General",
    distanceKm: 7.5,
    durationMin: 28,
    mode: "Bus",
  },
  {
    id: "T2",
    personId: "P2",
    originMacro: "El Poblado",
    destinationMacro: "El Poblado",
    distanceKm: 2.4,
    durationMin: 14,
    mode: "Caminata",
  },
  {
    id: "T3",
    personId: "P2",
    originMacro: "El Poblado",
    destinationMacro: "La Candelaria",
    distanceKm: 6.2,
    durationMin: 28,
    mode: "Metro",
  },
  {
    id: "T4",
    personId: "P3",
    originMacro: "El Poblado",
    destinationMacro: "Laureles-Estadio",
    distanceKm: 5.3,
    durationMin: 30,
    mode: "Carro",
  },
  {
    id: "T5",
    personId: "P4",
    originMacro: "Belén",
    destinationMacro: "Guayabal",
    distanceKm: 3.1,
    durationMin: 18,
    mode: "Moto",
  },
  {
    id: "T6",
    personId: "P5",
    originMacro: "Robledo",
    destinationMacro: "Laureles-Estadio",
    distanceKm: 4.3,
    durationMin: 22,
    mode: "Bus",
  },
  {
    id: "T7",
    personId: "P6",
    originMacro: "Niquía",
    destinationMacro: "Centro Bello",
    distanceKm: 3.5,
    durationMin: 20,
    mode: "Moto",
  },
  {
    id: "T8",
    personId: "P7",
    originMacro: "Las Vegas",
    destinationMacro: "Z. Centro",
    distanceKm: 2.8,
    durationMin: 16,
    mode: "Bus",
  },
  {
    id: "T9",
    personId: "P8",
    originMacro: "San Pio",
    destinationMacro: "Calatrava",
    distanceKm: 5.2,
    durationMin: 24,
    mode: "Carro",
  },
  {
    id: "T10",
    personId: "P9",
    originMacro: "Urbana",
    destinationMacro: "Urbana",
    distanceKm: 1.1,
    durationMin: 10,
    mode: "Caminata",
  },
  {
    id: "T11",
    personId: "P10",
    originMacro: "Rural",
    destinationMacro: "Urbana",
    distanceKm: 8.2,
    durationMin: 38,
    mode: "Moto",
  },
  {
    id: "T12",
    personId: "P11",
    originMacro: "Urbana",
    destinationMacro: "Las Vegas",
    distanceKm: 7.0,
    durationMin: 32,
    mode: "Bus",
  },
  {
    id: "T13",
    personId: "P12",
    originMacro: "Urbana",
    destinationMacro: "San Francisco",
    distanceKm: 5.6,
    durationMin: 27,
    mode: "Metro",
  },
  {
    id: "T14",
    personId: "P13",
    originMacro: "Urbana",
    destinationMacro: "Rural",
    distanceKm: 9.1,
    durationMin: 41,
    mode: "Bus",
  },
];

const MACROZONAS_POR_MUNICIPIO = {
  "AMVA General": ["AMVA General"],
  Barbosa: ["Rural", "Urbana"],
  Bello: [
    "Acevedo",
    "Altos de Niquía",
    "Bellavista",
    "Centro Bello",
    "Croacia El Pinar",
    "Fontidueño",
    "Guasimalito",
    "La Cumbre - El Carmelo",
    "Madera",
    "Niquía",
    "Paris",
    "Rural",
    "Santa Ana",
  ],
  Caldas: ["Rural", "Urbana"],
  Copacabana: ["Rural", "Urbana"],
  Envigado: [
    "Alcalá",
    "El Dorado - La Paz",
    "El Esmeraldal",
    "La Inmaculada",
    "Las Flores - Alto de Misael",
    "Las Vegas",
    "San José",
    "San Marcos",
    "Vereda El Escobero",
    "Vereda El Vallano",
    "Vereda Las Palmas",
    "Vereda Perico y Pantanillo",
    "Z. Centro",
  ],
  Girardota: ["Rural", "Urbana"],
  Itagüí: ["Calatrava", "El Rosario", "Rural", "San Francisco", "San Pio", "Santa Maria", "Z. Centro"],
  "La Estrella": ["Rural", "Urbana"],
  Medellín: [
    "Aranjuez",
    "Belén",
    "Buenos Aires",
    "Castilla",
    "Corregimiento Altavista",
    "Corregimiento San Antonio",
    "Corregimiento San Cristóbal",
    "Corregimiento San Sebastián",
    "Corregimiento Santa Elena",
    "Doce de Octubre",
    "El Poblado",
    "Guayabal",
    "La América",
    "La Candelaria",
    "Laureles-Estadio",
    "Manrique",
    "Popular",
    "Robledo",
    "San Javier",
    "Santa Cruz",
    "Villa Hermosa",
  ],
  Sabaneta: ["Rural", "Urbana"],
  "Zona Externa": ["Zona Externa"],
};

const MUNICIPIOS = [
  "AMVA General",
  "Barbosa",
  "Bello",
  "Caldas",
  "Copacabana",
  "Envigado",
  "Girardota",
  "Itagüí",
  "La Estrella",
  "Medellín",
  "Sabaneta",
  "Zona Externa",
];

const THEMATIC_OPTIONS = {
  gender: ["Hombre", "Mujer"],
  ageRange: ["18–25", "26–35", "36–45", "46–60"],
  estrato: [1, 2, 3, 4, 5],
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
