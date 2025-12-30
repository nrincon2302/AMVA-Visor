import React from "react";
import KpiCard from "../components/KpiCard";
import {
  PRIMARY_GREEN,
  SECONDARY_GREEN,
  TERTIARY_PINK,
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
  allPersons = [],
}) {
  const GLOBAL_TRIPS_PER_HOUSEHOLD = 118.43;
  const GLOBAL_TRIPS_PER_PERSON = 40.45;
  const GLOBAL_TRIPS_PER_TRAVELER = 40.65;

  const tripsCount = filteredTrips?.length || 0;
  const personsCount = filteredPersons?.length || 0;
  const personsBaseCount = filteredPersonsBase?.length || 0;
  const householdsCount = filteredHouseholds?.length || 0;

  const NON_MOTORIZED_MODES = new Set([
    "Bicicleta propia",
    "Bicicleta pública",
    "Patineta eléctrica",
    "A pie",
  ]);

  const tripsDiffPct = totalTrips ? ((tripsCount / totalTrips) - 1) * 100 : 0;
  const formatDelta = (value, unit) => {
    const pct = Number.isFinite(value) ? value : 0;
    const direction = pct >= 0 ? "más" : "menos";
    return `${Math.abs(pct).toFixed(1)}% ${direction} ${unit} que el Indicador Global`;
  };

  const nonMotorizedTripsFiltered = filteredTrips.filter((trip) =>
    NON_MOTORIZED_MODES.has(trip.mode)
  ).length;
  const nonMotorizedTripsGlobal = allTrips.filter((trip) =>
    NON_MOTORIZED_MODES.has(trip.mode)
  ).length;
  const nonMotorizedTripsDiffPct = nonMotorizedTripsGlobal
    ? ((nonMotorizedTripsFiltered / nonMotorizedTripsGlobal) - 1) * 100
    : 0;

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
  const tripsPerHouseholdDiffPct = GLOBAL_TRIPS_PER_HOUSEHOLD
    ? (((tripsPerHouseholdFiltered - GLOBAL_TRIPS_PER_HOUSEHOLD) / GLOBAL_TRIPS_PER_HOUSEHOLD) * 100)
    : 0;

  // Viajes promedio por persona (incluye quienes no viajan)
  const avgTripsPerPersonFiltered = personsBaseCount ? tripsCount / personsBaseCount : 0;
  const totalPersonsGlobal = allPersons?.length || 0;
  const tripsPerPersonDiffPct = GLOBAL_TRIPS_PER_PERSON
    ? (((avgTripsPerPersonFiltered - GLOBAL_TRIPS_PER_PERSON) / GLOBAL_TRIPS_PER_PERSON) * 100)
    : 0;

  // Viajes promedio por personas que realizan viajes
  const avgTripsPerTravelerFiltered = personsCount ? tripsCount / personsCount : 0;
  const tripsPerTravelerDiffPct = GLOBAL_TRIPS_PER_TRAVELER
    ? (((avgTripsPerTravelerFiltered - GLOBAL_TRIPS_PER_TRAVELER) / GLOBAL_TRIPS_PER_TRAVELER) * 100)
    : 0;

  // Personas que no viajan
  const personsWithoutTripsFiltered = filteredPersonsBase.filter(
    (person) => person.noTravelReason
  ).length;
  const personsWithoutTripsGlobal = allPersons.filter(
    (person) => person.noTravelReason
  ).length;
  const personsWithoutTripsFilteredPct = personsBaseCount
    ? (personsWithoutTripsFiltered / personsBaseCount) * 100
    : 0;
  const personsWithoutTripsGlobalPct = totalPersonsGlobal
    ? (personsWithoutTripsGlobal / totalPersonsGlobal) * 100
    : 0;
  const personsWithoutTripsDiffPct = personsWithoutTripsGlobalPct
    ? (((personsWithoutTripsFilteredPct - personsWithoutTripsGlobalPct) / personsWithoutTripsGlobalPct) * 100)
    : 0;

  // Tamaño promedio del hogar (personas mayores de 5 años)
  const avgHouseholdSizeFiltered = householdsCount
    ? personsBaseCount / householdsCount
    : 0;
  const avgHouseholdSizeGlobal = totalHouseholdsGlobal
    ? totalPersonsGlobal / totalHouseholdsGlobal
    : 0;
  const householdSizeDiffPct = avgHouseholdSizeGlobal
    ? (((avgHouseholdSizeFiltered - avgHouseholdSizeGlobal) / avgHouseholdSizeGlobal) * 100)
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
          label="Viajes totales diarios"
          value={(tripsCount || 0).toLocaleString()}
          subLabel={`${globalLabel}: ${(totalTrips || 0).toLocaleString()}`}
          headerColor={PRIMARY_GREEN}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[formatDelta(tripsDiffPct, "viajes")]}
        />

        <KpiCard
          label="% de personas que no viajan"
          value={`${personsWithoutTripsFilteredPct.toFixed(1)}%`}
          subLabel={`${globalLabel}: ${personsWithoutTripsGlobalPct.toFixed(1)}%`}
          headerColor={TERTIARY_PINK}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[formatDelta(personsWithoutTripsDiffPct, "porcentaje de personas sin viaje")]}
        />

        <KpiCard
          label="Tiempo promedio de viaje (min)"
          value={`${avgDurationFiltered ? avgDurationFiltered.toFixed(1) : 0} min`}
          subLabel={avgDurationGlobal ? `${globalLabel}: ${avgDurationGlobal.toFixed(1)} min` : `${globalLabel}: N/A`}
          headerColor={TERTIARY_BLUE}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[formatDelta(durationDiffPct, "min")]}
        />

        <KpiCard
          label="Tamaño promedio del hogar (personas de más de 5 años)"
          value={avgHouseholdSizeFiltered ? avgHouseholdSizeFiltered.toFixed(2) : "0.00"}
          subLabel={avgHouseholdSizeGlobal ? `${globalLabel}: ${avgHouseholdSizeGlobal.toFixed(2)}` : `${globalLabel}: N/A`}
          headerColor={TERTIARY_ORANGE}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[formatDelta(householdSizeDiffPct, "personas por hogar")]}
        />

        <KpiCard
          label="Viajes diarios en modos no motorizados"
          value={nonMotorizedTripsFiltered.toLocaleString()}
          subLabel={`${globalLabel}: ${nonMotorizedTripsGlobal.toLocaleString()}`}
          headerColor={TERTIARY_BLUE}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[formatDelta(nonMotorizedTripsDiffPct, "viajes no motorizados")]}
        />

        <KpiCard
          label="Viajes diarios por hogar"
          value={tripsPerHouseholdFiltered ? tripsPerHouseholdFiltered.toFixed(2) : "0.00"}
          subLabel={`${globalLabel}: ${GLOBAL_TRIPS_PER_HOUSEHOLD.toFixed(2)}`}
          headerColor={TERTIARY_ORANGE}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[formatDelta(tripsPerHouseholdDiffPct, "viajes por hogar")]}
        />

        <KpiCard
          label="Viajes diarios promedio por persona"
          value={avgTripsPerPersonFiltered ? avgTripsPerPersonFiltered.toFixed(2) : "0.00"}
          subLabel={`${globalLabel}: ${GLOBAL_TRIPS_PER_PERSON.toFixed(2)}`}
          headerColor={PRIMARY_GREEN}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[formatDelta(tripsPerPersonDiffPct, "viajes por persona")]}
        />

        <KpiCard
          label="Viajes diarios promedio por personas que realizan viajes"
          value={avgTripsPerTravelerFiltered ? avgTripsPerTravelerFiltered.toFixed(2) : "0.00"}
          subLabel={`${globalLabel}: ${GLOBAL_TRIPS_PER_TRAVELER.toFixed(2)}`}
          headerColor={TERTIARY_PINK}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[formatDelta(tripsPerTravelerDiffPct, "viajes por viajero")]}
        />
      </div>
    </section>
  );
}
