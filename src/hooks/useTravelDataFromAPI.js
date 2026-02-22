import { useEffect, useState, useCallback, useMemo } from "react";
import { urls, buildQueryParams, fetchJSON } from "../config/api";

export function useTravelDataFromAPI() {
  // Hooks de estado para Metadata
  const [municipios, setMunicipios] = useState([]);
  const [temas, setTemas] = useState([]); 
  const [temasDetalles, setTemasDetalles] = useState({});
  const [indicadorNombres, setIndicadorNombres] = useState([]);
  const [metadataLoaded, setMetadataLoaded] = useState(false);

  // Hooks de estado para Filtros
  const [municipio, setMunicipio] = useState("AMVA General");
  const [municipio_destino, setMunicipioDestino] = useState("AMVA General");
  const [macrozona_origen, setMacrozonaOrigen] = useState("");
  const [macrozona_destino, setMacrozonaDestino] = useState("");
  const [zona, setZona] = useState("");
  const [temasFiltros, _setTemasFiltros] = useState({});

  // Hooks de estado para Indicadores
  const [indicadoresData, setIndicadoresData] = useState({});
  const [indicadoresGlobales, setIndicadoresGlobales] = useState(null);
  const [detailedData, setDetailedData] = useState(null);

  // Hooks de estado para control de la carga
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hooks de estado para control de Modo de Comparación
  const [compareMode,   setCompareMode]   = useState(false);
  const [compareTema,   setCompareTema]   = useState(null);

  // Inicializar compareTema con el primer tema disponible
  useEffect(() => {
    if (temas.length > 0 && !compareTema) {
      const firstTema = temas[0].id;
      setCompareTema(firstTema);
    }
  }, [temas, compareTema]);


  /* ========================================================
   Carga de la metadata al montar la aplicación
   ======================================================== */
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);

        // tres llamadas en paralelo (sin detalles)
        const [municipiosRaw, temasRaw, indicadoresRaw] = await Promise.all([
          fetchJSON(urls.municipios()),
          fetchJSON(urls.temas()),
          fetchJSON(urls.indicadores()),
        ]);

        // Extraer arrays de las respuestas
        const mArray = municipiosRaw?.municipios ?? municipiosRaw ?? [];
        const tArray = temasRaw?.temas ?? temasRaw ?? [];
        const iArray = indicadoresRaw?.ids_indicadores ?? indicadoresRaw?.indicadores ?? indicadoresRaw ?? []; 

        // normalizar municipios → string[]
        const mList = (Array.isArray(mArray) ? mArray : []).map((m) =>
          typeof m === "string" ? m : (m.nombre ?? m.name ?? m.id));
        // Solo agregar "AMVA General" si no viene ya del backend
        const finalMunicipios = mList.includes("AMVA General") 
          ? mList 
          : ["AMVA General", ...mList];
        setMunicipios(finalMunicipios);

        // normalizar indicadores → string[]
        setIndicadorNombres(Array.isArray(iArray) ? iArray : []);

        // normalizar temas → [{ id, nombre }]
        const tNorm = (Array.isArray(tArray) ? tArray : []).map((t) =>
          typeof t === "string"
            ? { id: t, nombre: t }
            : { id: t.id ?? t.nombre, nombre: t.nombre ?? t.id }
        );
        setTemas(tNorm);

        // inicializar filtros VACÍOS (en modo AGRUPAR no se filtran por temas)
        // Solo guardamos la estructura para saber qué temas existen
        const init = {};
        tNorm.forEach(({ id }) => {
          init[id] = [];  // Vacío por defecto
        });
        _setTemasFiltros(init);

      } catch (e) {
        console.error("Error cargando metadata:", e);
        setError(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

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
   Generación del Query String
   ============================================================== */ 
  const qs = useMemo(() => {
    if (!municipio || !compareTema) return "";

    const params = {};

    if (municipio) params.municipio = municipio;
    if (compareTema) params.tema = compareTema;

    const valoresSeleccionados = temasFiltros[compareTema];

    if (Array.isArray(valoresSeleccionados) && valoresSeleccionados.length > 0) {
      params.detalles = valoresSeleccionados.filter(Boolean);
    }

    return buildQueryParams(params);
  }, [municipio, compareTema, temasFiltros]);

  /* =============================================================
   Carga de los datos desde el Backend mediante hook de efecto
   ============================================================== */
  useEffect(() => {
    async function fetchGlobalKpis() {
      const ids = [1,2,3,4,5,6,7,8,9,10,11,12,13,14];

      const entries = await Promise.all(
        ids.map(async (id) => {
          const url = urls.agregado(id);
          const res = await fetchJSON(url);

          const transformed = transformAgregado(res, id);

          return [id, transformed];
        })
      );

      setIndicadoresGlobales(Object.fromEntries(entries));
    }

    fetchGlobalKpis();
  }, []);

  useEffect(() => {
    if (!metadataLoaded || !indicadorNombres.length) return;
    // No cargar si no tenemos query string válido (falta municipio o tema)
    if (!qs) return;

    // El modo determina el endpoint para usar
    const urlFn = compareMode ? urls.porDetalle : urls.agregado;

    (async () => {
      setIsLoading(true);
      try {
        const entries = await Promise.all(
          indicadorNombres.map(async (nombre) => {
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
                : transformAgregado(response, nombre);

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
  }, [metadataLoaded, indicadorNombres, qs, compareMode, compareTema, macrozona_origen, macrozona_destino]);

  // Setters de filtro
  const setDestinationMunicipio = useCallback(
    (val) => setMunicipioDestino(val), []
  );

  // Cambiar los valores seleccionados de un tema
  const setTemaValues = useCallback((temaId, valores) => {
    _setTemasFiltros((prev) => ({ ...prev, [temaId]: valores }));
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

  const mobilityPatternsData = useMemo(() => {
    return buildMobilityPatternsData(indicadoresData);
  }, [indicadoresData]);


  return {
    /* metadata */
    municipios,
    temas,                 // [{ id, nombre }]
    temasDetalles,         // { id → { valores, nombre, … } }
    indicadorNombres,      // string[]  – los IDs disponibles
    thematicOptions,       // { temaId → valores[] }
    metadataLoaded,

    /* filtros */
    filters,
    municipio,
    municipio_destino,
    setMunicipio,
    setDestinationMunicipio,
    temasFiltros,
    setTemaValues,
    setActiveTema,

    /* modo comparar */
    compareMode,
    setCompareMode,
    compareTema,

    /* datos */
    indicadoresData,
    indicadoresGlobales,
    mobilityPatternsData,
    detailedData,

    /* estado */
    isLoading,
    error,
  };
}

function buildDetailedData(tema, indicadoresMap) {
  const comparaciones = {};
  comparaciones[tema] = {};

  Object.entries(indicadoresMap).forEach(([nombre, transformedData]) => {
    if (transformedData == null) return;
    // transformedData ya viene transformado por transformPerDetalle
    // estructura: { "Campo de Gráfica": { "12-17": { valor, count, suma_bases }, ... } }
    comparaciones[tema][nombre] = transformedData;
  });

  return { comparaciones };
}

function transformAgregado(response) {
  if (!response || typeof response !== "object") return null;

  // 🔹 Caso 1: indicador simple → { valor: number }
  if (typeof response.valor === "number") {
    return {
      tipo: "simple",
      value: response.valor,
      nombre: response.nombre,
    };
  }

  // 🔹 Caso 2: indicador agrupado → { grupos: [{ criterio, valor }] }
  if (Array.isArray(response.grupos)) {
    return {
      tipo: "agrupado",
      nombre: response.nombre,
      data: response.grupos.map(g => ({
        label: g.criterio,
        value: g.valor,
      })),
    };
  }

  // 🔹 Caso 3: indicador 15 (matriz OD)
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

  // 🔹 Caso simple → { comparativo: [{ detalle, valor }] }
  if (Array.isArray(response.comparativo)) {
    return {
      tipo: "comparativo_simple",
      nombre: response.nombre,
      data: response.comparativo.map(d => ({
        label: d.detalle,
        value: d.valor,
      })),
    };
  }

  // 🔹 Caso agrupado → { grupos: [{ grupo, comparativo: [...] }] }
  if (Array.isArray(response.grupos)) {
    return {
      tipo: "comparativo_agrupado",
      nombre: response.nombre,
      data: response.grupos.map(g => ({
        grupo: g.grupo,
        data: g.comparativo.map(d => ({
          label: d.detalle,
          value: d.valor,
        })),
      })),
    };
  }

  // 🔹 Caso especial indicador 15 → devuelve matriz igual que /agregado
  if (Array.isArray(response.matriz)) {
    return {
      tipo: "matriz",
      nombre: response.nombre,
      data: response.matriz,
    };
  }

  return null;
}

/* ============================================================
   BUILD MOBILITY PATTERNS DATA (Indicadores 16–26)
============================================================ */

function buildMobilityPatternsData(indicadoresData) {
  if (!indicadoresData) return null;

  /* =============================
    HOURLY SERIES (16–19)
  ============================= */
  const ind16 = indicadoresData[16];
  const ind17 = indicadoresData[17];
  const ind18 = indicadoresData[18];
  const ind19 = indicadoresData[19];

  let hourlyModeData = [];

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
    durationHistogramData,
    tripFrequencyData,
    tripsByEstratoData,
    durationByModeGroupData,
  };
}