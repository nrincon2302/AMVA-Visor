import { useEffect, useState, useCallback, useMemo } from "react";
import { urls, buildQueryParams, fetchJSON } from "../config/api";

export function useTravelDataFromAPI() {
  // Hooks de estado para Metadata
  const [municipios, setMunicipios] = useState([]);
  const [temas, setTemas] = useState([]); 
  const [temasDetalles, setTemasDetalles] = useState({});
  const [indicadorIds, setIndicadorIds] = useState([]);
  const [metadataLoaded, setMetadataLoaded] = useState(false);

  // Hooks de estado para Filtros
  const [municipio, setMunicipio] = useState("AMVA General");
  const [municipio_destino, setMunicipioDestino] = useState("AMVA General");
  const [macrozona_origen, setMacrozonaOrigen] = useState("");
  const [macrozona_destino, setMacrozonaDestino] = useState("");
  const [zona, setZona] = useState("");
  const [temasFiltros, setTemasFiltros] = useState({});

  // Hooks de estado para Indicadores
  const [indicadoresData, setIndicadoresData] = useState({});
  const [indicadoresGlobales, setIndicadoresGlobales] = useState(null);
  const [detailedData, setDetailedData] = useState(null);

  // Hooks de estado para control de la carga
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hooks de estado para control de Modo de Comparación
  const [compareMode, setCompareMode] = useState(false);
  const [compareTema, setCompareTema] = useState(null);


  /* ========================================================
   Carga de la metadata al montar la aplicación
   ======================================================== */
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);

        const [municipiosRaw, temasRaw, indicadoresRaw] = await Promise.all([
          fetchJSON(urls.municipios()),
          fetchJSON(urls.temas()),
          fetchJSON(urls.indicadores()),
        ]);

        const mArray = municipiosRaw?.municipios ?? municipiosRaw ?? [];
        const tArray = temasRaw?.temas ?? temasRaw ?? [];
        const iArray =
          indicadoresRaw?.ids_indicadores ??
          indicadoresRaw?.indicadores ??
          indicadoresRaw ??
          [];

        const mList = (Array.isArray(mArray) ? mArray : []).map((m) =>
          typeof m === "string" ? m : m.nombre ?? m.id
        );

        setMunicipios(
          mList.includes("AMVA General")
            ? mList
            : ["AMVA General", ...mList]
        );

        const temasNorm = (Array.isArray(tArray) ? tArray : []).map((t) =>
          typeof t === "string"
            ? { id: t, nombre: t }
            : { id: t.id ?? t.nombre, nombre: t.nombre ?? t.id }
        );

        setTemas(temasNorm);
        setIndicadorIds(Array.isArray(iArray) ? iArray : []);

        const init = {};
        temasNorm.forEach(({ id }) => (init[id] = []));
        setTemasFiltros(init);

      } catch (e) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Inicializar compareTema con el primer tema disponible
  useEffect(() => {
    if (temas.length && !compareTema) {
      setCompareTema(temas[0].id);
    }
  }, [temas, compareTema]);
  

  /* =============================================================
   Generación del Query String
   ============================================================== */ 
  const qs = useMemo(() => {
    if (!municipio || !compareTema) return "";

    const params = {
      municipio,
      tema: compareTema,
    };

    const valoresSeleccionados = temasFiltros[compareTema];

    if (valoresSeleccionados?.length) {
      params.detalles = valoresSeleccionados;
    }

    return buildQueryParams(params);
  }, [municipio, compareTema, temasFiltros
  ]);

  
  /* =====================================================
   Cargar los detalles de un tema una vez este ya haya cargado
   ===================================================== */
  useEffect(() => {
    if (!temas || temas.length === 0) return;
    let mounted = true;

    (async () => {
      try {
        setIsLoading(true);
        const dets = {};

        await Promise.all(
          temas.map(async ({ id }) => {
            try {
              const detalle = await fetchJSON(urls.detalles(id));

              // Intentar extraer array de valores desde varias formas
              let valores = null;
              if (Array.isArray(detalle)) valores = detalle;
              else if (detalle && typeof detalle === 'object') {
                valores = detalle.valores 
                       ?? detalle.opciones 
                       ?? detalle.options
                       ?? detalle.detalles
                       ?? detalle.data
                       ?? detalle.items;
                if (!valores || !Array.isArray(valores)) {
                  const arrayKey = Object.keys(detalle).find(k => Array.isArray(detalle[k]));
                  if (arrayKey) valores = detalle[arrayKey];
                }
              }

              dets[id] = {
                nombre: id,
                valores: Array.isArray(valores) ? valores : [],
                raw: detalle,
              };
            } catch (err) {
              // Mantener warning para errores de fetch
              console.warn(`detalles no cargado para tema "${id}":`, err);
              dets[id] = { valores: [], nombre: id };
            }
          })
        );

        if (!mounted) return;
        setTemasDetalles(dets);
        setMetadataLoaded(true);
      } catch (e) {
        console.error('Error cargando detalles de temas:', e);
        setError(e);
      } finally {
        setIsLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [temas]);


  /* =============================================================
   Carga de los datos desde el Backend mediante hook de efecto
   ============================================================== */
  useEffect(() => {
    async function fetchGlobalKpis() {
      const ids = [1,2,3,4,5,6,7,8,9,10,11,12,13,14];

      try {
        const entries = await Promise.all(
          ids.map(async (id) => {
            const res = await fetchJSON(urls.agregado(id));
            return [id, transformAgregado(res)];
          })
        );

        setIndicadoresGlobales(Object.fromEntries(entries));
      } catch (e) {
        console.error("Error cargando KPIs globales:", e);
      }
    }

    fetchGlobalKpis();
  }, []);

  useEffect(() => {
    if (!metadataLoaded || !indicadorIds.length) return;
    // No cargar si no tenemos query string válido (falta municipio o tema)
    if (!qs) return;

    // El modo determina el endpoint para usar
    const urlFn = compareMode ? urls.porDetalle : urls.agregado;

    (async () => {
      setIsLoading(true);
      try {
        const entries = await Promise.all(
          indicadorIds.map(async (nombre) => {
            try {
              let finalQs = qs;

              // CASO ESPECIAL: Indicador 15 susceptible a macrozona_origen y macrozona_destino
              if (nombre === 15 || nombre === "15") {
                const extraParams = {};

                if (macrozona_origen) extraParams.origen = macrozona_origen;
                if (macrozona_destino) extraParams.destino = macrozona_destino;

                const extraQs = buildQueryParams(extraParams);
                if (extraQs) finalQs = finalQs ? `${finalQs}&${extraQs}` : extraQs;
              }

              const url = urlFn(nombre) + (finalQs ? `?${finalQs}` : "");
              const response = await fetchJSON(url);

              const transformedData = compareMode
                ? transformPerDetalle(response, nombre)
                : transformAgregado(response);

              return [nombre, transformedData];
            } catch (e) {
              console.error(`fetch indicador "${nombre}" (${compareMode ? "por-detalle" : "agregado"}) fallido:`, e);
              return [nombre, null];
            }
          })
        );

        const map = Object.fromEntries(entries);
        setIndicadoresData(map);

        // Si estamos en modo comparar, construir la estructura que
        // espera AnalysisViewsPanel → detailedData.comparaciones[tema][indicador]
        const detailed = compareMode && compareTema
          ? buildDetailedData(compareTema, map)
          : null;
        
        setDetailedData(detailed);
      } catch (e) {
        console.error("Error cargando indicadores:", e);
        setError(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [metadataLoaded, indicadorIds, qs, compareMode, compareTema, macrozona_origen, macrozona_destino]);


  /* =============================================================
    Herramientas y callbacks de apoyo
  ============================================================= */
  // Setters de filtro
  const setDestinationMunicipio = useCallback(
    (val) => setMunicipioDestino(val), []
  );

  // Cambiar los valores seleccionados de un tema
  const setTemaValues = useCallback((temaId, valores) => {
    setTemasFiltros((prev) => ({ ...prev, [temaId]: valores }));
  }, []);

  // Cambiar el tema activo (siempre actualiza compareTema para que el query tenga tema)
  const setActiveTema = useCallback((temaId) => {
    setCompareTema(temaId);
  }, []);

  const thematicOptions = useMemo(() => {
    const out = {};
    temas.forEach(({ id }) => {
      const det = temasDetalles[id] || {};
      out[id] = det.valores || [];
    });
    return out;
  }, [temas, temasDetalles]);

  const filters = useMemo(() => ({
    municipio,
    destinationMunicipio: municipio_destino,
    municipio_destino,
    thematicFilters: temasFiltros,
    temasFiltros,
  }), [municipio, municipio_destino, temasFiltros]);


  /* =============================================================
     NORMALIZAR PARA KPI Y DASH
  ============================================================= */
  const activeDetail =
    compareMode && temasFiltros[compareTema]?.length
      ? temasFiltros[compareTema][0]
      : null;

  const normalizedIndicadores = useMemo(() => {
    if (!compareMode || !activeDetail) return indicadoresData;

    const out = {};

    Object.entries(indicadoresData).forEach(([id, ind]) => {
      if (!ind) {
        out[id] = null;
        return;
      }

      // Comparativo simple → convertir a simple
      if (ind.tipo === "comparativo_simple") {
        const found = ind.comparativo.find(
          (d) => String(d.detalle) === String(activeDetail)
        );

        out[id] = {
          tipo: "simple",
          nombre: ind.nombre,
          value: found?.value ?? 0,
        };
        return;
      }

      // Comparativo agrupado → convertir a agrupado
      if (ind.tipo === "comparativo_agrupado") {
        out[id] = {
          tipo: "agrupado",
          nombre: ind.nombre,
          data: ind.grupos.map((g) => {
            const found = g.comparativo.find(
              (d) => String(d.detalle) === String(activeDetail)
            );

            return {
              label: g.grupo,
              value: found?.value ?? 0,
            };
          }),
        };
        return;
      }

      // Si no es comparativo, dejar igual
      out[id] = ind;
    });

    return out;
  }, [indicadoresData, compareMode, activeDetail]);


  /* =============================================================
     DATA DERIVADA
  ============================================================= */
  const mobilityPatternsData = useMemo(
    () => buildMobilityPatternsData(
      compareMode ? indicadoresData : normalizedIndicadores,
      compareMode
    ),
    [indicadoresData, normalizedIndicadores, compareMode]
  );

  // Extraer hourlyModeDatasets si están disponibles
  const hourlyModeDatasets = mobilityPatternsData?.hourlyModeDatasets || null;

  const analysisViewsData = useMemo(
    () => buildAnalysisViewsData(normalizedIndicadores),
    [normalizedIndicadores]
  );


  return {
    municipios,
    temas,
    temasDetalles,
    indicadorIds,
    thematicOptions,
    metadataLoaded,

    filters,
    municipio,
    setMunicipio,
    municipio_destino,
    setDestinationMunicipio,
    temasFiltros,
    setTemaValues,
    setActiveTema,

    compareMode,
    setCompareMode,
    compareTema,
    setCompareTema,

    indicadoresData: compareMode ? indicadoresData : normalizedIndicadores,
    indicadoresGlobales,
    detailedData,

    mobilityPatternsData,
    hourlyModeDatasets,
    analysisViewsData,

    isLoading,
    error,
  };
}

function buildDetailedData(tema, indicadoresMap) {
  const comparaciones = { [tema]: {} };

  Object.entries(indicadoresMap).forEach(([id, data]) => {
    if (!data) return;
    comparaciones[tema][id] = data;
  });

  return { comparaciones };
}

function transformAgregado(response) {
  if (!response || typeof response !== "object") return null;

  if (typeof response.valor === "number") {
    return {
      tipo: "simple",
      nombre: response.nombre,
      value: response.valor,
    };
  }

  if (Array.isArray(response.grupos)) {
    return {
      tipo: "agrupado",
      nombre: response.nombre,
      data: response.grupos.map(g => ({
        label: g.criterio ?? g.grupo,
        value: g.valor,
      })),
    };
  }

  if (Array.isArray(response.matriz)) {
    return {
      tipo: "matriz",
      nombre: response.nombre,
      data: response.matriz,
    };
  }

  return null;
}

function transformPerDetalle(response) {
  if (!response || typeof response !== "object") return null;

  // Simple comparativo
  if (Array.isArray(response.comparativo)) {
    return {
      tipo: "comparativo_simple",
      nombre: response.nombre,
      comparativo: response.comparativo.map(d => ({
        detalle: d.detalle,
        value: d.valor,
      })),
    };
  }

  // Agrupado comparativo
  if (Array.isArray(response.grupos)) {
    return {
      tipo: "comparativo_agrupado",
      nombre: response.nombre,
      grupos: response.grupos.map(g => ({
        grupo: g.grupo,
        comparativo: g.comparativo.map(d => ({
          detalle: d.detalle,
          value: d.valor,
        })),
      })),
    };
  }

  if (Array.isArray(response.matriz)) {
    return {
      tipo: "matriz",
      nombre: response.nombre,
      data: response.matriz,
    };
  }

  return null;
}

function buildMobilityPatternsData(indicadoresData, isCompareMode) {
  if (!indicadoresData) return null;

  /* =============================
    HOURLY SERIES (16–19)
  ============================= */
  const ind16 = indicadoresData[16];
  const ind17 = indicadoresData[17];
  const ind18 = indicadoresData[18];
  const ind19 = indicadoresData[19];

  let hourlyModeData = [];
  let hourlyModeDatasets = null;

  // Caso normal: todos agrupados
  if (
    ind16?.tipo === "agrupado" &&
    ind17?.tipo === "agrupado" &&
    ind18?.tipo === "agrupado" &&
    ind19?.tipo === "agrupado"
  ) {
    const baseLabels = ind16.data.map(d => d.label);

    hourlyModeData = baseLabels.map(label => {
      const informalV = Math.round(ind16.data.find(d => d.label === label)?.value) ?? 0;
      const publicV = Math.round(ind17.data.find(d => d.label === label)?.value) ?? 0;
      const privateV = Math.round(ind18.data.find(d => d.label === label)?.value) ?? 0;
      const nonMotorizedV = Math.round(ind19.data.find(d => d.label === label)?.value) ?? 0;

      return {
        hour: label,
        informal: informalV,
        public: publicV,
        private: privateV,
        nonMotorized: nonMotorizedV,
      };
    });
  }
  // Caso comparativo: todos comparativo_agrupado
  else if (
    isCompareMode &&
    ind16?.tipo === "comparativo_agrupado" &&
    ind17?.tipo === "comparativo_agrupado" &&
    ind18?.tipo === "comparativo_agrupado" &&
    ind19?.tipo === "comparativo_agrupado"
  ) {
    // Extraer los detalles únicos de los indicadores
    const detalles = new Set();
    [ind16, ind17, ind18, ind19].forEach(ind => {
      if (ind?.grupos) {
        ind.grupos.forEach(g => {
          g.comparativo?.forEach(d => {
            detalles.add(String(d.detalle));
          });
        });
      }
    });

    // Para cada detalle, construir un dataset
    hourlyModeDatasets = Array.from(detalles).map(detalle => {
      const data = ind16.grupos.map(grupoObj => {
        const grupoLabel = grupoObj.grupo;
        
        const informalComp = ind16.grupos.find(x => x.grupo === grupoLabel)?.comparativo?.find(c => String(c.detalle) === String(detalle));
        const publicComp = ind17.grupos.find(x => x.grupo === grupoLabel)?.comparativo?.find(c => String(c.detalle) === String(detalle));
        const privateComp = ind18.grupos.find(x => x.grupo === grupoLabel)?.comparativo?.find(c => String(c.detalle) === String(detalle));
        const nonMotorizedComp = ind19.grupos.find(x => x.grupo === grupoLabel)?.comparativo?.find(c => String(c.detalle) === String(detalle));

        return {
          hour: grupoLabel,
          informal: Math.round(informalComp?.value ?? 0),
          public: Math.round(publicComp?.value ?? 0),
          private: Math.round(privateComp?.value ?? 0),
          nonMotorized: Math.round(nonMotorizedComp?.value ?? 0),
        };
      });

      return {
        nombre: String(detalle),
        data: data,
      };
    });
  }

  /* =============================
    Indicador 20 (%)
  ============================= */
  const durationHistogramData =
    indicadoresData[20]?.tipo === "agrupado"
      ? indicadoresData[20].data.map(d => ({
          label: d.label,
          value: d.value * 100,
        }))
      : [];

  /* =============================
    Indicador 21 (%)
  ============================= */
  const tripFrequencyData =
    indicadoresData[21]?.tipo === "agrupado"
      ? indicadoresData[21].data.map(d => ({
          label: d.label,
          value: d.value * 100,
        }))
      : [];

  /* =============================
    Indicador 22 (%)
  ============================= */
  const tripsByEstratoData =
    indicadoresData[22]?.tipo === "agrupado"
      ? indicadoresData[22].data.map(d => ({
          label: "Estrato " + d.label,
          value: d.value * 100,
        }))
      : [];

  /* =============================
    Indicadores 23–26 (simples)
  ============================= */
  const labelsDuracionModo = [
    "Transporte público",
    "Transporte privado",
    "Transporte Informal",
    "Modo no motorizado"
  ];

  const idsDuracionModo = [23, 24, 25, 26];

  const durationByModeGroupData = idsDuracionModo.map((id, index) => ({
    label: labelsDuracionModo[index],
    value: indicadoresData[id]?.value ?? 0,
  }));

  return {
    hourlyModeData,
    hourlyModeDatasets,
    durationHistogramData,
    tripFrequencyData,
    tripsByEstratoData,
    durationByModeGroupData,
  };
}

function buildAnalysisViewsData(indicadoresData) {
  if (!indicadoresData) return null;

  const mapAgrupadoPercent = (id) =>
    indicadoresData[id]?.tipo === "agrupado"
      ? indicadoresData[id].data.map(d => ({
          label: d.label,
          value: d.value * 100,
        }))
      : [];

  /* =============================
     VIAJES (27–35)
  ============================= */
  const modeData = mapAgrupadoPercent(27);
  const purposeData = mapAgrupadoPercent(28);
  const stageData = mapAgrupadoPercent(29);
  const noTravelReasonData = mapAgrupadoPercent(30);

  // 31–35 simples (%)
  const populationLabels = [
    "Cuidador",
    "Extranjero (residente permanente)",
    "Madre cabeza de familia",
    "Persona en situación de discapacidad",
    "Ninguna",
  ];

  const populationIds = [31, 32, 33, 34, 35];

  const populationInterestData = populationIds.map((id, index) => ({
    label: populationLabels[index],
    value: (indicadoresData[id]?.value ?? 0) * 100,
  }));

  /* =============================
     VEHICULAR (36–38)
  ============================= */
  const vehicleTypeData = mapAgrupadoPercent(36);
  const vehicleTenureData = mapAgrupadoPercent(37);
  const vehicleModelData = mapAgrupadoPercent(38);

  return {
    modeData,
    purposeData,
    stageData,
    noTravelReasonData,
    populationInterestData,
    vehicleTypeData,
    vehicleTenureData,
    vehicleModelData,
  };
}
