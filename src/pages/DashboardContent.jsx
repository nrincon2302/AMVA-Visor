import { useMemo, useRef, useState, useTransition, useEffect } from "react";

import LoadingOverlay from "../components/LoadingOverlay";
import ExportActions from "../components/ExportActions";
import { exportToExcel, exportToPdf } from "../utils/exportUtils";
import { COMPARE_COLORS } from "../config/constants";
import { useTravelDataFromAPI } from "../hooks/useTravelDataFromAPI";

import FiltersPanel from "./FiltersPanel";
import KpisPanel from "./KpisPanel";
import MapsPanel from "./MapsPanel";
import AnalysisViewsPanel from "./AnalysisViewsPanel";
import MobilityPatternsPanel from "./MobilityPatternsPanel";
import MobilityIndicatorsPanel from "./MobilityIndicatorsPanel";


const IND = {
  /* análisis – viajes */
  modo:            "modo_principal",
  motivo:          "motivo_viaje",
  etapas:          "etapas",
  motivoNoViaje:   "motivo_no_viaje",
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
  origenDestino:   "origen_destino"
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
    indicadoresGlobales,
    mobilityPatternsData,
    analysisViewsData,
    detailedData,
    compareMode,
    setCompareMode,
    isLoading,
  } = useTravelDataFromAPI();


  /* ========================================================
   CONSTRUCCIÓN DE LA INTERFAZ Y SU COMPORTAMIENTO
   ======================================================== */
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

  // Mapeo para desplazamiento sobre la página con los botones del índice
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

  // thematicConfig construido desde temas del API
  const thematicConfig = useMemo(
    () => {
      const config = temas.map(({ id, nombre }) => ({
        key:     id,
        label:   nombre,
        options: thematicOptions[id] || [],
      }));
      return config; 
    },
    [temas, thematicOptions]
  );

  // Inicializar activeThematicKey cuando temas llega del backend
  useEffect(() => {
    if (thematicConfig.length && !activeThematicKey) {
      const first = thematicConfig[0];
      setActiveThematicKey(first.key);
      setLocalSelectedValues(first.options);  // UI muestra todos seleccionados
      // IMPORTANTE: también actualizar el tema activo en el hook
      setActiveTema(first.key);
      setTemaValues(first.key, []);
    }
  }, [thematicConfig, activeThematicKey, setActiveTema, setTemaValues]);

  // Sincronizar opciones cuando cambie el tema activo -> Actualiza Metadata
  const activeThematic = thematicConfig.find((t) => t.key === activeThematicKey);
  useEffect(() => {
    if (activeThematic?.options?.length && !compareMode) {
      setLocalSelectedValues(activeThematic.options);
    }
  }, [activeThematic, compareMode]);


  /* =====================================================
   EXTRACCIÓN DE LOS DATOS DE INDICADORES
   =================================================== */
  const ind  = (nombre) => indicadoresData[nombre] ?? [];

  const modeData               = ind(IND.modo);
  const purposeData            = ind(IND.motivo);
  const stageData              = ind(IND.etapas);
  const noTravelReasonData     = ind(IND.motivoNoViaje);
  const vehicleTenureData      = ind(IND.tenencia);
  const vehicleTypeData        = ind(IND.tipoVehiculo);
  const vehicleModelData       = ind(IND.modeloVehiculo);
  const hourlyModeData         = ind(IND.horaria);
  const durationHistogramData  = ind(IND.duracion);
  const origenDestinoData      = ind(IND.origenDestino);

  const pickRange = (source, from, to) =>
    Object.fromEntries(
      Object.entries(source || {})
        .filter(([key]) => {
          const n = Number(key);
          return n >= from && n <= to;
        })
    );

  const kpisGenerales = useMemo(() => {
    return pickRange(indicadoresData, 1, 8);
  }, [indicadoresData]);
  const kpisGlobales = useMemo(() => {
    return pickRange(indicadoresGlobales, 1, 8);
  }, [indicadoresGlobales]);

  const kpisMotorizacion = useMemo(() => {
    return pickRange(indicadoresData, 9, 14);
  }, [indicadoresData]);
  const kpisMotorizacionGlobales = useMemo(() => {
    return pickRange(indicadoresGlobales, 9, 14);
  }, [indicadoresGlobales]);

  /* ========================================================
   FUNCIONES DE APOYO
   ======================================================= */
  const isAllSelected =
    (activeThematic?.options || []).length === (localSelectedValues || []).length;

  const selectedColorMap = useMemo(
    () =>
      new Map(
        (localSelectedValues || []).slice(0, 3).map((v, i) => [v, COMPARE_COLORS[i]])
      ),
    [localSelectedValues]
  );

  // Cambio de tema temático
  const handleThematicKeyChange = (newKey) => {
    const t = thematicConfig.find((c) => c.key === newKey);
    const allOptions = t?.options || [];

    setActiveThematicKey(newKey);
    setLocalSelectedValues(allOptions);  // UI muestra todos seleccionados

    startTransition(() => {
      // Actualizar el tema activo en el backend y en la query
      setActiveTema(newKey);

      // Solo se enviarán detalles cuando el usuario haga toggle de valores
      setTemaValues(newKey, []);
      
      // Si estábamos en modo comparar, salir (volver a modo AGRUPAR)
      if (compareMode) setCompareMode(false);
    });
  };

  // Conmutador entre modos AGRUPAR y COMPARAR
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
        // Cambiar el modo -> Altera el endpoint de consulta
        setCompareMode(true);
        // Actualizar los filtros con los valores seleccionados
        setTemaValues(activeThematicKey, opciones);
      });
    } else {
      // Salir a modo AGRUPAR y mantener los valores seleccionados como están
      startTransition(() => {
        setCompareMode(false);
      });
    }
  };

  // Toggle individual de valor temático
  const toggleThematicValue = (value) => {
    const current = localSelectedValues || [];
    const next    = current.includes(value)
      ? current.filter((x) => x !== value)
      : [...current, value];

    setLocalSelectedValues(next);
    
    // Actualizar los filtros del backend para el endpoint en uso
    startTransition(() => {
      setTemaValues(activeThematicKey, next);
    });
  };


  /* =================================================== 
   CONFIGURACIÓN DE EXPORTABLES
   =================================================== */
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


  /* =======================================================
   RETORNO - RENDERIZACIÓN DEL COMPONENTE
   ======================================================= */
  return (
    <main style={{ width: "100%", maxWidth: 1400, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}>

        {/* Panel de filtros */}
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

        {/* Contenido principal */}
        <div style={{ position: "relative" }} ref={dashboardRef}>
          <LoadingOverlay
            visible={isPending || isLoading}
            label={isLoading ? "Cargando datos…" : "Actualizando visualizaciones…"}
          />

          {/* KPIs generales */}
          <KpisPanel 
            kpisData={kpisGenerales} 
            kpisGlobales={kpisGlobales}
            isCompareMode={compareMode}
            localSelectedValues={localSelectedValues}
            selectedColorMap={selectedColorMap}
          />

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
            />
          </div>

          {/* Patrones de movilidad */}
          <div ref={mobilitySectionRef}>
            <MobilityPatternsPanel
              hourlyModeData={mobilityPatternsData?.hourlyModeData}
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
              detailedData={detailedData}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
