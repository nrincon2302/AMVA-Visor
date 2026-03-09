const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");
const API = `${API_BASE_URL}/api`;

// ============================================
// Construcción de las URLs de Metadatos e Indicadores
// ============================================
export const urls = {
  /* URI de Metadata */
  metadata:     () => `${API}/metadata/`,
  municipios:   () => `${API}/metadata/municipios`,
  macrozonas:   (municipio) => `${API}/metadata/municipios/${encodeURIComponent(municipio)}/macrozonas`,
  findMacrozona: (id) => `${API}/metadata/macrozonas/${encodeURIComponent(id)}`,
  temas:        () => `${API}/metadata/temas`,
  detalles:     (tema) => `${API}/metadata/temas/${encodeURIComponent(tema)}/detalles`,
  indicadores:  () => `${API}/metadata/indicadores`,

  /* URI de Indicadores */
  agregado:     (nombre) => `${API}/indicadores/${encodeURIComponent(nombre)}/agregado`,
  porDetalle:   (nombre) => `${API}/indicadores/${encodeURIComponent(nombre)}/por-detalle`
};

// ============================================
// Construcción de los Queries según filtros aplicados
// origen y destino pueden ser arrays (multi-selección de macrozonas)
// ============================================
export function buildQueryParams({municipio, macrozona, origen, destino, tema, zona, detalles} = {}) {
  const p = new URLSearchParams();

  // Adjuntar el municipio, la zona y la macrozona de residencia
  if (municipio && municipio !== "AMVA General") p.append("municipio", municipio);
  if (macrozona) p.append("macrozona", macrozona);
  if (zona) p.append("zona", zona);

  // Origen y destino soportan arrays (multi-selección)
  if (Array.isArray(origen) && origen.length > 0) {
    origen.forEach((o) => p.append("origen", String(o)));
  } else if (origen && !Array.isArray(origen)) {
    p.append("origen", origen);
  }

  if (Array.isArray(destino) && destino.length > 0) {
    destino.forEach((d) => p.append("destino", String(d)));
  } else if (destino && !Array.isArray(destino)) {
    p.append("destino", destino);
  }

  // Adjuntar el tema y los detalles
  if (tema) p.append("tema", tema);
  if (detalles) {
    if (Array.isArray(detalles) && detalles.length > 0) {
      detalles.forEach((d) => p.append("detalles", String(d)));
    }
  }

  return p.toString();
}

// ============================================
// Fetch de datos
// ============================================
export async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
  return res.json();
}