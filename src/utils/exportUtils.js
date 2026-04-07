import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Generates an Excel file from an array of submissions with full history
 */
export const exportToExcel = (submissions, fileName = 'Submissions_FormaFlow') => {
  if (!submissions || submissions.length === 0) return;

  const data = submissions.map(sub => {
    const flatSub = {
      'ID Registro': sub.id,
      'Estado': sub.status?.toUpperCase(),
      'Fecha Creación': sub.created_date?.seconds ? new Date(sub.created_date.seconds * 1000).toLocaleString() : 'N/A',
      'Creado por': sub.created_by || 'Público',
      'Última Acción': sub.last_action || 'N/A',
      'Eventos en Historial': sub.history?.length || 0
    };

    // Add dynamic form responses
    Object.entries(sub.responses || {}).forEach(([key, value]) => {
      flatSub[`CAMPO: ${key}`] = typeof value === 'object' && value !== null ? JSON.stringify(value) : value;
    });

    // Add history summary as a single string field
    if (sub.history && sub.history.length > 0) {
      flatSub['Historial Completo'] = sub.history.map(h => 
        `[${h.timestamp?.seconds ? new Date(h.timestamp.seconds * 1000).toLocaleString() : '?'}] ${h.action_label || h.type}: ${h.note || ''}`
      ).join(' | ');
    }

    return flatSub;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Registros_Completos');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `${fileName.replace(/\s+/g, '_')}_${new Date().getTime()}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generates a PRO PDF Report with Timeline and Verification QR
 */
export const exportToPDF = (submissions, formTitle = 'FormaFlow Export') => {
  if (!submissions || submissions.length === 0) return;

  const doc = new jsPDF();
  const primaryColor = [16, 185, 129]; // #10b981 (Emerald)

  // Header Design
  doc.setFillColor(15, 23, 42); // slate-950
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("FORMAFLOW", 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text("SISTEMA DE GESTIÓN OPERATIVA MUNICIPAL", 14, 28);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(`DOC ID: ${new Date().getTime()}`, 160, 15);
  doc.text(`FECHA: ${new Date().toLocaleString()}`, 160, 20);

  // Body Title
  doc.setTextColor(40);
  doc.setFontSize(16);
  doc.text(`Reporte de Auditoría: ${formTitle}`, 14, 55);

  // Main Table
  const tableRows = submissions.map((sub, index) => [
    index + 1,
    sub.id.substring(0, 8).toUpperCase(),
    sub.status?.toUpperCase() || 'PENDIENTE',
    sub.created_by?.substring(0, 15) || 'PÚBLICO',
    sub.created_date?.seconds ? new Date(sub.created_date.seconds * 1000).toLocaleDateString() : 'N/A'
  ]);

  doc.autoTable({
    startY: 65,
    head: [['#', 'ID TRÁMITE', 'ESTADO', 'AUTOR', 'FECHA']],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: primaryColor, fontSize: 10, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 14, right: 14 }
  });

  // Individual Timeline Details (if only one submission selected)
  if (submissions.length === 1 && submissions[0].history) {
    const sub = submissions[0];
    const finalY = doc.lastAutoTable.finalY + 15;
    
    doc.setFontSize(12);
    doc.setTextColor(60);
    doc.text("Trazabilidad Operativa (Timeline)", 14, finalY);
    
    const historyRows = sub.history.map(h => [
        h.timestamp?.seconds ? new Date(h.timestamp.seconds * 1000).toLocaleString() : 'N/A',
        h.action_label || h.type,
        h.note || '-'
    ]);

    doc.autoTable({
        startY: finalY + 5,
        head: [['FECHA/HORA', 'ACCIÓN', 'OBSERVACIONES']],
        body: historyRows,
        theme: 'grid',
        headStyles: { fillColor: [71, 85, 105] }, // slate-600
        styles: { fontSize: 8 }
    });
  }

  // Footer & Verification QR Placeholder
  const pageHeight = doc.internal.pageSize.height;
  doc.setDrawColor(200);
  doc.line(14, pageHeight - 30, 196, pageHeight - 30);
  
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("Este documento es una copia fiel generada digitalmente por FormaFlow.", 14, pageHeight - 20);
  doc.text("La validez legal puede verificarse mediante el portal de transparencia municipal.", 14, pageHeight - 15);

  // Decorative QR Placeholder
  doc.setFillColor(240);
  doc.rect(170, pageHeight - 35, 25, 25, 'F');
  doc.setFontSize(6);
  doc.setTextColor(100);
  doc.text("CÓDIGO QR", 175, pageHeight - 20);
  doc.text("VERIFICACIÓN", 173, pageHeight - 17);

  doc.save(`${formTitle.replace(/\s+/g, '_')}_Report_${new Date().getTime()}.pdf`);
};
