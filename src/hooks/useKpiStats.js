import { useEffect, useState } from "react";

const defaultStats = {
  totalTrips: 0,
  avgDistance: 0,
  avgTime: 0,
  pctMen: 0,
  pctWomen: 0,
  tripsPerHousehold: 0,
  avgTripsByEstrato: 0,
  vehiclesPerHousehold: 0,
  vehiclesByEstrato: 0,
  topOrigin: null,
  topDestination: null,
};

export function useKpiStats(filteredTrips, filteredPersons, filteredHouseholds) {
  const [stats, setStats] = useState(defaultStats);

  useEffect(() => {
    if (!filteredTrips || filteredTrips.length === 0) {
      setStats(defaultStats);
      return;
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

    const householdCount = filteredHouseholds?.length || 0;
    const tripsPerHousehold = householdCount
      ? Number((totalTrips / householdCount).toFixed(2))
      : 0;

    const estratoTripTotals = filteredTrips.reduce((acc, trip) => {
      acc[trip.estrato] = (acc[trip.estrato] || 0) + 1;
      return acc;
    }, {});

    const personsPerEstrato = filteredPersons.reduce((acc, person) => {
      acc[person.estrato] = (acc[person.estrato] || 0) + 1;
      return acc;
    }, {});

    const estratoAverages = Object.entries(estratoTripTotals).map(
      ([estrato, trips]) => {
        const people = personsPerEstrato[estrato] || 1;
        return trips / people;
      }
    );
    const avgTripsByEstrato = estratoAverages.length
      ? Number(
          (
            estratoAverages.reduce((acc, value) => acc + value, 0) /
            estratoAverages.length
          ).toFixed(2)
        )
      : 0;

    const vehiclesPerHousehold = householdCount
      ? Number(
          (
            filteredHouseholds.reduce(
              (acc, household) => acc + (household.vehicleCount || 0),
              0
            ) / householdCount
          ).toFixed(2)
        )
      : 0;

    const vehiclesByEstratoMap = filteredPersons.reduce((acc, person) => {
      const vehicleCount = person.household?.vehicleCount ?? 0;
      acc[person.estrato] = acc[person.estrato] || { count: 0, people: 0 };
      acc[person.estrato].count += vehicleCount;
      acc[person.estrato].people += 1;
      return acc;
    }, {});

    const vehiclesByEstratoAverages = Object.values(vehiclesByEstratoMap).map(
      ({ count, people }) => (people ? count / people : 0)
    );

    const vehiclesByEstrato = vehiclesByEstratoAverages.length
      ? Number(
          (
            vehiclesByEstratoAverages.reduce((acc, value) => acc + value, 0) /
            vehiclesByEstratoAverages.length
          ).toFixed(2)
        )
      : 0;

    const topOrigin = filteredTrips.reduce((acc, trip) => {
      const key = trip.originKey;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const topDestination = filteredTrips.reduce((acc, trip) => {
      const key = trip.destinationKey;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const [originLabel, originTrips] = Object.entries(topOrigin).sort(
      (a, b) => b[1] - a[1]
    )[0];
    const [destinationLabel, destinationTrips] = Object.entries(
      topDestination
    ).sort((a, b) => b[1] - a[1])[0];

    setStats({
      totalTrips,
      avgDistance,
      avgTime,
      pctMen,
      pctWomen,
      tripsPerHousehold,
      avgTripsByEstrato,
      vehiclesPerHousehold,
      vehiclesByEstrato,
      topOrigin: { label: originLabel, trips: originTrips },
      topDestination: { label: destinationLabel, trips: destinationTrips },
    });
  }, [filteredTrips, filteredPersons, filteredHouseholds]);

  return stats;
}
