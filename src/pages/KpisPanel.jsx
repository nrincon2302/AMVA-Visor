import React from "react";
import KpiCard from "../components/KpiCard";
import {
  PRIMARY_GREEN,
  SECONDARY_GREEN,
  TERTIARY_BLUE,
  TERTIARY_ORANGE,
  TERTIARY_YELLOW,
  BANNER_IMAGE_URL,
} from "../config/constants";

export default function KpisPanel({
  filteredTrips = [],
  filteredPersons = [],
  filteredPersonsBase = [],
  filteredHouseholds = [],
  totalTrips = 0,
  allTrips = [],
  allHouseholds = [],
  derivedHouseholds = {},
  allPersons = [],
}) {
  const tripsCount = filteredTrips?.length || 0;
  const personsCount = filteredPersons?.length || 0;
  const personsBaseCount = filteredPersonsBase?.length || 0;
  const householdsCount = filteredHouseholds?.length || 0;

  const tripsShare = totalTrips ? `${((tripsCount / totalTrips) * 100).toFixed(1)}% del total` : null;
  const formatDelta = (value, unit) => {
    const pct = Number.isFinite(value) ? value : 0;
    const direction = pct >= 0 ? "más" : "menos";
    return `${Math.abs(pct).toFixed(1)}% ${direction} ${unit} que el total`;
  };

  // Tiempo promedio (min)
  const avgDurationFiltered =
    filteredTrips && filteredTrips.length
      ? filteredTrips.reduce((acc, t) => acc + (t.durationMin || 0), 0) / filteredTrips.length
      : 0;

  const avgDurationGlobal = allTrips && allTrips.length
    ? allTrips.reduce((acc, t) => acc + (t.durationMin || 0), 0) / allTrips.length
    : 0;

  const durationDiffPct = avgDurationGlobal ? (((avgDurationFiltered - avgDurationGlobal) / avgDurationGlobal) * 100) : 0;

  // Viajes por hogar
  const tripsPerHouseholdFiltered = householdsCount ? tripsCount / householdsCount : 0;
  const totalHouseholdsGlobal = allHouseholds?.length || 0;
  const tripsPerHouseholdGlobal = totalHouseholdsGlobal ? (allTrips?.length || 0) / totalHouseholdsGlobal : 0;
  const tripsPerHouseholdDiffPct = tripsPerHouseholdGlobal ? (((tripsPerHouseholdFiltered - tripsPerHouseholdGlobal) / tripsPerHouseholdGlobal) * 100) : 0;

  // Vehículos por hogar
  const avgVehiclesFiltered = filteredHouseholds && filteredHouseholds.length
    ? filteredHouseholds.reduce((acc, h) => acc + (h.vehicleCount || 0), 0) / filteredHouseholds.length
    : 0;

  const derivedList = Object.values(derivedHouseholds || {});
  const avgVehiclesGlobal = derivedList.length
    ? derivedList.reduce((acc, h) => acc + (h.vehicleCount || 0), 0) / derivedList.length
    : 0;

  const vehiclesDiffPct = avgVehiclesGlobal ? (((avgVehiclesFiltered - avgVehiclesGlobal) / avgVehiclesGlobal) * 100) : 0;

  // Viajes promedio por persona (incluye quienes no viajan)
  const avgTripsPerPersonFiltered = personsBaseCount ? tripsCount / personsBaseCount : 0;
  const totalPersonsGlobal = allPersons?.length || 0;
  const avgTripsPerPersonGlobal = totalPersonsGlobal ? (totalTrips || 0) / totalPersonsGlobal : 0;
  const tripsPerPersonDiffPct = avgTripsPerPersonGlobal
    ? (((avgTripsPerPersonFiltered - avgTripsPerPersonGlobal) / avgTripsPerPersonGlobal) * 100)
    : 0;

  // Viajes promedio por personas que realizan viajes
  const avgTripsPerTravelerFiltered = personsCount ? tripsCount / personsCount : 0;
  const personsWithTripsGlobal = allTrips?.length
    ? new Set(allTrips.map((trip) => trip.personId)).size
    : 0;
  const avgTripsPerTravelerGlobal = personsWithTripsGlobal
    ? (totalTrips || 0) / personsWithTripsGlobal
    : 0;
  const tripsPerTravelerDiffPct = avgTripsPerTravelerGlobal
    ? (((avgTripsPerTravelerFiltered - avgTripsPerTravelerGlobal) / avgTripsPerTravelerGlobal) * 100)
    : 0;

  // Distancia promedio (km)
  const avgDistanceFiltered =
    filteredTrips && filteredTrips.length
      ? filteredTrips.reduce((acc, t) => acc + (t.distanceKm || 0), 0) / filteredTrips.length
      : 0;
  const avgDistanceGlobal =
    allTrips && allTrips.length
      ? allTrips.reduce((acc, t) => acc + (t.distanceKm || 0), 0) / allTrips.length
      : 0;
  const distanceDiffPct = avgDistanceGlobal
    ? (((avgDistanceFiltered - avgDistanceGlobal) / avgDistanceGlobal) * 100)
    : 0;

  // Personas que no viajan
  const personsWithoutTripsFiltered = filteredPersonsBase.filter(
    (person) => person.noTravelReason
  ).length;
  const personsWithoutTripsGlobal = allPersons.filter(
    (person) => person.noTravelReason
  ).length;
  const personsWithoutTripsDiffPct = personsWithoutTripsGlobal
    ? (((personsWithoutTripsFiltered - personsWithoutTripsGlobal) / personsWithoutTripsGlobal) * 100)
    : 0;

  return (
    <section
      style={{
        marginBottom: 20,
        padding: 16,
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
      }}
    >
      <h3 style={{ marginTop: 0 }}>Cifras generales</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(180px,1fr))", gap: 12 }}>
        <KpiCard
          label="Viajes totales"
          value={(tripsCount || 0).toLocaleString()}
          subLabel={`Base global: ${(totalTrips || 0).toLocaleString()}`}
          headerColor="#E770D3"
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[`${tripsShare || "0.0%"} del total`]}
        />

        <KpiCard
          label="Tiempo promedio"
          value={`${avgDurationFiltered ? avgDurationFiltered.toFixed(1) : 0} min`}
          subLabel={avgDurationGlobal ? `Base global: ${avgDurationGlobal.toFixed(1)} min` : "Base global: N/A"}
          headerColor={PRIMARY_GREEN}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[formatDelta(durationDiffPct, "min")]}
        />

        <KpiCard
          label="Viajes por hogar"
          value={tripsPerHouseholdFiltered ? tripsPerHouseholdFiltered.toFixed(2) : "0.00"}
          subLabel={tripsPerHouseholdGlobal ? `Base global: ${tripsPerHouseholdGlobal.toFixed(2)}` : "Base global: N/A"}
          headerColor={SECONDARY_GREEN}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[formatDelta(tripsPerHouseholdDiffPct, "viajes por hogar")]}
        />

        <KpiCard
          label="Vehículos por hogar"
          value={avgVehiclesFiltered ? avgVehiclesFiltered.toFixed(2) : "0.00"}
          subLabel={avgVehiclesGlobal ? `Base global: ${avgVehiclesGlobal.toFixed(2)}` : "Base global: N/A"}
          headerColor="#FF9000"
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[formatDelta(vehiclesDiffPct, "vehículos por hogar")]}
        />

        <KpiCard
          label="Viajes promedio por persona"
          value={avgTripsPerPersonFiltered ? avgTripsPerPersonFiltered.toFixed(2) : "0.00"}
          subLabel={avgTripsPerPersonGlobal ? `Base global: ${avgTripsPerPersonGlobal.toFixed(2)}` : "Base global: N/A"}
          headerColor={TERTIARY_BLUE}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[formatDelta(tripsPerPersonDiffPct, "viajes por persona")]}
        />

        <KpiCard
          label="Viajes promedio por personas que realizan viajes"
          value={avgTripsPerTravelerFiltered ? avgTripsPerTravelerFiltered.toFixed(2) : "0.00"}
          subLabel={avgTripsPerTravelerGlobal ? `Base global: ${avgTripsPerTravelerGlobal.toFixed(2)}` : "Base global: N/A"}
          headerColor={TERTIARY_YELLOW}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[formatDelta(tripsPerTravelerDiffPct, "viajes por viajero")]}
        />

        <KpiCard
          label="Distancia promedio"
          value={`${avgDistanceFiltered ? avgDistanceFiltered.toFixed(1) : "0.0"} km`}
          subLabel={avgDistanceGlobal ? `Base global: ${avgDistanceGlobal.toFixed(1)} km` : "Base global: N/A"}
          headerColor={TERTIARY_ORANGE}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[formatDelta(distanceDiffPct, "km")]}
        />

        <KpiCard
          label="Personas que no viajan"
          value={personsWithoutTripsFiltered.toLocaleString()}
          subLabel={`Base global: ${personsWithoutTripsGlobal.toLocaleString()}`}
          headerColor={PRIMARY_GREEN}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[formatDelta(personsWithoutTripsDiffPct, "no viajantes")]}
        />
      </div>
    </section>
  );
}
