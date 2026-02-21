import KpiCard from "../components/KpiCard";
import {
  PRIMARY_GREEN,
  SECONDARY_GREEN,
  TERTIARY_PINK,
  TERTIARY_ORANGE,
  TERTIARY_BLUE,
  BANNER_IMAGE_URL,
} from "../config/constants";

export default function MobilityIndicatorsPanel({ kpisData, kpisGlobales }) {
  // Obtener los valores
  const totalVehicles = Math.round(kpisData[9]?.value);
  const avgVehiclesPerHousehold = kpisData[10]?.value.toFixed(3);
  const cleanVehiclesPct = 100*kpisData[11]?.value;
  const autos = kpisData[12]?.value.toFixed(2);
  const motos = kpisData[13]?.value.toFixed(2);
  const bicicletas = kpisData[14]?.value.toFixed(2);

  // Si se proporcionan valores globales para comparación, usarlos
  const totalVehiclesGlobal = Math.round(kpisGlobales[9]?.value);
  const avgVehiclesPerHouseholdGlobal = kpisGlobales[10]?.value.toFixed(3);
  const cleanVehiclesPctGlobal = 100*kpisGlobales[11]?.value;
  const autosGlobal = kpisGlobales[12]?.value.toFixed(2);
  const motosGlobal = kpisGlobales[13]?.value.toFixed(2);  
  const bicicletasGlobal = kpisGlobales[14]?.value.toFixed(2);

  const globalLabel = "Estadística global para Valle de Aburrá";

  const formatDelta = (filtrado, global, unit) => {
    if (!global || global === 0) return "N/A";
    const pct = ((filtrado - global) / global) * 100;
    const direction = pct >= 0 ? "más" : "menos";
    return `${Math.abs(pct).toFixed(1)}% ${direction} ${unit}`;
  };

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
      <h3 style={{ marginTop: 0 }}>Indicadores de motorización</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(180px, 1fr))", gap: 12 }}>
        <KpiCard
          label={kpisData[9]?.nombre ?? "Número total de vehículos propios (toda tipología)"}
          value={totalVehicles.toLocaleString()}
          subLabel={totalVehicles ? `${globalLabel}: ${(totalVehiclesGlobal || 0).toLocaleString()}` : undefined}
          headerColor={PRIMARY_GREEN}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={totalVehicles ? [formatDelta(totalVehicles, totalVehiclesGlobal, "vehículos propios")] : []}
        />
        <KpiCard
          label={kpisData[10]?.nombre ?? "Número promedio de vehículos por hogar"}
          value={`${avgVehiclesPerHousehold}`}
          subLabel={avgVehiclesPerHousehold ? `${globalLabel}: ${(avgVehiclesPerHouseholdGlobal || 0).toLocaleString()}` : undefined}
          headerColor={TERTIARY_PINK}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={avgVehiclesPerHousehold ? [formatDelta(avgVehiclesPerHousehold, avgVehiclesPerHouseholdGlobal, "vehículos por hogar")] : []}
        />
        <KpiCard
          label={kpisData[11]?.nombre ?? "% de vehículos que operan con tecnologías limpias"}
          value={`${cleanVehiclesPct.toFixed(2)}%`}
          subLabel={cleanVehiclesPct ? `${globalLabel}: ${(cleanVehiclesPctGlobal || 0).toLocaleString()}` : undefined}
          headerColor={TERTIARY_BLUE}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={cleanVehiclesPct ? [formatDelta(cleanVehiclesPct, cleanVehiclesPctGlobal, "vehículos limpios")] : []}
        />
        <KpiCard
          label={kpisData[12]?.nombre ?? "Autos por 1000 habitantes"}
          value={autos}
          subLabel={autos ? `${globalLabel}: ${(autosGlobal || 0).toLocaleString()}` : undefined}
          headerColor={TERTIARY_ORANGE}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={autos ? [formatDelta(autos, autosGlobal, "automóviles")] : []}
        />
        <KpiCard
          label={kpisData[13]?.nombre ?? "Motocicletas por 1000 habitantes"}
          value={motos}
          subLabel={motos ? `${globalLabel}: ${(motosGlobal || 0).toLocaleString()}` : undefined}
          headerColor={SECONDARY_GREEN}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={motos ? [formatDelta(motos, motosGlobal, "motocicletas")] : []}
        />
        <KpiCard
          label={kpisData[14]?.nombre ?? "Bicicletas por 1000 habitantes"}
          value={bicicletas}
          subLabel={bicicletas ? `${globalLabel}: ${(bicicletasGlobal || 0).toLocaleString()}` : undefined}
          headerColor={PRIMARY_GREEN}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={bicicletas ? [formatDelta(bicicletas, bicicletasGlobal, "bicicletas")] : []}
        />
      </div>
    </section>
  );
}
