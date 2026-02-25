import { useMemo, useRef, useState, useTransition, useEffect } from "react";

import FilterVeil from "../components/FilterVeil";
import FilterDrawer from "../components/FilterDrawer";
import ExportActions from "../components/ExportActions";
import { generatePdfReport, generateExcelReport } from "../utils/exportUtils";
import { COMPARE_COLORS } from "../config/constants";
import { useTravelDataFromAPI } from "../hooks/useTravelDataFromAPI";

import FiltersPanel from "./FiltersPanel";
import KpisPanel from "./KpisPanel";
import MapsPanel from "./MapsPanel";
import AnalysisViewsPanel from "./AnalysisViewsPanel";
import MobilityPatternsPanel from "./MobilityPatternsPanel";
import MobilityIndicatorsPanel from "./MobilityIndicatorsPanel";

export default function DashboardSection() {
  const {
    municipios,
    temas,
    thematicOptions,
    filters,
    setMunicipio,
    setZona,
    setDestinationMunicipio,
    setTemaValues,
    setActiveTema,
    indicadoresData,
    indicadoresGlobales,
    mobilityPatternsData,
    hourlyModeDatasets,
    analysisViewsData,
    detailedData,
    compareMode,
    setCompareMode,
    metadataLoaded,
    isLoading,
  } = useTravelDataFromAPI();


  /* ========================================================
   CONSTRUCCIÓN DE LA INTERFAZ Y SU COMPORTAMIENTO
   ======================================================== */
  const [activeThematicKey,  setActiveThematicKey]  = useState(null);
  const [localSelectedValues, setLocalSelectedValues] = useState([]);
  const [, startTransition] = useTransition();
  const [activeSection, setActiveSection] = useState("stats");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // useState so flag change triggers re-render
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    if (metadataLoaded && !isLoading && !initialLoadDone) {
      setInitialLoadDone(true);
    }
  }, [metadataLoaded, isLoading, initialLoadDone]);

  // Velo opaco para la carga inicial (sin datos previos)
  const showInitialVeil = !initialLoadDone && isLoading;

  // Velo translúcido: solo cuando isLoading es true después de la carga inicial.
  // No usamos isPending — se activa antes de que React pinte el checkbox.
  const showFilterVeil = initialLoadDone && isLoading;

  // Velo opaco para cambio de modo COMPARAR ↔ AGRUPAR
  // Estrategia: trackeamos la transición isLoading false→true→false
  // usando el valor anterior de isLoading, no el actual.
  const [showModeVeil, setShowModeVeil] = useState(false);
  const prevIsLoadingRef  = useRef(false);
  const modeVeilActiveRef = useRef(false);  // true mientras el veil de modo está activo

  const triggerModeVeil = () => {
    modeVeilActiveRef.current  = true;
    prevIsLoadingRef.current   = false;  // reset — isLoading todavía no subió
    setShowModeVeil(true);
  };

  useEffect(() => {
    const prev = prevIsLoadingRef.current;
    prevIsLoadingRef.current = isLoading;

    if (!modeVeilActiveRef.current) return;

    // Detectar transición true→false (ciclo de carga completado)
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

  const sectionOptions = [
    { key: "stats",      label: "Estadísticas generales" },
    { key: "indicators", label: "Indicadores de motorización" },
    { key: "maps",       label: "Distribución geográfica" },
    { key: "mobility",   label: "Patrones de Movilidad" },
    { key: "viajes",     label: "Características de los viajes" },
    { key: "vehicular",  label: "Vehículos por hogar" },
  ];
  const sectionRefs = {
    stats: statsSectionRef, indicators: indicatorsSectionRef,
    maps: mapsSectionRef,   mobility: mobilitySectionRef,
    viajes: viajesSectionRef, vehicular: vehicularSectionRef,
  };

  const handleSectionChange = (key) => {
    setActiveSection(key);
    sectionRefs[key]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const thematicConfig = useMemo(
    () => temas.map(({ id, nombre }) => ({
      key:     id,
      label:   nombre,
      options: thematicOptions[id] || [],
    })),
    [temas, thematicOptions]
  );

  // Inicializar activeThematicKey cuando temas llega del backend
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
    if (activeThematic?.options?.length && !compareMode) {
      setLocalSelectedValues(activeThematic.options);
    }
  }, [activeThematic, compareMode]);


  /* =====================================================
   EXTRACCIÓN DE LOS DATOS DE INDICADORES
   =================================================== */
  const pickRange = (source, from, to) =>
    Object.fromEntries(
      Object.entries(source || {})
        .filter(([key]) => { const n = Number(key); return n >= from && n <= to; })
    );

  const kpisGenerales         = useMemo(() => pickRange(indicadoresData, 1, 8),        [indicadoresData]);
  const kpisGlobales          = useMemo(() => pickRange(indicadoresGlobales, 1, 8),     [indicadoresGlobales]);
  const kpisMotorizacion      = useMemo(() => pickRange(indicadoresData, 9, 14),        [indicadoresData]);
  const kpisMotorizacionGlobales = useMemo(() => pickRange(indicadoresGlobales, 9, 14), [indicadoresGlobales]);


  /* ========================================================
   FUNCIONES DE APOYO
   ======================================================= */
  // Mapa de colores sin límite de cantidad
  const selectedColorMap = useMemo(
    () =>
      new Map(
        (localSelectedValues || []).map((v, i) => [v, COMPARE_COLORS[i % COMPARE_COLORS.length]])
      ),
    [localSelectedValues]
  );

  // Cambio de tema temático
  const handleThematicKeyChange = (newKey) => {
    const t = thematicConfig.find((c) => c.key === newKey);
    const allOptions = t?.options || [];

    setActiveThematicKey(newKey);
    setLocalSelectedValues(allOptions);

    startTransition(() => {
      setActiveTema(newKey);
      setTemaValues(newKey, []);
      if (compareMode) setCompareMode(false);
    });
  };

  // Conmutador entre modos AGRUPAR y COMPARAR
  // Siempre reinicia a todos los filtros seleccionados y pide datos sin filtrar
  const handleModeChange = (enterCompare) => {
    const allOptions = activeThematic?.options || [];

    // Siempre volver a "todos" al cambiar de modo
    setLocalSelectedValues(allOptions);

    // Velo opaco para el cambio de modo (descarga datos nuevos)
    triggerModeVeil();

    startTransition(() => {
      if (enterCompare) {
        setCompareMode(true);
        // [] = sin filtrar por detalles → el backend devuelve todos
        setTemaValues(activeThematicKey, []);
      } else {
        setCompareMode(false);
        setTemaValues(activeThematicKey, []);
      }
    });
  };

  // Toggle individual — siempre deja mínimo 1 seleccionado
  const toggleThematicValue = (value) => {
    const current = localSelectedValues || [];
    const exists  = current.includes(value);

    // Impedir deseleccionar si es el último
    if (exists && current.length === 1) return;

    const next = exists
      ? current.filter((x) => x !== value)
      : [...current, value];

    setLocalSelectedValues(next);

    startTransition(() => {
      setTemaValues(activeThematicKey, next);
    });
  };

  // Seleccionar todos — conserva el modo actual (AGRUPAR o COMPARAR)
  const handleSelectAll = () => {
    const allOptions = activeThematic?.options || [];
    setLocalSelectedValues(allOptions);

    startTransition(() => {
      // [] significa "todos" para el backend (sin filtrar por detalles)
      setTemaValues(activeThematicKey, []);
      // NO cambiamos compareMode — el usuario permanece en el modo que eligió
    });
  };


  /* =================================================== 
   CONFIGURACIÓN DE EXPORTABLES
   =================================================== */
  const handleExportPdf = () => {
    generatePdfReport({
      filters,
      compareMode,
      selectedValues: localSelectedValues,
      themeName: activeThematic?.label || "N/A",
      indicadoresData,
      analysisViewsData,
      mobilityPatternsData,
    });
  };

  const handleExportExcel = () => {
    generateExcelReport({
      filters,
      compareMode,
      selectedValues: localSelectedValues,
      themeName: activeThematic?.label || "N/A",
      indicadoresData,
      analysisViewsData,
      mobilityPatternsData,
    });
  };


  /* =======================================================
   RETORNO - RENDERIZACIÓN DEL COMPONENTE
   ======================================================= */
  return (
    <main className="dashboard-main" style={{ width: "100%", maxWidth: 1400, margin: "0 auto", padding: 24 }}>
      <div className="dashboard-grid">

        {/* Panel de filtros */}
        <FiltersPanel
          municipios={municipios}
          filters={filters}
          setMunicipio={setMunicipio}
          setZona={setZona}
          setDestinationMunicipio={setDestinationMunicipio}
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

        {/* Contenido principal */}
        <div
          ref={dashboardRef}
          style={{ position: "relative" }}
        >
          {/* Velo de carga unificado
               - opaco: carga inicial o cambio de modo COMPARAR/AGRUPAR
               - translúcido: cambio de filtros de detalle              */}
          <FilterVeil
            visible={showInitialVeil || showModeVeil || showFilterVeil}
            opaque={showInitialVeil || showModeVeil}
          />

          {/* KPIs generales */}
          <div ref={statsSectionRef}>
            <KpisPanel
              kpisData={kpisGenerales}
              kpisGlobales={kpisGlobales}
              isCompareMode={compareMode}
              localSelectedValues={localSelectedValues}
              selectedColorMap={selectedColorMap}
            />
          </div>

          {/* Indicadores de motorización */}
          <div ref={indicatorsSectionRef}>
            <MobilityIndicatorsPanel
              kpisData={kpisMotorizacion}
              kpisGlobales={kpisMotorizacionGlobales}
              isCompareMode={compareMode}
              localSelectedValues={localSelectedValues}
              selectedColorMap={selectedColorMap}
            />
          </div>

          {/* Mapas */}
          <div ref={mapsSectionRef}>
            <MapsPanel
              macroHeatData={indicadoresData?.[15] ?? { data: [] }}
              filters={filters}
              municipios={municipios}
              isCompareMode={compareMode}
              onDestinationMunicipiChange={setDestinationMunicipio}
            />
          </div>

          {/* Patrones de movilidad */}
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

          {/* Análisis – viajes */}
          <div ref={viajesSectionRef}>
            <AnalysisViewsPanel
              analysisView="viajes"
              isCompareMode={compareMode}
              localSelectedValues={localSelectedValues}
              selectedColorMap={selectedColorMap}
              activeThematicKey={activeThematicKey}
              modeData={analysisViewsData?.modeData}
              purposeData={analysisViewsData?.purposeData}
              stageData={analysisViewsData?.stageData}
              noTravelReasonData={analysisViewsData?.noTravelReasonData}
              populationInterestData={analysisViewsData?.populationInterestData}
              vehicleTypeData={analysisViewsData?.vehicleTypeData}
              vehicleModelData={analysisViewsData?.vehicleModelData}
              vehicleTenureData={analysisViewsData?.vehicleTenureData}
              detailedData={detailedData}
            />
          </div>

          {/* Análisis – vehicular */}
          <div ref={vehicularSectionRef}>
            <AnalysisViewsPanel
              analysisView="vehicular"
              isCompareMode={compareMode}
              localSelectedValues={localSelectedValues}
              selectedColorMap={selectedColorMap}
              activeThematicKey={activeThematicKey}
              modeData={analysisViewsData?.modeData}
              purposeData={analysisViewsData?.purposeData}
              stageData={analysisViewsData?.stageData}
              noTravelReasonData={analysisViewsData?.noTravelReasonData}
              vehicleTypeData={analysisViewsData?.vehicleTypeData}
              vehicleModelData={analysisViewsData?.vehicleModelData}
              vehicleTenureData={analysisViewsData?.vehicleTenureData}
              vehicleStratumData={analysisViewsData?.vehicleStratumData}
              detailedData={detailedData}
            />
          </div>
        </div>
      </div>

      {/* ── MÓVIL: Drawer deslizante (reemplaza sidebar) ── */}
      <FilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        municipios={municipios}
        filters={filters}
        setMunicipio={setMunicipio}
        setZona={setZona}
        setDestinationMunicipio={setDestinationMunicipio}
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

      {/* ── MÓVIL: Botón flotante hamburger ── */}
      <button
        className={`filters-fab${isDrawerOpen ? " is-open" : ""}`}
        onClick={() => setIsDrawerOpen((prev) => !prev)}
        aria-label={isDrawerOpen ? "Cerrar filtros" : "Abrir filtros"}
        aria-expanded={isDrawerOpen}
      >
        {isDrawerOpen ? (
          /* X cuando está abierto */
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="4" y1="4" x2="16" y2="16" />
            <line x1="16" y1="4" x2="4" y2="16" />
          </svg>
        ) : (
          /* Hamburger cuando está cerrado */
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="5"  x2="17" y2="5"  />
            <line x1="3" y1="10" x2="17" y2="10" />
            <line x1="3" y1="15" x2="17" y2="15" />
          </svg>
        )}
      </button>
    </main>
  );
}