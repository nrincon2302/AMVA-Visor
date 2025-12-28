import React from "react";
import KpiCard from "../components/KpiCard";
import {
  PRIMARY_GREEN,
  SECONDARY_GREEN,
  TERTIARY_BLUE,
  TERTIARY_ORANGE,
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

  const tripsDiffPct = totalTrips ? ((tripsCount / totalTrips) - 1) * 100 : 0;
  const formatDelta = (value, unit) => {
    const pct = Number.isFinite(value) ? value : 0;
    const direction = pct >= 0 ? "más" : "menos";
    return `${Math.abs(pct).toFixed(1)}% ${direction} ${unit} que el Indicador Global`;
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

  const globalLabel = "Estadística global para Valle de Aburrá";

  return (
    <section
      style={{
        marginBottom: 20,
        padding: 16,
        background: "#ffffff",
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
      }}
    >
      <h3 style={{ marginTop: 0 }}>Estadísticas generales</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(180px,1fr))", gap: 12 }}>
        <KpiCard
          label="Viajes totales"
          value={(tripsCount || 0).toLocaleString()}
          subLabel={`${globalLabel}: ${(totalTrips || 0).toLocaleString()}`}
          headerColor="#E770D3"
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[formatDelta(tripsDiffPct, "viajes")]}
        />

        <KpiCard
          label="Tiempo promedio"
          value={`${avgDurationFiltered ? avgDurationFiltered.toFixed(1) : 0} min`}
          subLabel={avgDurationGlobal ? `${globalLabel}: ${avgDurationGlobal.toFixed(1)} min` : `${globalLabel}: N/A`}
          headerColor={PRIMARY_GREEN}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[formatDelta(durationDiffPct, "min")]}
        />

        <KpiCard
          label="Viajes por hogar"
          value={tripsPerHouseholdFiltered ? tripsPerHouseholdFiltered.toFixed(2) : "0.00"}
          subLabel={tripsPerHouseholdGlobal ? `${globalLabel}: ${tripsPerHouseholdGlobal.toFixed(2)}` : `${globalLabel}: N/A`}
          headerColor={SECONDARY_GREEN}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[formatDelta(tripsPerHouseholdDiffPct, "viajes por hogar")]}
        />

        <KpiCard
          label="Vehículos por hogar"
          value={avgVehiclesFiltered ? avgVehiclesFiltered.toFixed(2) : "0.00"}
          subLabel={avgVehiclesGlobal ? `${globalLabel}: ${avgVehiclesGlobal.toFixed(2)}` : `${globalLabel}: N/A`}
          headerColor="#FF9000"
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[formatDelta(vehiclesDiffPct, "vehículos por hogar")]}
        />

        <KpiCard
          label="Viajes promedio por persona"
          value={avgTripsPerPersonFiltered ? avgTripsPerPersonFiltered.toFixed(2) : "0.00"}
          subLabel={avgTripsPerPersonGlobal ? `${globalLabel}: ${avgTripsPerPersonGlobal.toFixed(2)}` : `${globalLabel}: N/A`}
          headerColor={TERTIARY_BLUE}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[formatDelta(tripsPerPersonDiffPct, "viajes por persona")]}
        />

        <KpiCard
          label="Viajes promedio por personas que realizan viajes"
          value={avgTripsPerTravelerFiltered ? avgTripsPerTravelerFiltered.toFixed(2) : "0.00"}
          subLabel={avgTripsPerTravelerGlobal ? `${globalLabel}: ${avgTripsPerTravelerGlobal.toFixed(2)}` : `${globalLabel}: N/A`}
          headerColor={TERTIARY_ORANGE}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[formatDelta(tripsPerTravelerDiffPct, "viajes por viajero")]}
        />

        <KpiCard
          label="Personas que no viajan"
          value={personsWithoutTripsFiltered.toLocaleString()}
          subLabel={`${globalLabel}: ${personsWithoutTripsGlobal.toLocaleString()}`}
          headerColor={PRIMARY_GREEN}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[formatDelta(personsWithoutTripsDiffPct, "no viajantes")]}
        />
      </div>
    </section>
  );
}
