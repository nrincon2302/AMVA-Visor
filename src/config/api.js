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
  temas:        () => `${API}/metadata/temas`,
  detalles:     (tema) => `${API}/metadata/temas/${encodeURIComponent(tema)}/detalles`,
  indicadores:  () => `${API}/metadata/indicadores`,

  /* URI de Indicadores */
  agregado:     (nombre) => `${API}/indicadores/${encodeURIComponent(nombre)}/agregado`,
  porDetalle:   (nombre) => `${API}/indicadores/${encodeURIComponent(nombre)}/por-detalle`,
  filtrados:    (nombre) => `${API}/indicadores/${encodeURIComponent(nombre)}/filtrados`,
};

// ============================================
// Construcción de los Queries según filtros aplicados
// ============================================
export function buildQueryParams({
  municipio,
  macrozonas,
  tema,
  detalles,
} = {}) {
  const p = new URLSearchParams();

  // Adjuntar el municipio y las macrozonas
  if (municipio && municipio !== "AMVA General")
    p.append("municipio", municipio);

  if (macrozonas) {
    if (Array.isArray(macrozonas) && macrozonas.length > 0) {
      macrozonas.forEach((m) => p.append("macrozona", String(m)));
    }
  }

  // Adjuntar el tema y los detalles
  p.append("tema", tema);

  if (detalles) {
    if (Array.isArray(detalles) && detalles.length > 0) {
      detalles.forEach((d) => p.append("detalle", String(d)));
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