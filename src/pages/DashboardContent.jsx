import { useMemo, useRef, useState, useTransition, useEffect } from "react";
import logoUrl from "../assets/logo-area.png";

import FilterVeil from "../components/FilterVeil";
import ExportActions from "../components/ExportActions";
import { generatePdfReport, generateExcelReport } from "../utils/exportUtils";
import { COMPARE_COLORS } from "../config/constants";
import { getMacroInfo } from "../config/geoLookup";
import { useTravelDataFromAPI } from "../hooks/useTravelDataFromAPI";

import FiltersPanel from "./FiltersPanel";
import KpisPanel from "./KpisPanel";
import MapsPanel from "./MapsPanel";
import AnalysisViewsPanel from "./AnalysisViewsPanel";
import MobilityPatternsPanel from "./MobilityPatternsPanel";
import MobilityIndicatorsPanel from "./MobilityIndicatorsPanel";
import SociodemographicPanel from "./SociodemographicPanel";

export default function DashboardSection() {
  const {
    municipios, temas, thematicOptions, filters,
    setMunicipio, setZona, setMacrozona, macrozonas,
    setTemaValues, setActiveTema,
    indicadoresData, indicadoresGlobales,
    mobilityPatternsData, hourlyModeDatasets, analysisViewsData, detailedData,
    compareMode, setCompareMode,
    metadataLoaded, isLoading,
    origen, destino, toggleOrigen, toggleDestino, setOrigen, setDestino,
  } = useTravelDataFromAPI();

  const hasODFilter = origen !== null || destino !== null;

  const [activeThematicKey,   setActiveThematicKey]  = useState("");
  const [localSelectedValues, setLocalSelectedValues] = useState([]);
  const [, startTransition] = useTransition();
  const [activeSection, setActiveSection] = useState("stats");
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const [originMunicipio,      setOriginMunicipio]      = useState("AMVA General");
  const [destinationMunicipio, setDestinationMunicipio] = useState("AMVA General");
  const [expandedMap, setExpandedMap] = useState(null);

  useEffect(() => {
    if (metadataLoaded && !isLoading && !initialLoadDone) setInitialLoadDone(true);
  }, [metadataLoaded, isLoading, initialLoadDone]);

  const showInitialVeil = !initialLoadDone && isLoading;
  const showFilterVeil  = initialLoadDone && isLoading;

  const [showModeVeil, setShowModeVeil] = useState(false);
  const prevIsLoadingRef  = useRef(false);
  const modeVeilActiveRef = useRef(false);

  const triggerModeVeil = () => {
    modeVeilActiveRef.current = true;
    prevIsLoadingRef.current  = false;
    setShowModeVeil(true);
  };

  useEffect(() => {
    const prev = prevIsLoadingRef.current;
    prevIsLoadingRef.current = isLoading;
    if (!modeVeilActiveRef.current) return;
    if (prev === true && isLoading === false) {
      modeVeilActiveRef.current = false;
      setShowModeVeil(false);
    }
  }, [isLoading]);

  const dashboardRef         = useRef(null);
  const statsSectionRef      = useRef(null);
  const indicatorsSectionRef = useRef(null);
  const mapsSectionRef       = useRef(null);
  const mobilitySectionRef   = useRef(null);
  const viajesSectionRef     = useRef(null);
  const vehicularSectionRef  = useRef(null);
  const sociodemographicSectionRef = useRef(null);

  const sectionOptions = [
    { key: "stats",      label: "Estadísticas generales"       },
    { key: "indicators", label: "Indicadores de motorización"  },
    { key: "maps",       label: "Distribución geográfica"      },
    { key: "mobility",   label: "Patrones de Movilidad"        },
    { key: "viajes",     label: "Características de los viajes"},
    { key: "vehicular",  label: "Vehículos por hogar"          },
    { key: "sociodemographic", label: "Caracterización socioeconómica" },
  ];

  const sectionRefs = {
    stats: statsSectionRef, indicators: indicatorsSectionRef,
    maps: mapsSectionRef,   mobility: mobilitySectionRef,
    viajes: viajesSectionRef, vehicular: vehicularSectionRef,
    sociodemographic: sociodemographicSectionRef,
  };

  const handleSectionChange = (key) => {
    setActiveSection(key);
    sectionRefs[key]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const thematicConfig = useMemo(
    () => temas.map(({ id, nombre }) => ({
      key: id, label: nombre, options: thematicOptions[id] || [],
    })),
    [temas, thematicOptions]
  );

  useEffect(() => {
    if (thematicConfig.length && !activeThematicKey) {
      const first = thematicConfig[0];
      setActiveThematicKey(first.key);
      setLocalSelectedValues(first.options);
      setActiveTema(first.key);
      setTemaValues(first.key, []);
    }
  }, [thematicConfig, activeThematicKey, setActiveTema, setTemaValues]);

  const activeThematic = thematicConfig.find((t) => t.key === activeThematicKey);

  useEffect(() => {
    if (activeThematic?.options?.length && !compareMode)
      setLocalSelectedValues(activeThematic.options);
  }, [activeThematic, compareMode]);

  const pickRange = (source, from, to) =>
    Object.fromEntries(
      Object.entries(source || {})
        .filter(([key]) => { const n = Number(key); return n >= from && n <= to; })
    );

  const kpisGenerales            = useMemo(() => pickRange(indicadoresData, 1, 8),     [indicadoresData]);
  const kpisGlobales             = useMemo(() => pickRange(indicadoresGlobales, 1, 8), [indicadoresGlobales]);
  const kpisMotorizacion         = useMemo(() => pickRange(indicadoresData, 9, 14),    [indicadoresData]);
  const kpisMotorizacionGlobales = useMemo(() => pickRange(indicadoresGlobales, 9, 14),[indicadoresGlobales]);

  const macrozoneExportData = useMemo(() => {
    const matriz = indicadoresData?.[15]?.data || [];
    if (!matriz.length) return { origin: [], destination: [] };
    const originMap = new Map(), destinationMap = new Map();
    matriz.forEach(({ agrupa_mz_origen, agrupa_mz_destino, valor }) => {
      const oid = Number(agrupa_mz_origen), did = Number(agrupa_mz_destino);
      originMap.set(oid, (originMap.get(oid) || 0) + valor);
      destinationMap.set(did, (destinationMap.get(did) || 0) + valor);
    });
    const toArr = (map) =>
      Array.from(map.entries())
        .map(([id, value]) => { const { municipio, macrozona } = getMacroInfo(id); return { id, municipio, macrozona, trips: Math.round(value) }; })
        .sort((a, b) => b.trips - a.trips);
    return { origin: toArr(originMap), destination: toArr(destinationMap) };
  }, [indicadoresData]);

  const selectedColorMap = useMemo(
    () => new Map((localSelectedValues || []).map((v, i) => [v, COMPARE_COLORS[i % COMPARE_COLORS.length]])),
    [localSelectedValues]
  );

  const handleThematicKeyChange = (newKey) => {
    const t = thematicConfig.find((c) => c.key === newKey);
    const allOptions = t?.options || [];
    setActiveThematicKey(newKey);
    setLocalSelectedValues(allOptions);
    startTransition(() => { setActiveTema(newKey); setTemaValues(newKey, []); if (compareMode) setCompareMode(false); });
  };

  const handleModeChange = (enterCompare) => {
    const allOptions = activeThematic?.options || [];
    setLocalSelectedValues(allOptions);
    triggerModeVeil();
    startTransition(() => { setCompareMode(enterCompare); setTemaValues(activeThematicKey, []); });
  };

  const toggleThematicValue = (value) => {
    const current = localSelectedValues || [];
    const exists  = current.includes(value);
    if (exists && current.length === 1) return;
    const next = exists ? current.filter((x) => x !== value) : [...current, value];
    setLocalSelectedValues(next);
    startTransition(() => { setTemaValues(activeThematicKey, next); });
  };

  const handleSelectAll = () => {
    const allOptions = activeThematic?.options || [];
    setLocalSelectedValues(allOptions);
    startTransition(() => { setTemaValues(activeThematicKey, []); });
  };

  const handleOriginSelect = (id) => {
    if (id === null) { setOrigen(null); return; }
    toggleOrigen(id);
  };
  const handleDestinationSelect = (id) => {
    if (id === null) { setDestino(null); return; }
    toggleDestino(id);
  };

  // Export context — includes OD filter info
  const exportCtx = {
    filters,
    origen,
    destino,
    hasODFilter,
    compareMode,
    selectedValues: localSelectedValues,
    themeName: activeThematic?.label || "N/A",
    indicadoresData,
    analysisViewsData,
    mobilityPatternsData,
    macrozoneData: macrozoneExportData,
    logoUrl,
  };
  const handleExportPdf   = () => generatePdfReport(exportCtx);
  const handleExportExcel = () => generateExcelReport(exportCtx);

  return (
    <main className="dashboard-main" style={{ width: "100%", maxWidth: 1400, margin: "0 auto", padding: 24 }}>
      <div className="dashboard-grid">
        <FiltersPanel
          municipios={municipios}
          macrozonas={macrozonas}
          filters={filters}
          setMunicipio={setMunicipio}
          setZona={setZona}
          setMacrozona={setMacrozona}
          thematicConfig={thematicConfig}
          activeThematicKey={activeThematicKey}
          handleThematicKeyChange={handleThematicKeyChange}
          activeThematic={activeThematic}
          isCompareMode={compareMode}
          onModeChange={handleModeChange}
          localSelectedValues={localSelectedValues}
          toggleThematicValue={toggleThematicValue}
          selectedColorMap={selectedColorMap}
          onSelectAll={handleSelectAll}
          sectionOptions={sectionOptions}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          exportActions={
            <ExportActions
              onExportPdf={handleExportPdf}
              onExportExcel={handleExportExcel}
              isDisabled={isLoading}
            />
          }
        />

        <div ref={dashboardRef} style={{ position: "relative" }}>
          <FilterVeil visible={showInitialVeil || showModeVeil || showFilterVeil} opaque={showInitialVeil || showModeVeil} />

          {!compareMode && (
            <div ref={statsSectionRef}>
              <KpisPanel
                kpisData={kpisGenerales}
                kpisGlobales={kpisGlobales}
                isCompareMode={compareMode}
                localSelectedValues={localSelectedValues}
                selectedColorMap={selectedColorMap}
                hasODFilter={hasODFilter}
              />
            </div>
          )}

          {/* Indicadores 9-14 no responden al filtro OD — se ocultan */}
          {!compareMode && !hasODFilter && (
            <div ref={indicatorsSectionRef}>
              <MobilityIndicatorsPanel
                kpisData={kpisMotorizacion}
                kpisGlobales={kpisMotorizacionGlobales}
                isCompareMode={compareMode}
                localSelectedValues={localSelectedValues}
                selectedColorMap={selectedColorMap}
              />
            </div>
          )}

          {!compareMode && (
            <div ref={mapsSectionRef}>
              <MapsPanel
                macroHeatData={indicadoresData?.[15] ?? { data: [] }}
                municipios={municipios}
                isCompareMode={compareMode}
                selectedOrigin={origen}
                selectedDestination={destino}
                onOriginSelect={handleOriginSelect}
                onDestinationSelect={handleDestinationSelect}
                originMunicipio={originMunicipio}
                destinationMunicipio={destinationMunicipio}
                onOriginMunicipioChange={setOriginMunicipio}
                onDestinationMunicipioChange={setDestinationMunicipio}
                expandedMap={expandedMap}
                onExpandedMapChange={setExpandedMap}
              />
            </div>
          )}

          <div ref={mobilitySectionRef}>
            <MobilityPatternsPanel
              isCompareMode={compareMode}
              localSelectedValues={localSelectedValues}
              selectedColorMap={selectedColorMap}
              activeThematicKey={activeThematicKey}
              detailedData={detailedData}
              hourlyModeData={mobilityPatternsData?.hourlyModeData}
              hourlyModeDatasets={hourlyModeDatasets}
              durationHistogramData={mobilityPatternsData?.durationHistogramData}
              tripFrequencyData={mobilityPatternsData?.tripFrequencyData}
              tripsByEstratoData={mobilityPatternsData?.tripsByEstratoData}
              durationByModeGroupData={mobilityPatternsData?.durationByModeGroupData}
            />
          </div>

          {/* Indicadores 27-28 (modo, propósito) responden al filtro OD — visibles.
              Indicadores 29+ (etapas, población, vehículo) no responden — se ocultan. */}
          <div ref={viajesSectionRef}>
            <AnalysisViewsPanel
              analysisView="viajes"
              isCompareMode={compareMode}
              localSelectedValues={localSelectedValues}
              selectedColorMap={selectedColorMap}
              activeThematicKey={activeThematicKey}
              modeData={analysisViewsData?.modeData}
              purposeData={analysisViewsData?.purposeData}
              stageData={!hasODFilter ? analysisViewsData?.stageData : undefined}
              populationInterestData={!hasODFilter ? analysisViewsData?.populationInterestData : undefined}
              vehicleTypeData={!hasODFilter ? analysisViewsData?.vehicleTypeData : undefined}
              vehicleModelData={!hasODFilter ? analysisViewsData?.vehicleModelData : undefined}
              vehicleTenureData={!hasODFilter ? analysisViewsData?.vehicleTenureData : undefined}
              detailedData={detailedData}
              hasODFilter={hasODFilter}
            />
          </div>

          {/* Vehículos por hogar: 36+ — no responde al filtro OD */}
          {!hasODFilter && (
            <div ref={vehicularSectionRef}>
              <AnalysisViewsPanel
                analysisView="vehicular"
                isCompareMode={compareMode}
                localSelectedValues={localSelectedValues}
                selectedColorMap={selectedColorMap}
                activeThematicKey={activeThematicKey}
                vehicleTypeData={analysisViewsData?.vehicleTypeData}
                vehicleModelData={analysisViewsData?.vehicleModelData}
                vehicleTenureData={analysisViewsData?.vehicleTenureData}
                vehicleStratumData={analysisViewsData?.vehicleStratumData}
                detailedData={detailedData}
              />
            </div>
          )}

          {/* Sociodemo 42-45 — no responde al filtro OD */}
          {!hasODFilter && (
            <div ref={sociodemographicSectionRef}>
              <SociodemographicPanel
                isCompareMode={compareMode}
                localSelectedValues={localSelectedValues}
                selectedColorMap={selectedColorMap}
                activeThematicKey={activeThematicKey}
                socioData1={analysisViewsData?.socioData1}
                socioData2={analysisViewsData?.socioData2}
                socioData3={analysisViewsData?.socioData3}
                socioData4={analysisViewsData?.socioData4}
                detailedData={detailedData}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}