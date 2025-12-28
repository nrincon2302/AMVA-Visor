import React from "react";
import { PRIMARY_GREEN } from "../config/constants";

export default function SectionIndex({ sectionOptions = [], activeSection, onSectionChange }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8 }}>
        Sección temática de análisis
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        {sectionOptions.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onSectionChange?.(item.key)}
            style={{
              border: "1px solid #d1d5db",
              background: activeSection === item.key ? PRIMARY_GREEN : "#ffffff",
              color: activeSection === item.key ? "#ffffff" : "#0f172a",
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
  );
}
