import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

export function exportToExcel(sheetsData: { sheetName: string; data: Record<string, any>[] }[], fileName: string) {
  const wb = XLSX.utils.book_new();

  sheetsData.forEach(({ sheetName, data }) => {
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
  });

  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

export function exportToPdfReport(options: {
  title: string;
  subtitle: string;
  headers: string[];
  rows: string[][];
  fileName: string;
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // School Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(7, 92, 66); // Dark green #075C42
  doc.text('ARYS BIL SCHOOL - STUDY & DORMITORY TRACKER', 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(36, 52, 45); // #24342D
  doc.text(options.title, 14, 28);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(options.subtitle, 14, 34);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 39);

  // Divider line
  doc.setDrawColor(19, 138, 98);
  doc.setLineWidth(0.5);
  doc.line(14, 42, 196, 42);

  // Table rendering
  let y = 50;
  const colWidth = (196 - 14) / options.headers.length;

  // Header row
  doc.setFillColor(230, 244, 234); // #E6F4EA
  doc.rect(14, y - 5, 182, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(7, 92, 66);

  options.headers.forEach((header, i) => {
    doc.text(header, 16 + i * colWidth, y);
  });

  y += 7;

  // Data rows
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(36, 52, 45);
  doc.setFontSize(8.5);

  options.rows.forEach((row, rowIdx) => {
    if (y > 275) {
      doc.addPage();
      y = 20;
    }

    if (rowIdx % 2 === 1) {
      doc.setFillColor(248, 250, 249);
      doc.rect(14, y - 4, 182, 6.5, 'F');
    }

    row.forEach((cell, i) => {
      const text = String(cell || '');
      doc.text(text.substring(0, 25), 16 + i * colWidth, y);
    });

    y += 6.5;
  });

  // Footer signature
  if (y > 260) {
    doc.addPage();
    y = 30;
  }
  y += 12;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(120, 120, 120);
  doc.text('Official Document — Arys BIL School Administration', 14, y);
  doc.text('Signature / Seal: _________________________', 120, y);

  doc.save(`${options.fileName}.pdf`);
}
