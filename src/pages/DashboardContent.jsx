import React, { useMemo, useRef, useState, useTransition, useEffect } from "react";
import { useTravelCrossfilterRecharts } from "../hooks/useTravelCrossfilterRecharts";
import FiltersPanel from "./FiltersPanel";
import LoadingOverlay from "../components/LoadingOverlay";
import KpisPanel from "./KpisPanel";
import MapsPanel from "./MapsPanel";
import { COMPARE_COLORS, PRIMARY_GREEN } from "../config/constants";
import AnalysisViewsPanel from "./AnalysisViewsPanel";
import MobilityPatternsPanel from "./MobilityPatternsPanel";
import MobilityIndicatorsPanel from "./MobilityIndicatorsPanel";

export default function DashboardSection() {
  const {
    filters,
    municipios,
    setMunicipio,
    setDestinationMunicipio,
    setThematicValues,
    filteredTrips,
    filteredPersons,
    filteredPersonsBase,
    filteredHouseholds,
    estratoData,
    edadData,
    generoData,
    escolaridadData,
    modeData,
    stageData,
    purposeData,
    noTravelReasonData,
    occupationData,
    populationInterestData,
    vehicleTenureData,
    vehicleTypeData,
    vehicleModelData,
    geoHourlyModeData,
    geoDurationHistogramData,
    geoTripsByEstratoData,
    geoVehicleRates,
    macroHeatData,
    isLoading,
    thematicOptions,
    trips,
    households,
    derivedHouseholds,
    persons,
  } = useTravelCrossfilterRecharts();

  const [activeThematicKey, setActiveThematicKey] = useState("estrato");
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [localSelectedValues, setLocalSelectedValues] = useState(
    thematicOptions.estrato || []
  );
  const [isPending, startTransition] = useTransition();
  const [analysisView, setAnalysisView] = useState("viajes");
  const analysisSectionRef = useRef(null);

  useEffect(() => {
    if (!analysisSectionRef.current) return;
    analysisSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [analysisView]);

  const thematicConfig = useMemo(
    () => [
      { key: "estrato", label: "Estrato", options: thematicOptions.estrato },
      { key: "ageRange", label: "Edad", options: thematicOptions.ageRange },
      { key: "gender", label: "Género", options: thematicOptions.gender },
      { key: "occupation", label: "Ocupación", options: thematicOptions.occupation },
      { key: "edu", label: "Escolaridad", options: thematicOptions.edu },
    ],
    [thematicOptions]
  );

  const activeThematic = thematicConfig.find((t) => t.key === activeThematicKey);

  const isAllSelected =
    (activeThematic?.options || []).length === localSelectedValues.length;

  const selectedColorMap = useMemo(() => {
    return new Map(
      (localSelectedValues || []).slice(0, 3).map((v, i) => [v, COMPARE_COLORS[i]])
    );
  }, [localSelectedValues]);

  const handleThematicKeyChange = (newKey) => {
    setActiveThematicKey(newKey);
    setIsCompareMode(false);
    const newThematic = thematicConfig.find((t) => t.key === newKey);
    const allOptions = newThematic?.options || [];
    setLocalSelectedValues(allOptions);
    startTransition(() => {
      setThematicValues(newKey, allOptions);
    });
  };

  const handleModeChange = (compareMode) => {
    const options = compareMode
      ? (activeThematic?.options || []).slice(0, 3)
      : activeThematic?.options || [];
    startTransition(() => {
      setIsCompareMode(compareMode);
      setLocalSelectedValues(options);
      setThematicValues(activeThematicKey, options);
    });
  };

  const toggleThematicValue = (value) => {
    const current = localSelectedValues || [];
    const exists = current.includes(value);
    const next = exists ? current.filter((x) => x !== value) : [...current, value];
    setLocalSelectedValues(next);
    startTransition(() => setThematicValues(activeThematicKey, next));
  };

  const exportReport = (format) => {
    console.log("Exporting report:", format, { filters });
    alert(`Exportar ${format} (simulado)`);
  };

  return (
    <main style={{ width: "100%", maxWidth: 1400, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>
        <FiltersPanel
          municipios={municipios}
          filters={filters}
          setMunicipio={setMunicipio}
          setDestinationMunicipio={setDestinationMunicipio}
          thematicConfig={thematicConfig}
          activeThematicKey={activeThematicKey}
          handleThematicKeyChange={handleThematicKeyChange}
          activeThematic={activeThematic}
          isAllSelected={isAllSelected}
          SECONDARY_GREEN={PRIMARY_GREEN}
          isCompareMode={isCompareMode}
          onModeChange={handleModeChange}
          localSelectedValues={localSelectedValues}
          toggleThematicValue={toggleThematicValue}
          selectedColorMap={selectedColorMap}
          analysisView={analysisView}
          setAnalysisView={setAnalysisView}
          exportReport={exportReport}
        />

        <div style={{ position: "relative" }}>
          <LoadingOverlay 
            visible={isPending || isLoading} 
            label={isLoading ? "Cargando datos..." : "Actualizando visualizaciones..."} 
          />
          {/* compute global baselines and pass to KPIs */}
          <KpisPanel
            filteredTrips={filteredTrips}
            filteredPersons={filteredPersons}
            filteredPersonsBase={filteredPersonsBase}
            filteredHouseholds={filteredHouseholds}
            totalTrips={trips?.length || 0}
            allTrips={trips}
            allHouseholds={households}
            derivedHouseholds={derivedHouseholds}
            allPersons={persons}
          />
          <MobilityIndicatorsPanel vehicleRates={geoVehicleRates} />
          <MapsPanel
            macroHeatData={macroHeatData}
            filteredTrips={filteredTrips}
            filters={filters} // IMPORTANTE: Pasar filters para filtrado por municipio
          />
          <MobilityPatternsPanel
            hourlyModeData={geoHourlyModeData}
            durationHistogramData={geoDurationHistogramData}
            tripsByEstratoData={geoTripsByEstratoData}
          />
          <div ref={analysisSectionRef}>
            <AnalysisViewsPanel
              analysisView={analysisView}
              isCompareMode={isCompareMode}
              localSelectedValues={localSelectedValues}
              selectedColorMap={selectedColorMap}
              activeThematicKey={activeThematicKey}
              modeData={modeData}
              purposeData={purposeData}
              stageData={stageData}
              estratoData={estratoData}
              edadData={edadData}
              generoData={generoData}
              escolaridadData={escolaridadData}
              occupationData={occupationData}
              noTravelReasonData={noTravelReasonData}
              populationInterestData={populationInterestData}
              vehicleTypeData={vehicleTypeData}
              vehicleModelData={vehicleModelData}
              vehicleTenureData={vehicleTenureData}
              filteredTrips={filteredTrips}
              filteredPersonsBase={filteredPersonsBase}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
