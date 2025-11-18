import { useMemo, useState } from "react";
import crossfilter from "crossfilter2";

const mockTrips = [
  // Hombre, 18–25
  {
    gender: "Hombre",
    ageRange: "18–25",
    estrato: 2,
    income: "1–2 SM",
    edu: "Secundaria",
    distanceKm: 4.2,
    durationMin: 28,
  },
  {
    gender: "Hombre",
    ageRange: "18–25",
    estrato: 2,
    income: "1–2 SM",
    edu: "Técnica",
    distanceKm: 5.1,
    durationMin: 32,
  },

  // Hombre, 26–35
  {
    gender: "Hombre",
    ageRange: "26–35",
    estrato: 3,
    income: "2–4 SM",
    edu: "Universitaria",
    distanceKm: 6.3,
    durationMin: 35,
  },
  {
    gender: "Hombre",
    ageRange: "26–35",
    estrato: 3,
    income: "2–4 SM",
    edu: "Universitaria",
    distanceKm: 6.8,
    durationMin: 37,
  },
  {
    gender: "Hombre",
    ageRange: "26–35",
    estrato: 4,
    income: "4–6 SM",
    edu: "Posgrado",
    distanceKm: 7.5,
    durationMin: 40,
  },

  // Hombre, 36–45
  {
    gender: "Hombre",
    ageRange: "36–45",
    estrato: 3,
    income: "2–4 SM",
    edu: "Universitaria",
    distanceKm: 6.0,
    durationMin: 34,
  },
  {
    gender: "Hombre",
    ageRange: "36–45",
    estrato: 4,
    income: "4–6 SM",
    edu: "Universitaria",
    distanceKm: 7.2,
    durationMin: 39,
  },

  // Mujer, 18–25
  {
    gender: "Mujer",
    ageRange: "18–25",
    estrato: 2,
    income: "1–2 SM",
    edu: "Secundaria",
    distanceKm: 3.8,
    durationMin: 26,
  },
  {
    gender: "Mujer",
    ageRange: "18–25",
    estrato: 3,
    income: "2–4 SM",
    edu: "Técnica",
    distanceKm: 4.5,
    durationMin: 29,
  },

  // Mujer, 26–35
  {
    gender: "Mujer",
    ageRange: "26–35",
    estrato: 3,
    income: "2–4 SM",
    edu: "Universitaria",
    distanceKm: 5.9,
    durationMin: 33,
  },
  {
    gender: "Mujer",
    ageRange: "26–35",
    estrato: 4,
    income: "4–6 SM",
    edu: "Universitaria",
    distanceKm: 6.4,
    durationMin: 36,
  },
  {
    gender: "Mujer",
    ageRange: "26–35",
    estrato: 4,
    income: "4–6 SM",
    edu: "Posgrado",
    distanceKm: 6.9,
    durationMin: 38,
  },

  // Mujer, 36–45
  {
    gender: "Mujer",
    ageRange: "36–45",
    estrato: 3,
    income: "2–4 SM",
    edu: "Universitaria",
    distanceKm: 5.7,
    durationMin: 32,
  },
  {
    gender: "Mujer",
    ageRange: "36–45",
    estrato: 2,
    income: "1–2 SM",
    edu: "Secundaria",
    distanceKm: 4.1,
    durationMin: 27,
  },

  // Mujer, 46–60
  {
    gender: "Mujer",
    ageRange: "46–60",
    estrato: 2,
    income: "0–1 SM",
    edu: "Primaria",
    distanceKm: 3.2,
    durationMin: 24,
  },
  {
    gender: "Mujer",
    ageRange: "46–60",
    estrato: 3,
    income: "1–2 SM",
    edu: "Secundaria",
    distanceKm: 3.9,
    durationMin: 26,
  },

  // Hombre, 46–60
  {
    gender: "Hombre",
    ageRange: "46–60",
    estrato: 4,
    income: "4–6 SM",
    edu: "Universitaria",
    distanceKm: 7.0,
    durationMin: 38,
  },
  {
    gender: "Hombre",
    ageRange: "46–60",
    estrato: 5,
    income: "6+ SM",
    edu: "Posgrado",
    distanceKm: 8.1,
    durationMin: 42,
  },
];

export function useTravelCrossfilterRecharts() {
  const [filters, setFilters] = useState({ gender: "Todos" });

  const result = useMemo(() => {
    const cf = crossfilter(mockTrips);

    const genderDim = cf.dimension((d) => d.gender);
    if (filters.gender !== "Todos") {
      genderDim.filter(filters.gender);
    }

    const totalTrips = cf.groupAll().value();

    const estratoDim = cf.dimension((d) => d.estrato);
    const estratoData = estratoDim
      .group()
      .all()
      .sort((a, b) => a.key - b.key)
      .map((d) => ({ label: String(d.key), value: d.value }));

    const edadDim = cf.dimension((d) => d.ageRange);
    const edadData = edadDim
      .group()
      .all()
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((d) => ({ label: d.key, value: d.value }));

    const eduDim = cf.dimension((d) => d.edu);
    const escolaridadData = eduDim
      .group()
      .all()
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((d) => ({ label: d.key, value: d.value }));

    const incomeDim = cf.dimension((d) => d.income);
    const ingresosData = incomeDim
      .group()
      .all()
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((d) => ({ label: d.key, value: d.value }));

    const generoData = genderDim
      .group()
      .all()
      .map((d) => ({ name: d.key, value: d.value }));

    const filteredTrips = genderDim.top(Infinity);

    return {
      totalTrips,
      filteredTrips,
      estratoData,
      edadData,
      escolaridadData,
      ingresosData,
      generoData,
    };
  }, [filters]);

  const setGenderFilter = (gender) => {
    setFilters((prev) => ({ ...prev, gender }));
  };

  return {
    filters,
    setGenderFilter,
    ...result,
  };
}