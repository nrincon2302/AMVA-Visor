import { PRIMARY_GREEN } from "../config/constants";

const FilterVeil = ({ visible, opaque = false }) => {
  const label = opaque ? "Cargando datos…" : "Actualizando…";

  return (
    <>
      {/* ── Velo sobre el área de paneles ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          borderRadius: 12,
          pointerEvents: visible ? "all" : "none",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.28s ease",

          /* Carga inicial: blanco opaco */
          backgroundColor: opaque
            ? "rgba(255, 255, 255, 0.97)"
            : "rgba(124, 185, 40, 0.055)",

          /* Shimmer solo en modo filtro translúcido */
          backgroundImage:
            visible && !opaque
              ? `linear-gradient(
                  105deg,
                  rgba(124, 185, 40, 0.03) 0%,
                  rgba(124, 185, 40, 0.09) 40%,
                  rgba(255, 255, 255, 0.16) 50%,
                  rgba(124, 185, 40, 0.09) 60%,
                  rgba(124, 185, 40, 0.03) 100%
                )`
              : "none",
          backgroundSize: "200% 100%",
          animation:
            visible && !opaque
              ? "filter-shimmer 1.6s ease-in-out infinite"
              : "none",
        }}
      >
        {/* Barra de progreso en el borde superior */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            borderRadius: "12px 12px 0 0",
            overflow: "hidden",
            background: opaque
              ? "rgba(124, 185, 40, 0.12)"
              : "rgba(124, 185, 40, 0.15)",
          }}
        >
          <div
            style={{
              height: "100%",
              background: PRIMARY_GREEN,
              animation: visible
                ? "filter-progress 1.4s ease-in-out infinite"
                : "none",
              transformOrigin: "left center",
            }}
          />
        </div>
      </div>

      {/* ── Badge centrado en el viewport (fixed) ── */}
      {visible && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(255, 255, 255, 0.96)",
            border: `1.5px solid rgba(124, 185, 40, 0.35)`,
            borderRadius: 28,
            padding: "10px 20px 10px 14px",
            boxShadow:
              "0 8px 32px rgba(124, 185, 40, 0.18), 0 2px 8px rgba(0,0,0,0.08)",
            backdropFilter: "blur(8px)",
            animation: "panel-fade-in 0.22s ease forwards",
            pointerEvents: "none",
          }}
        >
          {/* Spinner verde */}
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              border: "2.5px solid rgba(124, 185, 40, 0.2)",
              borderTopColor: PRIMARY_GREEN,
              animation: "amva-spin 0.75s linear infinite",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#2d6a10",
              whiteSpace: "nowrap",
              letterSpacing: 0.1,
            }}
          >
            {label}
          </span>
        </div>
      )}
    </>
  );
};

export default FilterVeil;
