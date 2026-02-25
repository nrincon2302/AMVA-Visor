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
  onSelectAll,
}) => {
  const allOptions = activeThematic?.options || [];
  const isAllSelected = localSelectedValues.length === 0 || localSelectedValues.length === allOptions.length;

  return (
    <>
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>
          Variables temáticas socioeconómicas
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600 }}>
            Selecciona variable
            <select
              value={activeThematicKey ?? ""}
              disabled={!thematicConfig?.length}
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
              maxHeight: 180,
              overflowY: "auto",
              display: "grid",
              gap: 6,
            }}
          >
            {/* Cabecera de la lista con label y botón "Todos" */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
                {activeThematic?.label}
              </div>
              <button
                type="button"
                onClick={onSelectAll}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "3px 9px",
                  borderRadius: 9999,
                  border: isAllSelected ? `1px solid ${PRIMARY_GREEN}` : "1px solid #cbd5e1",
                  background: isAllSelected ? "#e8f5d6" : "#f8fafc",
                  color: isAllSelected ? "#339933" : "#64748b",
                  cursor: "pointer",
                  transition: "all 120ms ease",
                  whiteSpace: "nowrap",
                }}
              >
                Todos
              </button>
            </div>

            {allOptions.map((option) => {
              const isChecked = localSelectedValues.length === 0 || localSelectedValues.includes(option);
              const highlightColor = selectedColorMap.get(option);
              // Solo bloquear deselección si es el único seleccionado
              const isLastSelected =
                localSelectedValues.length === 1 && localSelectedValues.includes(option);

              return (
                <label
                  key={option}
                  onClick={() => {
                    if (!isLastSelected) toggleThematicValue(option);
                  }}
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
                        ? `${highlightColor}20`
                        : "#e6f7e0"
                      : "transparent",
                    cursor: isLastSelected ? "not-allowed" : "pointer",
                    opacity: isLastSelected ? 0.5 : 1,
                    transition: "background 0.15s ease",
                    userSelect: "none",
                  }}
                  title={isLastSelected ? "Debe haber al menos un detalle seleccionado" : undefined}
                >
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      border: isChecked
                        ? isCompareMode && highlightColor
                          ? `2px solid ${highlightColor}`
                          : "2px solid #22c55e"
                        : "2px solid #cbd5e1",
                      background: isChecked
                        ? isCompareMode && highlightColor
                          ? highlightColor
                          : "#22c55e"
                        : "#ffffff",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 800,
                      color: "#ffffff",
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