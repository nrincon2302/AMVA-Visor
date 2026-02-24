import { useState, useEffect } from "react";
import KpiCard from "../components/KpiCard";

export default function KpisPanel({ kpisData, kpisGlobales, isCompareMode, localSelectedValues, selectedColorMap }) {
  const [activeComparisonIndex, setActiveComparisonIndex] = useState(0);

  useEffect(() => {
    if (!localSelectedValues?.length) {
      setActiveComparisonIndex(0);
    } else {
      setActiveComparisonIndex(0);
    }
  }, [localSelectedValues, isCompareMode]);

  const getValue = (id) => {
    const item = kpisData[id];
    if (!item) return 0;

    if (isCompareMode && item.tipo === "comparativo_simple") {
      return item.comparativo[activeComparisonIndex]?.value ?? 0;
    }

    return item?.value ?? 0;
  };

  // Valores dinámicos
  const viajesTotales = Math.round(getValue(1));
  const porcentajeNoViajan = 100 * getValue(2);
  const duracionPromedio = getValue(3);
  const viajesPrivados = Math.round(getValue(4));
  const viajesModoNoMotorizado = Math.round(getValue(5));
  const viajesPublicos = Math.round(getValue(6));
  const viajesPorPersona = getValue(7);
  const viajesPorViajero = getValue(8);

  // Globales (no cambian por comparación)
  const viajesTotalesGlobal = Math.round(kpisGlobales[1]?.value ?? 0);
  const porcentajeNoViajasGlobal = 100 * (kpisGlobales[2]?.value ?? 0);
  const duracionPromedioGlobal = kpisGlobales[3]?.value ?? 0;
  const viajesPrivadosGlobal = Math.round(kpisGlobales[4]?.value ?? 0);
  const viajesNoMotorizadoGlobal = Math.round(kpisGlobales[5]?.value ?? 0);
  const viajesPublicosGlobal = Math.round(kpisGlobales[6]?.value ?? 0);
  const viajesPorPersonaGlobal = kpisGlobales[7]?.value ?? 0;
  const viajesPorViajeroGlobal = kpisGlobales[8]?.value ?? 0;

  const globalLabel = "Estadística global para el Valle de Aburrá";

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

      {isCompareMode && localSelectedValues?.length > 0 && (
        <div style={{
          display: "flex",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap"
        }}>
          {localSelectedValues.map((value, index) => {
            const isActive = index === activeComparisonIndex;

            return (
              <button
                key={value}
                onClick={() => setActiveComparisonIndex(index)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  borderRadius: 20,
                  border: isActive ? "2px solid #1e293b" : "1px solid #cbd5e1",
                  background: isActive ? "#f1f5f9" : "#ffffff",
                  cursor: "pointer",
                  fontWeight: isActive ? 600 : 500,
                  transition: "all 0.2s ease"
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: selectedColorMap?.get(value) || "#999"
                  }}
                />
                {value}
              </button>
            );
          })}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(180px,1fr))",
          gap: 12,
        }}
      >
        <KpiCard
          label={kpisData[1]?.nombre ?? "Viajes totales diarios"}
          value={(viajesTotales || 0).toLocaleString()}
          subLabel={viajesTotales ? `${globalLabel}: ${(viajesTotalesGlobal || 0).toLocaleString()}` : undefined}
          contextLines={viajesTotales ? [formatDelta(viajesTotales, viajesTotalesGlobal, "viajes que el Indicador AMVA")] : []}
        />

        <KpiCard
          label={kpisData[2]?.nombre ?? "% de personas que no viajan"}
          value={`${(porcentajeNoViajan || 0).toFixed(1)}%`}
          subLabel={porcentajeNoViajasGlobal ? `${globalLabel}: ${(porcentajeNoViajasGlobal || 0).toFixed(1)}%` : undefined}
          contextLines={porcentajeNoViajasGlobal ? [formatDelta(porcentajeNoViajan, porcentajeNoViajasGlobal, "personas que el Indicador AMVA")] : []}
        />

        <KpiCard
          label={kpisData[3]?.nombre ?? "Tiempo promedio de viaje (min)"}
          value={`${(duracionPromedio || 0).toFixed(1)} min`}
          subLabel={duracionPromedioGlobal ? `${globalLabel}: ${(duracionPromedioGlobal || 0).toFixed(1)} min` : undefined}
          contextLines={duracionPromedioGlobal ? [formatDelta(duracionPromedio, duracionPromedioGlobal, "minutos que el Indicador AMVA")] : []}
        />

        <KpiCard
          label={kpisData[4]?.nombre ?? "Tamaño promedio del hogar (personas de más de 5 años)"}
          value={`${(viajesPrivados || 0).toLocaleString()}`}
          subLabel={viajesPrivadosGlobal ? `${globalLabel}: ${(viajesPrivadosGlobal || 0).toLocaleString()}` : undefined}
          contextLines={viajesPrivadosGlobal ? [formatDelta(viajesPrivados, viajesPrivadosGlobal, "personas por hogar que el Indicador AMVA")] : []}
        />

        <KpiCard
          label={kpisData[5]?.nombre ?? "Viajes diarios en modos no motorizados"}
          value={(viajesModoNoMotorizado || 0).toLocaleString()}
          subLabel={viajesNoMotorizadoGlobal ? `${globalLabel}: ${(viajesNoMotorizadoGlobal || 0).toLocaleString()}` : undefined}
          contextLines={viajesNoMotorizadoGlobal ? [formatDelta(viajesModoNoMotorizado, viajesNoMotorizadoGlobal, "viajes diarios que el Indicador AMVA")] : []}
        />

        <KpiCard
          label={kpisData[6]?.nombre ?? "Viajes diarios por hogar"}
          value={`${(viajesPublicos || 0).toLocaleString()}`}
          subLabel={`${globalLabel}: ${(viajesPublicosGlobal || 0).toLocaleString()}`}
          contextLines={[formatDelta(viajesPublicos, viajesPublicosGlobal, "viajes por hogar que el Indicador AMVA")]}
        />

        <KpiCard
          label={kpisData[7]?.nombre ?? "Viajes diarios promedio por persona"}
          value={`${(viajesPorPersona || 0).toFixed(2)}`}
          subLabel={`${globalLabel}: ${(viajesPorPersonaGlobal || 0).toFixed(2)}`}
          contextLines={[formatDelta(viajesPorPersona, viajesPorPersonaGlobal, "viajes por persona que el Indicador AMVA")]}
        />

        <KpiCard
          label={kpisData[8]?.nombre ?? "Viajes diarios promedio por personas que realizan viajes"}
          value={`${(viajesPorViajero || 0).toFixed(2)}`}
          subLabel={`${globalLabel}: ${(viajesPorViajeroGlobal || 0).toFixed(2)}`}
          contextLines={[formatDelta(viajesPorViajero, viajesPorViajeroGlobal, "viajes diarios que el Indicador AMVA")]}
        />
      </div>
    </section>
  );
}