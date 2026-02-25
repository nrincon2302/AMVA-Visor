import "./App.css";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import DashboardSection from "./pages/DashboardContent";
import { PRIMARY_GREEN } from "./config/constants";
import logoAmva from "./assets/logo-area.png";

const App = () => (
  <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
    <Header />
    <div style={{ width: "100%", background: PRIMARY_GREEN, color: "#fff" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "18px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <img src={logoAmva} alt="Logo Área Metropolitana" style={{ width: 84, height: 84, objectFit: "contain" }} />
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Encuesta Origen - Destino 2025</h1>
        </div>
      </div>
    </div>
    <DashboardSection />
    <Footer />
  </div>
);

export default App;
