import React, { useCallback, useMemo, useRef, useState } from "react";
import KpiCard from "./components/KpiCard";
import HighchartsMapCard from "./components/HighchartsMapCard";
import TabbedChartsRecharts from "./components/TabbedChartsRecharts";
import BarChartCard from "./components/BarChartCard";
import PieChartCard from "./components/PieChartCard";
import HourlyModeChartCard from "./components/HourlyModeChartCard";
import ChartCard from "./components/ChartCard";
import { useTravelCrossfilterRecharts } from "./hooks/useTravelCrossfilterRecharts";
import { useKpiStats } from "./hooks/useKpiStats";
import logoAmva from "./assets/logo-area.png";
import logoFoot from "./assets/logo-fott.png";
import escudo from "./assets/escudo-colombia.png";

const PRIMARY_GREEN = "#66CC33";
const SECONDARY_GREEN = "#339933";
const TERTIARY_YELLOW = "#FDEB00";
const TERTIARY_PINK = "#E770D3";
const TERTIARY_ORANGE = "#FF9000";
const TERTIARY_BLUE = "#00A7F4";
const GRAY_65 = "#A6A6A6";

// ---------- Header + navbar + hero --------------
const Header = () => {
  const navItems = [
    { label: "Inicio", color: "#0d9488" },
    { label: "Subdirección Ambiental", color: "#0ea5e9" },
    { label: "Subdirección Transporte", color: "#f97316" },
    { label: "Subdirección Dllo Social", color: "#a21caf" },
    { label: "Subdirección Proyectos", color: "#f59e0b" },
    { label: "Subdirección Planeación", color: "#2563eb" },
    { label: "Subdirección General", color: "#059669" },
    { label: "Administrativa y Financiera", color: "#be185d" },
  ];

  return (
    <>
      {/* Barra superior GOV.CO y redes */}
      <div
        style={{
          background: "rgba(54, 102, 204, 1)",
          color: "#ffffff",
          padding: "6px 0",
          fontSize: 10,
        }}
      >
        <div
          style={{
            maxWidth: 1300,
            margin: "0 auto",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 700 }}>GOV.CO</span>
            <span style={{ opacity: 0.8 }}>|</span>
            <span style={{ fontSize: 9 }}>Línea ética 018000 423 459</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {["Twitter", "Facebook", "Instagram"].map((label) => (
              <span
                key={label}
                style={{
                  width: 24,
                  height: 24,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 4,
                  background: "rgba(255,255,255,0.2)",
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {label[0]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Franja verde con logo y buscador */}
      <header
        style={{
          background: "rgba(124, 185, 40, 1)",
          padding: "14px 0 10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            maxWidth: 1300,
            margin: "0 auto",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
            <div
              style={{
                width: 150,
                height: 60,
                background: "rgba(124, 185, 40, 1)",
                borderRadius: 6,
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 6
              }}
            >
              <img
                src={logoAmva}
                alt="Logo Área Metropolitana"
                style={{ width: "120%", height: "120%", objectFit: "contain" }}
              />
            </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              background: "#ffffff",
              borderRadius: 9999,
              padding: "6px 12px",
              gap: 10,
              minHeight: 42,
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
            }}
          >
            <input
              placeholder="¿Qué estás buscando?"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: 10,
                color: "#0f172a",
              }}
            />
            <button
              style={{
                border: "none",
                background: SECONDARY_GREEN,
                color: "#ffffff",
                borderRadius: 14,
                padding: "6px 12px",
                cursor: "pointer",
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              Buscar
            </button>
          </div>

          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 6
            }}
          >
            <img
              src={escudo}
              alt="Escudo Área Metropolitana"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        </div>
      </header>

      {/* Navbar principal de secciones */}
      <nav
        style={{
          background: "#f3f4f6",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            maxWidth: 1300,
            margin: "0 auto",
            padding: "0 16px",
            display: "flex",
            gap: 12,
            rowGap: 8,
            flexWrap: "wrap",
            fontSize: "10pt",
          }}
        >
          {navItems.map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 4px",
                whiteSpace: "nowrap",
                cursor: "pointer",
                color: "#374151",
                fontWeight: item.label === "Subdirección Proyectos" ? 700 : 500,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  marginRight: 8,
                  borderRadius: 2,
                  background: item.color,
                  flexShrink: 0,
                }}
              />
              {item.label}
            </div>
          ))}
        </div>
      </nav>

      {/* Hero con breadcrumb, título y tabs secundarios */}
      <section
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(255,255,255,0.22), rgba(0,0,0,0.2)), url('https://www.metropol.gov.co/BannerInternas/Observatorio.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            maxWidth: 1300,
            margin: "0 auto",
            padding: "40px 16px 60px",
          }}
        >
          <div
            style={{ fontSize: "10pt", opacity: 0.95, marginBottom: 10 }}
          >
            Inicio &gt; Observatorio &gt; Encuesta origen destino
          </div>
          <h2 style={{ margin: 0, fontSize: 16, marginBottom: 10, letterSpacing: 0.3 }}>
            ENCUESTA ORIGEN DESTINO
          </h2>

          <div
            style={{
              display: "flex",
              gap: 24,
              marginTop: 16,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            {/* Tabs secciones */}
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                fontSize: "10pt",
              }}
            >
              {["Presentación", "Ambiental", "Movilidad", "Calidad de Vida"].map(
                (tab, idx) => (
                  <button
                    key={tab}
                    style={{
                      border: "none",
                      cursor: "pointer",
                      borderRadius: 9999,
                      padding: "6px 14px",
                      fontSize: "10pt",
                      fontWeight: idx === 0 ? 600 : 500,
                      background: idx === 0 ? "#ffffff" : "transparent",
                      color: idx === 0 ? "#16a34a" : "#e5e7eb",
                      boxShadow:
                        idx === 0 ? "0 4px 12px rgba(0,0,0,0.18)" : "none",
                    }}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>

            {/* Newsletter a la derecha */}
            <div
              style={{
                marginLeft: "auto",
                minWidth: 240,
                maxWidth: 280,
                background: "rgba(255,255,255,0.2)",
                padding: 14,
                borderRadius: 10,
                fontSize: "10pt",
                boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
              }}
            >
              <div style={{ marginBottom: 6, fontWeight: 600 }}>
                Suscríbete a nuestro boletín
              </div>
              <input
                placeholder="Ingresa tu correo electrónico"
                style={{
                  width: "100%",
                  borderRadius: 4,
                  border: "1px solid rgba(255,255,255,0.6)",
                  padding: "6px 8px",
                  fontSize: "10pt",
                  marginBottom: 6,
                  background: "rgba(255,255,255,0.75)",
                }}
              />
              <button
                style={{
                  width: "100%",
                  borderRadius: 4,
                  border: "none",
                  padding: "8px 10px",
                  fontSize: "10pt",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: "rgba(124, 185, 40, 1)",
                  color: "#ffffff",
                }}
              >
                Suscribirme
              </button>
              <div style={{ marginTop: 6, fontSize: "10pt" }}>
                Acepto Términos y condiciones
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ borderBottom: "24px solid #d1d5db" }} />
      <div style={{ borderBottom: "16px solid #ffffff" }} />

      {/* Banda verde con título del módulo */}
      <section
        style={{
          background: "rgba(124, 185, 40, 1)",
          color: "#ffffff",
          padding: "14px 0",
        }}
      >
        <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "0 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 14,
              fontSize: 12,
              fontWeight: 700,
            }}
        >
          <img
            src={logoAmva}
            alt="Logo Área Metropolitana"
            style={{ height: 36, width: 36, objectFit: "contain" }}
          />
          <span>Encuesta de Origen - Destino - Análisis de Viajes</span>
        </div>
      </section>
    </>
  );
};

// ---------- Footer --------------
const Footer = () => {
  return (
    <footer style={{ marginTop: 32 }}>
      {/* Bloque verde */}
      <div
        style={{
          background: "rgba(124, 185, 40, 1)",
          color: "#ffffff",
          padding: "28px 16px 22px",
        }}
      >
        <div
          style={{
            maxWidth: 1300,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 22,
            fontSize: "10pt",
          }}
        >
          {/* Columna 1 - contacto */}
          <div>
            <div
              style={{
                width: 150,
                height: 60,
                background: "#ffffff",
                borderRadius: 6,
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 6,
                boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
              }}
            >
              <img
                src={logoFoot}
                alt="Logo Área Metropolitana"
                style={{ width: "100%", height: "100%", objectFit: "stretch" }}
              />
            </div>
            <p style={{ margin: "4px 0" }}>
              Carrera 53 No. 40 A - 31
              <br />
              Medellín, Antioquia - Colombia
            </p>
            <p style={{ margin: "4px 0" }}>
              Lunes a jueves: 8:00 a.m. a 5:00 p.m.
              <br />
              Viernes: 8:00 a.m. a 4:30 p.m.
            </p>
            <p style={{ margin: "4px 0" }}>PBX: +(57)(604) 385 60 00</p>
            <p style={{ margin: "4px 0" }}>Fax: +(57)(604) 381 60 10</p>
            <p style={{ margin: "4px 0" }}>Línea anticorrupción: +(57)(604) 385 60 00</p>
            <p style={{ margin: "4px 0" }}>Extensiones 932 – 134</p>
          </div>

          {/* Columna 2 - líneas */}
          <div>
            <h4 style={{ marginTop: 0, marginBottom: 8, fontSize: 10 }}>
              Líneas
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                "La Entidad",
                "Subdirección Ambiental",
                "Subdirección de Movilidad",
                "Subdirección Planeación",
                "Subdirección Participación",
                "Subdirección Proyectos",
              ].map((txt) => (
                <li key={txt} style={{ marginBottom: 4 }}>
                  {txt}
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3 - secciones */}
          <div>
            <h4 style={{ marginTop: 0, marginBottom: 8, fontSize: 10 }}>
              Secciones
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                "Central Noticias",
                "Agenda de Eventos",
                "Participación y Ciudadanía",
                "Normatividad y Actos",
                "Documentación",
                "Contratación",
                "Atención y Trámites",
                "Subdirección Administrativa y Financiera",
              ].map((txt) => (
                <li key={txt} style={{ marginBottom: 4 }}>
                  {txt}
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4 - ayudas */}
          <div>
            <h4 style={{ marginTop: 0, marginBottom: 8, fontSize: 10 }}>
              Ayudas
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                "Mapa del Sitio",
                "Servicios en Línea",
                "Preguntas frecuentes",
                "Trámites y procedimientos",
                "PQRS y/O Quejas y Reclamos",
                "Contacte funcionarios",
              ].map((txt) => (
                <li key={txt} style={{ marginBottom: 4 }}>
                  {txt}
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 5 - newsletter */}
          <div>
            <h4 style={{ marginTop: 0, marginBottom: 8, fontSize: 10 }}>
              Suscríbete a nuestro boletín
            </h4>
            <input
              placeholder="Ingresa tu correo electrónico"
              style={{
                width: "100%",
                borderRadius: 4,
                border: "none",
                padding: "6px 8px",
                fontSize: "10pt",
                marginBottom: 6,
              }}
            />
            <button
              style={{
                width: "100%",
                borderRadius: 4,
                border: "none",
                padding: "6px 8px",
                fontSize: "10pt",
                fontWeight: 600,
                cursor: "pointer",
                background: "#ffffff",
                color: "rgba(124, 185, 40, 1)",
              }}
            >
              Suscribirme
            </button>
            <div style={{ marginTop: 6, fontSize: "10pt" }}>
              Acepto Términos y condiciones
            </div>
          </div>
        </div>

        <div
          style={{
            maxWidth: 1300,
            margin: "14px auto 0",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
            fontSize: "10pt",
          }}
        >
          <span>Iniciar sesión</span>
          <span>|</span>
          <span>lineaetica@metropol.gov.co</span>
          <span>anticorrupcion@metropol.gov.co</span>
          <span>facturacion.electronica@metropol.gov.co</span>
          <span>pqrsdamva@metropol.gov.co</span>
        </div>
      </div>

      {/* Franja azul inferior */}
      <div
        style={{
          background: "rgba(54, 102, 204, 1)",
          color: "#ffffff",
          textAlign: "center",
          fontSize: "10pt",
          padding: "8px 16px",
        }}
      >
        <div style={{ maxWidth: 1300, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span style={{ fontWeight: 700 }}>GOV.CO</span>
          <span>|</span>
          <span>
            Copyright © 2019 Área Metropolitana del Valle de Aburrá. Todos los
            derechos reservados | Valle de Aburrá - Colombia.
          </span>
        </div>
      </div>
    </footer>
  );
};

// ---------- Dashboard (contenido central) --------------
const DashboardSection = () => {
  const BASE_BAR_COLOR = PRIMARY_GREEN;
  const MACRO_DEST_BAR_COLOR = TERTIARY_ORANGE;
  const MODE_BAR_COLOR = PRIMARY_GREEN;
  const OCCUPATION_BAR_COLOR = PRIMARY_GREEN;
  const STAGE_BAR_COLOR = PRIMARY_GREEN;
  const {
    filters,
    municipios,
    setMunicipio,
    setMacrozona,
    setThematicValue,
    filteredTrips,
    filteredPersons,
    filteredHouseholds,
    estratoData,
    edadData,
    generoData,
    escolaridadData,
    modeData,
    stageData,
    purposeData,
    occupationData,
    vehicleTenureData,
    hourlyTripShareData,
    macroHeatData,
    trips,
  } = useTravelCrossfilterRecharts();

  const originHeatData = macroHeatData?.origin || [];
  const destinationHeatData = macroHeatData?.destination || [];

  const {
    totalTrips,
    avgTime,
    pctMen,
    pctWomen,
    tripsPerHousehold,
    avgTripsByEstrato,
    vehiclesPerHousehold,
    vehiclesByEstrato,
  } = useKpiStats(filteredTrips, filteredPersons, filteredHouseholds);

  const [exportingFormat, setExportingFormat] = useState(null);

  const baseKpis = useMemo(() => {
    const total = trips.length;
    const avgTimeGlobal = total
      ? trips.reduce((acc, trip) => acc + (trip.durationMin ?? 0), 0) / total
      : 0;

    return {
      totalTrips: total,
      avgTime: avgTimeGlobal,
    };
  }, [trips]);

  const toggleFilter = useCallback(
    (key, value) => {
      const current = filters.thematicFilters[key];
      setThematicValue(key, current === value ? null : value);
    },
    [filters.thematicFilters, setThematicValue]
  );

  const toggleMacrozona = useCallback(
    (value) => {
      setMacrozona(filters.macrozona === value ? null : value);
    },
    [filters.macrozona, setMacrozona]
  );

  const selectedMacrozonaLabel = useMemo(() => {
    if (!filters.macrozona) return null;
    const prefix = `${filters.municipio} - `;
    return filters.macrozona.startsWith(prefix)
      ? filters.macrozona.replace(prefix, "")
      : filters.macrozona;
  }, [filters.macrozona, filters.municipio]);

  const buildHeatDistribution = useCallback(
    (sourceData = []) => {
      if (!sourceData?.length) return [];

      return sourceData
        .map(({ name, value }) => {
          const label =
            filters.municipio !== "AMVA General" && name.startsWith(`${filters.municipio} - `)
              ? name.replace(`${filters.municipio} - `, "")
              : name;

          return {
            label,
            value,
          };
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
    },
    [filters.municipio]
  );

  const macroHeatBarData = useMemo(
    () => ({
      origin: buildHeatDistribution(originHeatData),
      destination: buildHeatDistribution(destinationHeatData),
    }),
    [buildHeatDistribution, destinationHeatData, originHeatData]
  );

  const kpiContext = useMemo(() => {
    const tripsShare = baseKpis.totalTrips
      ? (totalTrips / baseKpis.totalTrips) * 100
      : 0;
    const timeDelta = baseKpis.avgTime
      ? ((avgTime - baseKpis.avgTime) / baseKpis.avgTime) * 100
      : 0;

    return {
      tripsLine: `${tripsShare.toFixed(1)}% del total`,
      timeLine: `${Math.abs(timeDelta).toFixed(1)} ${
        timeDelta >= 0 ? "más" : "menos"
      } que el promedio total`,
    };
  }, [avgTime, baseKpis, totalTrips]);

  const dashboardRef = useRef(null);

  const loadExternalLib = async (url, globalName) => {
    if (window[globalName]) return window[globalName];

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.onload = () => resolve(window[globalName]);
      script.onerror = () => reject(new Error(`No se pudo cargar ${url}`));
      document.body.appendChild(script);
    });
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportReport = async (format) => {
    setExportingFormat(format);
    const filename = `reporte-viajes.${format === "excel" ? "xlsx" : "pdf"}`;

    const summaryText = `Municipio seleccionado: ${filters.municipio}\nMacrozona activa: ${
      selectedMacrozonaLabel || "Todas"
    }\nViajes totales (global): ${baseKpis.totalTrips}\nTiempo promedio global: ${baseKpis.avgTime.toFixed(
      1
    )} min\nViajes filtrados actuales: ${totalTrips}\nTiempo promedio filtrado: ${avgTime.toFixed(
      1
    )} min\nViajes por hogar (filtrado): ${tripsPerHousehold}\nVehículos por hogar (filtrado): ${vehiclesPerHousehold}\nParticipación mujeres: ${pctWomen}%\nParticipación hombres: ${pctMen}%`;

    const buildExcel = async () => {
      const XLSX = await loadExternalLib(
        "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",
        "XLSX"
      );

      const workbook = XLSX.utils.book_new();

      const summarySheet = XLSX.utils.json_to_sheet([
        {
          Municipio: filters.municipio,
          Macrozona: selectedMacrozonaLabel || "Todas",
          "Viajes totales (global)": baseKpis.totalTrips,
          "Tiempo promedio global (min)": Number(baseKpis.avgTime.toFixed(1)),
          "Viajes filtrados": totalTrips,
          "Tiempo promedio filtrado (min)": Number(avgTime.toFixed(1)),
          "Viajes por hogar": tripsPerHousehold,
          "Promedio viajes por estrato": avgTripsByEstrato,
          "Vehículos por hogar": vehiclesPerHousehold,
          "Vehículos por estrato": vehiclesByEstrato,
          "% Mujeres": pctWomen,
          "% Hombres": pctMen,
        },
      ]);

      const modeSheet = XLSX.utils.json_to_sheet(
        modeData.map((item) => ({ "Modo principal": item.label, "% del total": item.value }))
      );

      const purposeSheet = XLSX.utils.json_to_sheet(
        purposeData.map((item) => ({ Motivo: item.label, "% del total": item.value }))
      );

      const occupationSheet = XLSX.utils.json_to_sheet(
        occupationData.map((item) => ({ Ocupacion: item.label, "% del total": item.value }))
      );

      const vehicleSheet = XLSX.utils.json_to_sheet(
        vehicleTenureData.map((item) => ({ "Tenencia vehicular por cada mil habitantes": item.label, "% del total": item.value }))
      );

      const estratoSheet = XLSX.utils.json_to_sheet(
        estratoData.map((item) => ({ Estrato: item.label, "% del total": item.value }))
      );

      const edadSheet = XLSX.utils.json_to_sheet(
        edadData.map((item) => ({ Edad: item.label, "% del total": item.value }))
      );

      const generoSheet = XLSX.utils.json_to_sheet(
        generoData.map((item) => ({ Genero: item.name, "% del total": item.value }))
      );

      const escolaridadSheet = XLSX.utils.json_to_sheet(
        escolaridadData.map((item) => ({ Escolaridad: item.label, "% del total": item.value }))
      );

        XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen");
        XLSX.utils.book_append_sheet(workbook, modeSheet, "Modo principal");
        XLSX.utils.book_append_sheet(workbook, purposeSheet, "Motivo");
        XLSX.utils.book_append_sheet(workbook, occupationSheet, "Ocupación");
        XLSX.utils.book_append_sheet(workbook, vehicleSheet, "Tenencia vehicular");
        XLSX.utils.book_append_sheet(workbook, estratoSheet, "Estrato");
        XLSX.utils.book_append_sheet(workbook, edadSheet, "Edad");
        XLSX.utils.book_append_sheet(workbook, generoSheet, "Género");
        XLSX.utils.book_append_sheet(workbook, escolaridadSheet, "Escolaridad");

      const wbout = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      downloadBlob(new Blob([wbout], { type: "application/octet-stream" }), filename);
    };

    const buildPdf = async () => {
      const { jsPDF } = await loadExternalLib(
        "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js",
        "jspdf"
      );

      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 36;

      let cursorY = margin;

      const ensureSpace = (needed) => {
        if (cursorY + needed > pageHeight - margin) {
          pdf.addPage();
          cursorY = margin;
        }
      };

      const drawBarSection = (title, data, color = PRIMARY_GREEN) => {
        if (!data?.length) return;
        ensureSpace(30 + data.length * 18);
        pdf.setFontSize(12);
        pdf.text(title, margin, cursorY);
        cursorY += 12;

        const labelWidth = 170;
        const maxWidth = pageWidth - margin * 2 - labelWidth - 40;
        const maxValue = Math.max(...data.map((d) => d.value || 0), 1);

        data.forEach((item) => {
          const barWidth = (Math.min(item.value || 0, maxValue) / maxValue) * maxWidth;
          pdf.setFillColor(color);
          pdf.roundedRect(margin + labelWidth, cursorY - 9, barWidth, 12, 3, 3, "F");
          pdf.setFontSize(10);
          pdf.text(String(item.label || item.name), margin, cursorY);
          pdf.text(`${item.value}${item.value && item.value > 0 ? " %" : ""}`.trim(), margin + labelWidth + barWidth + 8, cursorY);
          cursorY += 16;
        });
        cursorY += 8;
      };

      const drawLineSection = (title, points) => {
        if (!points?.length) return;
        ensureSpace(180);
        pdf.setFontSize(12);
        pdf.text(title, margin, cursorY);
        cursorY += 12;

        const chartHeight = 110;
        const chartWidth = pageWidth - margin * 2 - 20;
        const startX = margin;
        const startY = cursorY + chartHeight;
        const maxValue = Math.max(...points.map((p) => p.value), 1);

        pdf.setDrawColor("#e5e7eb");
        pdf.rect(startX, cursorY, chartWidth, chartHeight);

        points.forEach((point, idx) => {
          const x =
            startX + (idx / Math.max(points.length - 1, 1)) * chartWidth;
          const y = startY - (point.value / maxValue) * (chartHeight - 10);
          if (idx === 0) {
            pdf.setDrawColor("#22c55e");
            pdf.moveTo(x, y);
          } else {
            pdf.lineTo(x, y);
          }
        });
        pdf.stroke();

        pdf.setFontSize(9);
        pdf.text(`${points[0].hour} - ${points[points.length - 1].hour}`, startX, startY + 12);
        cursorY = startY + 24;
      };

      pdf.setFontSize(16);
      pdf.text("Reporte de viajes", margin, cursorY);
      cursorY += 16;
      pdf.setFontSize(10);
      pdf.text(summaryText.split("\n"), margin, cursorY + 2);
      cursorY += summaryText.split("\n").length * 12 + 10;

      const chartSections = [
        { title: "Modo principal", data: modeData, color: MODE_BAR_COLOR },
        { title: "Motivo", data: purposeData, color: PRIMARY_GREEN },
        { title: "Ocupación", data: occupationData, color: OCCUPATION_BAR_COLOR },
        { title: "Cantidad de etapas", data: stageData, color: STAGE_BAR_COLOR },
        { title: "Estrato", data: estratoData, color: PRIMARY_GREEN },
        { title: "Edad", data: edadData, color: PRIMARY_GREEN },
        { title: "Escolaridad", data: escolaridadData, color: PRIMARY_GREEN },
        {
          title: "Género",
          data: generoData.map((item) => ({ label: item.name, value: item.value })),
          color: PRIMARY_GREEN,
        },
        { title: "Tenencia vehicular por cada mil habitantes", data: vehicleTenureData, color: PRIMARY_GREEN },
      ];

      chartSections.forEach((section) =>
        drawBarSection(section.title, section.data, section.color)
      );
      drawLineSection("Distribución horaria", hourlyTripShareData);

      pdf.save(filename);
    };

    try {
      if (format === "excel") {
        await buildExcel();
        return;
      }

      await buildPdf();
    } finally {
      setExportingFormat(null);
    }
  };

  const exportingLabel = exportingFormat === "excel" ? "Excel" : "PDF";

  return (
    <>
      <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
        <main
          ref={dashboardRef}
          style={{
            width: "100%",
            maxWidth: "1500px",
            margin: "0 auto",
            padding: "32px 32px 48px",
          }}
        >
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button
          onClick={() => exportReport("pdf")}
          style={{
            border: "1px solid #d1d5db",
            background: "#fff",
            borderRadius: 8,
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          Exportar PDF
        </button>
        <button
          onClick={() => exportReport("excel")}
          style={{
            border: "1px solid #d1d5db",
            background: "#fff",
            borderRadius: 8,
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          Exportar Excel
        </button>
      </div>

      {/* KPIs */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
          marginBottom: 20,
        }}
      >
        <KpiCard
          label="Viajes totales"
          value={totalTrips.toLocaleString("es-CO")}
          subLabel={`Base global: ${baseKpis.totalTrips.toLocaleString("es-CO")}`}
          contextLines={[kpiContext.tripsLine]}
          accentColor={PRIMARY_GREEN}
        />

        <KpiCard
          label="Tiempo promedio"
          value={`${avgTime.toFixed(1)} min`}
          subLabel={`Promedio global: ${baseKpis.avgTime.toFixed(1)} min`}
          contextLines={[kpiContext.timeLine]}
          accentColor={TERTIARY_BLUE}
        />
      </section>

      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          marginBottom: 16,
          padding: "10px 12px",
          background: "#f8fafc",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
        }}
      >
        <label style={{ fontSize: "10pt", fontWeight: 700, color: "#0f172a" }}>
          Municipio
          <select
            value={filters.municipio}
            onChange={(e) => setMunicipio(e.target.value)}
            style={{
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              padding: "6px 8px",
              marginLeft: 8,
              background: "#fff",
              fontSize: 10,
            }}
          >
            {municipios.map((muni) => (
              <option key={muni} value={muni}>
                {muni}
              </option>
            ))}
          </select>
        </label>
        <div style={{ fontSize: "10pt", color: "#475569" }}>
          Selecciona macrozonas en la gráfica inferior para filtrar las demás
          visualizaciones (los mapas permanecen a nivel municipal).
        </div>
      </div>

      {/* Mapas y distribución de calor */}
      <section
        style={{
          marginBottom: 20,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
          gap: 16,
        }}
      >
        <HighchartsMapCard
          title="Mapa de calor de orígenes"
          data={originHeatData}
          palette="green"
        />
        <HighchartsMapCard
          title="Mapa de calor de destinos"
          data={destinationHeatData}
          palette="orange"
        />
      </section>

      <section
        style={{
          marginBottom: 28,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 16,
        }}
      >
        <BarChartCard
          title="Macrozonas de origen"
          data={macroHeatBarData.origin}
          xKey="label"
          yKey="value"
          color={BASE_BAR_COLOR}
          highlightKey={selectedMacrozonaLabel}
          onSelect={toggleMacrozona}
          showPercent={false}
        />
        <BarChartCard
          title="Macrozonas de destino"
          data={macroHeatBarData.destination}
          xKey="label"
          yKey="value"
          color={MACRO_DEST_BAR_COLOR}
          highlightKey={selectedMacrozonaLabel}
          onSelect={toggleMacrozona}
          showPercent={false}
        />
      </section>

      <section
        style={{
          background: "#f9fafb",
          borderRadius: 14,
          padding: 16,
          border: "1px solid #e5e7eb",
          marginBottom: 32,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
          gap: 24,
        }}
      >
        <ChartCard title="Análisis de Viajes">
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "grid",
              gap: 10,
            }}
          >
            {[ 
              {
                label: "Viajes filtrados",
                value: totalTrips.toLocaleString("es-CO"),
                detail: `${filters.municipio}${
                  selectedMacrozonaLabel ? ` · ${selectedMacrozonaLabel}` : ""
                }`,
                color: PRIMARY_GREEN,
              },
              {
                label: "Viajes por hogar",
                value: tripsPerHousehold,
                color: TERTIARY_BLUE,
              },
              {
                label: "Prom. viajes por estrato",
                value: avgTripsByEstrato,
                color: SECONDARY_GREEN,
              },
              {
                label: "Vehículos por hogar",
                value: vehiclesPerHousehold,
                color: TERTIARY_ORANGE,
              },
              {
                label: "Vehículos por estrato",
                value: vehiclesByEstrato,
                color: TERTIARY_PINK,
              },
            ].map((item) => (
              <li
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: item.color,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>{item.label}</div>
                  {item.detail && (
                    <div style={{ fontSize: "10pt", color: "#475569" }}>
                      {item.detail}
                    </div>
                  )}
                </div>
                <div style={{ fontWeight: 800, color: "#0f172a" }}>
                  {typeof item.value === "number" ? item.value.toLocaleString("es-CO") : item.value}
                </div>
              </li>
            ))}
          </ul>
        </ChartCard>
      </section>

      <section
        style={{
          background: "#f9fafb",
          borderRadius: 14,
          padding: 16,
          border: "1px solid #e5e7eb",
          marginBottom: 32,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          gap: 24,
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 16, gridColumn: "1 / -1" }}>
          Análisis descriptivo de los viajes realizados
        </h3>
        <BarChartCard
          title="Modo principal"
          data={modeData}
          xKey="label"
          yKey="value"
          color={MODE_BAR_COLOR}
          highlightKey={filters.thematicFilters.mode}
          onSelect={(value) => toggleFilter("mode", value)}
        />

        <PieChartCard
          title="Motivo"
          data={purposeData.map((item) => ({ name: item.label, value: item.value }))}
          dataKey="value"
          nameKey="name"
          selectedKey={filters.thematicFilters.tripPurpose}
          onSelect={(value) => toggleFilter("tripPurpose", value)}
        />

        <BarChartCard
          title="Ocupación"
          data={occupationData}
          xKey="label"
          yKey="value"
          color={OCCUPATION_BAR_COLOR}
          highlightKey={filters.thematicFilters.occupation}
          onSelect={(value) => toggleFilter("occupation", value)}
        />

        <BarChartCard
          title="Cantidad de etapas"
          data={stageData}
          xKey="label"
          yKey="value"
          color={STAGE_BAR_COLOR}
          highlightKey={filters.thematicFilters.stageBucket}
          onSelect={(value) => toggleFilter("stageBucket", value)}
        />

        <div style={{ gridColumn: "span 2" }}>
          <HourlyModeChartCard
            title="Distribución horaria"
            data={hourlyTripShareData}
          />
        </div>
      </section>

      {/* Tabs + gráficos inferiores */}
      <section
        style={{
          background: "#f9fafb",
          borderRadius: 14,
          padding: 16,
          border: "1px solid #e5e7eb",
        }}
      >
        <h3 style={{ marginTop: 0 }}>
          Distribución del total de viajes por variables socioeconómicas
        </h3>
        <TabbedChartsRecharts
          estratoData={estratoData}
          edadData={edadData}
          generoData={generoData}
          escolaridadData={escolaridadData}
          vehicleData={vehicleTenureData}
          selectedFilters={filters.thematicFilters}
          onSelect={toggleFilter}
        />
      </section>
        </main>

        {exportingFormat && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(102,204,51,0.78)",
              zIndex: 2000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "auto",
              padding: 16,
            }}
          >
            <div
              style={{
                background: "#ffffff",
                color: "#0f172a",
                padding: "18px 20px",
                borderRadius: 12,
                boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
                border: `1px solid ${SECONDARY_GREEN}`,
                maxWidth: 360,
                width: "100%",
                textAlign: "center",
              }}
            >
              <img
                src={logoAmva}
                alt="Logo Área Metropolitana"
                style={{ width: 82, height: 82, objectFit: "contain", margin: "0 auto 10px" }}
              />
              <div style={{ fontWeight: 800, fontSize: 10, marginBottom: 6, color: SECONDARY_GREEN }}>
                Generando informe en {exportingLabel}
              </div>
              <p style={{ fontSize: 10, margin: 0, color: "#0f172a" }}>
                Por favor espera unos segundos mientras preparamos tu archivo.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// ---------- App raíz --------------
const App = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />
      <DashboardSection />
      <Footer />
    </div>
  );
};

export default App;