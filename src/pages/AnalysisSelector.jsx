import { PRIMARY_GREEN } from "../config/constants";

const AnalysisSelector = ({
  thematicConfig,
  activeThematicKey,
  handleThematicKeyChange,
  activeThematic,
  isCompareMode,
  onModeChange,
  localSelectedValues,
  toggleThematicValue,
  selectedColorMap,
}) => {
  return (
    <>
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

          {/* Botones AGRUPAR / COMPARAR */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => onModeChange(false)}
              style={{
                flex: 1,
                border: "1px solid #d1d5db",
                background: !isCompareMode ? PRIMARY_GREEN : "#ffffff",
                color: !isCompareMode ? "#ffffff" : "#0f172a",
                borderRadius: 8,
                padding: "6px 10px",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              AGRUPAR
            </button>
            <button
              type="button"
              onClick={() => onModeChange(true)}
              title="La comparación por variables temáticas se aplica solamente en las secciones de Análisis de Viajes y Vehículos por Hogar"
              style={{
                flex: 1,
                border: "1px solid #d1d5db",
                background: isCompareMode ? PRIMARY_GREEN : "#ffffff",
                color: isCompareMode ? "#ffffff" : "#0f172a",
                borderRadius: 8,
                padding: "6px 10px",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              COMPARAR
            </button>
          </div>

          <div
            style={{
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              padding: "10px 12px",
              background: "#ffffff",
              maxHeight: 140,
              overflowY: "auto",
              display: "grid",
              gap: 6,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
              {activeThematic?.label}
            </div>
            
            {isCompareMode && (
              <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>
                Las comparaciones se encuentran habilitadas para máximo 3 valores en simultáneo
              </div>
            )}

            {(activeThematic?.options || []).map((option) => {
              const isChecked = localSelectedValues.includes(option);
              const highlightColor = selectedColorMap.get(option);
              const canSelect = !isCompareMode || isChecked || localSelectedValues.length < 3;

              return (
                <label
                  key={option}
                  onClick={() => canSelect && toggleThematicValue(option)}
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    fontSize: 12,
                    color: "#0f172a",
                    fontWeight: isChecked ? 600 : 500,
                    padding: "6px 8px",
                    borderRadius: 6,
                    background: isChecked
                      ? isCompareMode && highlightColor
                        ? `${highlightColor}20` // 20% opacidad
                        : "#e6f7e0" // Verde muy claro
                      : "transparent",
                    cursor: canSelect ? "pointer" : "not-allowed",
                    opacity: canSelect ? 1 : 0.5,
                    transition: "background 0.15s ease",
                  }}
                >
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      border: "2px solid #cbd5e1",
                      background: "#ffffff",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {isChecked ? "✓" : ""}
                  </span>
                  {option}
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default AnalysisSelector;
