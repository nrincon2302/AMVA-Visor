import React from "react";
import KpiCard from "../components/KpiCard";
import { PRIMARY_GREEN, SECONDARY_GREEN, BANNER_IMAGE_URL } from "../config/constants";

export default function KpisPanel({ filteredTrips = [], filteredPersons = [], filteredHouseholds = [], totalTrips = 0 }) {
  const tripsCount = filteredTrips?.length || 0;
  const personsCount = filteredPersons?.length || 0;
  const householdsCount = filteredHouseholds?.length || 0;

  const tripsShare = totalTrips ? `${((tripsCount / totalTrips) * 100).toFixed(1)}% del total` : null;

  return (
    <section style={{ marginBottom: 20, padding: 16, background: "#fff", borderRadius: 12 }}>
      <h3 style={{ marginTop: 0 }}>Cifras generales</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 12 }}>
        <KpiCard
          label="Viajes totales"
          value={(tripsCount || 0).toLocaleString()}
          subLabel={""}
          headerColor="#E770D3"
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[
            `Base global: ${(totalTrips || 0).toLocaleString()}`,
            `(${tripsShare || "0.0%"})`,
          ]}
        />

        <KpiCard
          label="Tiempo promedio"
          value={(/* placeholder: compute if available */ 0).toLocaleString() + " min"}
          subLabel={"Promedio global: N/A"}
          headerColor={PRIMARY_GREEN}
          bannerImageUrl={BANNER_IMAGE_URL}
        />

        <KpiCard
          label="Viajes por hogar"
          value={(householdsCount ? (tripsCount / householdsCount).toFixed(2) : 0)}
          subLabel={"Promedio filtrado"}
          headerColor={SECONDARY_GREEN}
          bannerImageUrl={BANNER_IMAGE_URL}
        />

        <KpiCard
          label="Vehículos por hogar"
          value={(/* placeholder */ 1.04)}
          subLabel={"Promedio filtrado"}
          headerColor="#FF9000"
          bannerImageUrl={BANNER_IMAGE_URL}
        />
      </div>
    </section>
  );
}
