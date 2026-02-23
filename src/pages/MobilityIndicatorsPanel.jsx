import { useState } from "react";
import KpiCard from "../components/KpiCard";
import {
  PRIMARY_GREEN,
  SECONDARY_GREEN,
  TERTIARY_PINK,
  TERTIARY_ORANGE,
  TERTIARY_BLUE,
  BANNER_IMAGE_URL,
} from "../config/constants";

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

  // Valores dinámicos
  //console.log("Datos en panel de KPIS", kpisData)
  const totalVehicles = Math.round(getValue(9));
  const avgVehiclesPerHousehold = getValue(10);
  const cleanVehiclesPct = 100*getValue(11);
  const autos = getValue(12);
  const motos = getValue(13);
  const bicicletas = getValue(14);

  // Si se proporcionan valores globales para comparación, usarlos
  const totalVehiclesGlobal = Math.round(kpisGlobales[9]?.value ?? 0);
  const avgVehiclesPerHouseholdGlobal = kpisGlobales[10]?.value ?? 0;
  const cleanVehiclesPctGlobal = 100*(kpisGlobales[11]?.value ?? 0);
  const autosGlobal = kpisGlobales[12]?.value ?? 0;
  const motosGlobal = kpisGlobales[13]?.value ?? 0;  
  const bicicletasGlobal = kpisGlobales[14]?.value ?? 0;

  const globalLabel = "Estadística global para Valle de Aburrá";

  const formatDelta = (filtrado, global, unit) => {
    if (!global || global === 0) return "N/A";
    const pct = ((filtrado - global) / global) * 100;
    const direction = pct >= 0 ? "más" : "menos";
    return `${Math.abs(pct).toFixed(1)}% ${direction} ${unit}`;
  };

  const hasValue = (v) => v !== undefined && v !== null; // Maneja cuando vale 0 REAL

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
      ></div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(180px, 1fr))", gap: 12 }}>
        <KpiCard
          label={kpisData[9]?.nombre ?? "Número total de vehículos propios (toda tipología)"}
          value={(totalVehicles || 0).toLocaleString()}
          subLabel={hasValue(totalVehicles) ? `${globalLabel}: ${(totalVehiclesGlobal || 0).toLocaleString()}` : undefined}
          headerColor={PRIMARY_GREEN}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={hasValue(totalVehicles) ? [formatDelta(totalVehicles, totalVehiclesGlobal, "vehículos propios")] : []}
        />
        <KpiCard
          label={kpisData[10]?.nombre ?? "Número promedio de vehículos por hogar"}
          value={`${(avgVehiclesPerHousehold || 0).toFixed(3)}`}
          subLabel={hasValue(avgVehiclesPerHousehold) ? `${globalLabel}: ${(avgVehiclesPerHouseholdGlobal || 0).toFixed(3)}` : undefined}
          headerColor={TERTIARY_PINK}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={hasValue(avgVehiclesPerHousehold) ? [formatDelta(avgVehiclesPerHousehold, avgVehiclesPerHouseholdGlobal, "vehículos por hogar")] : []}
        />
        <KpiCard
          label={kpisData[11]?.nombre ?? "% de vehículos que operan con tecnologías limpias"}
          value={`${cleanVehiclesPct.toFixed(3)}%`}
          subLabel={hasValue(cleanVehiclesPct) ? `${globalLabel}: ${(cleanVehiclesPctGlobal || 0).toFixed(3)}%` : undefined}
          headerColor={TERTIARY_BLUE}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={hasValue(cleanVehiclesPct) ? [formatDelta(cleanVehiclesPct, cleanVehiclesPctGlobal, "vehículos limpios")] : []}
        />
        <KpiCard
          label={kpisData[12]?.nombre ?? "Autos por 1000 habitantes"}
          value={(autos || 0).toFixed(2)}
          subLabel={hasValue(autos) ? `${globalLabel}: ${(autosGlobal || 0).toFixed(2)}` : undefined}
          headerColor={TERTIARY_ORANGE}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={hasValue(autos) ? [formatDelta(autos, autosGlobal, "automóviles")] : []}
        />
        <KpiCard
          label={kpisData[13]?.nombre ?? "Motocicletas por 1000 habitantes"}
          value={(motos || 0).toFixed(2)}
          subLabel={hasValue(motos) ? `${globalLabel}: ${(motosGlobal || 0).toFixed(2)}` : undefined}
          headerColor={SECONDARY_GREEN}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={hasValue(motos) ? [formatDelta(motos, motosGlobal, "motocicletas")] : []}
        />
        <KpiCard
          label={kpisData[14]?.nombre ?? "Bicicletas por 1000 habitantes"}
          value={(bicicletas || 0).toFixed(2)}
          subLabel={hasValue(bicicletas) ? `${globalLabel}: ${(bicicletasGlobal || 0).toFixed(2)}` : undefined}
          headerColor={PRIMARY_GREEN}
          bannerImageUrl={BANNER_IMAGE_URL}
          contextLines={hasValue(bicicletas) ? [formatDelta(bicicletas, bicicletasGlobal, "bicicletas")] : []}
        />
      </div>
    </section>
  );
}
