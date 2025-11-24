// src/components/HighchartsMapCard.jsx
import React from "react";
import Highcharts from "highcharts/highmaps";
import HighchartsReact from "highcharts-react-official";
import ChartCard from "./ChartCard";
import mapData from "../assets/macrozonas.geo.json";
import TiledWebMapModule from "highcharts/modules/tiledwebmap";

const TiledWebMap = TiledWebMapModule?.default || TiledWebMapModule;
if (typeof TiledWebMap === "function") {
  TiledWebMap(Highcharts);
}
import mapData from "@highcharts/map-collection/countries/co/co-all.geo.json";

const HighchartsMapCard = ({ title, departamentoData, palette = "green" }) => {
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
      map: mapData,
      height: 260,
      spacing: [0, 0, 0, 0],
    },
    mapView: {
      projection: {
        name: "WebMercator",
      },
      center: {
        lat: 6.2442,
        lon: -75.5812,
      },
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
      pointFormatter: function pointFormatter() {
        const [municipio, macrozona] = (this.name || "").split(" - ");
        return `<span style="font-weight:600">${macrozona || this.name}</span><br/>Municipio: ${
          municipio || ""
        }<br/>Viajes: ${Highcharts.numberFormat(this.value || 0, 0)}`;
      },
    },
    series: [
      {
        type: "tiledwebmap",
        name: "Base OSM",
        provider: {
          type: "osm",
          url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        },
        opacity: 0.6,
        zIndex: 0,
      },
      {
        type: "map",
        mapData: mapData,
        data: departamentoData || [],
        // name en el GeoJSON vs name en data
        joinBy: ["name", "name"],
        name: "Viajes",
        borderColor: "#ffffff",
        borderWidth: 0.5,
        nullColor: "rgba(243, 244, 246, 0.6)",
        states: {
          hover: { brightness: 0.1 },
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
