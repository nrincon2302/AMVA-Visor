import { useState, useEffect } from "react";
import KpiCard from "../components/KpiCard";
import { formateo } from "../config/constants";

export default function KpisPanel({ kpisData, kpisGlobales, isCompareMode, localSelectedValues, selectedColorMap }) {
  const [activeComparisonIndex, setActiveComparisonIndex] = useState(0);

  useEffect(() => {
    setActiveComparisonIndex(0);
  }, [localSelectedValues, isCompareMode]);

  const getValue = (id) => {
    const item = kpisData[id];
    if (!item) return 0;
    if (isCompareMode && item.tipo === "comparativo_simple") {
      return item.comparativo[activeComparisonIndex]?.value ?? 0;
    }
    return item?.value ?? 0;
  };

  const viajesTotales          = Math.round(getValue(1));
  const porcentajeNoViajan     = 100 * getValue(2);
  const duracionPromedio       = getValue(3);
  const viajesPrivados         = Math.round(getValue(4));
  const viajesModoNoMotorizado = Math.round(getValue(5));
  const viajesPublicos         = Math.round(getValue(6));
  const viajesPorPersona       = getValue(7);
  const viajesPorViajero       = getValue(8);

  const viajesTotalesGlobal        = Math.round(kpisGlobales[1]?.value ?? 0);
  const porcentajeNoViajasGlobal   = 100 * (kpisGlobales[2]?.value ?? 0);
  const duracionPromedioGlobal     = kpisGlobales[3]?.value ?? 0;
  const viajesPrivadosGlobal       = Math.round(kpisGlobales[4]?.value ?? 0);
  const viajesNoMotorizadoGlobal   = Math.round(kpisGlobales[5]?.value ?? 0);
  const viajesPublicosGlobal       = Math.round(kpisGlobales[6]?.value ?? 0);
  const viajesPorPersonaGlobal     = kpisGlobales[7]?.value ?? 0;
  const viajesPorViajeroGlobal     = kpisGlobales[8]?.value ?? 0;

  const globalLabel = "Estadística para el Valle de Aburrá";
  const hasValue = (v) => v !== undefined && v !== null;

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
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
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
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: selectedColorMap?.get(value) || "#999" }} />
                {value}
              </button>
            );
          })}
        </div>
      )}

      <div className="kpi-grid-4">
        <KpiCard 
          label={kpisData[1]?.nombre ?? "Viajes totales diarios"} 
          value={formateo(viajesTotales || 0)} 
          subLabel={hasValue(viajesTotales) ? `${globalLabel}: ${formateo(viajesTotalesGlobal || 0)}` : undefined} 
        />
        <KpiCard 
          label={kpisData[2]?.nombre ?? "% de personas que no viajan"} 
          value={`${formateo(porcentajeNoViajan || 0)}%`} 
          subLabel={hasValue(porcentajeNoViajasGlobal) ? `${globalLabel}: ${formateo(porcentajeNoViajasGlobal || 0)}%` : undefined} 
        />
        <KpiCard 
          label={kpisData[3]?.nombre ?? "Tiempo promedio de viaje (min)"} 
          value={`${formateo(duracionPromedio || 0)} min`} 
          subLabel={hasValue(duracionPromedioGlobal) ? `${globalLabel}: ${formateo(duracionPromedioGlobal || 0)} min` : undefined} 
        />
        <KpiCard 
          label={kpisData[4]?.nombre ?? "Tamaño promedio del hogar"} 
          value={`${formateo(viajesPrivados || 0)}`} 
          subLabel={hasValue(viajesPrivadosGlobal) ? `${globalLabel}: ${formateo(viajesPrivadosGlobal || 0)}` : undefined} 
        />
        <KpiCard 
          label={kpisData[5]?.nombre ?? "Viajes diarios en modos no motorizados"} 
          value={formateo(viajesModoNoMotorizado || 0)} 
          subLabel={hasValue(viajesNoMotorizadoGlobal) ? `${globalLabel}: ${formateo(viajesNoMotorizadoGlobal || 0)}` : undefined} 
        />
        <KpiCard 
          label={kpisData[6]?.nombre ?? "Viajes diarios por hogar"} 
          value={`${formateo(viajesPublicos || 0)}`} 
          subLabel={hasValue(viajesPublicos) ? `${globalLabel}: ${formateo(viajesPublicosGlobal || 0)}` : undefined} 
        />
        <KpiCard 
          label={kpisData[7]?.nombre ?? "Viajes diarios promedio por persona"} 
          value={`${formateo(viajesPorPersona || 0)}`} 
          subLabel={hasValue(viajesPorPersona) ? `${globalLabel}: ${formateo(viajesPorPersonaGlobal || 0)}` : undefined} 
        />
        <KpiCard 
          label={kpisData[8]?.nombre ?? "Viajes diarios promedio por personas que realizan viajes"} 
          value={`${formateo(viajesPorViajero || 0)}`} 
          subLabel={hasValue(viajesPorViajero) ? `${globalLabel}: ${formateo(viajesPorViajeroGlobal || 0)}` : undefined} 
        />
      </div>
    </section>
  );
}
