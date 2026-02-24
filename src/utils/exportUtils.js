/**
 * UTILIDADES DE EXPORTACIÓN
 * PDF: Documento formateado con datos, gráficas y filtros
 * Excel: Múltiples hojas con tablas formateadas
 */

// ============================================================
// EXPORTACIÓN A PDF
// ============================================================

export const generatePdfReport = async (exportData) => {
  try {
    // Importar jsPDF dinámicamente
    const { jsPDF } = await import("jspdf");

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 15;

    // Colores
    const primaryColor = [51, 153, 51]; // Verde
    const textColor = [30, 30, 30];
    const lightGray = [240, 240, 240];
    const headerBg = [51, 153, 51];
    const headerText = [255, 255, 255];

    // Función para agregar página si es necesario
    const checkNewPage = (requiredHeight) => {
      if (yPosition + requiredHeight > pageHeight - 10) {
        doc.addPage();
        yPosition = 15;
      }
    };

    // Función para agregar una tabla en el PDF
    const addTableToPdf = (title, headers, rows, maxRows = null) => {
      if (!rows || rows.length === 0) return;

      checkNewPage(15);

      // Título
      doc.setFillColor(...lightGray);
      doc.rect(15, yPosition - 2, pageWidth - 30, 6, "F");
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryColor);
      doc.text(title, 15, yPosition + 2);
      yPosition += 8;

      // Encabezados de tabla
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...headerText);
      doc.setFillColor(...headerBg);

      const colWidth = (pageWidth - 30) / headers.length;
      let xPos = 15;

      headers.forEach((header) => {
        doc.rect(xPos, yPosition - 3, colWidth, 5, "F");
        doc.text(header, xPos + 1, yPosition + 1, { maxWidth: colWidth - 2 });
        xPos += colWidth;
      });

      yPosition += 6;

      // Filas de datos (limitar a máxRows si se especifica)
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...textColor);
      let rowCount = 0;
      const rowsToShow = maxRows ? rows.slice(0, maxRows) : rows;

      rowsToShow.forEach((row) => {
        checkNewPage(5);

        // Alternar color de fondo
        if (rowCount % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(15, yPosition - 3, pageWidth - 30, 4, "F");
        }

        xPos = 15;
        headers.forEach((header) => {
          const cellValue = String(row[header] || "");
          doc.text(cellValue, xPos + 1, yPosition + 1, { maxWidth: colWidth - 2 });
          xPos += colWidth;
        });

        yPosition += 4;
        rowCount++;
      });

      yPosition += 3;
    };

    // Función para agregar un gráfico de barras horizontal
    const addBarChart = (title, data) => {
      if (!data || data.length === 0) return;

      checkNewPage(50);

      // Título
      doc.setFillColor(...lightGray);
      doc.rect(15, yPosition - 2, pageWidth - 30, 6, "F");
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryColor);
      doc.text(title, 15, yPosition + 2);
      yPosition += 8;

      // Gráfico de barras horizontal
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...textColor);

      // Encontrar el valor máximo para escala
      const maxValue = Math.max(...data.map(d => {
        const v = typeof d.value === "number" ? d.value : 0;
        return Math.abs(v);
      }), 1); // Asegurar que no sea 0

      data.forEach((item) => {
        const label = String(item.label || "").substring(0, 18);
        const value = typeof item.value === "number" ? item.value : 0;
        
        // Calcular escala: si el valor es >= 1, es en escala directa; si < 1, es decimal/porcentaje
        const isPercentage = value < 1 && value > 0;
        const displayValue = isPercentage ? (value * 100).toFixed(1) : value.toFixed(2);
        const valueForBar = isPercentage ? value * 100 : value;
        const barLength = (valueForBar / maxValue) * 70; // 70mm máxima longitud de barra

        // Etiqueta (alineada a la izquierda)
        doc.text(label, 15, yPosition + 1.5);

        // Barra (rectángulo verde)
        if (barLength > 0) {
          doc.setFillColor(51, 153, 51);
          doc.rect(70, yPosition - 1, Math.max(barLength, 1), 3, "F");
        }

        // Valor (alineado a la derecha)
        const valueStr = isPercentage ? `${displayValue}%` : displayValue;
        doc.text(valueStr, 150, yPosition + 1.5);

        yPosition += 4;
      });

      yPosition += 2;
    };

    // Encabezado del documento
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 25, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("REPORTE DEL VISOR DE MOVILIDAD", pageWidth / 2, 12, { align: "center" });
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const fecha = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.text(`Reporte generado el ${fecha}`, pageWidth / 2, 20, { align: "center" });

    yPosition = 35;

    // Sección de Filtros Aplicados
    doc.setTextColor(...textColor);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("FILTROS APLICADOS", 15, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const {
      filters = {},
      compareMode = false,
      selectedValues = [],
      themeName = "N/A",
    } = exportData || {};

    const filterLines = [
      `Municipio origen: ${filters?.municipio || "AMVA General"}`,
      `Municipio destino: ${filters?.destinationMunicipio || "AMVA General"}`,
      `Tema: ${themeName}`,
      `Modo: ${compareMode ? "Comparación" : "Agrupación"}`,
    ];

    if (compareMode && selectedValues?.length > 0) {
      filterLines.push(`Valores comparados: ${selectedValues.join(", ")}`);
    }

    filterLines.forEach((line) => {
      checkNewPage(5);
      doc.text(line, 15, yPosition);
      yPosition += 6;
    });

    yPosition += 4;

    // Sección de KPIs (solo los 14 primeros)
    // En modo Comparación, solo mostrar tabla de KPIs sin gráficos
    if (!compareMode) {
      const kpiIndicators = Object.entries(exportData?.indicadoresData || {})
        .filter(([key]) => {
          const num = Number(key);
          return num >= 1 && num <= 14;
        })
        .sort(([a], [b]) => Number(a) - Number(b));

      if (kpiIndicators.length > 0) {
        const kpiRows = kpiIndicators.map(([key, indicator]) => {
          let displayValue = "--";
          if (indicator && typeof indicator.value === "number") {
            displayValue = indicator.value.toFixed(2);
          }
          return {
            "Indicador": indicator?.label || indicator?.nombre || `Indicador ${key}`,
            "Valor": displayValue,
          };
        });

        addTableToPdf("INDICADORES CLAVE (KPIs 1-14)", ["Indicador", "Valor"], kpiRows);
      }

      // Patrones de Movilidad - como gráficos
      if (exportData?.mobilityPatternsData) {
        // Duración
        const durationData = exportData.mobilityPatternsData?.durationHistogramData;
        if (Array.isArray(durationData) && durationData.length > 0) {
          const data = durationData
            .map((item) => ({
              label: String(item?.label || "--").slice(0, 20),
              value: typeof item?.value === "number" ? item.value : 0,
            }))
            .filter(d => d.value > 0);
          if (data.length > 0) addBarChart("DISTRIBUCIÓN POR DURACIÓN DE VIAJE", data);
        }

        // Frecuencia
        const frequencyData = exportData.mobilityPatternsData?.tripFrequencyData;
        if (Array.isArray(frequencyData) && frequencyData.length > 0) {
          const data = frequencyData
            .map((item) => ({
              label: String(item?.label || "--").slice(0, 20),
              value: typeof item?.value === "number" ? item.value : 0,
            }))
            .filter(d => d.value > 0);
          if (data.length > 0) addBarChart("FRECUENCIA DE VIAJES", data);
        }

        // Estrato
        const estratoData = exportData.mobilityPatternsData?.tripsByEstratoData;
        if (Array.isArray(estratoData) && estratoData.length > 0) {
          const data = estratoData
            .map((item) => ({
              label: String(item?.label || "--").slice(0, 20),
              value: typeof item?.value === "number" ? item.value : 0,
            }))
            .filter(d => d.value > 0);
          if (data.length > 0) addBarChart("VIAJES POR ESTRATO", data);
        }

        // Modo
        const modeData = exportData.mobilityPatternsData?.durationByModeGroupData;
        if (Array.isArray(modeData) && modeData.length > 0) {
          const data = modeData
            .map((item) => ({
              label: String(item?.label || "--").slice(0, 20),
              value: typeof item?.value === "number" ? item.value : 0,
            }))
            .filter(d => d.value > 0);
          if (data.length > 0) addBarChart("TIEMPO PROMEDIO POR MODO (minutos)", data);
        }
      }

      // Análisis de Viajes - como gráficos
      if (exportData?.analysisViewsData) {
        const analysisData = exportData.analysisViewsData;

        if (Array.isArray(analysisData?.modeData) && analysisData.modeData.length > 0) {
          const data = analysisData.modeData
            .map((item) => ({
              label: String(item?.label || "--").slice(0, 20),
              value: typeof item?.value === "number" ? item.value : 0,
            }))
            .filter(d => d.value > 0);
          if (data.length > 0) addBarChart("MODO DE TRANSPORTE (Viajes)", data);
        }

        if (Array.isArray(analysisData?.purposeData) && analysisData.purposeData.length > 0) {
          const data = analysisData.purposeData
            .map((item) => ({
              label: String(item?.label || "--").slice(0, 20),
              value: typeof item?.value === "number" ? item.value : 0,
            }))
            .filter(d => d.value > 0);
          if (data.length > 0) addBarChart("PROPÓSITO DEL VIAJE", data);
        }

        if (Array.isArray(analysisData?.stageData) && analysisData.stageData.length > 0) {
          const data = analysisData.stageData
            .map((item) => ({
              label: String(item?.label || "--").slice(0, 20),
              value: typeof item?.value === "number" ? item.value : 0,
            }))
            .filter(d => d.value > 0);
          if (data.length > 0) addBarChart("ETAPA DEL VIAJE", data);
        }

        if (Array.isArray(analysisData?.noTravelReasonData) && analysisData.noTravelReasonData.length > 0) {
          const data = analysisData.noTravelReasonData
            .map((item) => ({
              label: String(item?.label || "--").slice(0, 20),
              value: typeof item?.value === "number" ? item.value : 0,
            }))
            .filter(d => d.value > 0);
          if (data.length > 0) addBarChart("RAZÓN DE NO VIAJAR", data);
        }

        if (Array.isArray(analysisData?.populationInterestData) && analysisData.populationInterestData.length > 0) {
          const data = analysisData.populationInterestData
            .map((item) => ({
              label: String(item?.label || "--").slice(0, 20),
              value: typeof item?.value === "number" ? item.value : 0,
            }))
            .filter(d => d.value > 0);
          if (data.length > 0) addBarChart("POBLACIÓN DE INTERÉS", data);
        }

        if (Array.isArray(analysisData?.vehicleTypeData) && analysisData.vehicleTypeData.length > 0) {
          const data = analysisData.vehicleTypeData
            .map((item) => ({
              label: String(item?.label || "--").slice(0, 20),
              value: typeof item?.value === "number" ? item.value : 0,
            }))
            .filter(d => d.value > 0);
          if (data.length > 0) addBarChart("TIPO DE VEHÍCULO", data);
        }

        if (Array.isArray(analysisData?.vehicleTenureData) && analysisData.vehicleTenureData.length > 0) {
          const data = analysisData.vehicleTenureData
            .map((item) => ({
              label: String(item?.label || "--").slice(0, 20),
              value: typeof item?.value === "number" ? item.value : 0,
            }))
            .filter(d => d.value > 0);
          if (data.length > 0) addBarChart("TENENCIA DEL VEHÍCULO", data);
        }

        if (Array.isArray(analysisData?.vehicleModelData) && analysisData.vehicleModelData.length > 0) {
          const data = analysisData.vehicleModelData
            .slice(0, 10)
            .map((item) => ({
              label: String(item?.label || "--").slice(0, 20),
              value: typeof item?.value === "number" ? item.value : 0,
            }))
            .filter(d => d.value > 0);
          if (data.length > 0) addBarChart("MODELO DEL VEHÍCULO (Top 10)", data);
        }
      }
    } else {
      // Modo Comparación: Mostrar tabla simplificada
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryColor);
      doc.text("NOTA: En modo Comparación, el PDF muestra una estructura simplificada.", 15, yPosition);
      yPosition += 6;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Para visualizar todos los datos de comparación, use la exportación a Excel.", 15, yPosition);
      yPosition += 8;
    }

    // Pie de página
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 5,
        { align: "center" }
      );
    }

    // Guardar
    const filename = `Reporte_Visor_Movilidad_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(filename);
  } catch (error) {
    console.error("Error completo generando PDF:", error);
    alert(`Error al generar el PDF: ${error.message || error}. Por favor intenta nuevamente.`);
  }
};

// ============================================================
// EXPORTACIÓN A EXCEL
// ============================================================

const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const buildSheetXml = (rows) => {
  if (!rows || rows.length === 0) {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData/>
</worksheet>`;
  }

  const headers = Object.keys(rows[0]) || [];
  
  // Fila de encabezados
  const headerRow = `<row>${headers
    .map(
      (header) =>
        `<c t="inlineStr"><is><t>${escapeXml(header)}</t></is></c>`
    )
    .join("")}</row>`;

  // Filas de datos
  const bodyRows = rows
    .map((row) => {
      const cells = headers
        .map((header) => {
          const value = row[header];
          if (typeof value === "number") {
            return `<c><v>${value}</v></c>`;
          }
          return `<c t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`;
        })
        .join("");
      return `<row>${cells}</row>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    ${headerRow}
    ${bodyRows}
  </sheetData>
</worksheet>`;
};

const buildWorkbookXml = (sheets) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <workbookPr date1904="false" />
  <sheets>
    ${sheets
      .map(
        (sheet, idx) =>
          `<sheet name="${escapeXml(sheet.name)}" sheetId="${idx + 1}" r:id="rId${idx + 2}" />`
      )
      .join("")}
  </sheets>
</workbook>`;

const buildStylesXml = () => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts>
    <font><sz val="11"/><color rgb="FF000000"/></font>
  </fonts>
  <fills>
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
  </fills>
  <borders>
    <border><left/><right/><top/><bottom/><diagonal/></border>
  </borders>
  <cellStyleXfs>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
  </cellXfs>
</styleSheet>`;


const buildWorkbookRelsXml = (sheets) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml" />
  ${sheets
    .map(
      (_, idx) =>
        `<Relationship Id="rId${idx + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${idx + 1}.xml" />`
    )
    .join("")}
</Relationships>`;

const buildRootRelsXml = () => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml" />
</Relationships>`;

const buildContentTypesXml = (sheets) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
  <Default Extension="xml" ContentType="application/xml" />
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" />
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml" />
  ${sheets
    .map(
      (_, idx) =>
        `<Override PartName="/xl/worksheets/sheet${idx + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" />`
    )
    .join("")}
</Types>`;

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

const crc32 = (data) => {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) {
    crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const encodeUtf8 = (value) => new TextEncoder().encode(value);

const buildZip = (files) => {
  const fileRecords = [];
  let offset = 0;
  const chunks = [];

  files.forEach((file) => {
    const nameBytes = encodeUtf8(file.name);
    const data = file.data instanceof Uint8Array ? file.data : encodeUtf8(file.data);
    const crc = crc32(data);
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(localHeader.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, 0, true);
    view.setUint16(12, 0, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, data.length, true);
    view.setUint32(22, data.length, true);
    view.setUint16(26, nameBytes.length, true);
    view.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);

    chunks.push(localHeader, data);

    fileRecords.push({
      nameBytes,
      crc,
      size: data.length,
      offset,
    });

    offset += localHeader.length + data.length;
  });

  const centralDirectoryOffset = offset;
  const centralChunks = [];

  fileRecords.forEach((record) => {
    const centralHeader = new Uint8Array(46 + record.nameBytes.length);
    const view = new DataView(centralHeader.buffer);
    view.setUint32(0, 0x02014b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 20, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, 0, true);
    view.setUint16(12, 0, true);
    view.setUint16(14, 0, true);
    view.setUint32(16, record.crc, true);
    view.setUint32(20, record.size, true);
    view.setUint32(24, record.size, true);
    view.setUint16(28, record.nameBytes.length, true);
    view.setUint16(30, 0, true);
    view.setUint16(32, 0, true);
    view.setUint16(34, 0, true);
    view.setUint16(36, 0, true);
    view.setUint32(38, 0, true);
    view.setUint32(42, record.offset, true);
    centralHeader.set(record.nameBytes, 46);
    centralChunks.push(centralHeader);
    offset += centralHeader.length;
  });

  const centralDirectorySize = offset - centralDirectoryOffset;
  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, fileRecords.length, true);
  endView.setUint16(10, fileRecords.length, true);
  endView.setUint32(12, centralDirectorySize, true);
  endView.setUint32(16, centralDirectoryOffset, true);
  endView.setUint16(20, 0, true);

  return new Blob([...chunks, ...centralChunks, endRecord], { type: "application/zip" });
};

export const exportToExcel = (sheets, filename = "reporte.xlsx") => {
  const sheetFiles = sheets.map((sheet, idx) => ({
    name: `xl/worksheets/sheet${idx + 1}.xml`,
    data: buildSheetXml(sheet.rows || []),
  }));

  const files = [
    { name: "[Content_Types].xml", data: buildContentTypesXml(sheets) },
    { name: "_rels/.rels", data: buildRootRelsXml() },
    { name: "xl/workbook.xml", data: buildWorkbookXml(sheets) },
    { name: "xl/_rels/workbook.xml.rels", data: buildWorkbookRelsXml(sheets) },
    { name: "xl/styles.xml", data: buildStylesXml() },
    ...sheetFiles,
  ];

  const zipBlob = buildZip(files);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(zipBlob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

export const generateExcelReport = (exportData) => {
  const sheets = [];

  // Hoja 1: Resumen de filtros
  const filterRows = [
    { Campo: "Municipio origen", Valor: exportData.filters?.municipio || "AMVA General" },
    { Campo: "Municipio destino", Valor: exportData.filters?.destinationMunicipio || "AMVA General" },
    { Campo: "Tema", Valor: exportData.themeName || "N/A" },
    { Campo: "Modo", Valor: exportData.compareMode ? "Comparación" : "Agrupación" },
  ];

  if (exportData.compareMode && exportData.selectedValues?.length > 0) {
    filterRows.push({
      Campo: "Valores comparados",
      Valor: exportData.selectedValues.join(", "),
    });
  }

  sheets.push({
    name: "Filtros",
    rows: filterRows,
  });

  // Hoja 2: Consolidar KPIs Generales (1-8) en una sola hoja
  if (exportData.compareMode) {
    // Modo Comparación: Presentar KPIs con compar de valores
    const kpisGeneralesRows = [];
    if (exportData.indicadoresData && typeof exportData.indicadoresData === "object") {
      Object.entries(exportData.indicadoresData).forEach(([key, indicator]) => {
        const numKey = Number(key);
        if (indicator && numKey >= 1 && numKey <= 8) {
          const row = { Indicador: indicator?.label || indicator?.nombre || `Indicador ${key}` };
          
          // Si es comparativo simple, agregar columnas para cada detalle
          if (indicator.tipo === "comparativo_simple" && Array.isArray(indicator.comparativo)) {
            indicator.comparativo.forEach(comp => {
              row[String(comp.detalle)] = typeof comp.value === "number" ? comp.value.toFixed(2) : comp.value;
            });
          } 
          // Si es comparativo agrupado, mostrar como agregado
          else if (indicator.tipo === "comparativo_agrupado" && Array.isArray(indicator.grupos)) {
            const valores = [];
            indicator.grupos.forEach(g => {
              if (g.comparativo && g.comparativo.length > 0) {
                valores.push(g.comparativo[0].value);
              }
            });
            row.Valor = valores.length > 0 ? (valores[0] !== null ? valores[0].toFixed ? valores[0].toFixed(2) : valores[0] : "--") : "--";
          } 
          else {
            row.Valor = indicator?.value !== undefined && indicator?.value !== null ? 
              (typeof indicator.value === "number" ? indicator.value.toFixed(2) : indicator.value) : "--";
          }
          
          kpisGeneralesRows.push(row);
        }
      });
    }

    if (kpisGeneralesRows.length > 0) {
      sheets.push({
        name: "KPIs Generales",
        rows: kpisGeneralesRows,
      });
    }

    // Hoja 3: KPIs Motorización Comparación
    const kpisMotorizacionRows = [];
    if (exportData.indicadoresData && typeof exportData.indicadoresData === "object") {
      Object.entries(exportData.indicadoresData).forEach(([key, indicator]) => {
        const numKey = Number(key);
        if (indicator && numKey >= 9 && numKey <= 14) {
          const row = { Indicador: indicator?.label || indicator?.nombre || `Indicador ${key}` };
          
          if (indicator.tipo === "comparativo_simple" && Array.isArray(indicator.comparativo)) {
            indicator.comparativo.forEach(comp => {
              row[String(comp.detalle)] = typeof comp.value === "number" ? comp.value.toFixed(2) : comp.value;
            });
          } 
          else if (indicator.tipo === "comparativo_agrupado" && Array.isArray(indicator.grupos)) {
            const valores = [];
            indicator.grupos.forEach(g => {
              if (g.comparativo && g.comparativo.length > 0) {
                valores.push(g.comparativo[0].value);
              }
            });
            row.Valor = valores.length > 0 ? (valores[0] !== null ? valores[0].toFixed ? valores[0].toFixed(2) : valores[0] : "--") : "--";
          } 
          else {
            row.Valor = indicator?.value !== undefined && indicator?.value !== null ? 
              (typeof indicator.value === "number" ? indicator.value.toFixed(2) : indicator.value) : "--";
          }
          
          kpisMotorizacionRows.push(row);
        }
      });
    }

    if (kpisMotorizacionRows.length > 0) {
      sheets.push({
        name: "KPIs Motorización",
        rows: kpisMotorizacionRows,
      });
    }
  } else {
    // Modo Normal: Presentar KPIs simples
    const kpisGeneralesRows = [];
    if (exportData.indicadoresData && typeof exportData.indicadoresData === "object") {
      Object.entries(exportData.indicadoresData).forEach(([key, indicator]) => {
        const numKey = Number(key);
        if (indicator && numKey >= 1 && numKey <= 8) {
          kpisGeneralesRows.push({
            ID: key,
            Indicador: indicator?.label || indicator?.nombre || `Indicador ${key}`,
            Valor: indicator?.value !== undefined && indicator?.value !== null ? 
              (typeof indicator.value === "number" ? indicator.value.toFixed(2) : indicator.value) : "--",
          });
        }
      });
    }

    if (kpisGeneralesRows.length > 0) {
      sheets.push({
        name: "KPIs Generales",
        rows: kpisGeneralesRows,
      });
    }

    // Hoja 3: KPIs Motorización
    const kpisMotorizacionRows = [];
    if (exportData.indicadoresData && typeof exportData.indicadoresData === "object") {
      Object.entries(exportData.indicadoresData).forEach(([key, indicator]) => {
        const numKey = Number(key);
        if (indicator && numKey >= 9 && numKey <= 14) {
          kpisMotorizacionRows.push({
            ID: key,
            Indicador: indicator?.label || indicator?.nombre || `Indicador ${key}`,
            Valor: indicator?.value !== undefined && indicator?.value !== null ? 
              (typeof indicator.value === "number" ? indicator.value.toFixed(2) : indicator.value) : "--",
          });
        }
      });
    }

    if (kpisMotorizacionRows.length > 0) {
      sheets.push({
        name: "KPIs Motorización",
        rows: kpisMotorizacionRows,
      });
    }
  }

  // Hojas 4+: Patrones de Movilidad
  // Hoja 4: Duración de viajes
  if (exportData.mobilityPatternsData?.durationHistogramData?.length > 0) {
    const rows = exportData.mobilityPatternsData.durationHistogramData.map((item) => ({
      Duración: item.label || "--",
      Valor: typeof item.value === "number" ? `${item.value.toFixed(2)}%` : item.value || "--",
    }));

    sheets.push({
      name: "Duración de Viajes",
      rows,
    });
  }

  // Hoja 4: Frecuencia de viajes
  if (exportData.mobilityPatternsData?.tripFrequencyData?.length > 0) {
    const rows = exportData.mobilityPatternsData.tripFrequencyData.map((item) => ({
      Frecuencia: item.label || "--",
      Valor: typeof item.value === "number" ? `${item.value.toFixed(2)}%` : item.value || "--",
    }));

    sheets.push({
      name: "Frecuencia de Viajes",
      rows,
    });
  }

  // Hoja 5: Viajes por estrato
  if (exportData.mobilityPatternsData?.tripsByEstratoData?.length > 0) {
    const rows = exportData.mobilityPatternsData.tripsByEstratoData.map((item) => ({
      Estrato: item.label || "--",
      Valor: typeof item.value === "number" ? `${item.value.toFixed(2)}%` : item.value || "--",
    }));

    sheets.push({
      name: "Viajes por Estrato",
      rows,
    });
  }

  // Hoja 6: Tiempo por modo
  if (exportData.mobilityPatternsData?.durationByModeGroupData?.length > 0) {
    const rows = exportData.mobilityPatternsData.durationByModeGroupData.map((item) => ({
      Modo: item.label || "--",
      "Duración promedio (min)": typeof item.value === "number" ? item.value.toFixed(2) : item.value || "--",
    }));

    sheets.push({
      name: "Tiempo por Modo",
      rows,
    });
  }

  // Hoja 7: Modo horario (si existe en modo normal)
  if (exportData.mobilityPatternsData?.hourlyModeData?.length > 0) {
    const rows = exportData.mobilityPatternsData.hourlyModeData.map((item) => ({
      Hora: item.hour || item.label || "--",
      Informal: typeof item.informal === "number" ? item.informal : "--",
      Público: typeof item.public === "number" ? item.public : "--",
      Privado: typeof item.private === "number" ? item.private : "--",
      "No motorizado": typeof item.nonMotorized === "number" ? item.nonMotorized : "--",
    }));

    sheets.push({
      name: "Modo Horario",
      rows,
    });
  }

  // Hoja 7b: Modo horario comparativo (si existe en modo comparativo)
  if (exportData.mobilityPatternsData?.hourlyModeDatasets?.length > 0) {
    exportData.mobilityPatternsData.hourlyModeDatasets.forEach((dataset, idx) => {
      const rows = dataset.data.map((item) => ({
        Hora: item.hour || item.label || "--",
        Informal: typeof item.informal === "number" ? item.informal : "--",
        Público: typeof item.public === "number" ? item.public : "--",
        Privado: typeof item.private === "number" ? item.private : "--",
        "No motorizado": typeof item.nonMotorized === "number" ? item.nonMotorized : "--",
      }));

      sheets.push({
        name: `Modo Horario - ${dataset.nombre}`,
        rows,
      });
    });
  }

  // Hojas 8-15: Analysis Views
  // Hoja 8: Análisis por Modo
  if (exportData.analysisViewsData?.modeData?.length > 0) {
    const rows = exportData.analysisViewsData.modeData.map((item) => ({
      Modo: item.label || "--",
      Proporción: typeof item.value === "number" ? `${item.value.toFixed(2)}%` : item.value || "--",
    }));

    sheets.push({
      name: "Análisis por Modo",
      rows,
    });
  }

  // Hoja 9: Análisis por Propósito
  if (exportData.analysisViewsData?.purposeData?.length > 0) {
    const rows = exportData.analysisViewsData.purposeData.map((item) => ({
      Propósito: item.label || "--",
      Proporción: typeof item.value === "number" ? `${item.value.toFixed(2)}%` : item.value || "--",
    }));

    sheets.push({
      name: "Análisis por Propósito",
      rows,
    });
  }

  // Hoja 10: Análisis por Etapa
  if (exportData.analysisViewsData?.stageData?.length > 0) {
    const rows = exportData.analysisViewsData.stageData.map((item) => ({
      Etapa: item.label || "--",
      Proporción: typeof item.value === "number" ? `${item.value.toFixed(2)}%` : item.value || "--",
    }));

    sheets.push({
      name: "Análisis por Etapa",
      rows,
    });
  }

  // Hoja 11: Razones sin Viaje
  if (exportData.analysisViewsData?.noTravelReasonData?.length > 0) {
    const rows = exportData.analysisViewsData.noTravelReasonData.map((item) => ({
      Razón: item.label || "--",
      Proporción: typeof item.value === "number" ? `${item.value.toFixed(2)}%` : item.value || "--",
    }));

    sheets.push({
      name: "Razones sin Viaje",
      rows,
    });
  }

  // Hoja 12: Población de Interés
  if (exportData.analysisViewsData?.populationInterestData?.length > 0) {
    const rows = exportData.analysisViewsData.populationInterestData.map((item) => ({
      "Población": item.label || "--",
      Proporción: typeof item.value === "number" ? `${item.value.toFixed(2)}%` : item.value || "--",
    }));

    sheets.push({
      name: "Población de Interés",
      rows,
    });
  }

  // Hoja 13: Tipo de Vehículo
  if (exportData.analysisViewsData?.vehicleTypeData?.length > 0) {
    const rows = exportData.analysisViewsData.vehicleTypeData.map((item) => ({
      "Tipo de Vehículo": item.label || "--",
      Proporción: typeof item.value === "number" ? `${item.value.toFixed(2)}%` : item.value || "--",
    }));

    sheets.push({
      name: "Tipo de Vehículo",
      rows,
    });
  }

  // Hoja 14: Tenencia de Vehículo
  if (exportData.analysisViewsData?.vehicleTenureData?.length > 0) {
    const rows = exportData.analysisViewsData.vehicleTenureData.map((item) => ({
      "Tenencia": item.label || "--",
      Proporción: typeof item.value === "number" ? `${item.value.toFixed(2)}%` : item.value || "--",
    }));

    sheets.push({
      name: "Tenencia de Vehículo",
      rows,
    });
  }

  // Hoja 15: Modelo de Vehículo
  if (exportData.analysisViewsData?.vehicleModelData?.length > 0) {
    const rows = exportData.analysisViewsData.vehicleModelData.slice(0, 10).map((item) => ({
      "Modelo": item.label || "--",
      Proporción: typeof item.value === "number" ? `${item.value.toFixed(2)}%` : item.value || "--",
    }));

    sheets.push({
      name: "Modelo de Vehículo",
      rows,
    });
  }

  // Exportar
  const filename = `Reporte_Visor_Movilidad_${new Date().toISOString().split("T")[0]}.xlsx`;
  exportToExcel(sheets, filename);
};

export const exportToPdf = generatePdfReport;

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const captureElementToDataUrl = async (element) => {
  const rect = element.getBoundingClientRect();
  const width = Math.ceil(rect.width);
  const height = Math.ceil(rect.height);
  const cloned = element.cloneNode(true);
  cloned.style.margin = "0";
  cloned
    .querySelectorAll(".recharts-tooltip-wrapper, .recharts-tooltip-cursor")
    .forEach((node) => node.remove());

  const serializer = new XMLSerializer();
  const foreignObject = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        ${serializer.serializeToString(cloned)}
      </foreignObject>
    </svg>
  `;

  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(foreignObject)}`;
  const image = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0);
  return canvas.toDataURL("image/jpeg", 0.92);
};

const exportToPdfOld = async (element, title = "Reporte del dashboard") => {
  if (!element) return;
  const dataUrl = await captureElementToDataUrl(element);
  const img = await loadImage(dataUrl);
  const width = img.width;
  const height = img.height;
  const imageBytes = atob(dataUrl.split(",")[1]);
  const imageLength = imageBytes.length;
  const content = `q ${width} 0 0 ${height} 0 0 cm /Im0 Do Q`;

  const objects = [
    `1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n`,
    `2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n`,
    `3 0 obj << /Type /Page /Parent 2 0 R /Resources << /XObject << /Im0 4 0 R >> /ProcSet [/PDF /ImageC] >> /MediaBox [0 0 ${width} ${height}] /Contents 5 0 R >> endobj\n`,
    `4 0 obj << /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageLength} >> stream\n`,
    `\nendstream endobj\n`,
    `5 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj\n`,
  ];

  const encoder = new TextEncoder();
  const header = encoder.encode("%PDF-1.3\n");
  const offsets = [];
  let cursor = header.length;
  offsets.push(cursor);
  cursor += encoder.encode(objects[0]).length;
  offsets.push(cursor);
  cursor += encoder.encode(objects[1]).length;
  offsets.push(cursor);
  cursor += encoder.encode(objects[2]).length;
  offsets.push(cursor);
  cursor += encoder.encode(objects[3]).length + imageLength + encoder.encode(objects[4]).length;
  offsets.push(cursor);
  cursor += encoder.encode(objects[5]).length;

  const xrefOffset = cursor;
  const xref = `xref\n0 6\n0000000000 65535 f \n${offsets
    .map((val) => String(val).padStart(10, "0") + " 00000 n \n")
    .join("")}trailer << /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const imageBinary = new Uint8Array(imageBytes.split("").map((c) => c.charCodeAt(0)));
  const blob = new Blob(
    [
      header,
      encoder.encode(objects[0]),
      encoder.encode(objects[1]),
      encoder.encode(objects[2]),
      encoder.encode(objects[3]),
      imageBinary,
      encoder.encode(objects[4]),
      encoder.encode(objects[5]),
      encoder.encode(xref),
    ],
    { type: "application/pdf" }
  );
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${title.replace(/\s+/g, "_")}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};
