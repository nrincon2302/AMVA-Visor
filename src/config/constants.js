import BannerImage from "../assets/Observatorio.jpg";

export const PRIMARY_GREEN = "#7CB928";
export const SECONDARY_GREEN = "#339933";
export const TERTIARY_YELLOW = "#FDEB00";
export const TERTIARY_PINK = "#E770D3";
export const TERTIARY_ORANGE = "#FF9000";
export const TERTIARY_BLUE = "#00A7F4";
export const GRAY_65 = "#A6A6A6";

// ── Colores para exportaciones (PDF / Excel) ──────────────────────────────────
export const EXPORT_HEADER_BG     = "#1B3A2D";  // fondo encabezado PDF/Excel
export const EXPORT_ROW_ALT       = "#F0FDF4";  // fila alternada (verde muy pálido)
export const EXPORT_ROW_ODD       = "#F8FAFC";  // fila normal (gris muy claro)
export const EXPORT_LIGHT_GREEN   = "#D1FAE5";  // fondo sección / portada
export const EXPORT_LIGHT_BLUE    = "#DBEAFE";
export const EXPORT_LIGHT_ORANGE  = "#FED7AA";
export const EXPORT_DARK_TEXT     = "#1E293B";
export const EXPORT_GRAY_TEXT     = "#64748B";
export const EXPORT_BORDER_COLOR  = "#E2E8F0";

// Paleta ampliada para modo COMPARAR (sin límite de 3)
export const COMPARE_COLORS = [
  TERTIARY_BLUE,
  TERTIARY_PINK,
  TERTIARY_ORANGE,
  "#8B5CF6", // violeta
  "#10B981", // esmeralda
  "#EF4444", // rojo
  TERTIARY_YELLOW, // amarillo
  "#6366F1", // índigo
  "#14B8A6", // teal
  "#84CC16", // lima
  "#EC4899", // rosa
];

export const MAP_GREEN_MIN = "#c8e6c9";  // verde muy pálido
export const MAP_GREEN_MAX = "#1b5e20";  // verde bosque oscuro

export const BANNER_IMAGE_URL = BannerImage;

export const formateo = (valor) => {
  const esEntero = Number.isInteger(valor);

  return new Intl.NumberFormat("es-CO", {
    style: "decimal",
    minimumFractionDigits: esEntero ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(valor);
};