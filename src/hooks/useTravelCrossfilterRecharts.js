import { useMemo, useState } from "react";
import crossfilter from "crossfilter2";

const mockTrips = [
  { gender: "Hombre", ageRange: "18–25", estrato: 2 },
  { gender: "Mujer", ageRange: "26–35", estrato: 3 },
  // ...
];

export function useTravelCrossfilterRecharts() {
  const [filters, setFilters] = useState({ gender: "Todos" });

  const result = useMemo(() => {
    const cf = crossfilter(mockTrips);

    const genderDim = cf.dimension((d) => d.gender);
    if (filters.gender !== "Todos") {
      genderDim.filter(filters.gender);
    }

    // Estrato
    const estratoDim = cf.dimension((d) => d.estrato);
    const estratoGroup = estratoDim.group();
    const estratoData = estratoGroup
      .all()
      .sort((a, b) => a.key - b.key)
      .map((d) => ({ label: String(d.key), value: d.value }));

    // Edad
    const ageDim = cf.dimension((d) => d.ageRange);
    const ageGroup = ageDim.group();
    const edadData = ageGroup
      .all()
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((d) => ({ label: d.key, value: d.value }));

    // Género (para pie)
    const generoGroup = genderDim.group();
    const generoData = generoGroup
      .all()
      .map((d) => ({ name: d.key, value: d.value }));

    return { estratoData, edadData, generoData };
  }, [filters]);

  const setGenderFilter = (gender) =>
    setFilters((prev) => ({ ...prev, gender }));

  return { filters, setGenderFilter, ...result };
}
