// src/components/HighchartsMapCard.jsx
import React, { useRef, useState } from "react";
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

const FRONT_ZONES = ["Urbana Barbosa", "Urbana Girardota"];

/** Remove the `color` prop from a data item so the colorAxis always drives fill. */
const stripColor = ({ color, ...rest }) => rest; // eslint-disable-line no-unused-vars

const HighchartsMapCard = ({
  title,
  data,
  palette = "green",
  hideBaseMap = false,
  selectedMacrozone,
  expandedHeight,
  onSelect,
  // IDs genuinely pending (not yet applied). MapsPanel sends [] once applied.
  pendingIds = [],
}) => {
  // Private deep copy — prevents shared GeoJSON object from being annotated
  // with per-instance Highcharts state, which caused hover color contamination.
  const [mapGeoJSON] = useState(() => JSON.parse(JSON.stringify(mapDataSource)));

  const chartRef = useRef(null);

  const selectColor = palette === "orange" ? TERTIARY_ORANGE : SECONDARY_GREEN;

  // ── Main series data ─────────────────────────────────────────────────────
  const processedData = (data || []).map((item) => {
    const clean = stripColor(item);
    if (selectedMacrozone) {
      if (clean.id === selectedMacrozone) return { ...clean, color: selectColor };
      return { ...clean, value: null };
    }
    return clean;
  });

  // ── Pending overlay data ─────────────────────────────────────────────────
  // Only zones that are marked but not yet applied.
  // When pendingIds is [] (after apply or before any selection) this array
  // is empty and the overlay series draws nothing.
  const pendingMapData = (data || [])
    .filter((item) => pendingIds.includes(item.id))
    .map(stripColor);

  const hasPending = pendingMapData.length > 0;

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

  const options = {
    chart: {
      height: expandedHeight ?? 320,
      spacing: [0, 0, 0, 0],
      animation: false,
      events: {
        render: function () {
          const series = this.series;

          // Set pointer-events:none on the overlay group so clicks/hovers
          // pass through to the main series beneath.
          const overlaySeries = series[series.length - 1];
          if (overlaySeries?.group?.element && hasPending) {
            overlaySeries.group.element.setAttribute("pointer-events", "none");
          }

          // Urban Barbosa & Girardota always on top of their rural envelopes.
          const mapSeries = series.find(
            (s) => s.type === "map" && s.options.name === "Viajes"
          );
          if (!mapSeries) return;
          FRONT_ZONES.forEach((zoneName) => {
            const pt = mapSeries.points.find((p) => p.name?.includes(zoneName));
            if (pt?.graphic) pt.graphic.toFront();
          });
        },
      },
    },

    mapView: {
      projection: { name: "WebMercator" },
      center: { lat: 6.2442, lon: -75.5812 },
      zoom: 9.7,
    },

    title:     { text: "" },
    credits:   { enabled: false },
    exporting: { enabled: false, allowHTML: true },

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
        const rawName   = this.name || "";
        const parts     = rawName.split(" - ");
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
              if (onSelect && this.id !== undefined) onSelect(this.id);
            },
          },
        },
      },
    },

    series: [
      // 1. OSM basemap
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

      // 2. Main choropleth
      {
        type: "map",
        name: "Viajes",
        mapData: mapGeoJSON,
        data: processedData,
        joinBy: ["name", "name"],
        allAreas: true,
        ignoreLatLon: true,
        marker:     { enabled: false },
        dataLabels: { enabled: false },
        borderColor: "#3a3a3a",
        borderWidth: 1,
        nullColor: "rgba(190,190,190,0.82)",
        opacity: 0.95,
        states: {
          hover: {
            brightness: 0.12,
            borderWidth: 3,
            borderColor: selectColor,
          },
          select: { color: null, borderColor: null, borderWidth: 0 },
        },
        allowPointSelect: false,
        zIndex: 1,
      },

      // 3. Pending-selection overlay
      // colorAxis:false → the series-level `color` is used directly.
      // enableMouseTracking:false + pointer-events:none (set in render event)
      // → all mouse events pass through to the main series below.
      // Empty when pendingIds is [].
      {
        type: "map",
        name: "Pending",
        mapData: mapGeoJSON,
        data: pendingMapData,
        joinBy: ["name", "name"],
        allAreas: false,
        ignoreLatLon: true,
        colorAxis: false,
        color: palette === "orange" ? "rgba(251,191,36,0.50)" : "rgba(163,230,53,0.50)",
        borderColor: selectColor,
        borderWidth: 2.5,
        opacity: 1,
        marker:     { enabled: false },
        dataLabels: { enabled: false },
        showInLegend: false,
        enableMouseTracking: false,
        states: { hover: { enabled: false }, select: { enabled: false } },
        zIndex: 2,
      },
    ],
  };

  return (
    <ChartCard title={title}>
      <HighchartsReact
        ref={chartRef}
        highcharts={Highcharts}
        constructorType="mapChart"
        options={options}
      />
    </ChartCard>
  );
};

export default HighchartsMapCard;