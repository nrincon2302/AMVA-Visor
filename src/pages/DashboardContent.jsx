import React, { useMemo, useRef, useState, useTransition } from "react";
import { useTravelCrossfilterRecharts } from "../hooks/useTravelCrossfilterRecharts";
import FiltersPanel from "./FiltersPanel";
import LoadingOverlay from "../components/LoadingOverlay";
import KpisPanel from "./KpisPanel";
import MapsPanel from "./MapsPanel";
import { COMPARE_COLORS, PRIMARY_GREEN } from "../config/constants";
import AnalysisViewsPanel from "./AnalysisViewsPanel";
import MobilityPatternsPanel from "./MobilityPatternsPanel";
import MobilityIndicatorsPanel from "./MobilityIndicatorsPanel";
import ExportActions from "../components/ExportActions";
import { exportToExcel, exportToPdf } from "../utils/exportUtils";

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
    modeData,
    stageData,
    purposeData,
    noTravelReasonData,
    populationInterestData,
    vehicleTenureData,
    vehicleTypeData,
    vehicleModelData,
    geoHourlyModeData,
    geoDurationHistogramData,
    geoDurationByModeGroupData,
    geoTripsByEstratoData,
    geoVehicleRates,
    macroHeatData,
    isLoading,
    thematicOptions,
    trips,
    households,
    persons,
  } = useTravelCrossfilterRecharts();

  const [activeThematicKey, setActiveThematicKey] = useState("estrato");
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [localSelectedValues, setLocalSelectedValues] = useState(
    thematicOptions.estrato || []
  );
  const [isPending, startTransition] = useTransition();
  const [activeSection, setActiveSection] = useState("stats");
  const dashboardRef = useRef(null);
  const statsSectionRef = useRef(null);
  const indicatorsSectionRef = useRef(null);
  const mapsSectionRef = useRef(null);
  const mobilitySectionRef = useRef(null);
  const viajesSectionRef = useRef(null);
  const vehicularSectionRef = useRef(null);

  const sectionOptions = [
    { key: "stats", label: "Estadísticas generales" },
    { key: "indicators", label: "Indicadores de motorización" },
    { key: "maps", label: "Distribución geográfica" },
    { key: "mobility", label: "Patrones de movilidad" },
    { key: "viajes", label: "Análisis de viajes" },
    { key: "vehicular", label: "Vehículos por hogar" },
  ];

  const sectionRefs = {
    stats: statsSectionRef,
    indicators: indicatorsSectionRef,
    maps: mapsSectionRef,
    mobility: mobilitySectionRef,
    viajes: viajesSectionRef,
    vehicular: vehicularSectionRef,
  };

  const handleSectionChange = (key) => {
    setActiveSection(key);
    const targetRef = sectionRefs[key];
    if (targetRef?.current) {
      targetRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const toLabelRows = (data, labelKey = "label", valueKey = "value") =>
    (data || []).map((item) => ({
      etiqueta: item[labelKey] ?? item.name ?? item[0],
      valor: item[valueKey] ?? item.value ?? item[1],
    }));

  const buildSheets = () => [
    { name: "Modo principal", rows: toLabelRows(modeData) },
    { name: "Motivo de viaje", rows: toLabelRows(purposeData) },
    { name: "Etapas", rows: toLabelRows(stageData) },
    { name: "Motivo de no viaje", rows: toLabelRows(noTravelReasonData) },
    { name: "Tenencia vehicular", rows: toLabelRows(vehicleTenureData) },
    { name: "Tipo de vehículo", rows: toLabelRows(vehicleTypeData) },
    { name: "Modelo de vehículo", rows: toLabelRows(vehicleModelData) },
    { name: "Viajes por estrato", rows: toLabelRows(geoTripsByEstratoData) },
    { name: "Duración viajes", rows: toLabelRows(geoDurationHistogramData) },
    { name: "Distribución horaria", rows: geoHourlyModeData || [] },
    {
      name: "Origen macrozonas",
      rows: (macroHeatData?.origin || []).map((item) => ({
        macrozona: item.name ?? item.zone,
        viajes: item.value ?? item.trips ?? 0,
      })),
    },
    {
      name: "Destino macrozonas",
      rows: (macroHeatData?.destination || []).map((item) => ({
        macrozona: item.name ?? item.zone,
        viajes: item.value ?? item.trips ?? 0,
      })),
    },
  ];

  const handleExportExcel = () => {
    exportToExcel(buildSheets(), "dashboard-amva.xlsx");
  };

  const handleExportPdf = () => {
    if (!dashboardRef.current) return;
    exportToPdf(dashboardRef.current, "Reporte AMVA");
  };

  const thematicConfig = useMemo(
    () => [
      { key: "estrato", label: "Estrato", options: thematicOptions.estrato },
      { key: "ageRange", label: "Edad", options: thematicOptions.ageRange },
      { key: "gender", label: "Género", options: thematicOptions.gender },
      { key: "occupation", label: "Ocupación", options: thematicOptions.occupation },
      { key: "edu", label: "Escolaridad", options: thematicOptions.edu },
      {
        key: "populationInterest",
        label: "Poblaciones de interés",
        options: thematicOptions.populationInterest,
      },
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
          sectionOptions={sectionOptions}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          exportActions={
            <ExportActions
              onExportPdf={handleExportPdf}
              onExportExcel={handleExportExcel}
              isDisabled={isLoading || isPending}
            />
          }
        />

        <div style={{ position: "relative" }} ref={dashboardRef}>
          <LoadingOverlay 
            visible={isPending || isLoading} 
            label={isLoading ? "Cargando datos..." : "Actualizando visualizaciones..."} 
          />
          {/* compute global baselines and pass to KPIs */}
          <div ref={statsSectionRef}>
            <KpisPanel
              filteredTrips={filteredTrips}
              filteredPersons={filteredPersons}
              filteredPersonsBase={filteredPersonsBase}
              filteredHouseholds={filteredHouseholds}
              totalTrips={198_957}
              allTrips={trips}
              allHouseholds={households}
              allPersons={persons}
            />
          </div>
          <div ref={indicatorsSectionRef}>
            <MobilityIndicatorsPanel
              vehicleRates={geoVehicleRates}
              filteredHouseholds={filteredHouseholds}
            />
          </div>
          <div ref={mapsSectionRef}>
            <MapsPanel
              macroHeatData={macroHeatData}
              filteredTrips={filteredTrips}
              filters={filters} // IMPORTANTE: Pasar filters para filtrado por municipio
            />
          </div>
          <div ref={mobilitySectionRef}>
            <MobilityPatternsPanel
              hourlyModeData={geoHourlyModeData}
              durationHistogramData={geoDurationHistogramData}
              durationByModeGroupData={geoDurationByModeGroupData}
              tripsByEstratoData={geoTripsByEstratoData}
            />
          </div>
          <div ref={viajesSectionRef}>
            <AnalysisViewsPanel
              analysisView="viajes"
              isCompareMode={isCompareMode}
              localSelectedValues={localSelectedValues}
              selectedColorMap={selectedColorMap}
              activeThematicKey={activeThematicKey}
              modeData={modeData}
              purposeData={purposeData}
              stageData={stageData}
              noTravelReasonData={noTravelReasonData}
              populationInterestData={populationInterestData}
              vehicleTypeData={vehicleTypeData}
              vehicleModelData={vehicleModelData}
              vehicleTenureData={vehicleTenureData}
              filteredTrips={filteredTrips}
              filteredPersonsBase={filteredPersonsBase}
            />
          </div>
          <div ref={vehicularSectionRef}>
            <AnalysisViewsPanel
              analysisView="vehicular"
              isCompareMode={isCompareMode}
              localSelectedValues={localSelectedValues}
              selectedColorMap={selectedColorMap}
              activeThematicKey={activeThematicKey}
              modeData={modeData}
              purposeData={purposeData}
              stageData={stageData}
              noTravelReasonData={noTravelReasonData}
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
