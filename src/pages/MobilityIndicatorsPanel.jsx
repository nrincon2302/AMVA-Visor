import React from "react";
import KpiCard from "../components/KpiCard";
import { SECONDARY_GREEN, TERTIARY_ORANGE, TERTIARY_BLUE, BANNER_IMAGE_URL } from "../config/constants";

export default function MobilityIndicatorsPanel({ vehicleRates }) {
  const autos = vehicleRates?.autos ?? 0;
  const motos = vehicleRates?.motos ?? 0;
  const bicicletas = vehicleRates?.bicicletas ?? 0;

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
      <h3 style={{ marginTop: 0 }}>Indicadores de motorización</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(180px, 1fr))", gap: 12 }}>
        <KpiCard
          label="Autos por 1000 habitantes"
          value={autos.toFixed(1)}
          headerColor={SECONDARY_GREEN}
          bannerImageUrl={BANNER_IMAGE_URL}
        />
        <KpiCard
          label="Motos por 1000 habitantes"
          value={motos.toFixed(1)}
          headerColor={TERTIARY_ORANGE}
          bannerImageUrl={BANNER_IMAGE_URL}
        />
        <KpiCard
          label="Bicicletas por 1000 habitantes"
          value={bicicletas.toFixed(1)}
          headerColor={TERTIARY_BLUE}
          bannerImageUrl={BANNER_IMAGE_URL}
        />
      </div>
    </section>
  );
}
