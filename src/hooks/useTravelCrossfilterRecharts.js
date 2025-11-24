// src/hooks/useTravelCrossfilterRecharts.js
import { useMemo, useState } from "react";
import crossfilter from "crossfilter2";

// Mock de viajes con género, edad, estrato, ingresos, escolaridad y DEPARTAMENTO
const mockTrips = [
  // HOMBRES 18–25
  {
    gender: "Hombre",
    ageRange: "18–25",
    estrato: 2,
    income: "1–2 SM",
    edu: "Secundaria",
    distanceKm: 4.2,
    durationMin: 28,
    departamento: "Antioquia",
  },
  {
    gender: "Hombre",
    ageRange: "18–25",
    estrato: 2,
    income: "1–2 SM",
    edu: "Técnica",
    distanceKm: 5.1,
    durationMin: 32,
    departamento: "Antioquia",
  },

  // HOMBRES 26–35
  {
    gender: "Hombre",
    ageRange: "26–35",
    estrato: 3,
    income: "2–4 SM",
    edu: "Universitaria",
    distanceKm: 6.3,
    durationMin: 35,
    departamento: "Cundinamarca",
  },
  {
    gender: "Hombre",
    ageRange: "26–35",
    estrato: 3,
    income: "2–4 SM",
    edu: "Universitaria",
    distanceKm: 6.8,
    durationMin: 37,
    departamento: "Valle del Cauca",
  },
  {
    gender: "Hombre",
    ageRange: "26–35",
    estrato: 4,
    income: "4–6 SM",
    edu: "Posgrado",
    distanceKm: 7.5,
    durationMin: 40,
    departamento: "Atlántico",
  },

  // HOMBRES 36–45
  {
    gender: "Hombre",
    ageRange: "36–45",
    estrato: 3,
    income: "2–4 SM",
    edu: "Universitaria",
    distanceKm: 6.0,
    durationMin: 34,
    departamento: "Santander",
  },
  {
    gender: "Hombre",
    ageRange: "36–45",
    estrato: 4,
    income: "4–6 SM",
    edu: "Universitaria",
    distanceKm: 7.2,
    durationMin: 39,
    departamento: "Antioquia",
  },

  // MUJERES 18–25
  {
    gender: "Mujer",
    ageRange: "18–25",
    estrato: 2,
    income: "1–2 SM",
    edu: "Secundaria",
    distanceKm: 3.8,
    durationMin: 26,
    departamento: "Antioquia",
  },
  {
    gender: "Mujer",
    ageRange: "18–25",
    estrato: 3,
    income: "2–4 SM",
    edu: "Técnica",
    distanceKm: 4.5,
    durationMin: 29,
    departamento: "Cundinamarca",
  },

  // MUJERES 26–35
  {
    gender: "Mujer",
    ageRange: "26–35",
    estrato: 3,
    income: "2–4 SM",
    edu: "Universitaria",
    distanceKm: 5.9,
    durationMin: 33,
    departamento: "Valle del Cauca",
  },
  {
    gender: "Mujer",
    ageRange: "26–35",
    estrato: 4,
    income: "4–6 SM",
    edu: "Universitaria",
    distanceKm: 6.4,
    durationMin: 36,
    departamento: "Antioquia",
  },
  {
    gender: "Mujer",
    ageRange: "26–35",
    estrato: 4,
    income: "4–6 SM",
    edu: "Posgrado",
    distanceKm: 6.9,
    durationMin: 38,
    departamento: "Atlántico",
  },

  // MUJERES 36–45
  {
    gender: "Mujer",
    ageRange: "36–45",
    estrato: 3,
    income: "2–4 SM",
    edu: "Universitaria",
    distanceKm: 5.7,
    durationMin: 32,
    departamento: "Santander",
  },
  {
    gender: "Mujer",
    ageRange: "36–45",
    estrato: 2,
    income: "1–2 SM",
    edu: "Secundaria",
    distanceKm: 4.1,
    durationMin: 27,
    departamento: "Antioquia",
  },

  // MUJERES 46–60
  {
    gender: "Mujer",
    ageRange: "46–60",
    estrato: 2,
    income: "0–1 SM",
    edu: "Primaria",
    distanceKm: 3.2,
    durationMin: 24,
    departamento: "Nariño",
  },
  {
    gender: "Mujer",
    ageRange: "46–60",
    estrato: 3,
    income: "1–2 SM",
    edu: "Secundaria",
    distanceKm: 3.9,
    durationMin: 26,
    departamento: "Norte de Santander",
  },

  // HOMBRES 46–60
  {
    gender: "Hombre",
    ageRange: "46–60",
    estrato: 4,
    income: "4–6 SM",
    edu: "Universitaria",
    distanceKm: 7.0,
    durationMin: 38,
    departamento: "Bolívar",
  },
  {
    gender: "Hombre",
    ageRange: "46–60",
    estrato: 5,
    income: "6+ SM",
    edu: "Posgrado",
    distanceKm: 8.1,
    durationMin: 42,
    departamento: "Antioquia",
  },
];

export function useTravelCrossfilterRecharts() {
  const [filters, setFilters] = useState({ gender: "Todos", departamento: "Todos" });

  const result = useMemo(() => {
    const cf = crossfilter(mockTrips);

    // ---------- Filtro por género ----------
    const genderDim = cf.dimension((d) => d.gender);
    if (filters.gender !== "Todos") {
      genderDim.filter(filters.gender);
    }

    // ---------- Filtro por departamento ----------
    const deptDimFilter = cf.dimension((d) => d.departamento);
    if (filters.departamento !== "Todos") {
      deptDimFilter.filter(filters.departamento);
    }

    // Viajes filtrados (útil para KPIs más avanzados)
    const filteredTrips = genderDim.top(Infinity);
    const totalTrips = cf.groupAll().value();

    // ---------- Estrato ----------
    const estratoDim = cf.dimension((d) => d.estrato);
    const estratoData = estratoDim
      .group()
      .all()
      .sort((a, b) => a.key - b.key)
      .map((d) => ({ label: String(d.key), value: d.value }));

    // ---------- Edad ----------
    const edadDim = cf.dimension((d) => d.ageRange);
    const edadData = edadDim
      .group()
      .all()
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((d) => ({ label: d.key, value: d.value }));

    // ---------- Escolaridad ----------
    const eduDim = cf.dimension((d) => d.edu);
    const escolaridadData = eduDim
      .group()
      .all()
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((d) => ({ label: d.key, value: d.value }));

    // ---------- Ingresos ----------
    const incomeDim = cf.dimension((d) => d.income);
    const ingresosData = incomeDim
      .group()
      .all()
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((d) => ({ label: d.key, value: d.value }));

    // ---------- Género (para pie) ----------
    const generoData = genderDim
      .group()
      .all()
      .map((d) => ({ name: d.key, value: d.value }));

    // ---------- Departamentos (para mapa Highcharts) ----------
    const deptDim = cf.dimension((d) => d.departamento);
    const deptGroup = deptDim.group();
    const departamentoData = deptGroup.all().map((d) => ({
      name: d.key, // esto debe coincidir con properties.name del mapa de Colombia
      value: d.value,
    }));

    return {
      filteredTrips,
      totalTrips,
      estratoData,
      edadData,
      escolaridadData,
      ingresosData,
      generoData,
      departamentoData,
    };
  }, [filters]);

  // API de filtros hacia afuera
  const setGenderFilter = (gender) => {
    setFilters((prev) => ({ ...prev, gender }));
  };

  const setDepartamentoFilter = (departamento) => {
    setFilters((prev) => ({ ...prev, departamento }));
  };

  return {
    filters,
    setFilters,       // lo dejo expuesto por si en algún lado ya lo estabas usando
    setGenderFilter,  // este es el que usamos para el filtro de género en los tabs
    setDepartamentoFilter, // este es el que usamos para el filtro de departamento
    ...result,
  };
}