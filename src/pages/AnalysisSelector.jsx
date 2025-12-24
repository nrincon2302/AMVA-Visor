import { PRIMARY_GREEN } from "../config/constants";

const AnalysisSelector = ({
  thematicConfig,
  activeThematicKey,
  handleThematicKeyChange,
  activeThematic,
  isAllSelected,
  isCompareMode,
  setIsCompareMode,
  setLocalSelectedValues,
  localSelectedValues,
  setThematicValues,
  comparisonDefaults,
  toggleThematicValue,
  selectedColorMap,
  analysisView,
  setAnalysisView,
}) => {
  const handleModeChange = (compareMode) => {
    setIsCompareMode(compareMode);
    if (compareMode) {
      // Modo COMPARAR: seleccionar primeros 3
      const first3 = (activeThematic?.options || []).slice(0, 3);
      setLocalSelectedValues(first3);
      setThematicValues(activeThematicKey, first3);
    } else {
      // Modo AGRUPAR: seleccionar todos
      const allValues = activeThematic?.options || [];
      setLocalSelectedValues(allValues);
      setThematicValues(activeThematicKey, allValues);
    }
  };

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
              onClick={() => handleModeChange(false)}
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
              onClick={() => handleModeChange(true)}
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
              maxHeight: 220,
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

      {/* Línea divisoria */}
      <div style={{ height: 1, background: "#e2e8f0" }} />

      <div>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>
          Vista de análisis
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {[
            { key: "viajes", label: "Análisis de viajes" },
            { key: "socio", label: "Análisis socioeconómico" },
            { key: "vehicular", label: "Análisis vehicular" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setAnalysisView(item.key)}
              style={{
                border: "1px solid #d1d5db",
                background: analysisView === item.key ? PRIMARY_GREEN : "#ffffff",
                color: analysisView === item.key ? "#ffffff" : "#0f172a",
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
    </>
  );
};

export default AnalysisSelector;