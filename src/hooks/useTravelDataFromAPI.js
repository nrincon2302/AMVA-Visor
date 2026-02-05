// src/hooks/useTravelDataFromAPI.js
// ─────────────────────────────────────────────
// Hook principal.  Descubre metadata desde el backend,
// carga todos los indicadores en paralelo y expone
// los datos y los controles de filtro que necesitan
// DashboardContent y sus hijos.
// ─────────────────────────────────────────────
import { useEffect, useState, useCallback, useMemo } from "react";
import { urls, buildQueryParams, fetchJSON } from "../config/api";

export function useTravelDataFromAPI() {
  /* ═══ metadata ═══════════════════════════════ */
  const [municipios,        setMunicipios]        = useState([]);
  const [temas,             setTemas]             = useState([]);        // [{ id, nombre }]
  const [temasDetalles,     setTemasDetalles]     = useState({});        // { id → detalle }
  const [indicadorNombres,  setIndicadorNombres]  = useState([]);        // string[]
  const [metadataLoaded,    setMetadataLoaded]    = useState(false);

  /* ═══ filtros ════════════════════════════════ */
  const [municipio,          setMunicipio]          = useState("AMVA General");
  const [municipio_destino,  setMunicipioDestino]   = useState("AMVA General");
  const [temasFiltros,       _setTemasFiltros]      = useState({});  // { temaId → [valores] }

  /* ═══ datos de indicadores ═══════════════════ */
  const [indicadoresData,  setIndicadoresData]  = useState({});  // { nombre → respuesta }
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
      console.log('[useTravelDataFromAPI] Inicializando compareTema con:', firstTema);
      setCompareTema(firstTema);
    }
  }, [temas, compareTema]);

  // ── 1. Cargar metadata al montar ──────────────
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        console.log('[useTravelDataFromAPI] Iniciando carga de metadata...');

        // tres llamadas en paralelo
        const [municipiosRaw, temasRaw, indicadoresRaw] = await Promise.all([
          fetchJSON(urls.municipios()),
          fetchJSON(urls.temas()),
          fetchJSON(urls.indicadores()),
        ]);

        console.log('[useTravelDataFromAPI] municipiosRaw:', municipiosRaw);
        console.log('[useTravelDataFromAPI] temasRaw:', temasRaw);
        console.log('[useTravelDataFromAPI] indicadoresRaw:', indicadoresRaw);

        // Extraer arrays de las respuestas (pueden venir envueltos en objetos)
        const mArray = municipiosRaw?.municipios ?? municipiosRaw ?? [];
        const tArray = temasRaw?.temas ?? temasRaw ?? [];
        const iArray = indicadoresRaw?.ids_indicadores ?? indicadoresRaw?.indicadores ?? indicadoresRaw ?? [];

        console.log('[useTravelDataFromAPI] Arrays extraídos:', { mArray, tArray, iArray });

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
        console.log('[useTravelDataFromAPI] temas normalizados:', tNorm);

        // cargar detalles de cada tema en paralelo
        const dets = {};
        await Promise.all(
          tNorm.map(async ({ id }) => {
            try {
              const detalle = await fetchJSON(urls.temaDetalles(id));
              console.log(`[useTravelDataFromAPI] detalle tema "${id}":`, detalle);
              
              // El backend puede retornar el array envuelto en diferentes formas
              // Intentamos extraerlo de varias maneras posibles
              let valores = null;
              
              if (Array.isArray(detalle)) {
                // Formato 1: Array directo
                valores = detalle;
              } else if (detalle && typeof detalle === 'object') {
                // Formato 2: Objeto con campo específico
                valores = detalle.valores 
                       ?? detalle.opciones 
                       ?? detalle.options
                       ?? detalle.detalles
                       ?? detalle.data
                       ?? detalle.items;
                
                // Si no encontramos ningún campo conocido, buscar el primer array
                if (!valores || !Array.isArray(valores)) {
                  const arrayKey = Object.keys(detalle).find(k => Array.isArray(detalle[k]));
                  if (arrayKey) valores = detalle[arrayKey];
                }
              }
              
              dets[id] = {
                nombre: id,
                valores: Array.isArray(valores) ? valores : [],
                raw: detalle  // guardamos el raw por si acaso
              };
              
              console.log(`[useTravelDataFromAPI] valores procesados para tema "${id}":`, dets[id].valores);
            } catch (e) {
              console.warn(`detalles no cargado para tema "${id}":`, e);
              dets[id] = { valores: [], nombre: id };
            }
          })
        );
        setTemasDetalles(dets);

        // inicializar filtros VACÍOS (en modo AGRUPAR no se filtran por temas)
        // Solo guardamos la estructura para saber qué temas existen
        const init = {};
        tNorm.forEach(({ id }) => {
          init[id] = [];  // Vacío por defecto
          console.log(`[useTravelDataFromAPI] tema "${id}" inicializado sin filtros`);
        });
        _setTemasFiltros(init);

        console.log('[useTravelDataFromAPI] Metadata cargada exitosamente');
        console.log('[useTravelDataFromAPI] thematicOptions:', init);
        setMetadataLoaded(true);
      } catch (e) {
        console.error("Error cargando metadata:", e);
        setError(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ── query-string derivado ─────────────────────
  // SIEMPRE envía: municipio + tema (el activo en el UI)
  // SIEMPRE envía detalles si el usuario tiene valores seleccionados (independiente del modo)
  const qs = useMemo(
    () => {
      // Validar que tenemos lo mínimo necesario
      if (!municipio || !compareTema) {
        console.warn('[useTravelDataFromAPI] No se puede construir query: falta municipio o tema activo');
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
        console.log('[useTravelDataFromAPI] Query string:', 
          `municipio=${municipio}&tema=${compareTema}&${compareTema}=${params.detalles.join(',')}`);
      } else {
        console.log('[useTravelDataFromAPI] Query string:', 
          `municipio=${municipio}&tema=${compareTema} (sin detalles = todos)`);
      }

      return buildQueryParams(params);
    },
    [municipio, compareTema, temasFiltros]
  );

  // ── 2. Cargar todos los indicadores cuando cambie qs o el modo ─
  useEffect(() => {
    if (!metadataLoaded || !indicadorNombres.length) {
      console.log('[useTravelDataFromAPI] Esperando metadata o indicadores...', {
        metadataLoaded,
        indicadorNombresLength: indicadorNombres.length
      });
      return;
    }

    // No cargar si no tenemos query string válido (falta municipio o tema)
    if (!qs) {
      console.log('[useTravelDataFromAPI] Query string vacío, esperando municipio y tema...');
      return;
    }

    // El modo determina QUÉ ENDPOINT usar, no qué parámetros enviar
    const urlFn = compareMode ? urls.porDetalle : urls.agregado;
    const endpointName = compareMode ? '/por-detalle' : '/agregado';
    console.log(`[useTravelDataFromAPI] Cargando indicadores usando endpoint ${endpointName}...`);
    console.log('[useTravelDataFromAPI] Query string (mismo para ambos modos):', qs);

    (async () => {
      setIsLoading(true);
      try {
        const entries = await Promise.all(
          indicadorNombres.map(async (nombre) => {
            try {
              const url = urlFn(nombre) + (qs ? `?${qs}` : "");
              console.log(`[useTravelDataFromAPI] Fetching: ${url}`);
              const data = await fetchJSON(url);
              console.log(`[useTravelDataFromAPI] Indicador "${nombre}" cargado:`, data);
              return [nombre, data];
            } catch (e) {
              console.error(`fetch indicador "${nombre}" (${compareMode ? "por-detalle" : "agregado"}) fallido:`, e);
              return [nombre, null];
            }
          })
        );

        const map = Object.fromEntries(entries);
        setIndicadoresData(map);
        console.log('[useTravelDataFromAPI] Todos los indicadores cargados:', map);

        // Si estamos en modo comparar, construir la estructura que
        // espera AnalysisViewsPanel → detailedData.comparaciones[tema][indicador]
        const detailed = compareMode && compareTema
          ? buildDetailedData(compareTema, map)
          : null;
        
        if (detailed) {
          console.log('[useTravelDataFromAPI] detailedData construido:', detailed);
        }
        setDetailedData(detailed);
      } catch (e) {
        console.error("Error cargando indicadores:", e);
        setError(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [metadataLoaded, indicadorNombres, qs, compareMode, compareTema]);

  // ── setters de filtro ────────────────────────
  const setDestinationMunicipio = useCallback(
    (val) => setMunicipioDestino(val), []
  );

  // Cambiar los valores seleccionados de un tema
  const setTemaValues = useCallback((temaId, valores) => {
    _setTemasFiltros((prev) => ({ ...prev, [temaId]: valores }));
  }, []);

  // Cambiar el tema activo (siempre actualiza compareTema para que el query tenga tema)
  const setActiveTema = useCallback((temaId) => {
    console.log('[useTravelDataFromAPI] Cambiando tema activo a:', temaId);
    setCompareTema(temaId);
  }, []);

  // ── derived: thematicOptions (compat legacy) ─
  const thematicOptions = useMemo(() => {
    const out = {};
    temas.forEach(({ id }) => {
      const det = temasDetalles[id] || {};
      // Ahora det.valores ya está normalizado y garantizado como array
      out[id] = det.valores || [];
    });
    console.log('[useTravelDataFromAPI] thematicOptions construido:', out);
    return out;
  }, [temas, temasDetalles]);

  // ── filters object (compat FiltersPanel) ─────
  const filters = useMemo(() => ({
    municipio,
    destinationMunicipio: municipio_destino,   // alias antiguo
    municipio_destino,
    thematicFilters:      temasFiltros,         // alias antiguo
    temasFiltros,
  }), [municipio, municipio_destino, temasFiltros]);

  // ═══════════════════════════════════════════════
  return {
    /* metadata */
    municipios,
    temas,                 // [{ id, nombre }]
    temasDetalles,         // { id → { valores, nombre, … } }
    indicadorNombres,      // string[]  – los IDs disponibles
    thematicOptions,       // { temaId → valores[] }
    metadataLoaded,

    /* filtros */
    filters,               // objeto para FiltersPanel
    municipio,
    municipio_destino,
    setMunicipio,
    setDestinationMunicipio,
    temasFiltros,
    setTemaValues,
    setActiveTema,         // nuevo: cambiar tema activo

    /* modo comparar */
    compareMode,
    setCompareMode,
    compareTema,

    /* datos */
    indicadoresData,       // { indicadorNombre → data }
    detailedData,          // { comparaciones: { [tema]: { [indicador]: nested } } } | null

    /* estado */
    isLoading,
    error,
  };
}

// ═══ helpers internos ══════════════════════════════════════

/**
 * Construye la estructura detailedData que espera AnalysisViewsPanel:
 *   detailedData.comparaciones[tema][targetField][valorTematico][categoría] = porcentaje
 *
 * targetField = nombre del indicador (ej: "modo_principal")
 * El backend retorna por-detalle en uno de estos formatos y se normaliza:
 *   A) { "Valor1": { "Cat A": 45, "Cat B": 30 }, … }   → ya correcto
 *   B) [{ grupo, categoria, valor }, … ]                 → se convierte a A
 */
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