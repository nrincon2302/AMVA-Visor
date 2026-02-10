import { useEffect, useState, useCallback, useMemo } from "react";
import { urls, buildQueryParams, fetchJSON } from "../config/api";

export function useTravelDataFromAPI() {
  /* ═══ metadata ═══════════════════════════════ */
  const [municipios,        setMunicipios]        = useState([]);
  const [temas,             setTemas]             = useState([]); 
  const [temasDetalles,     setTemasDetalles]     = useState({});
  const [indicadorNombres,  setIndicadorNombres]  = useState([]);
  const [metadataLoaded,    setMetadataLoaded]    = useState(false);

  /* ═══ filtros ════════════════════════════════ */
  const [municipio,          setMunicipio]          = useState("AMVA General");
  const [municipio_destino,  setMunicipioDestino]   = useState("AMVA General");
  const [temasFiltros,       _setTemasFiltros]      = useState({});

  /* ═══ datos de indicadores ═══════════════════ */
  const [indicadoresData,  setIndicadoresData]  = useState({});
  const [detailedData,     setDetailedData]     = useState(null);

  /* ═══ estado de carga ════════════════════════ */
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState(null);

  /* ═══ modo comparar ══════════════════════════ */
  const [compareMode,   setCompareMode]   = useState(false);
  const [compareTema,   setCompareTema]   = useState(null);

  // Inicializar compareTema con el primer tema disponible
  useEffect(() => {
    if (temas.length > 0 && !compareTema) {
      const firstTema = temas[0].id;
      setCompareTema(firstTema);
    }
  }, [temas, compareTema]);

  // ── 1. Cargar metadata al montar (municipios, temas, indicadores) ──────────────
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

        // Extraer arrays de las respuestas (pueden venir envueltos en objetos)
        const mArray = municipiosRaw?.municipios ?? municipiosRaw ?? [];
        const tArray = temasRaw?.temas ?? temasRaw ?? [];
        const iArray = indicadoresRaw?.ids_indicadores ?? indicadoresRaw?.indicadores ?? indicadoresRaw ?? []; 

        // normalizar municipios → string[]
        const mList = (Array.isArray(mArray) ? mArray : []).map((m) =>
          typeof m === "string" ? m : (m.nombre ?? m.name ?? m.id)
        );
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

  // ── 1b. Cargar detalles de temas SOLO cuando `temas` ya esté disponible ─────────
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

  // ── query-string derivado ─────────────────────
  // SIEMPRE envía: municipio + tema (el activo en el UI)
  // SIEMPRE envía detalles si el usuario tiene valores seleccionados (independiente del modo)
  const qs = useMemo(
    () => {
      // Validar que tenemos lo mínimo necesario
      if (!municipio || !compareTema) {
        return '';
      }

      const params = {
        municipio,
        tema: compareTema,
      };

      // Agregar detalles si hay valores seleccionados para el tema activo
      // (independiente de si estamos en modo AGRUPAR o COMPARAR)
      const valoresSeleccionados = temasFiltros[compareTema];
      if (Array.isArray(valoresSeleccionados) && valoresSeleccionados.length > 0) {
        params.detalles = valoresSeleccionados;
      } else {
        // sin detalles = todos
      }

      return buildQueryParams(params);
    },
    [municipio, compareTema, temasFiltros]
  );

  // ── 2. Cargar todos los indicadores cuando cambie qs o el modo ─
  useEffect(() => {
    if (!metadataLoaded || !indicadorNombres.length) {
      return;
    }

    // No cargar si no tenemos query string válido (falta municipio o tema)
    if (!qs) {
      return;
    }

    // El modo determina el endpoint para usar
    const urlFn = compareMode ? urls.porDetalle : urls.agregado;

    (async () => {
      setIsLoading(true);
      try {
        const entries = await Promise.all(
          indicadorNombres.map(async (nombre) => {
            try {
              const url = urlFn(nombre) + (qs ? `?${qs}` : "");
              const data = await fetchJSON(url);
              console.log(`Indicador cargado:`, data.datos);
              return [nombre, data];
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
  }, [metadataLoaded, indicadorNombres, qs, compareMode, compareTema]);

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
    detailedData,

    /* estado */
    isLoading,
    error,
  };
}

function buildDetailedData(tema, indicadoresMap) {
  const comparaciones = {};
  comparaciones[tema] = {};

  Object.entries(indicadoresMap).forEach(([nombre, raw]) => {
    if (raw == null) return;
    comparaciones[tema][nombre] = normalizeDetalle(raw);
  });

  return { comparaciones };
}

function normalizeDetalle(raw) {
  // Formato A: objeto plano { grupo: { categoría: valor } }
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw;                       // ya en formato correcto
  }

  // Formato B: array de registros
  if (Array.isArray(raw)) {
    const nested = {};
    raw.forEach((item) => {
      const grupo = String(
        item.grupo ?? item.group ?? item.valor_tema ?? item.thematic_value ?? ""
      );
      const cat = String(
        item.categoria ?? item.category ?? item.label ?? ""
      );
      const val = Number(
        item.valor ?? item.value ?? item.porcentaje ?? 0
      );
      if (!nested[grupo]) nested[grupo] = {};
      nested[grupo][cat] = val;
    });
    return nested;
  }

  return {};
}