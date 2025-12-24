import React from "react";
import KpiCard from "../components/KpiCard";
import { PRIMARY_GREEN, SECONDARY_GREEN, BANNER_IMAGE_URL } from "../config/constants";

export default function KpisPanel({ filteredTrips = [], filteredPersons = [], filteredHouseholds = [] }) {
  return (
    <section style={{ marginBottom: 20, padding: 16, background: "#fff", borderRadius: 12 }}>
      <h3 style={{ marginTop: 0 }}>Cifras generales</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 12 }}>
        <KpiCard label="Viajes filtrados" value={(filteredTrips?.length || 0).toLocaleString()} subLabel="Viajes (filtrados)" headerColor={PRIMARY_GREEN} bannerImageUrl={BANNER_IMAGE_URL} />
        <KpiCard label="Personas activas" value={(filteredPersons?.length || 0).toLocaleString()} subLabel="Personas con viajes" headerColor={SECONDARY_GREEN} bannerImageUrl={BANNER_IMAGE_URL} />
        <KpiCard label="Hogares activos" value={(filteredHouseholds?.length || 0).toLocaleString()} subLabel="Hogares con viajes" headerColor="#FF9000" bannerImageUrl={BANNER_IMAGE_URL} />
      </div>
    </section>
  );
}
