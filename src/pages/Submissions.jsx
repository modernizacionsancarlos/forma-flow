import React, { useState, useEffect, useMemo } from "react";
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import { useSubmissions } from "../api/useSubmissions";
import { useForms } from "../api/useForms";
import { exportToExcel, exportToPDF } from "../utils/exportUtils";

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


  const handleGenerateIndividualPDF = () => {
    if (!selectedSubmission) return;
    exportToPDF([selectedSubmission], selectedSchema?.title || 'Trámite Individual');
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
            exportToPDF(selectedSubmissions, selectedSchema?.title || 'Export');
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
          generatePDF={handleGenerateIndividualPDF}
        />
      </div>
    </div>
  );
};

export default Submissions;
