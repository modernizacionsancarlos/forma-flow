import React, { useState, useEffect, useMemo } from "react";
import { collection, query, where, getDocs, orderBy, updateDoc, doc, Timestamp, addDoc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import { useSubmissions } from "../api/useSubmissions";
import { useForms } from "../api/useForms";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Components
import SubmissionsHeader from "../components/submissions/SubmissionsHeader";
import FormSidebar from "../components/submissions/FormSidebar";
import SubmissionList from "../components/submissions/SubmissionList";
import AuditPanel from "../components/submissions/AuditPanel";

const Submissions = () => {
  const { claims, user } = useAuth();
  const { queueCount, isSyncing, syncQueue, clearQueue } = useSubmissions();
  const { forms } = useForms();
  
  const [submissions, setSubmissions] = useState([]);
  
  // Tri-Pane State
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedSchema, setSelectedSchema] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
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

  const updateStatus = async (submissionId, newStatus) => {
    setActionLoading(true);
    try {
      const docRef = doc(db, "Submissions", submissionId);
      await updateDoc(docRef, { 
        status: newStatus,
        updated_at: Timestamp.now(),
        updated_by: user.uid 
      });
      
      // Log for audit
      await addDoc(collection(db, "AuditLogs"), {
        submission_id: submissionId,
        action: "status_change",
        old_status: selectedSubmission.status,
        new_status: newStatus,
        performer_id: user.uid,
        performer_name: user.email,
        timestamp: Timestamp.now(),
        tenant_id: claims.tenantId || "global"
      });

      setSelectedSubmission(prev => ({ ...prev, status: newStatus }));
      fetchSubmissions();
    } catch (err) {
      console.error(err);
    }
    setActionLoading(false);
  };

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

  const generatePDF = () => {
    if (!selectedSubmission) return;

    const doc = new jsPDF();
    const primaryColor = [15, 23, 42];
    const accentColor = [16, 185, 129];

    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text("FORMFLOW CENTRAL", 20, 28);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(160, 160, 160);
    doc.text("PLATAFORMA DE AUDITORÍA Y CONTROL DE CAMPO", 20, 36);
    
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(1.5);
    doc.line(20, 40, 75, 40);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("CERTIFICADO DE CAPTURA DIGITAL", 20, 60);
    
    doc.setFont("helvetica", "normal");
    const infoY = 72;
    doc.text(`ID Referencia: ${selectedSubmission.id}`, 20, infoY);
    doc.text(`Formulario: ${selectedSchema?.title || "Manual"}`, 20, infoY + 8);
    doc.text(`Entidad (Tenant): ${selectedSubmission.tenant_id}`, 20, infoY + 16);
    
    const date = selectedSubmission.created_date?.seconds 
      ? new Date(selectedSubmission.created_date.seconds * 1000).toLocaleString('es-ES') 
      : new Date(selectedSubmission.created_date).toLocaleString('es-ES');
    doc.text(`Fecha Entrega: ${date}`, 120, infoY);
    doc.text(`Estado Legal: ${selectedSubmission.status.toUpperCase()}`, 120, infoY + 8);
    doc.text(`Autor UID: ${selectedSubmission.created_by?.substring(0, 12) || "Sist. Público"}...`, 120, infoY + 16);

    const fields = getFlattenedFields();
    const tableData = Object.entries(selectedSubmission.data || {}).map(([key, val]) => {
      const field = fields.find(f => f.id === key);
      return [field?.label?.toUpperCase() || key.toUpperCase(), String(val)];
    });

    autoTable(doc, {
      startY: 105,
      head: [['PROPIEDAD AUDITADA', 'DATO REGISTRADO']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', halign: 'center' },
      styles: { fontSize: 9, cellPadding: 5, font: 'helvetica' },
      columnStyles: { 0: { fontStyle: 'bold', width: 80, fillColor: [248, 250, 252] } },
      margin: { left: 20, right: 20 }
    });

    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, finalY, 170, 30);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("VERIFICACIÓN DE SEGURIDAD", 25, finalY + 8);
    doc.text(`Este reporte ha sido generado automáticamente por el núcleo FormFlow Central.`, 25, finalY + 15);
    doc.text(`La integridad de estos datos ha sido validada contra los esquemas de auditoría vigentes.`, 25, finalY + 20);
    
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(`FORMFLOW ENTERPRISE v2.0 - AUDIT REPORT`, 20, 285);
      doc.text(`PÁGINA ${i} DE ${pageCount}`, 175, 285);
    }

    doc.save(`FormFlow_Audit_${selectedSubmission.id.substring(0, 8)}.pdf`);
  };

  const flattenedFields = getFlattenedFields();

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] gap-6 antialiased">
      <SubmissionsHeader 
        isOnline={isOnline}
        syncFeedback={syncFeedback}
        handleManualSync={handleManualSync}
        isSyncing={isSyncing}
        queueCount={queueCount}
        clearQueue={clearQueue}
      />

      <div className="flex flex-1 gap-6 overflow-hidden">
        <FormSidebar 
          forms={forms}
          submissions={submissions}
          selectedFormId={selectedFormId}
          onSelectForm={(id) => { setSelectedFormId(id); setSelectedSubmission(null); }}
        />

        <SubmissionList 
          loading={loading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filteredSubmissions={filteredSubmissions}
          selectedSubmission={selectedSubmission}
          onSelectSubmission={setSelectedSubmission}
        />

        <AuditPanel 
          selectedSubmission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          selectedSchema={selectedSchema}
          flattenedFields={flattenedFields}
          updateStatus={updateStatus}
          actionLoading={actionLoading}
          generatePDF={generatePDF}
        />
      </div>
    </div>
  );
};

export default Submissions;
