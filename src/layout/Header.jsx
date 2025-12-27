import React from "react";
import logoAmva from "../assets/logo-area.png";
import escudo from "../assets/escudo-colombia.png";

const PRIMARY_GREEN = "#66CC33";
const SECONDARY_GREEN = "#339933";
const BANNER_IMAGE_URL = "https://www.metropol.gov.co/BannerInternas/Observatorio.jpg";

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
              padding: 6,
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
              padding: 6,
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
            padding: "40px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 12,
            textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
        >
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
            Encuesta de Movilidad del Valle de Aburrá (2025)
            </h1>
            <p style={{ margin: 0, fontSize: 16, maxWidth: 600 }}>
                Encuestas de viajes de orígenes a destinos
            </p>
        </div>
      </section>
      <div
        style={{
          background: "#ffffff",
          padding: "28px 16px 22px",
        }}
      ></div>
    </>
  );
}

export default Header;