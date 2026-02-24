import BannerImage from "../assets/Observatorio.jpg";

export const PRIMARY_GREEN = "rgba(124, 185, 40, 1)";
export const SECONDARY_GREEN = "#339933";
export const TERTIARY_YELLOW = "#FDEB00";
export const TERTIARY_PINK = "#E770D3";
export const TERTIARY_ORANGE = "#FF9000";
export const TERTIARY_BLUE = "#00A7F4";
export const GRAY_65 = "#A6A6A6";

export const COMPARE_COLORS = [TERTIARY_BLUE, TERTIARY_PINK, TERTIARY_ORANGE];
export const BANNER_IMAGE_URL = BannerImage;

export const formateo = (valor) => {
  const esEntero = Number.isInteger(valor);

  return new Intl.NumberFormat("es-CO", {
    style: "decimal",
    minimumFractionDigits: esEntero ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(valor);
};