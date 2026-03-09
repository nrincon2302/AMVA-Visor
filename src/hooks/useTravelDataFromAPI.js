import { useEffect, useState, useCallback, useMemo } from "react";
import { urls, buildQueryParams, fetchJSON } from "../config/api";
import { getMacrozonesByMunicipio } from "../config/geoLookup";

export function useTravelDataFromAPI() {
  const [municipios, setMunicipios] = useState([]);
  const [temas, setTemas] = useState([]);
  const [temasDetalles, setTemasDetalles] = useState({});
  const [indicadorIds, setIndicadorIds] = useState([]);
  const [metadataLoaded, setMetadataLoaded] = useState(false);

  const [municipio, setMunicipio] = useState("AMVA General");
  const [zona, setZona] = useState("");
  const [macrozona, setMacrozona] = useState("");
  const [macrozonas, setMacrozonas] = useState([]);
  const [temasFiltros, setTemasFiltros] = useState({});

  // ── OD filters — arrays para multi-selección ─────────────────────────────
  const [origen, setOrigen] = useState([]);   // [] = sin filtro
  const [destino, setDestino] = useState([]); // [] = sin filtro

  const [indicadoresData, setIndicadoresData] = useState({});
  const [indicadoresGlobales, setIndicadoresGlobales] = useState(null);
  const [detailedData, setDetailedData] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [compareMode, setCompareMode] = useState(false);
  const [compareTema, setCompareTema] = useState(null);

  /* === Metadata inicial === */
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
        const iArray = indicadoresRaw?.ids_indicadores ?? indicadoresRaw?.indicadores ?? indicadoresRaw ?? [];

        const mList = (Array.isArray(mArray) ? mArray : []).map((m) =>
          typeof m === "string" ? m : m.nombre ?? m.id
        );
        setMunicipios(mList.includes("AMVA General") ? mList : ["AMVA General", ...mList]);

        const temasNorm = (Array.isArray(tArray) ? tArray : []).map((t) =>
          typeof t === "string" ? { id: t, nombre: t } : { id: t.id ?? t.nombre, nombre: t.nombre ?? t.id }
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

  useEffect(() => {
    if (temas.length && !compareTema) setCompareTema(temas[0].id);
  }, [temas, compareTema]);

  /* === Macrozonas del municipio seleccionado (desde geoLookup local) === */
  useEffect(() => {
    setMacrozona("");
    if (!municipio || municipio === "AMVA General") {
      setMacrozonas([]);
      return;
    }

    const localList = getMacrozonesByMunicipio(municipio);
    if (localList.length > 0) {
      setMacrozonas(localList);
      return;
    }

    (async () => {
      try {
        const data = await fetchJSON(urls.macrozonas(municipio));
        let lista = Array.isArray(data) ? data
          : data?.macrozonas ?? data?.nombres ?? data?.items ?? data?.data ?? [];
        setMacrozonas(
          lista.map((m) => {
            const nombre = typeof m === "string" ? m : m.nombre ?? m.name ?? String(m);
            return { id: nombre, nombre };
          })
        );
      } catch (e) {
        console.warn(`No se pudieron cargar macrozonas para ${municipio}:`, e);
        setMacrozonas([]);
      }
    })();
  }, [municipio]);

  /* === Query String === */
  const qs = useMemo(() => {
    if (!municipio || !compareTema) return "";
    const params = {
      municipio,
      macrozona,
      zona,
      tema: compareTema,
      // OD filters — solo se envían cuando tienen elementos
      ...(origen.length > 0  ? { origen }  : {}),
      ...(destino.length > 0 ? { destino } : {}),
    };
    const valoresSeleccionados = temasFiltros[compareTema];
    if (valoresSeleccionados?.length) params.detalles = valoresSeleccionados;
    return buildQueryParams(params);
  }, [municipio, zona, macrozona, compareTema, temasFiltros, origen, destino]);

  /* === Detalles de temas === */
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
              let valores = null;
              if (Array.isArray(detalle)) valores = detalle;
              else if (detalle && typeof detalle === "object") {
                valores = detalle.valores ?? detalle.opciones ?? detalle.options
                       ?? detalle.detalles ?? detalle.data ?? detalle.items;
                if (!valores || !Array.isArray(valores)) {
                  const k = Object.keys(detalle).find(k => Array.isArray(detalle[k]));
                  if (k) valores = detalle[k];
                }
              }
              dets[id] = { nombre: id, valores: Array.isArray(valores) ? valores : [], raw: detalle };
            } catch (err) {
              console.warn(`detalles no cargado para tema "${id}":`, err);
              dets[id] = { valores: [], nombre: id };
            }
          })
        );
        if (!mounted) return;
        setTemasDetalles(dets);
        setMetadataLoaded(true);
      } catch (e) {
        console.error("Error cargando detalles de temas:", e);
        setError(e);
      } finally {
        setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [temas]);

  /* === KPIs globales (sin filtros OD — siempre totales) === */
  useEffect(() => {
    (async () => {
      try {
        const ids = [1,2,3,4,5,6,7,8,9,10,11,12,13,14];
        const entries = await Promise.all(
          ids.map(async (id) => [id, transformAgregado(await fetchJSON(urls.agregado(id)))])
        );
        setIndicadoresGlobales(Object.fromEntries(entries));
      } catch (e) {
        console.error("Error cargando KPIs globales:", e);
      }
    })();
  }, []);

  /* === Indicadores filtrados (incluye origen/destino en qs) === */
  useEffect(() => {
    if (!metadataLoaded || !indicadorIds.length || !qs) return;
    const urlFn = compareMode ? urls.porDetalle : urls.agregado;
    (async () => {
      setIsLoading(true);
      try {
        const entries = await Promise.all(
          indicadorIds.map(async (nombre) => {
            try {
              const url = urlFn(nombre) + (qs ? `?${qs}` : "");
              const response = await fetchJSON(url);
              return [nombre, compareMode ? transformPerDetalle(response) : transformAgregado(response)];
            } catch (e) {
              console.error(`fetch indicador "${nombre}" fallido:`, e);
              return [nombre, null];
            }
          })
        );
        const map = Object.fromEntries(entries);
        setIndicadoresData(map);
        setDetailedData(compareMode && compareTema ? buildDetailedData(compareTema, map) : null);
      } catch (e) {
        console.error("Error cargando indicadores:", e);
        setError(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [metadataLoaded, indicadorIds, qs, compareMode, compareTema]);

  /* === Callbacks === */
  const setTemaValues = useCallback((temaId, valores) => {
    setTemasFiltros((prev) => ({ ...prev, [temaId]: valores }));
  }, []);
  const setActiveTema = useCallback((temaId) => setCompareTema(temaId), []);

  // Toggle origen: agrega/quita un ID del array
  const toggleOrigen = useCallback((id) => {
    setOrigen((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  // Toggle destino: agrega/quita un ID del array
  const toggleDestino = useCallback((id) => {
    setDestino((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const thematicOptions = useMemo(() => {
    const out = {};
    temas.forEach(({ id }) => { out[id] = temasDetalles[id]?.valores || []; });
    return out;
  }, [temas, temasDetalles]);

  const filters = useMemo(() => ({
    municipio, zona, macrozona,
    thematicFilters: temasFiltros, temasFiltros,
  }), [municipio, zona, macrozona, temasFiltros]);

  /* === Normalización para modo comparar === */
  const activeDetail = compareMode && temasFiltros[compareTema]?.length
    ? temasFiltros[compareTema][0] : null;

  const normalizedIndicadores = useMemo(() => {
    if (!compareMode || !activeDetail) return indicadoresData;
    const out = {};
    Object.entries(indicadoresData).forEach(([id, ind]) => {
      if (!ind) { out[id] = null; return; }
      if (ind.tipo === "comparativo_simple") {
        const found = ind.comparativo.find((d) => String(d.detalle) === String(activeDetail));
        out[id] = { tipo: "simple", nombre: ind.nombre, value: found?.value ?? 0 };
        return;
      }
      if (ind.tipo === "comparativo_agrupado") {
        out[id] = {
          tipo: "agrupado", nombre: ind.nombre,
          data: ind.grupos.map((g) => {
            const found = g.comparativo.find((d) => String(d.detalle) === String(activeDetail));
            return { label: g.grupo, value: found?.value ?? 0 };
          }),
        };
        return;
      }
      out[id] = ind;
    });
    return out;
  }, [indicadoresData, compareMode, activeDetail]);

  const mobilityPatternsData = useMemo(
    () => buildMobilityPatternsData(compareMode ? indicadoresData : normalizedIndicadores, compareMode),
    [indicadoresData, normalizedIndicadores, compareMode]
  );

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
    municipio, setMunicipio,
    zona, setZona,
    macrozona, setMacrozona,
    macrozonas,

    // OD filters (arrays para multi-selección)
    origen, setOrigen, toggleOrigen,
    destino, setDestino, toggleDestino,

    temasFiltros, setTemaValues, setActiveTema,
    compareMode, setCompareMode, compareTema, setCompareTema,

    indicadoresData: compareMode ? indicadoresData : normalizedIndicadores,
    indicadoresGlobales, detailedData,
    mobilityPatternsData,
    hourlyModeDatasets: mobilityPatternsData?.hourlyModeDatasets || null,
    analysisViewsData,
    isLoading, error,
  };
}

function buildDetailedData(tema, indicadoresMap) {
  const comparaciones = { [tema]: {} };
  Object.entries(indicadoresMap).forEach(([id, data]) => { if (data) comparaciones[tema][id] = data; });
  return { comparaciones };
}

function transformAgregado(response) {
  if (!response || typeof response !== "object") return null;
  if (typeof response.valor === "number") return { tipo: "simple", nombre: response.nombre, value: response.valor };
  if (Array.isArray(response.grupos)) return {
    tipo: "agrupado", nombre: response.nombre,
    data: response.grupos.map(g => ({ label: g.criterio ?? g.grupo, value: g.valor })),
  };
  if (Array.isArray(response.matriz)) return { tipo: "matriz", nombre: response.nombre, data: response.matriz };
  return null;
}

function transformPerDetalle(response) {
  if (!response || typeof response !== "object") return null;
  if (Array.isArray(response.comparativo)) return {
    tipo: "comparativo_simple", nombre: response.nombre,
    comparativo: response.comparativo.map(d => ({ detalle: d.detalle, value: d.valor })),
  };
  if (Array.isArray(response.grupos)) return {
    tipo: "comparativo_agrupado", nombre: response.nombre,
    grupos: response.grupos.map(g => ({
      grupo: g.grupo,
      comparativo: g.comparativo.map(d => ({ detalle: d.detalle, value: d.valor })),
    })),
  };
  if (Array.isArray(response.matriz)) return { tipo: "matriz", nombre: response.nombre, data: response.matriz };
  return null;
}

function buildMobilityPatternsData(indicadoresData, isCompareMode) {
  if (!indicadoresData) return null;
  const ind16 = indicadoresData[16], ind17 = indicadoresData[17];
  const ind18 = indicadoresData[18], ind19 = indicadoresData[19];
  let hourlyModeData = [], hourlyModeDatasets = null;

  if ([ind16,ind17,ind18,ind19].every(x => x?.tipo === "agrupado")) {
    const labels = ind16.data.map(d => d.label);
    hourlyModeData = labels.map(label => ({
      hour: label,
      informal:     Math.round(ind16.data.find(d => d.label === label)?.value ?? 0),
      public:       Math.round(ind17.data.find(d => d.label === label)?.value ?? 0),
      private:      Math.round(ind18.data.find(d => d.label === label)?.value ?? 0),
      nonMotorized: Math.round(ind19.data.find(d => d.label === label)?.value ?? 0),
    }));
  } else if (isCompareMode && [ind16,ind17,ind18,ind19].every(x => x?.tipo === "comparativo_agrupado")) {
    const detalles = new Set();
    [ind16,ind17,ind18,ind19].forEach(ind =>
      ind?.grupos?.forEach(g => g.comparativo?.forEach(d => detalles.add(String(d.detalle))))
    );
    hourlyModeDatasets = Array.from(detalles).map(detalle => ({
      nombre: String(detalle),
      data: ind16.grupos.map(grupoObj => {
        const gl = grupoObj.grupo;
        const get = (src) => src?.grupos?.find(x => x.grupo === gl)?.comparativo?.find(c => String(c.detalle) === String(detalle));
        return {
          hour: gl,
          informal: Math.round(get(ind16)?.value ?? 0),
          public: Math.round(get(ind17)?.value ?? 0),
          private: Math.round(get(ind18)?.value ?? 0),
          nonMotorized: Math.round(get(ind19)?.value ?? 0),
        };
      }),
    }));
  }

  const durationHistogramData = indicadoresData[20]?.tipo === "agrupado"
    ? indicadoresData[20].data.map(d => ({ label: d.label, value: d.value * 100 })) : [];
  const tripFrequencyData = indicadoresData[21]?.tipo === "agrupado"
    ? indicadoresData[21].data.map(d => ({ label: d.label, value: d.value * 100 })) : [];
  const tripsByEstratoData = indicadoresData[22]?.tipo === "agrupado"
    ? indicadoresData[22].data.map(d => ({ label: "Estrato " + d.label, value: d.value * 100 })) : [];
  const labelsDuracionModo = ["Transporte público","Transporte privado","Transporte Informal","Modo no motorizado"];
  const durationByModeGroupData = [23,24,25,26].map((id, i) => ({ label: labelsDuracionModo[i], value: indicadoresData[id]?.value ?? 0 }));

  return { hourlyModeData, hourlyModeDatasets, durationHistogramData, tripFrequencyData, tripsByEstratoData, durationByModeGroupData };
}

function buildAnalysisViewsData(indicadoresData) {
  if (!indicadoresData) return null;
  const mapAgrupadoPercent = (id) =>
    indicadoresData[id]?.tipo === "agrupado"
      ? indicadoresData[id].data.map(d => ({ label: id == 39 ? "Estrato " + d.label : d.label, value: d.value * 100 }))
      : [];
  const populationLabels = ["Cuidador","Extranjero (residente permanente)","Madre cabeza de familia","Persona en situación de discapacidad","Ninguna"];
  return {
    modeData: mapAgrupadoPercent(27),
    purposeData: mapAgrupadoPercent(28),
    stageData: mapAgrupadoPercent(29),
    populationInterestData: [31,32,33,34,35].map((id, i) => ({ label: populationLabels[i], value: (indicadoresData[id]?.value ?? 0) * 100 })),
    vehicleTypeData: mapAgrupadoPercent(36),
    vehicleTenureData: mapAgrupadoPercent(37),
    vehicleModelData: mapAgrupadoPercent(38),
    vehicleStratumData: mapAgrupadoPercent(39),
    socioData1: mapAgrupadoPercent(42),
    socioData2: mapAgrupadoPercent(43),
    socioData3: mapAgrupadoPercent(44),
    socioData4: mapAgrupadoPercent(45),
  };
}