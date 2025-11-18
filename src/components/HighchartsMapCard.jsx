import React, { useMemo } from "react";
import Highcharts from "highcharts/highmaps";
import HighchartsReact from "highcharts-react-official";
import ChartCard from "./ChartCard";

// Importa el GeoJSON del mapa (puedes cambiar la ruta si usas otro mapa)
import mapData from "@highcharts/map-collection/countries/co/co-all.geo.json";

/**
 * Props:
 * - title: string
 * - palette: 'green' | 'orange'
 * - data?: Array<{ code: string, value: number }>
 *      code: identificador de la zona; por defecto 'hc-key' del mapa
 */
const HighchartsMapCard = ({ title, palette = "green", data }) => {
  // Colores tipo origen/destino
  const colorAxis = useMemo(() => {
    if (palette === "orange") {
      return {
        min: 0,
        stops: [
          [0, "#fee7df"],
          [0.25, "#fdc4aa"],
          [0.5, "#fb9061"],
          [0.75, "#f97316"],
          [1, "#c2410c"],
        ],
      };
    }
    return {
      min: 0,
      stops: [
        [0, "#e5f9e9"],
        [0.25, "#bdeed0"],
        [0.5, "#7fdba6"],
        [0.75, "#32b56f"],
        [1, "#15803d"],
      ],
    };
  }, [palette]);

  // Si no nos pasan datos, generamos datos mock para cada feature del mapa
  const seriesData = useMemo(() => {
    if (data && data.length > 0) {
      // se espera { code, value } donde code = 'hc-key'
      return data.map((d) => [d.code, d.value]);
    }

    // mock: asignar valores random a cada feature
    return mapData.features.map((f, idx) => {
      const key = f.properties["hc-key"];
      const value = 2000 + idx * 500 + Math.round(Math.random() * 3000);
      return [key, value];
    });
  }, [data]);

  const options = {
    chart: {
      map: mapData,
      height: 260,
      spacing: [0, 0, 0, 0],
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
      itemStyle: {
        fontSize: "10px",
      },
    },
    mapNavigation: {
      enabled: true,
      buttonOptions: {
        verticalAlign: "top",
      },
    },
    colorAxis,
    tooltip: {
      pointFormat:
        "<b>{point.name}</b><br/>Viajes: {point.value:,.0f}",
    },
    series: [
      {
        type: "map",
        data: seriesData,
        name: "Viajes",
        joinBy: ["hc-key", 0], // 0 = primer elemento de cada tupla [hc-key, value]
        borderColor: "#ffffff",
        borderWidth: 0.4,
        states: {
          hover: {
            brightness: 0.1,
          },
        },
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