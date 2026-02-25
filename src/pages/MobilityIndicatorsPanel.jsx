import { useState } from "react";
import KpiCard from "../components/KpiCard";
import { formateo } from "../config/constants";

export default function MobilityIndicatorsPanel({ kpisData, kpisGlobales, isCompareMode, localSelectedValues, selectedColorMap }) {
  const [activeComparisonIndex, setActiveComparisonIndex] = useState(0);

  const getValue = (id) => {
    const item = kpisData[id];
    if (!item) return 0;
    if (isCompareMode && item.tipo === "comparativo_simple") {
      return item.comparativo[activeComparisonIndex]?.value ?? 0;
    }
    return item?.value ?? 0;
  };

  const totalVehicles            = Math.round(getValue(9));
  const avgVehiclesPerHousehold  = getValue(10);
  const cleanVehiclesPct         = 100 * getValue(11);
  const autos                    = getValue(12);
  const motos                    = getValue(13);
  const bicicletas               = getValue(14);

  const totalVehiclesGlobal           = Math.round(kpisGlobales[9]?.value ?? 0);
  const avgVehiclesPerHouseholdGlobal = kpisGlobales[10]?.value ?? 0;
  const cleanVehiclesPctGlobal        = 100 * (kpisGlobales[11]?.value ?? 0);
  const autosGlobal                   = kpisGlobales[12]?.value ?? 0;
  const motosGlobal                   = kpisGlobales[13]?.value ?? 0;
  const bicicletasGlobal              = kpisGlobales[14]?.value ?? 0;

  const globalLabel = "Estadística global para el Valle de Aburrá";
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
      <h3 style={{ marginTop: 0 }}>Indicadores de motorización</h3>

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
                }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: selectedColorMap?.get(value) || "#999" }} />
              {value}
              </button>
            );
          })}
        </div>
      )}

      <div className="kpi-grid-3">
        <KpiCard 
          label={kpisData[9]?.nombre ?? "Cantidad total de vehículos propios"} 
          value={formateo(totalVehicles || 0)} 
          subLabel={hasValue(totalVehicles) ? `${globalLabel}: ${formateo(totalVehiclesGlobal || 0)}` : undefined} 
        />
        <KpiCard 
          label={kpisData[10]?.nombre ?? "Cantidad promedio de vehículos por hogar"} 
          value={`${formateo(avgVehiclesPerHousehold || 0)}`} 
          subLabel={hasValue(avgVehiclesPerHousehold) ? `${globalLabel}: ${formateo(avgVehiclesPerHouseholdGlobal || 0)}` : undefined} 
        />
        <KpiCard 
          label={kpisData[11]?.nombre ?? "% de vehículos con tecnologías limpias"} 
          value={`${formateo(cleanVehiclesPct || 0)}%`} 
          subLabel={hasValue(cleanVehiclesPct) ? `${globalLabel}: ${formateo(cleanVehiclesPctGlobal || 0)}%` : undefined} 
        />
        <KpiCard 
          label={kpisData[12]?.nombre ?? "Autos por 1000 habitantes"} 
          value={formateo(autos || 0)} 
          subLabel={hasValue(autos) ? `${globalLabel}: ${formateo(autosGlobal || 0)}` : undefined} 
        />
        <KpiCard 
          label={kpisData[13]?.nombre ?? "Motocicletas por 1000 habitantes"} 
          value={formateo(motos || 0)} 
          subLabel={hasValue(motos) ? `${globalLabel}: ${formateo(motosGlobal || 0)}` : undefined} 
        />
        <KpiCard 
          label={kpisData[14]?.nombre ?? "Bicicletas por 1000 habitantes"} 
          value={formateo(bicicletas || 0)} 
          subLabel={hasValue(bicicletas) ? `${globalLabel}: ${formateo(bicicletasGlobal || 0)}` : undefined} 
        />
      </div>
    </section>
  );
}
