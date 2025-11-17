import React from "react";
import KpiCard from "./components/KpiCard";
import FilterBar from "./components/FilterBar";
import MapCard from "./components/MapCard";
import TabbedCharts from "./components/TabbedCharts";

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
  // Mock data como antes
  const estratoData = [
    { label: "1", value: 4200 },
    { label: "2", value: 11800 },
    { label: "3", value: 18900 },
    { label: "4", value: 13500 },
    { label: "5", value: 5200 },
    { label: "6", value: 1800 },
  ];

  const edadData = [
    { label: "18–25", value: 8200 },
    { label: "26–35", value: 15200 },
    { label: "36–45", value: 13100 },
    { label: "46–60", value: 9100 },
    { label: "60+", value: 3100 },
  ];

  const generoData = [
    { name: "Hombres", value: 54000 },
    { name: "Mujeres", value: 46000 },
  ];

  const escolaridadData = [
    { label: "Primaria", value: 6000 },
    { label: "Secundaria", value: 19000 },
    { label: "Técnica", value: 15000 },
    { label: "Universitaria", value: 22000 },
    { label: "Posgrado", value: 8000 },
  ];

  const ingresosData = [
    { label: "0–1 SM", value: 12000 },
    { label: "1–2 SM", value: 21000 },
    { label: "2–4 SM", value: 18000 },
    { label: "4–6 SM", value: 9000 },
    { label: "6+ SM", value: 3000 },
  ];

  return (
    <main
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px 16px 40px",
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
        Versión preliminar (datos de ejemplo)
      </p>

      {/* KPIs */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 16,
          marginBottom: 12,
        }}
      >
        <KpiCard
          label="Viajes Totales"
          value="311,002"
          subLabel="5% del total"
          accentColor="#16a34a"
        />
        <KpiCard
          label="Tiempo Promedio"
          value="32 min"
          subLabel="4 min menos que el promedio"
          accentColor="#3b82f6"
        />
        <KpiCard
          label="Distancia Promedio"
          value="5.9 km"
          subLabel="1 km menos que el total"
          accentColor="#f97316"
        />
      </section>

      {/* Filtros */}
      <FilterBar />

      {/* Mapas */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <MapCard title="Mapa de Origen (Viajes)" />
        <MapCard title="Mapa de Destino (Viajes)" />
      </section>

      {/* Tabs + gráficos inferiores */}
      <section>
        <TabbedCharts
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