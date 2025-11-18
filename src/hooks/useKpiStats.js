import { useMemo } from "react";

export function useKpiStats(filteredTrips) {
  return useMemo(() => {
    if (!filteredTrips || filteredTrips.length === 0) {
      return {
        totalTrips: 0,
        avgDistance: 0,
        avgTime: 0,
        pctMen: 0,
        pctWomen: 0,
      };
    }

    const totalTrips = filteredTrips.length;

    const avgDistance =
    filteredTrips.reduce((acc, trip) => acc + (trip.distanceKm ?? 0), 0) /
    totalTrips;

    const avgTime =
    filteredTrips.reduce((acc, trip) => acc + (trip.durationMin ?? 0), 0) /
    totalTrips;

    const men = filteredTrips.filter((t) => t.gender === "Hombre").length;
    const women = filteredTrips.filter((t) => t.gender === "Mujer").length;

    const pctMen = ((men / totalTrips) * 100).toFixed(1);
    const pctWomen = ((women / totalTrips) * 100).toFixed(1);

    return {
      totalTrips,
      avgDistance,
      avgTime,
      pctMen,
      pctWomen,
    };
  }, [filteredTrips]);
}