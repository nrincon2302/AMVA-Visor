import React, { useEffect, useMemo, useRef, useState, useTransition } from "react";
import KpiCard from "./components/KpiCard";
import HighchartsMapCard from "./components/HighchartsMapCard";
import BarChartCard from "./components/BarChartCard";
import HourlyModeChartCard from "./components/HourlyModeChartCard";
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
const COMPARE_COLORS = [TERTIARY_BLUE, TERTIARY_PINK, TERTIARY_YELLOW];
const BANNER_IMAGE_URL = "https://www.metropol.gov.co/BannerInternas/Observatorio.jpg";

const buildBannerGradient = (color) => ({
  backgroundImage: `linear-gradient(90deg, ${color} 0%, ${color} 45%, rgba(255,255,255,0.12) 100%), url('${BANNER_IMAGE_URL}')`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
});

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
            `linear-gradient(120deg, rgba(255,255,255,0.22), rgba(0,0,0,0.2)), url('${BANNER_IMAGE_URL}')`,
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
          <div style={{ fontSize: "10pt", opacity: 0.95, marginBottom: 10 }}>
            Inicio &gt; Observatorio &gt; Encuesta origen destino
          </div>
          <h2 style={{ margin: 0, fontSize: 22, marginBottom: 10, letterSpacing: 0.4 }}>
            ENCUESTA ORIGEN DESTINO 2025
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
              fontSize: 20,
              fontWeight: 700,
            }}
        >
          <div
            style={{
              width: 74,
              height: 74,
              background: PRIMARY_GREEN,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 6,
            }}
          >
            <img
              src={logoAmva}
              alt="Logo Área Metropolitana"
              style={{ height: "100%", width: "100%", objectFit: "contain" }}
            />
          </div>
          <span style={{ fontSize: 26, fontWeight: 800 }}>
            Encuesta Origen Destino 2025 - Análisis de Viajes
          </span>
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
  const {
    filters,
    municipios,
    setMunicipio,
    setDestinationMunicipio,
    setThematicValues,
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
    vehicleTypeData,
    vehicleModelData,
    hourlyTripShareData,
    trips,
    isLoading,
    thematicOptions,
  } = useTravelCrossfilterRecharts();

  const buildHeatSeries = (tripsSource, key) => {
    const counts = tripsSource.reduce((acc, trip) => {
      const value = trip[key];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };


  const {
    totalTrips,
    avgTime,
    pctMen,
    pctWomen,
    tripsPerHousehold,
    avgTripsByEstrato,
    vehiclesPerHousehold,
    vehiclesPerPerson,
    vehiclesByEstrato,
  } = useKpiStats(filteredTrips, filteredPersons, filteredHouseholds);

  const [exportingFormat, setExportingFormat] = useState(null);
  const [isPdfExporting, setIsPdfExporting] = useState(false);

  const [baseKpis, setBaseKpis] = useState({ totalTrips: 0, avgTime: 0 });
  const [displayOriginHeatData, setDisplayOriginHeatData] = useState([]);
  const [displayDestinationHeatData, setDisplayDestinationHeatData] = useState([]);
  const [originHighlightKeys, setOriginHighlightKeys] = useState([]);
  const [destinationHighlightKeys, setDestinationHighlightKeys] = useState([]);
  const [selectedOriginKeys, setSelectedOriginKeys] = useState([]);
  const [selectedDestinationKeys, setSelectedDestinationKeys] = useState([]);
  const [destinationTableData, setDestinationTableData] = useState([]);
  const [kpiContext, setKpiContext] = useState({ tripsLine: "", timeLine: "" });
  const thematicConfig = [
    { key: "estrato", label: "Estrato", options: thematicOptions.estrato },
    { key: "ageRange", label: "Edad", options: thematicOptions.ageRange },
    { key: "gender", label: "Género", options: thematicOptions.gender },
    { key: "occupation", label: "Ocupación", options: thematicOptions.occupation },
    { key: "edu", label: "Escolaridad", options: thematicOptions.edu },
  ];

  const [activeThematicKey, setActiveThematicKey] = useState("estrato");
  const activeThematic = thematicConfig.find((item) => item.key === activeThematicKey);

  const selectedThematicValues = filters.thematicFilters[activeThematicKey] || [];
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [activeMapThematicValue, setActiveMapThematicValue] = useState(null);
  const [localSelectedValues, setLocalSelectedValues] = useState(selectedThematicValues);
  const [isPending, startTransition] = useTransition();
  const [analysisView, setAnalysisView] = useState("viajes");
  const isSelectionLimitReached = isCompareMode && localSelectedValues.length >= 3;
  const selectedCompareValues = isCompareMode ? localSelectedValues.slice(0, 3) : [];
  const isAllSelected = localSelectedValues.length === (activeThematic?.options?.length || 0);
  const selectedColorMap = new Map(
    selectedCompareValues.map((value, index) => [value, COMPARE_COLORS[index]])
  );

  useEffect(() => {
    if (!isCompareMode) {
      setActiveMapThematicValue(null);
      return;
    }
    if (!selectedCompareValues.length) {
      setActiveMapThematicValue(null);
      return;
    }
    if (!selectedCompareValues.includes(activeMapThematicValue)) {
      setActiveMapThematicValue(selectedCompareValues[0]);
    }
  }, [isCompareMode, selectedCompareValues, activeMapThematicValue]);

  const mapTrips = useMemo(() => {
    if (isCompareMode && activeMapThematicValue) {
      return filteredTrips.filter(
        (trip) => trip[activeThematicKey] === activeMapThematicValue
      );
    }
    return filteredTrips;
  }, [filteredTrips, isCompareMode, activeMapThematicValue, activeThematicKey]);

  const originHeatData = useMemo(
    () => buildHeatSeries(mapTrips, "originKey"),
    [mapTrips]
  );
  const destinationHeatData = useMemo(
    () => buildHeatSeries(mapTrips, "destinationKey"),
    [mapTrips]
  );

  const macroHeatBarData = useMemo(
    () => ({
      origin: buildHeatDistribution(originHeatData, filters.municipio),
      destination: buildHeatDistribution(destinationHeatData, filters.destinationMunicipio),
    }),
    [originHeatData, destinationHeatData, filters.municipio, filters.destinationMunicipio]
  );

  const toggleThematicValue = (value) => {
    if (!isCompareMode) return;
    const normalizedValue =
      activeThematicKey === "estrato" ? Number(value) : value;
    const current = localSelectedValues || [];
    const exists = current.includes(normalizedValue);
    if (!exists && current.length >= 3) return;
    const nextValues = exists
      ? current.filter((item) => item !== normalizedValue)
      : [...current, normalizedValue];

    setLocalSelectedValues(nextValues);
    startTransition(() => {
      setThematicValues(activeThematicKey, nextValues);
    });
  };

  const handleThematicKeyChange = (value) => {
    setActiveThematicKey(value);
    setIsCompareMode(false);
  };

  useEffect(() => {
    setLocalSelectedValues(selectedThematicValues);
  }, [selectedThematicValues, activeThematicKey]);

  useEffect(() => {
    const total = trips.length;
    const avgTimeGlobal = total
      ? trips.reduce((acc, trip) => acc + (trip.durationMin ?? 0), 0) / total
      : 0;
    setBaseKpis({ totalTrips: total, avgTime: avgTimeGlobal });
  }, [trips]);

  useEffect(() => {
    setSelectedOriginKeys([]);
    setSelectedDestinationKeys([]);
  }, [filters.municipio, filters.destinationMunicipio]);

  useEffect(() => {
    if (selectedDestinationKeys.length) {
      return;
    }
    if (!selectedOriginKeys.length) {
      setDisplayOriginHeatData(originHeatData);
      setDisplayDestinationHeatData(destinationHeatData);
      setOriginHighlightKeys([]);
      setDestinationHighlightKeys([]);
      return;
    }

    const selectedSet = new Set(selectedOriginKeys);
    const originFiltered = originHeatData.filter((item) => selectedSet.has(item.name));
    setDisplayOriginHeatData(originFiltered);
    setOriginHighlightKeys(selectedOriginKeys);

    const selectedTrips = filteredTrips.filter((trip) => selectedSet.has(trip.originKey));
    const destinationCounts = selectedTrips.reduce((acc, trip) => {
      acc[trip.destinationKey] = (acc[trip.destinationKey] || 0) + 1;
      return acc;
    }, {});

    const destinationSeries = Object.entries(destinationCounts).map(([name, value]) => ({
      name,
      value,
    }));
    setDisplayDestinationHeatData(destinationSeries);
    setDestinationHighlightKeys(destinationSeries.map((item) => item.name));
  }, [selectedOriginKeys, originHeatData, destinationHeatData, filteredTrips]);

  useEffect(() => {
    if (!selectedDestinationKeys.length) {
      return;
    }

    const selectedSet = new Set(selectedDestinationKeys);
    const destinationFiltered = destinationHeatData.filter((item) => selectedSet.has(item.name));
    setDisplayDestinationHeatData(destinationFiltered);
    setDestinationHighlightKeys(selectedDestinationKeys);

    const selectedTrips = filteredTrips.filter((trip) =>
      selectedSet.has(trip.destinationKey)
    );
    const originCounts = selectedTrips.reduce((acc, trip) => {
      acc[trip.originKey] = (acc[trip.originKey] || 0) + 1;
      return acc;
    }, {});

    const originSeries = Object.entries(originCounts).map(([name, value]) => ({
      name,
      value,
    }));
    setDisplayOriginHeatData(originSeries);
    setOriginHighlightKeys(originSeries.map((item) => item.name));
  }, [selectedDestinationKeys, destinationHeatData, filteredTrips]);

  useEffect(() => {
    const tripsShare = baseKpis.totalTrips
      ? (totalTrips / baseKpis.totalTrips) * 100
      : 0;
    const timeDelta = baseKpis.avgTime
      ? ((avgTime - baseKpis.avgTime) / baseKpis.avgTime) * 100
      : 0;

    setKpiContext({
      tripsLine: `${tripsShare.toFixed(1)}% del total`,
      timeLine: `${Math.abs(timeDelta).toFixed(1)} ${
        timeDelta >= 0 ? "más" : "menos"
      } que el Valle de Aburrá`,
    });
  }, [avgTime, baseKpis, totalTrips]);

  useEffect(() => {
    setDestinationTableData(
      buildHeatDistribution(displayDestinationHeatData, filters.destinationMunicipio)
    );
  }, [displayDestinationHeatData, filters.destinationMunicipio]);


  const buildComparisonSeries = (tripsSource, categoryKey, categories = []) => {
    const series = selectedCompareValues.map((value, index) => ({
      key: `series_${index}`,
      label: value,
      color: COMPARE_COLORS[index],
    }));
    const categoryLabels = categories.map((item) => item.label);
    const totals = Object.fromEntries(series.map((item) => [item.label, 0]));
    const counts = Object.fromEntries(series.map((item) => [item.label, {}]));

    tripsSource.forEach((trip) => {
      const thematicValue = trip[activeThematicKey];
      if (!totals.hasOwnProperty(thematicValue)) return;
      totals[thematicValue] += 1;
      const categoryValue = trip[categoryKey];
      const categoryCounts = counts[thematicValue];
      categoryCounts[categoryValue] = (categoryCounts[categoryValue] || 0) + 1;
    });

    const data = categoryLabels.map((label) => {
      const row = { label };
      series.forEach((item) => {
        const total = totals[item.label] || 0;
        const count = counts[item.label]?.[label] || 0;
        row[item.key] = total ? Number(((count / total) * 100).toFixed(1)) : 0;
      });
      return row;
    });

    return { data, series };
  };

  const buildHourlySeries = (tripsSource) => {
    const series = selectedCompareValues.map((value, index) => ({
      key: `series_${index}`,
      label: value,
      color: COMPARE_COLORS[index],
    }));
    const hourlyCounts = Object.fromEntries(
      series.map((item) => [item.label, Array.from({ length: 24 }, () => 0)])
    );

    tripsSource.forEach((trip) => {
      const thematicValue = trip[activeThematicKey];
      if (!hourlyCounts[thematicValue]) return;
      hourlyCounts[thematicValue][trip.departureHour] += 1;
    });

    const data = Array.from({ length: 24 }, (_, hour) => {
      const row = { hour: `${hour.toString().padStart(2, "0")}:00` };
      series.forEach((item) => {
        row[item.key] = hourlyCounts[item.label]?.[hour] || 0;
      });
      return row;
    });

    return { data, series };
  };

  function buildHeatDistribution(sourceData = [], municipioFilter) {
    if (!sourceData?.length) return [];

    return sourceData
      .filter(({ name }) =>
        municipioFilter && municipioFilter !== "AMVA General"
          ? name.startsWith(`${municipioFilter} - `)
          : true
      )
      .map(({ name, value }) => {
        const label =
          municipioFilter && municipioFilter !== "AMVA General" && name.startsWith(`${municipioFilter} - `)
            ? name.replace(`${municipioFilter} - `, "")
            : name;

        return {
          fullName: name,
          label,
          value,
        };
      })
      .sort((a, b) => b.value - a.value);
  }

  const hasComparison = isCompareMode && selectedCompareValues.length > 0;
  const modeComparison = hasComparison
    ? buildComparisonSeries(filteredTrips, "mode", modeData)
    : null;
  const purposeComparison = hasComparison
    ? buildComparisonSeries(filteredTrips, "tripPurpose", purposeData)
    : null;
  const stageComparison = hasComparison
    ? buildComparisonSeries(filteredTrips, "stageBucket", stageData)
    : null;
  const hourlyComparison = hasComparison ? buildHourlySeries(filteredTrips) : null;
  const socioEstratoComparison = hasComparison
    ? buildComparisonSeries(filteredTrips, "estrato", socioEstratoData)
    : null;
  const socioGeneroComparison = hasComparison
    ? buildComparisonSeries(filteredTrips, "gender", socioGeneroData)
    : null;
  const socioOcupacionComparison = hasComparison
    ? buildComparisonSeries(filteredTrips, "occupation", socioOcupacionData)
    : null;
  const socioEscolaridadComparison = hasComparison
    ? buildComparisonSeries(filteredTrips, "edu", socioEscolaridadData)
    : null;
  const socioEdadComparison = hasComparison
    ? buildComparisonSeries(filteredTrips, "ageRange", socioEdadData)
    : null;
  const vehiculoTenenciaComparison = hasComparison
    ? buildComparisonSeries(filteredTrips, "vehicleBucket", vehicleTenureData)
    : null;
  const vehiculoTipoComparison = hasComparison
    ? buildComparisonSeries(filteredTrips, "vehicleType", vehicleTypeData)
    : null;
  const vehiculoModeloComparison = hasComparison
    ? buildComparisonSeries(filteredTrips, "vehicleModel", vehicleModelData)
    : null;

  const socioEstratoData = estratoData.map((item) => ({
    label: `Estrato ${item.label}`,
    value: item.value,
  }));
  const socioEdadData = edadData.map((item) => ({
    label: item.label,
    value: item.value,
  }));
  const socioGeneroData = generoData.map((item) => ({
    label: item.name,
    value: item.value,
  }));
  const socioEscolaridadData = escolaridadData.map((item) => ({
    label: item.label,
    value: item.value,
  }));
  const socioOcupacionData = occupationData.map((item) => ({
    label: item.label,
    value: item.value,
  }));
  const vehicleTenurePerThousand = vehicleTenureData;
  const vehicleTypePerThousand = vehicleTypeData;

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
    if (format === "pdf") {
      setIsPdfExporting(true);
    }

    const geoSelectionLabel = `Municipio origen: ${filters.municipio} | Municipio destino: ${filters.destinationMunicipio}`;

    const summaryText = `${geoSelectionLabel}\nViajes totales (global): ${
      baseKpis.totalTrips
    }\nTiempo Valle de Aburrá: ${baseKpis.avgTime.toFixed(1)} min\nViajes filtrados actuales: ${totalTrips}\nTiempo Valle de Aburrá (filtro): ${avgTime.toFixed(
      1
    )} min\nViajes por hogar Valle de Aburrá: ${tripsPerHousehold}\nVehículos por hogar Valle de Aburrá: ${vehiclesPerHousehold}\nParticipación mujeres: ${pctWomen}%\nParticipación hombres: ${pctMen}%`;

    const buildExcel = async () => {
      const XLSX = await loadExternalLib(
        "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",
        "XLSX"
      );

      const workbook = XLSX.utils.book_new();

      const summarySheet = XLSX.utils.json_to_sheet([
        {
          "Filtro geográfico": geoSelectionLabel,
          "Viajes totales (global)": baseKpis.totalTrips,
          "Tiempo Valle de Aburrá (min)": Number(baseKpis.avgTime.toFixed(1)),
          "Viajes filtrados": totalTrips,
          "Tiempo Valle de Aburrá (filtro)": Number(avgTime.toFixed(1)),
          "Viajes por hogar Valle de Aburrá": tripsPerHousehold,
          "Viajes por estrato Valle de Aburrá": avgTripsByEstrato,
          "Vehículos por hogar Valle de Aburrá": vehiclesPerHousehold,
          "Vehículos por estrato Valle de Aburrá": vehiclesByEstrato,
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
        vehicleTenureData.map((item) => ({
          "Tenencia vehicular": item.label,
          "% del total": item.value,
        }))
      );

      const vehicleTypeSheet = XLSX.utils.json_to_sheet(
        vehicleTypeData.map((item) => ({ "Tipo de vehículo": item.label, "% del total": item.value }))
      );

      const vehicleModelSheet = XLSX.utils.json_to_sheet(
        vehicleModelData.map((item) => ({
          "Modelo de vehículo": item.label,
          "% del total": item.value,
        }))
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
        XLSX.utils.book_append_sheet(workbook, vehicleTypeSheet, "Tipo de vehículo");
        XLSX.utils.book_append_sheet(workbook, vehicleModelSheet, "Modelo de vehículo");
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
      const html2canvas = await loadExternalLib(
        "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js",
        "html2canvas"
      );

      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 28;
      const contentWidth = pageWidth - margin * 2;

      let cursorY = margin;

      const addFooter = () => {
        const pageCount = pdf.getNumberOfPages();
        const current = pdf.getCurrentPageInfo().pageNumber;
        pdf.setFontSize(9);
        pdf.text(
          `Página ${current} de ${pageCount}`,
          pageWidth - margin,
          pageHeight - 18,
          { align: "right" }
        );
      };

      const addTitle = (title) => {
        pdf.setFontSize(20);
        pdf.setTextColor("#0f172a");
        pdf.text(title, margin, cursorY);
        cursorY += 22;
      };

      const addSubtitle = (title) => {
        pdf.setFontSize(13);
        pdf.setTextColor("#0f172a");
        pdf.text(title, margin, cursorY);
        cursorY += 14;
      };

      const ensureSpace = (needed) => {
        if (cursorY + needed > pageHeight - margin) {
          addFooter();
          pdf.addPage();
          cursorY = margin;
        }
      };

      const loadImageDataUrl = async (url) => {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("No se pudo leer el logo"));
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          return null;
        }
      };

      const logoDataUrl = await loadImageDataUrl(logoAmva);

      if (logoDataUrl) {
        pdf.setFillColor(102, 204, 51);
        pdf.roundedRect(margin - 6, cursorY - 6, 60, 60, 8, 8, "F");
        pdf.addImage(logoDataUrl, "PNG", margin, cursorY, 48, 48);
      }
      pdf.setFontSize(16);
      pdf.setTextColor("#0f172a");
      pdf.text("Encuesta Origen - Destino", margin + 60, cursorY + 18);
      pdf.setFontSize(12);
      pdf.text("Análisis de Viajes", margin + 60, cursorY + 36);
      cursorY += 60;

      const generatedAt = new Date().toLocaleString("es-CO");
      pdf.setFontSize(10);
      pdf.setTextColor("#475569");
      pdf.text(`Fecha de generación: ${generatedAt}`, margin, cursorY);
      cursorY += 16;

      addSubtitle("Filtros aplicados");

      const filterRows = [
        ["Municipio", filters.municipio],
      ];
      const thematicRows = Object.entries(filters.thematicFilters)
        .filter(([, values]) => values.length)
        .map(([key, values]) => {
          const label =
            thematicConfig.find((item) => item.key === key)?.label || key;
          return [label, values.join(", ")];
        });
      const allRows = [...filterRows, ...thematicRows];

      const tableStartY = cursorY;
      const col1Width = contentWidth * 0.35;
      const col2Width = contentWidth * 0.65;
      const rowHeight = 18;

      pdf.setDrawColor("#cbd5e1");
      pdf.rect(margin, tableStartY, contentWidth, rowHeight, "S");
      pdf.setFontSize(10);
      pdf.setTextColor("#0f172a");
      pdf.text("Filtro", margin + 6, tableStartY + 12);
      pdf.text("Selección", margin + col1Width + 6, tableStartY + 12);

      let tableCursor = tableStartY + rowHeight;
      allRows.forEach(([label, value]) => {
        pdf.rect(margin, tableCursor, contentWidth, rowHeight, "S");
        pdf.text(label, margin + 6, tableCursor + 12);
        pdf.text(value || "Todos", margin + col1Width + 6, tableCursor + 12);
        tableCursor += rowHeight;
      });

      cursorY = tableCursor + 12;

      addSubtitle("KPIs principales");
      pdf.setFontSize(10);
      pdf.setTextColor("#0f172a");
      [
        `Viajes totales: ${totalTrips.toLocaleString("es-CO")}`,
        `Tiempo Valle de Aburrá: ${avgTime.toFixed(1)} min`,
        `Viajes por hogar: ${tripsPerHousehold}`,
        `Vehículos por hogar: ${vehiclesPerHousehold}`,
      ].forEach((line) => {
        ensureSpace(14);
        pdf.text(line, margin, cursorY);
        cursorY += 12;
      });

      addFooter();
      pdf.addPage();
      cursorY = margin;

      addSubtitle("Mapas y distribución geográfica");
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mapBlocks = Array.from(
        dashboardRef.current?.querySelectorAll("[data-print-map]") || []
      );

      for (const mapBlock of mapBlocks) {
        const canvas = await html2canvas(mapBlock, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          windowWidth: mapBlock.scrollWidth,
        });
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const maxHeight = pageHeight - margin * 2;
        const finalHeight = Math.min(imgHeight, maxHeight);
        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          margin,
          cursorY,
          imgWidth,
          finalHeight
        );
        cursorY += finalHeight + 14;

        if (cursorY + finalHeight > pageHeight - margin) {
          addFooter();
          pdf.addPage();
          cursorY = margin;
        }
      }

      addFooter();
      pdf.addPage();
      cursorY = margin;

      addSubtitle("Gráficas de análisis");
      const analysisSection = dashboardRef.current?.querySelector("[data-print-section='viajes']");
      if (analysisSection) {
        const charts = Array.from(analysisSection.querySelectorAll(".chart-card"));
        const renderBlocks = charts.length ? charts : [analysisSection];

        for (const chart of renderBlocks) {
          const canvas = await html2canvas(chart, {
            scale: 2,
            backgroundColor: "#ffffff",
            useCORS: true,
            windowWidth: chart.scrollWidth,
          });
          const imgWidth = contentWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          const availableHeight = pageHeight - margin - cursorY;

          if (imgHeight > availableHeight) {
            addFooter();
            pdf.addPage();
            cursorY = margin;
          }

          pdf.addImage(canvas.toDataURL("image/png"), "PNG", margin, cursorY, imgWidth, imgHeight);
          cursorY += imgHeight + 14;
        }
      }

      addFooter();
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
      if (format === "pdf") {
        setIsPdfExporting(false);
      }
    }
  };

  const exportingLabel = exportingFormat === "excel" ? "Excel" : "PDF";

  const loadingOverlay = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(102,204,51,0.9)",
        zIndex: 3000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 12,
        color: "#ffffff",
        textAlign: "center",
        pointerEvents: "auto",
        padding: 20,
      }}
    >
      <style>
        {`
          @keyframes visorSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes visorGlow { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
        `}
      </style>
      <div style={{ position: "relative", width: 150, height: 150 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "6px solid rgba(255,255,255,0.24)",
            borderTopColor: "#ffffff",
            animation: "visorSpin 1s linear infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 18,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.16)",
            boxShadow: "0 14px 36px rgba(0,0,0,0.25)",
            animation: "visorGlow 1.6s ease-in-out infinite",
          }}
        />
        <img
          src={logoAmva}
          alt="Logo Área Metropolitana"
          style={{
            position: "absolute",
            inset: 32,
            width: "calc(100% - 64px)",
            height: "calc(100% - 64px)",
            objectFit: "contain",
            filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.25))",
          }}
        />
      </div>
      <div style={{ fontWeight: 900, letterSpacing: 0.6, fontSize: 13 }}>
        Cargando datos de movilidad
      </div>
      <p style={{ margin: 0, maxWidth: 520, fontSize: 11, lineHeight: 1.5 }}>
        Estamos preparando los registros sintéticos y filtros personalizados. Este proceso
        solo toma unos segundos.
      </p>
    </div>
  );

  return (
    <>
      {isLoading && loadingOverlay}
      <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
        <main
          ref={dashboardRef}
          className="dashboard-main"
          style={{
            width: "100%",
            maxWidth: "1500px",
            margin: "0 auto",
            padding: "32px 32px 48px",
          }}
        >
          <div
            className="dashboard-layout"
            style={{
              display: "grid",
              gridTemplateColumns: "280px minmax(0, 1fr)",
              gap: 24,
              alignItems: "start",
            }}
          >
            <aside
              className="dashboard-sidebar"
              data-print-section="filtros"
              style={{
                position: "sticky",
                top: 24,
                alignSelf: "start",
                borderRadius: 16,
                border: "1px solid #e5e7eb",
                background: "#f8fafc",
                padding: 16,
                boxShadow: "0 12px 24px rgba(15,23,42,0.08)",
                display: "grid",
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>
                  Variables geográficas
                </div>
                <label style={{ fontSize: 12, fontWeight: 600 }}>
                  Municipio
                  <select
                    value={filters.municipio}
                    onChange={(e) => setMunicipio(e.target.value)}
                    style={{
                      marginTop: 6,
                      width: "100%",
                      borderRadius: 10,
                      border: "1px solid #cbd5e1",
                      padding: "8px 10px",
                      background: "#fff",
                      fontSize: 12,
                    }}
                  >
                    {municipios.map((muni) => (
                      <option key={muni} value={muni}>
                        {muni}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginTop: 12 }}>
                  Municipio destino
                  <select
                    value={filters.destinationMunicipio}
                    onChange={(e) => setDestinationMunicipio(e.target.value)}
                    style={{
                      marginTop: 6,
                      width: "100%",
                      borderRadius: 10,
                      border: "1px solid #cbd5e1",
                      padding: "8px 10px",
                      background: "#fff",
                      fontSize: 12,
                    }}
                  >
                    {municipios.map((muni) => (
                      <option key={muni} value={muni}>
                        {muni}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>
                  Variables temáticas
                </div>
                <div style={{ display: "grid", gap: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 600 }}>
                    Selecciona variable
                    <select
                      value={activeThematicKey}
                      onChange={(e) => handleThematicKeyChange(e.target.value)}
                      style={{
                        marginTop: 6,
                        width: "100%",
                        borderRadius: 10,
                        border: "1px solid #cbd5e1",
                        padding: "8px 10px",
                        background: "#fff",
                        fontSize: 12,
                      }}
                    >
                      {thematicConfig.map((item) => (
                        <option key={item.key} value={item.key}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div
                    style={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      padding: "10px 12px",
                      background: "#ffffff",
                      maxHeight: 220,
                      overflowY: "auto",
                      display: "grid",
                      gap: 8,
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
                      {activeThematic?.label}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => {
                          const nextValues = activeThematic?.options || [];
                          const allowCompareWithAll = activeThematicKey === "estrato";
                          setIsCompareMode(allowCompareWithAll);
                          setLocalSelectedValues(nextValues);
                          startTransition(() => {
                            setThematicValues(activeThematicKey, nextValues);
                          });
                        }}
                        style={{
                          border: "1px solid #d1d5db",
                          background: isAllSelected ? SECONDARY_GREEN : "#ffffff",
                          color: isAllSelected ? "#ffffff" : "#0f172a",
                          borderRadius: 999,
                          padding: "4px 8px",
                          fontSize: 10,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Seleccionar todos
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCompareMode(true);
                          setLocalSelectedValues([]);
                          startTransition(() => {
                            setThematicValues(activeThematicKey, []);
                          });
                        }}
                        style={{
                          border: "1px solid #d1d5db",
                          background: isCompareMode ? SECONDARY_GREEN : "#ffffff",
                          color: isCompareMode ? "#ffffff" : "#0f172a",
                          borderRadius: 999,
                          padding: "4px 8px",
                          fontSize: 10,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Realizar comparación
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCompareMode(true);
                          setLocalSelectedValues([]);
                          startTransition(() => {
                            setThematicValues(activeThematicKey, []);
                          });
                        }}
                        style={{
                          border: "1px solid #d1d5db",
                          background: "#ffffff",
                          color: "#0f172a",
                          borderRadius: 999,
                          padding: "4px 8px",
                          fontSize: 10,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Seleccionar ninguno
                      </button>
                    </div>
                    <div style={{ fontSize: 10, color: "#64748b" }}>
                      {isCompareMode
                        ? "Selecciona hasta 3 opciones para comparar."
                        : "Todos los valores están incluidos."}
                      {isPending ? " Aplicando cambios..." : ""}
                    </div>
                    {(activeThematic?.options || []).map((option) => {
                      const optionValue = option;
                      const isChecked = localSelectedValues.includes(optionValue);
                      const highlightColor = selectedColorMap.get(optionValue);
                      return (
                        <label
                          key={optionValue}
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            fontSize: 12,
                            color: "#0f172a",
                            fontWeight: isChecked ? 600 : 500,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={!isCompareMode || (!isChecked && isSelectionLimitReached)}
                            onChange={() => toggleThematicValue(optionValue)}
                            style={{ display: "none" }}
                          />
                          <span
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: 4,
                              border: "1px solid #cbd5e1",
                              background: isChecked
                                ? highlightColor || SECONDARY_GREEN
                                : "#ffffff",
                              boxShadow: isChecked
                                ? "0 0 0 1px rgba(15,23,42,0.12) inset"
                                : "none",
                              opacity: !isCompareMode ? 0.6 : 1,
                              flexShrink: 0,
                            }}
                          />
                          {optionValue}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>
                  Vista de análisis
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  {[
                    { key: "viajes", label: "Análisis de viajes" },
                    { key: "socio", label: "Análisis socioeconómico" },
                    { key: "vehicular", label: "Análisis vehicular" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setAnalysisView(item.key)}
                      style={{
                        border: "1px solid #d1d5db",
                        background: analysisView === item.key ? SECONDARY_GREEN : "#ffffff",
                        color: analysisView === item.key ? "#ffffff" : "#0f172a",
                        borderRadius: 10,
                        padding: "6px 10px",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <button
                  onClick={() => exportReport("pdf")}
                  style={{
                    border: "none",
                    background: SECONDARY_GREEN,
                    borderRadius: 10,
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#ffffff",
                  }}
                >
                  Exportar PDF
                </button>
                <button
                  onClick={() => exportReport("excel")}
                  style={{
                    border: "none",
                    background: PRIMARY_GREEN,
                    borderRadius: 10,
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#ffffff",
                  }}
                >
                  Exportar Excel
                </button>
              </div>
            </aside>

            <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              <section
                data-print-section="kpis"
                className="section-card"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 16,
                  padding: 16,
                  boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
                }}
              >
                <h3 style={{ margin: "0 0 16px", fontSize: 18, color: "#0f172a" }}>
                  Cifras generales
                </h3>
                <div
                  className="kpi-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 20,
                  }}
                >
                  <KpiCard
                    label="Viajes totales"
                    value={totalTrips.toLocaleString("es-CO")}
                    subLabel={`Base global: ${baseKpis.totalTrips.toLocaleString("es-CO")}`}
                    contextLines={[kpiContext.tripsLine]}
                    accentColor={TERTIARY_PINK}
                    headerColor={TERTIARY_PINK}
                    headerTextColor="#0f172a"
                    bannerImageUrl={BANNER_IMAGE_URL}
                  />
                  <KpiCard
                    label="Tiempo Valle de Aburrá"
                    value={`${avgTime.toFixed(1)} min`}
                    subLabel={`Valle de Aburrá: ${baseKpis.avgTime.toFixed(1)} min`}
                    contextLines={[kpiContext.timeLine]}
                    accentColor={TERTIARY_BLUE}
                    headerColor={TERTIARY_BLUE}
                    bannerImageUrl={BANNER_IMAGE_URL}
                  />
                  <KpiCard
                    label="Viajes por hogar"
                    value={tripsPerHousehold}
                    subLabel="Viajes Valle de Aburrá"
                    accentColor={SECONDARY_GREEN}
                    headerColor={SECONDARY_GREEN}
                    bannerImageUrl={BANNER_IMAGE_URL}
                  />
                  <KpiCard
                    label="Vehículos por hogar"
                    value={vehiclesPerHousehold}
                    subLabel="Vehículos por hogar Valle de Aburrá"
                    accentColor={TERTIARY_ORANGE}
                    headerColor={TERTIARY_ORANGE}
                    bannerImageUrl={BANNER_IMAGE_URL}
                  />
                </div>
              </section>

              <section
                data-print-section="mapas"
                className="section-card"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 16,
                  padding: 16,
                  boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
                }}
              >
                <h3 style={{ margin: "0 0 16px", fontSize: 18, color: "#0f172a" }}>
                  Distribución geográfica de los viajes
                </h3>
                {hasComparison && selectedCompareValues.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
                      Ver mapas por {activeThematic?.label?.toLowerCase()}:
                    </span>
                    {selectedCompareValues.map((value, index) => {
                      const color = COMPARE_COLORS[index];
                      const isActive = activeMapThematicValue === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setActiveMapThematicValue(value)}
                          style={{
                            border: `1px solid ${color}`,
                            background: isActive ? color : "#ffffff",
                            color: isActive ? "#ffffff" : color,
                            borderRadius: 999,
                            padding: "4px 12px",
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                )}
                <div
                  className="map-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                    gap: 20,
                  }}
                >
                  <div style={{ display: "grid", gap: 12 }}>
                    <div
                      style={{
                        ...buildBannerGradient(SECONDARY_GREEN),
                        color: "#ffffff",
                        padding: "8px 12px",
                        borderRadius: 10,
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      Orígenes de viajes
                    </div>
                    <div data-print-map>
                      <HighchartsMapCard
                        title={null}
                        data={displayOriginHeatData}
                        palette="green"
                        hideBaseMap={isPdfExporting}
                      />
                    </div>
                    <div
                      style={{
                        display: isPdfExporting ? "none" : "block",
                        background: "#ffffff",
                        borderRadius: 12,
                        border: "1px solid #e5e7eb",
                        overflow: "hidden",
                        boxShadow: "0 10px 20px rgba(15,23,42,0.08)",
                      }}
                    >
                      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                        <colgroup>
                          <col style={{ width: "70%" }} />
                          <col style={{ width: "30%" }} />
                        </colgroup>
                        <thead style={{ background: "rgba(102, 204, 51, 0.2)" }}>
                          <tr>
                            <th
                              style={{
                                textAlign: "left",
                                padding: "8px 12px",
                                fontSize: 12,
                              }}
                            >
                              Macrozona de origen
                            </th>
                            <th
                              style={{
                                textAlign: "right",
                                padding: "8px 12px",
                                fontSize: 12,
                              }}
                            >
                              Viajes
                            </th>
                          </tr>
                        </thead>
                      </table>
                        <div className="macro-table-body" style={{ height: 120, maxHeight: 120, overflowY: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                            <colgroup>
                              <col style={{ width: "70%" }} />
                              <col style={{ width: "30%" }} />
                            </colgroup>
                            <tbody>
                              {macroHeatBarData.origin.map((row) => {
                                const isSelected = originHighlightKeys.includes(row.fullName);
                                return (
                                  <tr
                                    key={row.fullName}
                                    style={{
                                      borderTop: "1px solid #e5e7eb",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => {
                                      setSelectedDestinationKeys([]);
                                      const exists = selectedOriginKeys.includes(row.fullName);
                                      const next = exists
                                        ? selectedOriginKeys.filter((item) => item !== row.fullName)
                                        : [...selectedOriginKeys, row.fullName];
                                      setSelectedOriginKeys(next);
                                    }}
                                  >
                                    <td
                                      style={{
                                        padding: "8px 12px",
                                        fontSize: 12,
                                        color: isSelected ? SECONDARY_GREEN : "#0f172a",
                                        fontWeight: isSelected ? 700 : 500,
                                      }}
                                    >
                                      {row.label}
                                    </td>
                                    <td
                                      style={{
                                        padding: "8px 12px",
                                        fontSize: 12,
                                        textAlign: "right",
                                        fontWeight: isSelected ? 800 : 700,
                                        color: isSelected ? SECONDARY_GREEN : "#0f172a",
                                      }}
                                    >
                                      {row.value.toLocaleString("es-CO")}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gap: 12 }}>
                    <div
                      style={{
                        ...buildBannerGradient(TERTIARY_ORANGE),
                        color: "#ffffff",
                        padding: "8px 12px",
                        borderRadius: 10,
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      Destinos de viajes
                    </div>
                    <div data-print-map>
                      <HighchartsMapCard
                        title={null}
                        data={displayDestinationHeatData}
                        palette="orange"
                        hideBaseMap={isPdfExporting}
                      />
                    </div>
                    <div
                      style={{
                        display: isPdfExporting ? "none" : "block",
                        background: "#ffffff",
                        borderRadius: 12,
                        border: "1px solid #e5e7eb",
                        overflow: "hidden",
                        boxShadow: "0 10px 20px rgba(15,23,42,0.08)",
                      }}
                    >
                      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                        <colgroup>
                          <col style={{ width: "70%" }} />
                          <col style={{ width: "30%" }} />
                        </colgroup>
                        <thead style={{ background: "#fef3c7" }}>
                          <tr>
                            <th
                              style={{
                                textAlign: "left",
                                padding: "8px 12px",
                                fontSize: 12,
                              }}
                            >
                              Macrozona de destino
                            </th>
                            <th
                              style={{
                                textAlign: "right",
                                padding: "8px 12px",
                                fontSize: 12,
                              }}
                            >
                              Viajes
                            </th>
                          </tr>
                        </thead>
                      </table>
                        <div className="macro-table-body" style={{ height: 120, maxHeight: 120, overflowY: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                            <colgroup>
                              <col style={{ width: "70%" }} />
                              <col style={{ width: "30%" }} />
                            </colgroup>
                            <tbody>
                          {destinationTableData.map((row) => {
                            const isHighlighted = destinationHighlightKeys.includes(row.fullName);
                            return (
                                  <tr
                                    key={row.fullName}
                                    style={{
                                      borderTop: "1px solid #e5e7eb",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => {
                                      setSelectedOriginKeys([]);
                                      const exists = selectedDestinationKeys.includes(row.fullName);
                                      const next = exists
                                        ? selectedDestinationKeys.filter((item) => item !== row.fullName)
                                        : [...selectedDestinationKeys, row.fullName];
                                      setSelectedDestinationKeys(next);
                                    }}
                                  >
                                    <td
                                      style={{
                                        padding: "8px 12px",
                                        fontSize: 12,
                                        color: isHighlighted ? TERTIARY_ORANGE : "#0f172a",
                                        fontWeight: isHighlighted ? 700 : 500,
                                      }}
                                    >
                                      {row.label}
                                    </td>
                                    <td
                                      style={{
                                        padding: "8px 12px",
                                        fontSize: 12,
                                        textAlign: "right",
                                        fontWeight: isHighlighted ? 800 : 700,
                                        color: isHighlighted ? TERTIARY_ORANGE : "#0f172a",
                                      }}
                                    >
                                      {row.value.toLocaleString("es-CO")}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                    </div>
                  </div>
                </div>
              </section>

              <section
                data-print-section="viajes"
                className="section-card"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 16,
                  padding: 16,
                  boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
                }}
              >
                <h3 style={{ margin: "0 0 16px", fontSize: 18, color: "#0f172a" }}>
                  {analysisView === "viajes"
                    ? "Análisis de viajes"
                    : analysisView === "socio"
                    ? "Análisis socioeconómico"
                    : "Análisis vehicular"}
                </h3>
                <p style={{ margin: "0 0 16px", fontSize: 12, color: "#475569" }}>
                  Filtros activos:{" "}
                  <strong>Municipio origen</strong> {filters.municipio}
                  {filters.destinationMunicipio &&
                    ` | Municipio destino: ${filters.destinationMunicipio}`}
                  {isCompareMode &&
                    selectedCompareValues.length > 0 &&
                    selectedCompareValues.length < (activeThematic?.options?.length || 0) &&
                    ` | ${activeThematic?.label}: ${selectedCompareValues.join(", ")}`}
                </p>
                {hasComparison && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 12,
                      marginBottom: 16,
                      fontSize: 12,
                      color: "#475569",
                    }}
                  >
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>
                      Convención:
                    </span>
                    {selectedCompareValues.map((value, index) => (
                      <span
                        key={value}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                      >
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: COMPARE_COLORS[index],
                            display: "inline-block",
                          }}
                        />
                        {value}
                      </span>
                    ))}
                  </div>
                )}
                {analysisView === "viajes" && (
                  <div
                    className="analysis-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gridTemplateRows: "1fr 1fr",
                      gridTemplateAreas: `"modo motivo etapas" "modo horas horas"`,
                      gap: 20,
                      alignItems: "stretch",
                    }}
                  >
                    <div style={{ gridArea: "modo", height: "100%" }}>
                      <BarChartCard
                        title="Modo principal"
                        data={hasComparison ? modeComparison?.data : modeData}
                        series={hasComparison ? modeComparison?.series : undefined}
                        xKey="label"
                        yKey="value"
                        color={SECONDARY_GREEN}
                        chartHeight="100%"
                      />
                    </div>
                    <div style={{ gridArea: "motivo" }}>
                      <BarChartCard
                        title="Motivo"
                        data={hasComparison ? purposeComparison?.data : purposeData}
                        series={hasComparison ? purposeComparison?.series : undefined}
                        xKey="label"
                        yKey="value"
                        color={SECONDARY_GREEN}
                      />
                    </div>
                    <div style={{ gridArea: "etapas" }}>
                      <BarChartCard
                        title="Cantidad de etapas"
                        data={hasComparison ? stageComparison?.data : stageData}
                        series={hasComparison ? stageComparison?.series : undefined}
                        xKey="label"
                        yKey="value"
                        color={SECONDARY_GREEN}
                      />
                    </div>
                    <div style={{ gridArea: "horas" }}>
                      <HourlyModeChartCard
                        title="Distribución horaria"
                        data={hasComparison ? hourlyComparison?.data : hourlyTripShareData}
                        series={hasComparison ? hourlyComparison?.series : undefined}
                      />
                    </div>
                  </div>
                )}
                {analysisView === "socio" && (
                  <div
                    className="analysis-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                      gap: 20,
                    }}
                  >
                    <BarChartCard
                      title="Estrato"
                      data={hasComparison ? socioEstratoComparison?.data : socioEstratoData}
                      series={hasComparison ? socioEstratoComparison?.series : undefined}
                      xKey="label"
                      yKey="value"
                      color={SECONDARY_GREEN}
                    />
                    <BarChartCard
                      title="Género"
                      data={hasComparison ? socioGeneroComparison?.data : socioGeneroData}
                      series={hasComparison ? socioGeneroComparison?.series : undefined}
                      xKey="label"
                      yKey="value"
                      color={TERTIARY_PINK}
                    />
                    <BarChartCard
                      title="Ocupación"
                      data={hasComparison ? socioOcupacionComparison?.data : socioOcupacionData}
                      series={hasComparison ? socioOcupacionComparison?.series : undefined}
                      xKey="label"
                      yKey="value"
                      color={TERTIARY_BLUE}
                    />
                    <BarChartCard
                      title="Escolaridad"
                      data={hasComparison ? socioEscolaridadComparison?.data : socioEscolaridadData}
                      series={hasComparison ? socioEscolaridadComparison?.series : undefined}
                      xKey="label"
                      yKey="value"
                      color={TERTIARY_ORANGE}
                    />
                    <BarChartCard
                      title="Edad"
                      data={hasComparison ? socioEdadComparison?.data : socioEdadData}
                      series={hasComparison ? socioEdadComparison?.series : undefined}
                      xKey="label"
                      yKey="value"
                      color={SECONDARY_GREEN}
                    />
                  </div>
                )}
                {analysisView === "vehicular" && (
                  <div
                    className="analysis-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                      gap: 20,
                    }}
                  >
                    <BarChartCard
                      title="Tenencia vehicular"
                      data={hasComparison ? vehiculoTenenciaComparison?.data : vehicleTenureData}
                      series={hasComparison ? vehiculoTenenciaComparison?.series : undefined}
                      xKey="label"
                      yKey="value"
                      color={SECONDARY_GREEN}
                    />
                    <BarChartCard
                      title="Tipo de vehículo"
                      data={hasComparison ? vehiculoTipoComparison?.data : vehicleTypeData}
                      series={hasComparison ? vehiculoTipoComparison?.series : undefined}
                      xKey="label"
                      yKey="value"
                      color={TERTIARY_BLUE}
                    />
                    <BarChartCard
                      title="Modelo de vehículo"
                      data={hasComparison ? vehiculoModeloComparison?.data : vehicleModelData}
                      series={hasComparison ? vehiculoModeloComparison?.series : undefined}
                      xKey="label"
                      yKey="value"
                      color={TERTIARY_PINK}
                    />
                  </div>
                )}
              </section>
            </div>
          </div>
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
