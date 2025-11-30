import React, { useMemo, useRef, useState } from "react";
import KpiCard from "./components/KpiCard";
import FilterBar from "./components/FilterBar";
import HighchartsMapCard from "./components/HighchartsMapCard";
import TabbedChartsRecharts from "./components/TabbedChartsRecharts";
import BarChartCard from "./components/BarChartCard";
import PieChartCard from "./components/PieChartCard";
import StackedAreaChartCard from "./components/StackedAreaChartCard";
import { useTravelCrossfilterRecharts } from "./hooks/useTravelCrossfilterRecharts";
import { useKpiStats } from "./hooks/useKpiStats";

// ---------- Header + navbar + hero --------------
const Header = () => {
  return (
    <>
      {/* Top bar con logo y búsqueda */}
      <header
        style={{
          background: "#7AC143",
          padding: "10px 0",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {/* Logo izquierda */}
          <div
            style={{
              width: 120,
              height: 50,
              background: "#ffffff",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 14,
              color: "#7AC143",
            }}
          >
            Logo Área
          </div>

          {/* Buscador */}
          <div
            style={{
              flex: 1,
              maxWidth: 500,
              display: "flex",
              alignItems: "center",
              background: "#ffffff",
              borderRadius: 9999,
              padding: "4px 10px",
              gap: 8,
            }}
          >
            <input
              placeholder="¿Qué estás buscando?"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: 13,
              }}
            />
            <button
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 18,
              }}
            >
              🔍
            </button>
          </div>

          {/* Escudo derecha */}
                <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                }}
                >
                Escudo
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
              maxWidth: 1200,
              margin: "0 auto",
              padding: "0 16px",
              display: "flex",
              gap: 18,
              overflowX: "auto",
              fontSize: 12,
            }}
            >
            {[
              "Inicio",
              "Subdirección Ambiental",
              "Subdirección Transporte",
              "Subdirección Dllo Social",
              "Subdirección Proyectos",
              "Subdirección Planeación",
              "Subdirección General",
              "Administrativa y Financiera",
            ].map((item, idx) => {
              // Define a color for each idx
              const colors = [
              "#16a34a", // Inicio
              "#0ea5e9", // Ambiental
              "#f97316", // Transporte
              "#a21caf", // Dllo Social
              "#f59e0b", // Proyectos
              "#2563eb", // Planeación
              "#059669", // General
              "#be185d", // Administrativa
              ];
              return (
              <div
                key={item}
                style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 0",
                whiteSpace: "nowrap",
                cursor: "pointer",
                color: "#374151", // Text color fixed (gray-700)
                fontWeight: idx === 4 ? 600 : 500,
                }}
              >
                <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  marginRight: 6,
                  background: colors[idx], // Only the dot is colored
                }}
                />
                {item}
              </div>
              );
            })}
            </div>
          </nav>

      {/* Hero con breadcrumb, título y tabs secundarios */}
      <section
        style={{
          backgroundImage:
            "linear-gradient(135deg, #1e293b, #0f766e), url('')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "24px 16px 32px",
          }}
        >
          <div
            style={{ fontSize: 11, opacity: 0.9, marginBottom: 8 }}
          >
            Inicio &gt; Observatorio &gt; Encuesta origen destino
          </div>
          <h2 style={{ margin: 0, fontSize: 26, marginBottom: 6 }}>
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
                fontSize: 12,
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
                      padding: "6px 12px",
                      fontSize: 12,
                      fontWeight: idx === 0 ? 600 : 500,
                      background: idx === 0 ? "#ffffff" : "transparent",
                      color: idx === 0 ? "#16a34a" : "#e5e7eb",
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
                background: "rgba(255,255,255,0.15)",
                padding: 12,
                borderRadius: 8,
                fontSize: 12,
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
                  border: "none",
                  padding: "6px 8px",
                  fontSize: 12,
                  marginBottom: 6,
                }}
              />
              <button
                style={{
                  width: "100%",
                  borderRadius: 4,
                  border: "none",
                  padding: "6px 8px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  background: "#7AC143",
                  color: "#ffffff",
                }}
              >
                Suscribirme
              </button>
              <div style={{ marginTop: 6, fontSize: 10 }}>
                Acepto Términos y condiciones
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banda verde con título del módulo */}
      <section
        style={{
          background: "#7AC143",
          color: "#ffffff",
          padding: "10px 0",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <span>Encuesta de Origen - Destino - Análisis de Viajes</span>
          <button
            style={{
              borderRadius: 4,
              border: "1px solid #ffffff",
              padding: "6px 10px",
              background: "rgba(255,255,255,0.1)",
              color: "#ffffff",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            INCLUIR VIAJES A PIE DE 2 CUADRAS O MENOS
          </button>
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
          background: "#7AC143",
          color: "#ffffff",
          padding: "24px 16px",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 24,
            fontSize: 12,
          }}
        >
          {/* Columna 1 - contacto */}
          <div>
            <div
              style={{
                width: 110,
                height: 50,
                background: "#ffffff",
                borderRadius: 4,
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                color: "#7AC143",
              }}
            >
              Logo Área
            </div>
            <p style={{ margin: "4px 0" }}>
              Carrera 53 N° 40A - 31
              <br />
              Medellín - Antioquia, Colombia
            </p>
            <p style={{ margin: "4px 0" }}>
              Lunes a jueves: 8:00 a.m. - 5:00 p.m.
              <br />
              Viernes: 8:00 a.m. - 4:30 p.m.
            </p>
            <p style={{ margin: "4px 0" }}>PBX: +57 (604) 385 60 00</p>
          </div>

          {/* Columna 2 - líneas */}
          <div>
            <h4 style={{ marginTop: 0, marginBottom: 8, fontSize: 13 }}>
              Líneas
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                "La Entidad",
                "Subdirección Ambiental",
                "Subdirección Transporte",
                "Subdirección Planeación",
                "Subdirección Desarrollo Social",
                "Subdirección Proyectos",
              ].map((txt) => (
                <li key={txt} style={{ marginBottom: 4 }}>
                  {txt}
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3 - ayudas */}
          <div>
            <h4 style={{ marginTop: 0, marginBottom: 8, fontSize: 13 }}>
              Ayudas
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                "Mapa del Sitio",
                "Organigrama",
                "Transparencia y acceso a la información",
                "Trámites en Línea",
              ].map((txt) => (
                <li key={txt} style={{ marginBottom: 4 }}>
                  {txt}
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4 - newsletter */}
          <div>
            <h4 style={{ marginTop: 0, marginBottom: 8, fontSize: 13 }}>
              Suscríbete a nuestro boletín
            </h4>
            <input
              placeholder="Ingresa tu correo electrónico"
              style={{
                width: "100%",
                borderRadius: 4,
                border: "none",
                padding: "6px 8px",
                fontSize: 12,
                marginBottom: 6,
              }}
            />
            <button
              style={{
                width: "100%",
                borderRadius: 4,
                border: "none",
                padding: "6px 8px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                background: "#ffffff",
                color: "#7AC143",
              }}
            >
              Suscribirme
            </button>
            <div style={{ marginTop: 6, fontSize: 10 }}>
              Acepto Términos y condiciones
            </div>
          </div>
        </div>
      </div>

      {/* Franja azul inferior */}
      <div
        style={{
          background: "#2563eb",
          color: "#ffffff",
          textAlign: "center",
          fontSize: 11,
          padding: "8px 16px",
        }}
      >
        Copyright © 2025 Área Metropolitana del Valle de Aburrá. Todos los
        derechos reservados.
      </div>
    </footer>
  );
};

// ---------- Dashboard (contenido central) --------------
const DashboardSection = () => {
  const {
    filters,
    macrozonaScope,
    macrozones,
    municipios,
    setMunicipio,
    setMacrozona,
    setMacrozonaScope,
    setThematicValue,
    thematicOptions,
    filteredTrips,
    filteredPersons,
    filteredHouseholds,
    estratoData,
    edadData,
    generoData,
    escolaridadData,
    ingresosData,
    modeData,
    purposeData,
    occupationData,
    vehicleTenureData,
    hourlyModeData,
    originRanking,
    destinationRanking,
    originHeatData,
    destinationHeatData,
  } = useTravelCrossfilterRecharts();
  const [heatView, setHeatView] = useState("origin");

  const {
    totalTrips,
    avgDistance,
    avgTime,
    pctMen,
    pctWomen,
    tripsPerHousehold,
    avgTripsByEstrato,
    vehiclesPerHousehold,
    vehiclesByEstrato,
    topOrigin,
    topDestination,
  } = useKpiStats(filteredTrips, filteredPersons, filteredHouseholds);

  const selectedMacrozonaLabel = useMemo(() => {
    if (filters.macrozona === "Todas") return null;
    const prefix = `${filters.municipio} - `;
    return filters.macrozona.startsWith(prefix)
      ? filters.macrozona.replace(prefix, "")
      : filters.macrozona;
  }, [filters.macrozona, filters.municipio]);

  const heatBarData = useMemo(() => {
    const sourceData = heatView === "origin" ? originHeatData : destinationHeatData;
    if (!sourceData?.length) return [];

    const total = sourceData.reduce((acc, item) => acc + item.value, 0) || 1;

    return sourceData
      .map(({ name, value }) => {
        const label =
          filters.municipio !== "AMVA General" && name.startsWith(`${filters.municipio} - `)
            ? name.replace(`${filters.municipio} - `, "")
            : name;

        return {
          label,
          value: Number(((value / total) * 100).toFixed(1)),
          raw: value,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [destinationHeatData, filters.municipio, heatView, originHeatData]);

  const hourlyModeSeries = useMemo(() => {
    if (!hourlyModeData?.length) return [];
    const sample = hourlyModeData[0];
    return Object.keys(sample).filter(
      (key) => key !== "hour" && !key.toLowerCase().includes("color")
    );
  }, [hourlyModeData]);

  const macrozonaScopeLabel = useMemo(() => {
    if (macrozonaScope === "ambos") return "Origen y destino";
    if (macrozonaScope === "origen") return "Solo origen";
    return "Solo destino";
  }, [macrozonaScope]);

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

  const captureDashboardImage = async () => {
    if (!dashboardRef.current) {
      throw new Error("No se pudo encontrar el contenedor del visor para exportar");
    }

    const html2canvas = await loadExternalLib(
      "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js",
      "html2canvas"
    );

    const canvas = await html2canvas(dashboardRef.current, {
      scale: 2,
      logging: false,
      useCORS: true,
    });

    return canvas.toDataURL("image/png");
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportReport = (format) => {
    const filename = `reporte-viajes.${format === "excel" ? "xlsx" : "pdf"}`;

    const summaryText = `Municipio: ${filters.municipio}\nMacrozona: ${filters.macrozona} (${macrozonaScopeLabel})\nViajes filtrados: ${totalTrips}\nTiempo promedio: ${avgTime.toFixed(
      1
    )} min\nDistancia promedio: ${avgDistance.toFixed(
      1
    )} km\nViajes por hogar: ${tripsPerHousehold}\nVehículos por hogar: ${vehiclesPerHousehold}\nParticipación mujeres: ${pctWomen}%\nParticipación hombres: ${pctMen}%`;

    const buildExcel = async () => {
      const XLSX = await loadExternalLib(
        "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js",
        "XLSX"
      );

      const workbook = XLSX.utils.book_new();

      const summarySheet = XLSX.utils.json_to_sheet([
        {
          Municipio: filters.municipio,
          Macrozona: filters.macrozona,
          "Ámbito de macrozona": macrozonaScopeLabel,
          "Viajes filtrados": totalTrips,
          "Tiempo promedio (min)": Number(avgTime.toFixed(1)),
          "Distancia promedio (km)": Number(avgDistance.toFixed(1)),
          "Viajes por hogar": tripsPerHousehold,
          "Promedio viajes por estrato": avgTripsByEstrato,
          "Vehículos por hogar": vehiclesPerHousehold,
          "Vehículos por estrato": vehiclesByEstrato,
          "% Mujeres": pctWomen,
          "% Hombres": pctMen,
        },
      ]);

      const modeSheet = XLSX.utils.json_to_sheet(
        modeData.map((item) => ({ Modo: item.label, "% del total": item.value }))
      );

      const purposeSheet = XLSX.utils.json_to_sheet(
        purposeData.map((item) => ({ Motivo: item.label, "% del total": item.value }))
      );

      const occupationSheet = XLSX.utils.json_to_sheet(
        occupationData.map((item) => ({ Ocupacion: item.label, "% del total": item.value }))
      );

      const vehicleSheet = XLSX.utils.json_to_sheet(
        vehicleTenureData.map((item) => ({ "Tenencia vehicular": item.label, "% del total": item.value }))
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

      const ingresosSheet = XLSX.utils.json_to_sheet(
        ingresosData.map((item) => ({ Ingresos: item.label, "% del total": item.value }))
      );

      const origenSheet = XLSX.utils.json_to_sheet(
        originRanking.map((item) => ({ Origen: item.name, Viajes: item.value }))
      );

      const destinoSheet = XLSX.utils.json_to_sheet(
        destinationRanking.map((item) => ({ Destino: item.name, Viajes: item.value }))
      );

      XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen");
      XLSX.utils.book_append_sheet(workbook, modeSheet, "Distribución modal");
      XLSX.utils.book_append_sheet(workbook, purposeSheet, "Motivos de viaje");
      XLSX.utils.book_append_sheet(workbook, occupationSheet, "Ocupación");
      XLSX.utils.book_append_sheet(workbook, vehicleSheet, "Tenencia vehicular");
      XLSX.utils.book_append_sheet(workbook, estratoSheet, "Estrato");
      XLSX.utils.book_append_sheet(workbook, edadSheet, "Edad");
      XLSX.utils.book_append_sheet(workbook, generoSheet, "Género");
      XLSX.utils.book_append_sheet(workbook, escolaridadSheet, "Escolaridad");
      XLSX.utils.book_append_sheet(workbook, ingresosSheet, "Ingresos");
      XLSX.utils.book_append_sheet(workbook, origenSheet, "Viajes por origen");
      XLSX.utils.book_append_sheet(workbook, destinoSheet, "Viajes por destino");

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

      const imageData = await captureDashboardImage();
      const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });

      pdf.setFontSize(12);
      pdf.text("Reporte de viajes", 20, 28);
      pdf.text(summaryText.split("\n"), 20, 48);

      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imageData);
      const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

      pdf.addImage(imageData, "PNG", 20, 140, pageWidth - 40, imgHeight);
      pdf.save(filename);
    };

    if (format === "excel") {
      buildExcel();
      return;
    }

    buildPdf();
  };

  return (
    <main
      ref={dashboardRef}
      style={{
        width: "100%",
        maxWidth: "1500px",
        margin: "0 auto",
        padding: "32px 32px 48px",
      }}
    >
      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 4,
        }}
      >
        Visor de Viajes
      </h1>
      <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
        Versión preliminar con jerarquías Municipio → Macrozona y entidades de Hogares,
        Personas y Viajes.
      </p>

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
          label="Viajes Totales (filtrados)"
          value={totalTrips.toLocaleString("es-CO")}
          subLabel={`Filtro: ${filters.municipio} → ${filters.macrozona} (${macrozonaScopeLabel})`}
          accentColor="#16a34a"
        />

        <KpiCard
          label="Tiempo promedio"
          value={`${avgTime.toFixed(1)} min`}
          subLabel="Basado en datos filtrados"
          accentColor="#3b82f6"
        />

        <KpiCard
          label="Distancia promedio"
          value={`${avgDistance.toFixed(1)} km`}
          subLabel="Basado en datos filtrados"
          accentColor="#f97316"
        />

        <KpiCard
          label="Viajes por hogar"
          value={tripsPerHousehold.toLocaleString("es-CO")}
          subLabel="Promedio de hogares con viajes"
          accentColor="#0ea5e9"
        />

        <KpiCard
          label="Prom. viajes por estrato"
          value={avgTripsByEstrato.toLocaleString("es-CO", { maximumFractionDigits: 2 })}
          subLabel="Media simple entre estratos"
          accentColor="#8b5cf6"
        />

        <KpiCard
          label="Vehículos por hogar"
          value={vehiclesPerHousehold.toLocaleString("es-CO", { maximumFractionDigits: 2 })}
          subLabel="Estimación de tenencia vehicular"
          accentColor="#f59e0b"
        />

        <KpiCard
          label="Vehículos por estrato"
          value={vehiclesByEstrato.toLocaleString("es-CO", { maximumFractionDigits: 2 })}
          subLabel="Promedio ponderado por personas"
          accentColor="#10b981"
        />

        {topOrigin && (
          <KpiCard
            label="Viajes por origen"
            value={topOrigin.trips.toLocaleString("es-CO")}
            subLabel={`Principal: ${topOrigin.label}`}
            accentColor="#22c55e"
          />
        )}

        {topDestination && (
          <KpiCard
            label="Viajes por destino"
            value={topDestination.trips.toLocaleString("es-CO")}
            subLabel={`Principal: ${topDestination.label}`}
            accentColor="#ef4444"
          />
        )}
      </section>

      <FilterBar
        municipio={filters.municipio}
        macrozona={filters.macrozona}
        macrozonaScope={macrozonaScope}
        macrozones={macrozones}
        municipios={municipios}
        thematicFilters={filters.thematicFilters}
        thematicOptions={thematicOptions}
        onMunicipioChange={setMunicipio}
        onMacrozonaChange={setMacrozona}
        onMacrozonaScopeChange={setMacrozonaScope}
        onThematicChange={setThematicValue}
      />

      {/* Mapas y distribución de calor */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          gap: 24,
          marginBottom: 32,
        }}
      >
        <HighchartsMapCard
          title="Mapa de calor de lugares de origen"
          data={originHeatData}
          palette="green"
        />
        <HighchartsMapCard
          title="Mapa de calor de lugares de destino"
          data={destinationHeatData}
          palette="orange"
        />
        <BarChartCard
          title={`Distribución de calor de ${heatView === "origin" ? "orígenes" : "destinos"}`}
          actions={
            <div style={{ display: "flex", gap: 6 }}>
              {[{ key: "origin", label: "Orígenes" }, { key: "destination", label: "Destinos" }].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setHeatView(opt.key)}
                  style={{
                    borderRadius: 9999,
                    border: heatView === opt.key ? "1px solid #2563eb" : "1px solid #e5e7eb",
                    background:
                      heatView === opt.key
                        ? "linear-gradient(120deg, #dbeafe, #eef2ff)"
                        : "#f8fafc",
                    color: "#0f172a",
                    fontSize: 11,
                    padding: "6px 10px",
                    cursor: "pointer",
                    boxShadow:
                      heatView === opt.key ? "0 6px 18px rgba(37, 99, 235, 0.25)" : "none",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          }
          data={heatBarData}
          xKey="label"
          yKey="value"
          color="#16a34a"
          orientation="horizontal"
          highlightKey={selectedMacrozonaLabel}
        />
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          gap: 24,
          marginBottom: 32,
        }}
      >
        <BarChartCard
          title="Distribución de viajes según modo de transporte"
          data={modeData}
          xKey="label"
          yKey="value"
          color="#0ea5e9"
          orientation="horizontal"
        />

        <PieChartCard
          title="Motivos de viaje"
          data={purposeData.map((item) => ({ name: item.label, value: item.value }))}
          dataKey="value"
          nameKey="name"
        />

        <BarChartCard
          title="Tenencia vehicular estimada"
          data={vehicleTenureData}
          xKey="label"
          yKey="value"
          color="#f59e0b"
          orientation="horizontal"
        />

        <BarChartCard
          title="Ocupación de las personas viajeras"
          data={occupationData}
          xKey="label"
          yKey="value"
          color="#8b5cf6"
        />

        <StackedAreaChartCard
          title="Distribución horaria por modo de transporte"
          data={hourlyModeData}
          modes={hourlyModeSeries}
        />
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
          ingresosData={ingresosData}
        />
      </section>
    </main>
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