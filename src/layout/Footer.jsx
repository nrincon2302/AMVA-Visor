import React from "react";
import logoFoot from "../assets/logo-fott.png";

const Footer = () => {
  return (
    <footer style={{ marginTop: 32 }}>
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
          <div>
            <div
              style={{
                width: 100,
                height: 100,
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
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
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

          <div>
            <h4 style={{ marginTop: 0, marginBottom: 8, fontSize: 10 }}>Líneas</h4>
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

          <div>
            <h4 style={{ marginTop: 0, marginBottom: 8, fontSize: 10 }}>Secciones</h4>
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

export default Footer;
