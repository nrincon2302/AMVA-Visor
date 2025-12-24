import Header from "./layout/Header";
import Footer from "./layout/Footer";
import DashboardSection from "./pages/DashboardContent";

const App = () => (
  <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
    <Header />
    <DashboardSection />
    <Footer />
  </div>
);

export default App;
