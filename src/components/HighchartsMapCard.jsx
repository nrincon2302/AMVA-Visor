// src/components/HighchartsMapCard.jsx
import React, { useEffect, useState } from "react";
import Highcharts from "highcharts/highmaps";
import HighchartsReact from "highcharts-react-official";
import ChartCard from "./ChartCard";
import mapDataSource from "../assets/macrozonas_actualizado.geo.json";
import TiledWebMapModule from "highcharts/modules/tiledwebmap";
import { SECONDARY_GREEN, TERTIARY_ORANGE } from "../config/constants";

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
  expandedHeight,
  onSelect,
}) => {
  const [mapGeoJSON, setMapGeoJSON] = useState(null);

  useEffect(() => {
    setMapGeoJSON(JSON.parse(JSON.stringify(mapDataSource)));
  }, []);

  // Determine highlight color based on palette
  const selectColor = palette === "orange" ? TERTIARY_ORANGE : SECONDARY_GREEN;

  const colorAxis =
    palette === "orange"
      ? {
          min: 0,
          stops: [
            [0,    "#ffe4a0"],
            [0.25, "#ffca60"],
            [0.5,  "#ff9f20"],
            [0.75, "#f07000"],
            [1,    "#c04a00"],
          ],
        }
      : {
          min: 0,
          stops: [
            [0,    "#b8e8c0"],
            [0.25, "#72cb8c"],
            [0.5,  "#35ab5e"],
            [0.75, "#1a8840"],
            [1,    "#0d6030"],
          ],
        };

  // Build data: highlight selected with solid accent color, null out others when selection active
  const processedData = (data || []).map((item) => {
    if (selectedMacrozone) {
      if (item.id === selectedMacrozone) {
        return { ...item, color: selectColor };
      }
      return { ...item, value: null };
    }
    return item;
  });

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
      enabled: false,
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
        const municipio = parts.length > 1 ? parts[0] : "Medellín";
        const macrozona = parts.length > 1 ? parts[1] : rawName;
        return `<span style="font-weight:600">${macrozona}</span><br/>
                Municipio: ${municipio}
                <br/>Viajes: ${Highcharts.numberFormat(this.value || 0, 0)}`;
      },
    },

    plotOptions: {
      series: {
        cursor: "pointer",
        point: {
          events: {
            click: function () {
              if (onSelect && this.id !== undefined) {
                onSelect(this.id);
              }
            },
          },
        },
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
        data: processedData,
        joinBy: ["name", "name"],
        allAreas: true,
        ignoreLatLon: true,
        marker: { enabled: false },

        dataLabels: { enabled: false },

        name: "Viajes",
        borderColor: "#3a3a3a",
        borderWidth: 1,
        nullColor: "rgba(160,160,160,0.30)",
        opacity: 0.95,

        states: {
          hover: { brightness: 0.1, borderWidth: 2, borderColor: "#808080" },
          // Disable built-in select styling — we handle it via data color
          select: { color: null, borderColor: null, borderWidth: 0 },
        },
        allowPointSelect: false,
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