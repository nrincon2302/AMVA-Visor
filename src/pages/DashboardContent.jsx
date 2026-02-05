import React, { useMemo, useRef, useState, useTransition, useEffect } from "react";
import { useTravelDataFromAPI } from "../hooks/useTravelDataFromAPI";
import FiltersPanel           from "./FiltersPanel";
import LoadingOverlay         from "../components/LoadingOverlay";
import KpisPanel              from "./KpisPanel";
import MapsPanel              from "./MapsPanel";
import { COMPARE_COLORS, PRIMARY_GREEN } from "../config/constants";
import AnalysisViewsPanel     from "./AnalysisViewsPanel";
import MobilityPatternsPanel  from "./MobilityPatternsPanel";
import MobilityIndicatorsPanel from "./MobilityIndicatorsPanel";
import ExportActions          from "../components/ExportActions";
import { exportToExcel, exportToPdf } from "../utils/exportUtils";

// ═══════════════════════════════════════════════════════════
// MAPEO indicador → dato que consume cada componente hijo
// ─────────────────────────────────────────────────────────
// Ajustar los VALUES (strings derecha) al nombre real que
// retorna  GET /api/metadata/indicadores
//
// Los keys de CHARTS_VIAJES y CHARTS_VEHICULAR coinciden con
// el "targetField" que usa buildComparisonSeries en AnalysisViewsPanel.
// ═══════════════════════════════════════════════════════════
const IND = {
  /* análisis – viajes */
  modo:            "modo_principal",
  motivo:          "motivo_viaje",
  etapas:          "etapas",
  motivoNoViaje:   "motivo_no_viaje",
  poblacion:       "poblacion_interes",
  /* análisis – vehicular */
  tenencia:        "tenencia_vehicular",
  tipoVehiculo:    "tipo_vehiculo",
  modeloVehiculo:  "modelo_vehiculo",
  /* patrones de movilidad */
  horaria:         "distribucion_horaria",
  duracion:        "duracion_viaje",
  duracionModo:    "duracion_por_modo",
  frecuencia:      "frecuencia_viaje",
  /* mapas */
  origenDestino:   "origen_destino",
  /* KPIs */
  kpiGeneral:      "kpi_general",
  kpiMotorizacion: "kpi_motorizacion",
};

export default function DashboardSection() {
  const {
    municipios,
    temas,
    thematicOptions,
    filters,
    setMunicipio,
    setDestinationMunicipio,
    setTemaValues,
    setActiveTema,
    indicadoresData,
    detailedData,
    compareMode,
    setCompareMode,
    isLoading,
  } = useTravelDataFromAPI();

  /* ── UI local ──────────────────────────────── */
  const [activeThematicKey,  setActiveThematicKey]  = useState(null);
  const [localSelectedValues, setLocalSelectedValues] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [activeSection, setActiveSection] = useState("stats");

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

  // ── thematicConfig construido desde temas del API ─
  const thematicConfig = useMemo(
    () => {
      const config = temas.map(({ id, nombre }) => ({
        key:     id,
        label:   nombre,
        options: thematicOptions[id] || [],
      }));
      console.log('[DashboardContent] thematicConfig construido:', config);
      console.log('[DashboardContent] thematicOptions:', thematicOptions);
      return config;
    },
    [temas, thematicOptions]
  );

  // Inicializar activeThematicKey cuando temas llega del backend
  useEffect(() => {
    console.log('[DashboardContent] useEffect inicialización:', {
      thematicConfigLength: thematicConfig.length,
      activeThematicKey,
      firstThematic: thematicConfig[0]
    });
    
    if (thematicConfig.length && !activeThematicKey) {
      const first = thematicConfig[0];
      console.log('[DashboardContent] Inicializando con primer tema:', first);
      setActiveThematicKey(first.key);
      setLocalSelectedValues(first.options);  // UI muestra todos seleccionados
      // IMPORTANTE: también actualizar el tema activo en el hook
      setActiveTema(first.key);
      // NO enviar detalles inicialmente ([] = todos)
      setTemaValues(first.key, []);
    }
  }, [thematicConfig, activeThematicKey, setActiveTema, setTemaValues]);

  // Sincronizar opciones cuando cambie el tema activo (ej: metadata se actualiza)
  const activeThematic = thematicConfig.find((t) => t.key === activeThematicKey);
  useEffect(() => {
    console.log('[DashboardContent] useEffect sync opciones:', {
      activeThematic,
      compareMode,
      options: activeThematic?.options
    });
    
    if (activeThematic?.options?.length && !compareMode) {
      console.log('[DashboardContent] Sincronizando localSelectedValues con:', activeThematic.options);
      setLocalSelectedValues(activeThematic.options);
    }
  });

  /* ── extraer datos de indicadores ─────────────
       ind("nombre") retorna la respuesta del backend
       para ese indicador, o un array vacío.        */
  const ind  = (nombre) => indicadoresData[nombre] ?? [];
  const indN = (nombre) => indicadoresData[nombre] ?? null;  // para KPIs (objetos)

  const modeData               = ind(IND.modo);
  const purposeData            = ind(IND.motivo);
  const stageData              = ind(IND.etapas);
  const noTravelReasonData     = ind(IND.motivoNoViaje);
  const populationInterestData = ind(IND.poblacion);
  const vehicleTenureData      = ind(IND.tenencia);
  const vehicleTypeData        = ind(IND.tipoVehiculo);
  const vehicleModelData       = ind(IND.modeloVehiculo);
  const hourlyModeData         = ind(IND.horaria);
  const durationHistogramData  = ind(IND.duracion);
  const durationByModeData     = ind(IND.duracionModo);
  const tripFrequencyData      = ind(IND.frecuencia);
  const origenDestinoData      = ind(IND.origenDestino);
  const kpisData               = indN(IND.kpiGeneral);
  const kpisMotorizacion       = indN(IND.kpiMotorizacion);

  /* ── helpers derivados ────────────────────────  */
  const isAllSelected =
    (activeThematic?.options || []).length === (localSelectedValues || []).length;

  const selectedColorMap = useMemo(
    () =>
      new Map(
        (localSelectedValues || []).slice(0, 3).map((v, i) => [v, COMPARE_COLORS[i]])
      ),
    [localSelectedValues]
  );

  // vehicleRates derivado de kpisMotorizacion (mismo que antes)
  const vehicleRates = kpisMotorizacion || { autos: 0, motos: 0, bicicletas: 0 };

  /* ── cambio de tema temático ──────────────────  */
  const handleThematicKeyChange = (newKey) => {
    const t = thematicConfig.find((c) => c.key === newKey);
    const allOptions = t?.options || [];

    setActiveThematicKey(newKey);
    setLocalSelectedValues(allOptions);  // UI muestra todos seleccionados

    startTransition(() => {
      // IMPORTANTE: actualizar el tema activo en el backend
      // Esto afecta el parámetro "tema" en la query
      setActiveTema(newKey);
      
      // NO enviar detalles al cambiar tema ([] = todos)
      // Solo se enviarán detalles cuando el usuario haga toggle de valores
      setTemaValues(newKey, []);
      
      // Si estábamos en modo comparar, salir (volver a modo AGRUPAR)
      if (compareMode) setCompareMode(false);
    });
  };

  /* ── conmutador AGRUPAR ↔ COMPARAR ──────────── */
  const handleModeChange = (enterCompare) => {
    if (enterCompare) {
      // Entrar a modo COMPARAR
      const current = localSelectedValues || [];
      
      // Si no hay valores seleccionados (todos), tomar los primeros 3 de las opciones
      let opciones;
      if (current.length === 0) {
        opciones = (activeThematic?.options || []).slice(0, 3);
      } else {
        // Limitar a máximo 3 valores si hay más
        opciones = current.length > 3 ? current.slice(0, 3) : current;
      }
      
      setLocalSelectedValues(opciones);
      
      startTransition(() => {
        // Cambiar el modo (afecta el endpoint usado)
        setCompareMode(true);
        // Actualizar los filtros con los valores seleccionados
        // (esto es necesario porque en AGRUPAR podría estar vacío = todos)
        setTemaValues(activeThematicKey, opciones);
      });
    } else {
      // Salir a modo AGRUPAR
      // Mantener los valores seleccionados como están
      startTransition(() => {
        setCompareMode(false);
      });
    }
  };

  /* ── toggle individual de valor temático ─────── */
  const toggleThematicValue = (value) => {
    const current = localSelectedValues || [];
    const next    = current.includes(value)
      ? current.filter((x) => x !== value)
      : [...current, value];

    setLocalSelectedValues(next);
    
    // SIEMPRE actualizar los filtros del backend
    // Los detalles seleccionados afectan el query en ambos modos (AGRUPAR y COMPARAR)
    // La diferencia es solo el endpoint que se usa, no los parámetros
    startTransition(() => {
      setTemaValues(activeThematicKey, next);
    });
  };

  /* ── export ───────────────────────────────────── */
  const toLabelRows = (data, lk = "label", vk = "value") =>
    (data || []).map((item) => ({
      etiqueta: item[lk] ?? item.name ?? "",
      valor:    item[vk] ?? item.value ?? 0,
    }));

  const buildSheets = () => [
    { name: "Modo principal",          rows: toLabelRows(modeData) },
    { name: "Motivo de viaje",         rows: toLabelRows(purposeData) },
    { name: "Etapas",                  rows: toLabelRows(stageData) },
    { name: "Motivo de no viaje",      rows: toLabelRows(noTravelReasonData) },
    { name: "Tenencia vehicular",      rows: toLabelRows(vehicleTenureData) },
    { name: "Tipo de vehículo",        rows: toLabelRows(vehicleTypeData) },
    { name: "Modelo de vehículo",      rows: toLabelRows(vehicleModelData) },
    { name: "Duración viajes",         rows: toLabelRows(durationHistogramData) },
    { name: "Distribución horaria",    rows: hourlyModeData || [] },
    { name: "Origen-Destino",          rows: toLabelRows(origenDestinoData) },
  ];

  const handleExportExcel = () => {
    const d = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    exportToExcel(buildSheets(), `${d}_EncuestasHogares_AMVA2025.xlsx`);
  };
  const handleExportPdf = () => {
    if (!dashboardRef.current) return;
    const d = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    exportToPdf(dashboardRef.current, `${d}_EncuestasHogares_AMVA2025`);
  };

  /* ── render ───────────────────────────────────── */
  return (
    <main style={{ width: "100%", maxWidth: 1400, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>

        {/* ── panel de filtros ── */}
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
          isCompareMode={compareMode}
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

        {/* ── contenido principal ── */}
        <div style={{ position: "relative" }} ref={dashboardRef}>
          <LoadingOverlay
            visible={isPending || isLoading}
            label={isLoading ? "Cargando datos…" : "Actualizando visualizaciones…"}
          />

          {/* KPIs generales */}
          <div ref={statsSectionRef}>
            <KpisPanel kpisData={kpisData} />
          </div>

          {/* Indicadores de motorización */}
          <div ref={indicatorsSectionRef}>
            <MobilityIndicatorsPanel
              vehicleRates={vehicleRates}
              kpisMotorizacion={kpisMotorizacion}
            />
          </div>

          {/* Mapas */}
          <div ref={mapsSectionRef}>
            <MapsPanel
              macroHeatData={origenDestinoData}
              filters={filters}
            />
          </div>

          {/* Patrones de movilidad */}
          <div ref={mobilitySectionRef}>
            <MobilityPatternsPanel
              hourlyModeData={hourlyModeData}
              durationHistogramData={durationHistogramData}
              durationByModeGroupData={durationByModeData}
              tripFrequencyData={tripFrequencyData}
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
              modeData={modeData}
              purposeData={purposeData}
              stageData={stageData}
              noTravelReasonData={noTravelReasonData}
              populationInterestData={populationInterestData}
              vehicleTypeData={vehicleTypeData}
              vehicleModelData={vehicleModelData}
              vehicleTenureData={vehicleTenureData}
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
              modeData={modeData}
              purposeData={purposeData}
              stageData={stageData}
              noTravelReasonData={noTravelReasonData}
              vehicleTypeData={vehicleTypeData}
              vehicleModelData={vehicleModelData}
              vehicleTenureData={vehicleTenureData}
              detailedData={detailedData}
            />
          </div>
        </div>
      </div>
    </main>
  );
}