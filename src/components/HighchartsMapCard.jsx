// src/components/HighchartsMapCard.jsx
import React, { useMemo } from "react"; // 1. Importar useMemo
import Highcharts from "highcharts/highmaps";
import HighchartsReact from "highcharts-react-official";
import ChartCard from "./ChartCard";
import mapDataSource from "../assets/macrozonas_actualizado.geo.json"; // Renombramos la importación
import TiledWebMapModule from "highcharts/modules/tiledwebmap";

const TiledWebMap = TiledWebMapModule?.default || TiledWebMapModule;
if (typeof TiledWebMap === "function") {
  TiledWebMap(Highcharts);
}

const HighchartsMapCard = ({ title, data, palette = "green" }) => {
  
  // 2. CLAVE: Clonar el GeoJSON para evitar que Highcharts lo corrompa al renderizar
  const mapGeoJSON = useMemo(() => {
    return JSON.parse(JSON.stringify(mapDataSource));
  }, []);

  const colorAxis =
    palette === "orange"
      ? {
          min: 0,
          stops: [
            [0, "#fee7df"],
            [0.25, "#fdc4aa"],
            [0.5, "#fb9061"],
            [0.75, "#f97316"],
            [1, "#c2410c"],
          ],
        }
      : {
          min: 0,
          stops: [
            [0, "#e5f9e9"],
            [0.25, "#bdeed0"],
            [0.5, "#7fdba6"],
            [0.75, "#32b56f"],
            [1, "#15803d"],
          ],
        };

  const options = {
    chart: {
      // No definir 'map' aquí globalmente para evitar conflictos con tiledwebmap
      height: 320,
      spacing: [0, 0, 0, 0],
    },

    mapView: {
      projection: { name: "WebMercator" },
      center: { lat: 6.2442, lon: -75.5812 },
      zoom: 10,
    },

    title: { text: "" },
    credits: { enabled: false },

    legend: {
      layout: "vertical",
      align: "right",
      verticalAlign: "bottom",
      floating: true,
      backgroundColor: "rgba(255,255,255,0.9)",
      borderRadius: 8,
      borderWidth: 0,
      itemStyle: { fontSize: "10px" },
    },

    mapNavigation: {
      enabled: true,
      buttonOptions: { verticalAlign: "top" },
    },

    colorAxis,

    tooltip: {
      useHTML: true,
      pointFormatter() {
        const rawName = this.name || "";
        const parts = rawName.split(" - ");
        // Manejo defensivo por si el nombre no tiene guión
        const municipio = parts.length > 1 ? parts[0] : "Medellín"; 
        const macrozona = parts.length > 1 ? parts[1] : rawName;
        
        return `<span style="font-weight:600">${macrozona}</span><br/>
                Municipio: ${municipio}
                <br/>Viajes: ${Highcharts.numberFormat(this.value || 0, 0)}`;
      },
    },

    series: [
      // Serie 1: Mapa base OSM
      {
        type: "tiledwebmap",
        name: "Base OSM",
        provider: {
          type: "osm",
          url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        },
        opacity: 0.7,
        zIndex: 0,
      },

      // Serie 2: Polígonos del GeoJSON
      {
        type: "map",
        mapData: mapGeoJSON, // 3. Usar la copia clonada
        data: data || [],
        
        // Configuraciones para forzar polígonos
        joinBy: ["name", "name"], 
        allAreas: true,       // Dibuja el polígono aunque no haya dato numérico
        ignoreLatLon: true,   // Ignora coordenadas en la data para no dibujar puntos
        
        marker: { 
          enabled: false      // 4. Forzar apagado de "círculos"
        },
        
        dataLabels: {
          enabled: false,     // Apagar etiquetas para limpiar la vista
          format: '{point.name}'
        },

        name: "Viajes",
        borderColor: "#6b7280", // Gris oscuro para definir bien el croquis
        borderWidth: 1,
        nullColor: "rgba(150, 150, 150, 0.2)", // Zonas sin datos
        opacity: 0.85,
        
        states: {
          hover: {
            brightness: 0.1,
            borderWidth: 2,
            borderColor: "#000"
          }
        },
        zIndex: 1,
      },
    ],
  };

  return (
    <ChartCard title={title}>
      <HighchartsReact
        highcharts={Highcharts}
        constructorType="mapChart"
        options={options}
      />
    </ChartCard>
  );
};

export default HighchartsMapCard;