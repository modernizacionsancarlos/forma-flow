import React, { useState, useEffect, useMemo } from "react";
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import { useSubmissions } from "../api/useSubmissions";
import { useForms } from "../api/useForms";
import { useTenants } from "../api/useTenants";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { exportToExcel, exportToPDF as bulkExportPDF } from "../utils/exportUtils";

// Components
import SubmissionsHeader from "../components/submissions/SubmissionsHeader";
import FormSidebar from "../components/submissions/FormSidebar";
import SubmissionList from "../components/submissions/SubmissionList";
import AuditPanel from "../components/submissions/AuditPanel";

const Submissions = () => {
  const { claims } = useAuth();
  const { queueCount, isSyncing, syncQueue, clearQueue } = useSubmissions();
  const { forms } = useForms();
  
  const [submissions, setSubmissions] = useState([]);
  
  // Tri-Pane State
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedSchema, setSelectedSchema] = useState(null);
  
  const [loading, setLoading] = useState(true);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncFeedback, setSyncFeedback] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const handleManualSync = async () => {
    if (!isOnline) {
      alert("No se puede sincronizar sin conexión a internet.");
      return;
    }
    const result = await syncQueue();
    if (result) {
      setSyncFeedback(`Sincronizados: ${result.success}, Fallidos: ${result.failed}`);
      setTimeout(() => setSyncFeedback(null), 5000);
      fetchSubmissions();
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      let q = query(
        collection(db, "Submissions"),
        orderBy("created_date", "desc")
      );
      
      if (claims.role !== 'super_admin' && claims.tenantId) {
          q = query(
            collection(db, "Submissions"),
            where("tenant_id", "==", claims.tenantId),
            orderBy("created_date", "desc")
          );
      }
      
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubmissions(results);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claims.tenantId]);

  useEffect(() => {
    const fetchSchema = async () => {
      if (selectedSubmission?.schema_id) {
        const schemaRef = doc(db, "FormSchemas", selectedSubmission.schema_id);
        const schemaSnap = await getDoc(schemaRef);
        if (schemaSnap.exists()) {
          setSelectedSchema(schemaSnap.data());
        }
      } else {
        setSelectedSchema(null);
      }
    };
    fetchSchema();
  }, [selectedSubmission]);


  const getFlattenedFields = () => {
    if (!selectedSchema) return [];
    if (selectedSchema.sections) {
      return selectedSchema.sections.flatMap(s => s.fields || []);
    }
    return selectedSchema.fields || [];
  };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      if (selectedFormId && sub.schema_id !== selectedFormId) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          sub.id.toLowerCase().includes(q) || 
          sub.schema_id?.toLowerCase().includes(q) ||
          JSON.stringify(sub.data).toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [submissions, selectedFormId, searchQuery]);

  const { tenants } = useTenants();
  const currentTenant = useMemo(() => {
    return tenants?.find(t => t.id === claims.tenantId) || tenants?.[0];
  }, [tenants, claims.tenantId]);

  const branding = currentTenant?.branding || {
    primary_color: "#10b981",
    logo_url: null
  };

  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };

  const primaryRGB = hexToRgb(branding.primary_color || "#10b981");

  const generatePDF = () => {
    if (!selectedSubmission) return;

    const doc = new jsPDF();
    const primaryColor = primaryRGB;
    const accentColor = [15, 23, 42]; // Slate 900 for text contrast

    // Header Background
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 45, 'F');
    
    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(currentTenant?.name?.toUpperCase() || "FORMFLOW CENTRAL", 20, 28);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(255, 255, 255, 0.8);
    doc.text("REPORTE OFICIAL DE GESTIÓN Y AUDITORÍA DIGITAL", 20, 36);

    // Accent Line
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.line(20, 40, 60, 40);

    // Submission Info Header
    doc.setTextColor(...accentColor);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("DETALLES DEL TRÁMITE", 20, 60);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139); // Slate 500
    
    const infoY = 72;
    // Left Column
    doc.text(`ID Referencia:`, 20, infoY);
    doc.setTextColor(30, 41, 59);
    doc.text(`${selectedSubmission.id}`, 50, infoY);
    
    doc.setTextColor(100, 116, 139);
    doc.text(`Formulario:`, 20, infoY + 8);
    doc.setTextColor(30, 41, 59);
    doc.text(`${selectedSchema?.title || "No especificado"}`, 50, infoY + 8);
    
    doc.setTextColor(100, 116, 139);
    doc.text(`Institución:`, 20, infoY + 16);
    doc.setTextColor(30, 41, 59);
    doc.text(`${currentTenant?.name || "Global"}`, 50, infoY + 16);

    // Right Column
    const date = selectedSubmission.created_date?.seconds 
      ? new Date(selectedSubmission.created_date.seconds * 1000).toLocaleString('es-ES') 
      : new Date(selectedSubmission.created_date).toLocaleString('es-ES');
    
    doc.setTextColor(100, 116, 139);
    doc.text(`Fecha/Hora:`, 120, infoY);
    doc.setTextColor(30, 41, 59);
    doc.text(`${date}`, 150, infoY);
    
    doc.setTextColor(100, 116, 139);
    doc.text(`Estado:`, 120, infoY + 8);
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text(`${selectedSubmission.status.toUpperCase()}`, 150, infoY + 8);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`Usuario:`, 120, infoY + 16);
    doc.setTextColor(30, 41, 59);
    doc.text(`${selectedSubmission.created_by?.substring(0, 15) || "Sist. Público"}...`, 150, infoY + 16);

    // Table of Data
    const fields = flattenedFields;
    const tableData = Object.entries(selectedSubmission.data || {}).map(([key, val]) => {
      const field = fields.find(f => f.id === key);
      const label = field?.label || key;
      
      let displayValue = "---";
      
      if (val !== undefined && val !== null && val !== "") {
        if (Array.isArray(val)) {
          displayValue = val.join(", ");
        } else if (typeof val === 'boolean') {
          displayValue = val ? "SÍ" : "NO";
        } else if (typeof val === 'object') {
          displayValue = JSON.stringify(val);
        } else {
          displayValue = String(val);
        }
      }

      return [label.toUpperCase(), displayValue];
    });

    autoTable(doc, {
      startY: 105,
      head: [['CAMPO / ATRIBUTO', 'VALOR REGISTRADO']],
      body: tableData,
      theme: 'striped',
      headStyles: { 
        fillColor: primaryColor, 
        textColor: 255, 
        fontStyle: 'bold', 
        halign: 'left',
        cellPadding: 4
      },
      styles: { 
        fontSize: 9, 
        cellPadding: 4, 
        font: 'helvetica',
        valign: 'middle'
      },
      columnStyles: { 
        0: { fontStyle: 'bold', width: 60, fillColor: [248, 250, 252] },
        1: { width: 'auto' }
      },
      margin: { left: 20, right: 20 },
      alternateRowStyles: { fillColor: [252, 253, 254] }
    });

    // Security Footer Box
    const finalY = doc.lastAutoTable.finalY + 15;
    if (finalY < 250) {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(20, finalY, 170, 25, 3, 3, 'FD');
      
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "bold");
      doc.text("VERIFICACIÓN DE INTEGRIDAD", 25, finalY + 8);
      doc.setFont("helvetica", "normal");
      doc.text(`Este documento certifica la recepción y validez de los datos contenidos en el sistema FormFlow.`, 25, finalY + 14);
      doc.text(`Cualquier modificación manual de este documento anula su validez legal.`, 25, finalY + 19);
    }
    
    // Page Numbering
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`${currentTenant?.name || "FormFlow"} - Reporte de Auditoría v2.0`, 20, 285);
      doc.text(`Página ${i} de ${pageCount}`, 175, 285);
    }

    doc.save(`${currentTenant?.name?.replace(/\s+/g, '_') || 'FormFlow'}_Audit_${selectedSubmission.id.substring(0, 8)}.pdf`);
  };

  const flattenedFields = getFlattenedFields();

  const [selectedIds, setSelectedIds] = useState([]);
  
  const toggleSelectId = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = (ids) => {
    setSelectedIds(prev => prev.length === ids.length ? [] : ids);
  };

  const handleStatusUpdated = (newStatus) => {
    if (selectedSubmission) {
      setSelectedSubmission(prev => ({ ...prev, status: newStatus }));
      fetchSubmissions();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] gap-6 antialiased">
      <SubmissionsHeader 
        isOnline={isOnline}
        syncFeedback={syncFeedback}
        handleManualSync={handleManualSync}
        isSyncing={isSyncing}
        queueCount={queueCount}
        clearQueue={clearQueue}
        selectedCount={selectedIds.length}
        onExport={(type) => {
          const selectedSubmissions = submissions.filter(s => selectedIds.includes(s.id));
          if (type === 'excel') {
            exportToExcel(selectedSubmissions, selectedSchema?.title || 'Export');
          } else if (type === 'pdf') {
            bulkExportPDF(selectedSubmissions, selectedSchema?.title || 'Export');
          }
        }}
      />

      <div className="flex flex-1 gap-6 overflow-hidden">
        <FormSidebar 
          forms={forms}
          submissions={submissions}
          selectedFormId={selectedFormId}
          onSelectForm={(id) => { setSelectedFormId(id); setSelectedSubmission(null); setSelectedIds([]); }}
        />

        <SubmissionList 
          loading={loading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filteredSubmissions={filteredSubmissions}
          selectedSubmission={selectedSubmission}
          onSelectSubmission={setSelectedSubmission}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelectId}
          onSelectAll={() => selectAll(filteredSubmissions.map(s => s.id))}
        />

        <AuditPanel 
          selectedSubmission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          selectedSchema={selectedSchema}
          flattenedFields={flattenedFields}
          onStatusUpdated={handleStatusUpdated}
          generatePDF={generatePDF}
        />
      </div>
    </div>
  );
};

export default Submissions;
