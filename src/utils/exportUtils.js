import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generates an Excel file from an array of submissions
 * @param {Array} submissions - The list of submissions to export
 * @param {string} fileName - The name of the file to save
 */
export const exportToExcel = (submissions, fileName = 'Submissions_FormaFlow') => {
  if (!submissions || submissions.length === 0) return;

  // Flatten the data for Excel - focus on dynamic fields
  const data = submissions.map(sub => {
    const flatSub = {
      'ID Registro': sub.id,
      'Estado': sub.status,
      'Fecha Creación': sub.created_date?.seconds ? new Date(sub.created_date.seconds * 1000).toLocaleString() : 'N/A',
      'Creado por': sub.created_by || 'Público',
    };

    // Add dynamic form responses
    Object.entries(sub.responses || {}).forEach(([key, value]) => {
      // If value is an object (like multiselect or gps), stringify it
      if (typeof value === 'object' && value !== null) {
        flatSub[key] = JSON.stringify(value);
      } else {
        flatSub[key] = value;
      }
    });

    return flatSub;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Registros');

  // Generate buffer and save
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  
  const blobUrl = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = `${fileName}_${new Date().getTime()}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generates a PDF file (concatenated or summary) from selected submissions
 * @param {Array} submissions - The list of submissions to export
 * @param {string} fileName - The name of the file to save
 */
export const exportToPDF = (submissions, formTitle = 'FormaFlow Export') => {
  if (!submissions || submissions.length === 0) return;

  const doc = new jsPDF();
  const title = `Reporte de Registros: ${formTitle}`;
  
  doc.setFontSize(20);
  doc.setTextColor(16, 185, 129); // Emerald Green
  doc.text(title, 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 30);
  doc.text(`Total de registros: ${submissions.length}`, 14, 35);

  const tableRows = submissions.map((sub, index) => [
    index + 1,
    sub.id.substring(0, 8),
    sub.status,
    sub.created_by || 'Público',
    sub.created_date?.seconds ? new Date(sub.created_date.seconds * 1000).toLocaleDateString() : 'N/A'
  ]);

  doc.autoTable({
    startY: 45,
    head: [['#', 'ID', 'Estado', 'Autor', 'Fecha']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save(`${formTitle.replace(/\s+/g, '_')}_Report_${new Date().getTime()}.pdf`);
};
