const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const buildSheetXml = (rows) => {
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const headerRow = headers.length
    ? `<row>${headers
        .map(
          (header) =>
            `<c t="inlineStr"><is><t>${escapeXml(header)}</t></is></c>`
        )
        .join("")}</row>`
    : "";

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
  <sheets>
    ${sheets
      .map(
        (sheet, idx) =>
          `<sheet name="${escapeXml(sheet.name)}" sheetId="${idx + 1}" r:id="rId${idx + 1}" />`
      )
      .join("")}
  </sheets>
</workbook>`;

const buildWorkbookRelsXml = (sheets) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${sheets
    .map(
      (_, idx) =>
        `<Relationship Id="rId${idx + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${idx + 1}.xml" />`
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

export const exportToPdf = async (element, title = "Reporte del dashboard") => {
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
