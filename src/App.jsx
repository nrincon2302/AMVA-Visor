import "./App.css";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import DashboardSection from "./pages/DashboardContent";
import { PRIMARY_GREEN } from "./config/constants";
import logoAmva from "./assets/logo-area.png";

const App = () => (
  <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
    <Header />

    {/* ── Banda verde de título ── */}
    <div style={{ width: "100%", background: PRIMARY_GREEN, color: "#fff" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "18px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <img src={logoAmva} alt="Logo Área Metropolitana" style={{ width: 84, height: 84, objectFit: "contain" }} />
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Encuesta Origen - Destino 2025</h1>
        </div>
      </div>
    </div>

    {/* ── Nota técnica ── */}
    <div style={{ width: "100%", background: "#f0fdf4", borderBottom: "1px solid #d1fae5" }}>
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "10px 28px",
          borderLeft: "4px solid rgba(124, 185, 40, 1)",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <p style={{ margin: 0, fontSize: 11.5, color: "#374151", lineHeight: 1.6 }}>
          <strong style={{ color: "#1a5c1a", letterSpacing: 0.2 }}>NOTA TÉCNICA.</strong>{" "}
          El visor presenta resultados desagregados según las variables establecidas en el diseño muestral de esta
          operación estadística, de modo que se controle el nivel de error de las estimaciones que se generan a nivel
          geográfico (municipio, macrozona y zona de residencia) y las variables socioeconómicas definidas como
          determinantes en los análisis de los viajes realizados en el Valle de Aburrá.
        </p>
      </div>
    </div>

    <DashboardSection />
    <Footer />
  </div>
);

export default App;