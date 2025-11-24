// src/components/HighchartsMapCard.jsx
import React from "react";
import Highcharts from "highcharts/highmaps";
import HighchartsReact from "highcharts-react-official";
import ChartCard from "./ChartCard";
import mapData from "../assets/medellin-zones.geo.json";

const HighchartsMapCard = ({ title, data, palette = "green" }) => {
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
      pointFormat: "<b>{point.name}</b><br/>Viajes: {point.value:,.0f}",
    },
    series: [
      {
        type: "map",
        mapData,
        data: data || [],
        joinBy: ["name", "name"],
        name: "Viajes",
        borderColor: "#ffffff",
        borderWidth: 0.5,
        nullColor: "#f3f4f6",
        states: {
          hover: { brightness: 0.1 },
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
