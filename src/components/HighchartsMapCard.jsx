// src/components/HighchartsMapCard.jsx
import React, { useEffect, useState } from "react";
import Highcharts from "highcharts/highmaps";
import HighchartsReact from "highcharts-react-official";
import ChartCard from "./ChartCard";
import mapDataSource from "../assets/macrozonas_actualizado.geo.json";
import TiledWebMapModule from "highcharts/modules/tiledwebmap";

const initModule = (mod) => {
  const fn = mod?.default ?? mod;
  if (typeof fn === "function") fn(Highcharts);
};
initModule(TiledWebMapModule);

const HighchartsMapCard = ({
  title,
  data,
  palette = "green",
  hideBaseMap = false,
  selectedMacrozone,
  expandedHeight
}) => {
  const [mapGeoJSON, setMapGeoJSON] = useState(null);

  useEffect(() => {
    setMapGeoJSON(JSON.parse(JSON.stringify(mapDataSource)));
  }, []);

  const colorAxis =
    palette === "orange"
      ? {
          min: 0,
          stops: [
            [0,    "#fff7d6"],
            [0.25, "#ffe8a3"],
            [0.5,  "#ffd166"],
            [0.75, "#ffad33"],
            [1,    "#ff8c00"],
          ],
        }
      : {
          min: 0,
          stops: [
            [0,    "#e5f9e9"],
            [0.25, "#bdeed0"],
            [0.5,  "#7fdba6"],
            [0.75, "#32b56f"],
            [1,    "#15803d"],
          ],
        };

  const options = {
    chart: {
      height: expandedHeight ?? 320,
      spacing: [0, 0, 0, 0],
      animation: false,
    },

    mapView: {
      projection: { name: "WebMercator" },
      center: { lat: 6.2442, lon: -75.5812 },
      zoom: 9.7,
    },

    title: { text: "" },
    credits: { enabled: false },

    exporting: {
      enabled: false,           // Ocultamos el menú nativo de Highcharts
      allowHTML: true,
    },

    legend: {
      layout: "vertical",
      align: "right",
      verticalAlign: "bottom",
      floating: true,
      backgroundColor: "rgba(255,255,255,0.9)",
      borderRadius: 8,
      borderWidth: 0,
      itemStyle: { fontSize: "10pt" },
    },

    mapNavigation: {
      enabled: true,
      buttonOptions: { verticalAlign: "top" },
    },

    accessibility: { enabled: false },

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
      ...(hideBaseMap
        ? []
        : [
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
          ]),
      {
        type: "map",
        mapData: mapGeoJSON || mapDataSource,
        data: (data || []).map((item) =>
          selectedMacrozone && item.id !== selectedMacrozone
            ? { ...item, value: null }
            : item
        ),
        joinBy: ["name", "name"],
        allAreas: true,
        ignoreLatLon: true,
        marker: { enabled: false },

        dataLabels: { enabled: false },

        name: "Viajes",
        borderColor: "#808080",
        borderWidth: 1,
        nullColor: "rgba(191,191,191,0.10)",
        opacity: 0.95,

        states: {
          hover:  { brightness: 0.1, borderWidth: 2, borderColor: "#808080" },
          select: { color: "#1d4ed8", borderColor: "#1d4ed8", borderWidth: 2 },
        },
        allowPointSelect: true,
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