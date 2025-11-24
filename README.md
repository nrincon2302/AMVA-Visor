# AMVA Visor de Movilidad

Visualizador interactivo para analizar viajes entre macrozonas del Área Metropolitana del Valle de Aburrá. El visor permite explorar orígenes y destinos con mapas de calor, filtrar por municipio y macrozonas, revisar distribuciones sociodemográficas y exportar los hallazgos a PDF, Word y Excel.

## Tecnologías utilizadas

- **React + Vite** para la construcción del SPA y el entorno de desarrollo.
- **Recharts** para gráficas de barras y pastel.
- **Highcharts Maps** con capa base de OpenStreetMap para los mapas de calor.
- **html2canvas** y **jsPDF** para capturar el estado del visor y generar exportables en PDF/Word.
- **SheetJS (XLSX)** para crear libros de Excel con múltiples hojas.
- **ESLint** con la configuración recomendada de React para mantener la calidad del código.

## Ejecución

```
npm install
npm run dev
```

Para generar el build de producción:

```
npm run build
```
