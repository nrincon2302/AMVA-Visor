import KpiCard from "../components/KpiCard";
import {
  PRIMARY_GREEN,
  TERTIARY_PINK,
  TERTIARY_BLUE,
  TERTIARY_ORANGE,
  BANNER_IMAGE_URL,
} from "../config/constants";

export default function KpisPanel({ kpisData, kpisGlobales }) {
  // Obtener los valores
  const viajesTotales = Math.round(kpisData[1]?.value);
  const porcentajeNoViajan = 100*kpisData[2]?.value;
  const duracionPromedio = kpisData[3]?.value;
  const tamanoPromedio = kpisData[4]?.value;
  const viajesModoNoMotorizado = Math.round(kpisData[5]?.value);
  const viajesPorHogar = kpisData[6]?.value;
  const viajesPorPersona = kpisData[7]?.value;
  const viajesPorViajero = kpisData[8]?.value;

  // Si se proporcionan valores globales para comparación, usarlos
  const viajesTotalesGlobal = Math.round(kpisGlobales[1]?.value);
  const porcentajeNoViajasGlobal = 100*kpisGlobales[2]?.value;
  const duracionPromedioGlobal = kpisGlobales[3]?.value;
  const tamanoPromedioGlobal = kpisGlobales[4]?.value;
  const viajesNoMotorizadoGlobal = Math.round(kpisGlobales[5]?.value);  
  const viajesPorHogarGlobal = kpisGlobales[6]?.value;
  const viajesPorPersonaGlobal = kpisGlobales[7]?.value;
  const viajesPorViajeroGlobal = kpisGlobales[8]?.value;

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
      <h3 style={{ marginTop: 0 }}>Estadísticas generales</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(180px,1fr))", gap: 12 }}>
        <KpiCard
          label={kpisData[1]?.nombre ?? "Viajes totales diarios"}
          value={(viajesTotales || 0).toLocaleString()}
          subLabel={viajesTotales ? `${globalLabel}: ${(viajesTotalesGlobal || 0).toLocaleString()}` : undefined}
          headerColor={PRIMARY_GREEN}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={viajesTotales ? [formatDelta(viajesTotales, viajesTotalesGlobal, "viajes")] : []}
        />

        <KpiCard
          label={kpisData[2]?.nombre ?? "% de personas que no viajan"}
          value={`${(porcentajeNoViajan || 0).toFixed(1)}%`}
          subLabel={porcentajeNoViajasGlobal ? `${globalLabel}: ${(porcentajeNoViajasGlobal || 0).toFixed(1)}%` : undefined}
          headerColor={TERTIARY_PINK}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={porcentajeNoViajasGlobal ? [formatDelta(porcentajeNoViajan, porcentajeNoViajasGlobal, "personas que no viajan")] : []}
        />

        <KpiCard
          label={kpisData[3]?.nombre ?? "Tiempo promedio de viaje (min)"}
          value={`${(duracionPromedio || 0).toFixed(1)} min`}
          subLabel={duracionPromedioGlobal ? `${globalLabel}: ${(duracionPromedioGlobal || 0).toFixed(1)} min` : undefined}
          headerColor={TERTIARY_BLUE}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={duracionPromedioGlobal ? [formatDelta(duracionPromedio, duracionPromedioGlobal, "minutos")] : []}
        />

        <KpiCard
          label={kpisData[4]?.nombre ?? "Tamaño promedio del hogar (personas de más de 5 años)"}
          value={`${(tamanoPromedio || 0).toFixed(2)}`}
          subLabel={tamanoPromedioGlobal ? `${globalLabel}: ${(tamanoPromedioGlobal || 0).toFixed(2)}` : undefined}
          headerColor={TERTIARY_ORANGE}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={tamanoPromedioGlobal ? [formatDelta(tamanoPromedio, tamanoPromedioGlobal, "personas por hogar")] : []}
        />

        <KpiCard
          label={kpisData[5]?.nombre ?? "Viajes diarios en modos no motorizados"}
          value={(viajesModoNoMotorizado || 0).toLocaleString()}
          subLabel={viajesNoMotorizadoGlobal ? `${globalLabel}: ${(viajesNoMotorizadoGlobal || 0).toLocaleString()}` : undefined}
          headerColor={TERTIARY_BLUE}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={viajesNoMotorizadoGlobal ? [formatDelta(viajesModoNoMotorizado, viajesNoMotorizadoGlobal, "viajes diarios")] : []}
        />

        <KpiCard
          label={kpisData[6]?.nombre ?? "Viajes diarios por hogar"}
          value={`${(viajesPorHogar || 0).toFixed(2)}`}
          subLabel={`${globalLabel}: ${(viajesPorHogarGlobal || 0).toFixed(2)}`}
          headerColor={TERTIARY_ORANGE}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[formatDelta(viajesPorHogar, viajesPorHogarGlobal, "viajes por hogar")]}
        />

        <KpiCard
          label={kpisData[7]?.nombre ?? "Viajes diarios promedio por persona"}
          value={`${(viajesPorPersona || 0).toFixed(2)}`}
          subLabel={`${globalLabel}: ${(viajesPorPersonaGlobal || 0).toFixed(2)}`}
          headerColor={PRIMARY_GREEN}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[formatDelta(viajesPorPersona, viajesPorPersonaGlobal, "viajes por persona")]}
        />

        <KpiCard
          label={kpisData[8]?.nombre ?? "Viajes diarios promedio por personas que realizan viajes"}
          value={`${(viajesPorViajero || 0).toFixed(2)}`}
          subLabel={`${globalLabel}: ${(viajesPorViajeroGlobal || 0).toFixed(2)}`}
          headerColor={TERTIARY_PINK}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={[formatDelta(viajesPorViajero, viajesPorViajeroGlobal, "viajes diarios")]}
        />
      </div>
    </section>
  );
}
