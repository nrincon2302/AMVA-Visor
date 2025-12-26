import React from "react";
import KpiCard from "../components/KpiCard";
import { PRIMARY_GREEN, SECONDARY_GREEN, BANNER_IMAGE_URL } from "../config/constants";

export default function KpisPanel({
  filteredTrips = [],
  filteredPersons = [],
  filteredHouseholds = [],
  totalTrips = 0,
  allTrips = [],
  allHouseholds = [],
  derivedHouseholds = {},
}) {
  const tripsCount = filteredTrips?.length || 0;
  const personsCount = filteredPersons?.length || 0;
  const householdsCount = filteredHouseholds?.length || 0;

  const tripsShare = totalTrips ? `${((tripsCount / totalTrips) * 100).toFixed(1)}% del total` : null;

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

  return (
    <section style={{ marginBottom: 20, padding: 16, background: "#fff", borderRadius: 12 }}>
      <h3 style={{ marginTop: 0 }}>Cifras generales</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 12 }}>
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
          contextLines={[`Cambio: ${durationDiffPct >= 0 ? "+" : ""}${durationDiffPct.toFixed(1)}%`]}
        />

        <KpiCard
          label="Viajes por hogar"
          value={tripsPerHouseholdFiltered ? tripsPerHouseholdFiltered.toFixed(2) : "0.00"}
          subLabel={tripsPerHouseholdGlobal ? `Base global: ${tripsPerHouseholdGlobal.toFixed(2)}` : "Base global: N/A"}
          headerColor={SECONDARY_GREEN}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[`Cambio: ${tripsPerHouseholdDiffPct >= 0 ? "+" : ""}${tripsPerHouseholdDiffPct.toFixed(1)}%`]}
        />

        <KpiCard
          label="Vehículos por hogar"
          value={avgVehiclesFiltered ? avgVehiclesFiltered.toFixed(2) : "0.00"}
          subLabel={avgVehiclesGlobal ? `Base global: ${avgVehiclesGlobal.toFixed(2)}` : "Base global: N/A"}
          headerColor="#FF9000"
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[`Cambio: ${vehiclesDiffPct >= 0 ? "+" : ""}${vehiclesDiffPct.toFixed(1)}%`]}
        />
      </div>
    </section>
  );
}
