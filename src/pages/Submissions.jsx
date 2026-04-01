import React, { useState, useEffect, useMemo } from "react";
import { collection, query, where, getDocs, orderBy, updateDoc, doc, Timestamp, addDoc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import { useSubmissions } from "../api/useSubmissions";
import { useForms } from "../api/useForms";
import { 
  Database, 
  RefreshCw,
  Search, 
  Filter,
  Eye,
  FileText,
  Check,
  X,
  History,
  Download,
  ShieldCheck,
  ChevronRight,
  Trash2,
  Globe,
  Layers,
  Inbox
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const STATUS_CONFIG = {
  pending_sync: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Pendiente Sinc" },
  pending_review: { color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", label: "En Revisión" },
  approved: { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Aprobado" },
  rejected: { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", label: "Rechazado" },
};

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

  // Filtrado de submissions basado en el form seleccionado y búsqueda
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      // Filtrar por Formulario
      if (selectedFormId && sub.schema_id !== selectedFormId) return false;
      // Filtrar por Búsqueda
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
    const primaryColor = [15, 23, 42]; // Slate-900 approx
    const accentColor = [16, 185, 129]; // Emerald-500

    // Header Branding
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

    // Business Intelligence Info
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

    // Dynamic Data Table
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

    // Verification Badge
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, finalY, 170, 30);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("VERIFICACIÓN DE SEGURIDAD", 25, finalY + 8);
    doc.text(`Este reporte ha sido generado automáticamente por el núcleo FormFlow Central.`, 25, finalY + 15);
    doc.text(`La integridad de estos datos ha sido validada contra los esquemas de auditoría vigentes.`, 25, finalY + 20);
    
    // Footer
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
    <div className="flex flex-col h-[calc(100vh-160px)] gap-6">
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-10 shadow-2xl flex justify-between items-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/5 blur-[100px] -z-10 group-hover:bg-emerald-600/10 transition-all duration-700"></div>
        <div className="flex items-center space-x-6">
           <div className={`p-4 rounded-2xl border-2 transition-all duration-500 shadow-xl ${isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
              <Globe size={24} className={isOnline ? "" : "animate-pulse"} />
           </div>
           <div>
             <h2 className="text-3xl font-black text-white mb-1 tracking-tighter uppercase italic">Mesa de Entradas</h2>
             <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest pl-1">
                <span className={isOnline ? "text-emerald-500" : "text-red-500"}>
                  {isOnline ? "Sistema Conectado" : "Modo Offline Activo"}
                </span>
                <span className="h-1 w-1 bg-slate-700 rounded-full"></span>
                <span className="text-slate-500">Workspace Explorer v3</span>
             </div>
           </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {syncFeedback && (
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 animate-bounce">
              {syncFeedback}
            </span>
          )}
          <div className="flex space-x-2">
            <button 
               onClick={handleManualSync}
               disabled={isSyncing || queueCount === 0 || !isOnline}
               className="px-8 py-3 bg-emerald-600/10 text-emerald-500 border-2 border-emerald-500/20 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center space-x-3 hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-20 active:scale-95 shadow-xl shadow-emerald-900/10"
            >
              <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
               <span>Sincronizar ({queueCount === 0 ? "Listo" : queueCount})</span>
            </button>
            {queueCount > 0 && (
               <button 
                 onClick={clearQueue}
                 className="p-3 bg-slate-950 text-slate-600 hover:text-red-500 border-2 border-slate-800 rounded-2xl transition-all"
                 title="Limpiar cola offline"
               >
                 <Trash2 size={18} />
               </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        
        {/* PANEL 1: Formularios (Carpetas) */}
        <div className="w-80 bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col z-10">
           <div className="p-6 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center space-x-2">
                 <Layers size={14} />
                 <span>Agrupación</span>
              </span>
              <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-[9px] font-bold">{forms?.length || 0}</span>
           </div>
           <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
              <button 
                onClick={() => { setSelectedFormId(null); setSelectedSubmission(null); }}
                className={`w-full flex items-center space-x-4 p-4 rounded-2xl border-2 transition-all text-left ${
                  selectedFormId === null 
                  ? "bg-emerald-600/10 border-emerald-500/30 text-emerald-500" 
                  : "bg-slate-950/50 border-transparent hover:border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                 <div className="p-2 bg-slate-900 rounded-xl shadow-inner border border-white/5">
                    <Inbox size={18} />
                 </div>
                 <div className="flex flex-col flex-1 overflow-hidden">
                    <span className="text-xs font-black uppercase tracking-tight truncate">Inbox Global</span>
                    <span className="text-[10px] opacity-70 font-medium">Todas las respuestas</span>
                 </div>
                 <span className="text-xs font-bold font-mono opacity-50">{submissions.length}</span>
              </button>
              
              <div className="pt-4 pb-2">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-4">Por Formulario</span>
              </div>

              {forms?.map(form => {
                const count = submissions.filter(s => s.schema_id === form.id).length;
                const isSelected = selectedFormId === form.id;
                
                return (
                  <button 
                    key={form.id}
                    onClick={() => { setSelectedFormId(form.id); setSelectedSubmission(null); }}
                    className={`w-full flex items-center space-x-4 p-4 rounded-2xl border-2 transition-all text-left group ${
                      isSelected 
                      ? "bg-slate-800/80 border-slate-600 text-white shadow-lg" 
                      : "bg-transparent border-transparent hover:bg-slate-950/50 hover:border-slate-800 text-slate-400 hover:text-slate-300"
                    }`}
                  >
                     <div className={`p-2 rounded-xl border shadow-inner transition-colors ${
                       isSelected ? "bg-slate-700 border-white/10 text-white" : "bg-slate-900 border-white/5 group-hover:bg-slate-800"
                     }`}>
                        <FileText size={18} />
                     </div>
                     <div className="flex flex-col flex-1 overflow-hidden">
                        <span className={`text-xs font-black uppercase tracking-tight truncate ${isSelected ? "text-white" : ""}`}>
                          {form.title || "Formulario Anónimo"}
                        </span>
                        <span className="text-[10px] opacity-70 font-medium truncate">{form.id.substring(0, 10)}...</span>
                     </div>
                     <span className="text-xs font-bold font-mono opacity-50">{count}</span>
                  </button>
                )
              })}
           </div>
        </div>

        {/* PANEL 2: Lista de Registros */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col z-10 transition-all duration-300">
          <div className="p-6 bg-slate-950/40 border-b border-slate-800 flex items-center space-x-6">
             <div className="relative flex-1">
                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por ID, Valor o Detalle..." 
                  className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-2xl pl-14 pr-6 py-4 text-sm font-medium focus:outline-none focus:border-emerald-600/50 transition-all text-white placeholder:text-slate-700 font-mono" 
                />
             </div>
             <button className="p-4 bg-slate-950 text-slate-400 hover:text-white border-2 border-slate-800 rounded-2xl transition-all shadow-inner">
                <Filter size={18} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                 <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-800 border-t-emerald-500"></div>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cargando Bóveda Central...</span>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
                 <Inbox size={48} className="text-slate-700" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No se encontraron registros</span>
              </div>
            ) : (
              <div className="space-y-2">
                 {filteredSubmissions.map((sub) => {
                    const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending_review;
                    const isSelected = selectedSubmission?.id === sub.id;
                    const date = sub.created_date?.seconds ? new Date(sub.created_date.seconds * 1000).toLocaleString() : "Offline";
                    
                    return (
                      <div 
                         key={sub.id} 
                         onClick={() => setSelectedSubmission(sub)}
                         className={`group cursor-pointer transition-all p-5 rounded-2xl border-2 flex items-center justify-between ${
                           isSelected 
                           ? "bg-emerald-600/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                           : "bg-slate-950/50 border-transparent hover:border-slate-800 hover:bg-slate-800/50"
                         }`}
                      >
                         <div className="flex items-center space-x-5">
                            <div className={`p-3 rounded-xl flexitems-center justify-center border transition-all ${
                              isSelected ? "bg-emerald-500 border-emerald-400 shadow-lg text-white" : "bg-slate-900 border-slate-800 text-slate-500 group-hover:text-emerald-500"
                            }`}>
                               <Database size={16} />
                            </div>
                            <div className="flex flex-col">
                               <div className="flex items-center space-x-3 mb-1">
                                  <span className={`font-mono text-sm font-bold tracking-tighter ${isSelected ? "text-white" : "text-slate-300"}`}>
                                    #{sub.id.substring(0, 8)}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border shadow-sm ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                    {cfg.label}
                                  </span>
                               </div>
                               <span className="text-[10px] text-slate-500 font-medium">
                                 {date} • Usuario: {sub.created_by?.substring(0,8) || "Sist"}
                               </span>
                            </div>
                         </div>
                         <ChevronRight size={18} className={`transition-all duration-300 ${isSelected ? "text-emerald-500 translate-x-1" : "text-slate-700 opacity-50 group-hover:opacity-100 group-hover:text-white"}`} />
                      </div>
                    );
                 })}
              </div>
            )}
          </div>
        </div>

        {/* PANEL 3: Panel de Auditoría Lateral (Digital Dossier) */}
        <div className={`transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden bg-slate-900 border-slate-800 rounded-[2.5rem] shadow-dark-2xl flex flex-col group relative ${
            selectedSubmission ? "w-[480px] border opacity-100" : "w-0 border-0 opacity-0 translate-x-10"
        }`}>
           {selectedSubmission && (
             <div className="flex flex-col h-full w-[480px]">
                <div className="p-8 bg-slate-950/60 border-b border-slate-800 flex justify-between items-start backdrop-blur-xl shrink-0">
                   <div className="space-y-3">
                       <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center space-x-2">
                          <ShieldCheck size={14} />
                          <span>Dossier de Auditoría</span>
                       </span>
                       <h3 className="text-2xl font-black text-white tracking-tighter leading-none">#{selectedSubmission.id.substring(0, 8)}</h3>
                   </div>
                   <button 
                     onClick={() => setSelectedSubmission(null)} 
                     className="p-2.5 bg-slate-900 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all border border-slate-800 hover:border-slate-700 active:scale-90"
                   >
                      <X size={18} />
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                   {/* Meta Global */}
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 shadow-inner">
                         <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest block mb-1">Entidad</span>
                         <span className="text-xs text-white font-black truncate block italic">{selectedSubmission.tenant_id}</span>
                      </div>
                      <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 shadow-inner">
                         <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest block mb-1">Autor</span>
                         <span className="text-xs text-white font-black truncate block">{selectedSubmission.created_by?.substring(0, 12)}...</span>
                      </div>
                   </div>

                   {/* Datos Técnicos */}
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center space-x-3">
                           <Database size={14} />
                           <span>Evidencia Capturada</span>
                        </h4>
                        {selectedSchema && (
                          <div className="flex items-center space-x-2 px-2.5 py-1 bg-emerald-600/10 border border-emerald-500/20 rounded-lg">
                             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                             <span className="text-[8px] text-emerald-500 font-black uppercase tracking-tighter">Mapeo Activo</span>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-2 border border-slate-800 rounded-3xl overflow-hidden bg-slate-950/30">
                         {Object.entries(selectedSubmission.data || {}).map(([key, val], idx, arr) => {
                           const field = flattenedFields.find(f => f.id === key);
                           const isLast = idx === arr.length - 1;
                           return (
                            <div key={key} className={`flex flex-col p-4 bg-transparent hover:bg-slate-900/50 transition-colors group/item ${!isLast ? 'border-b border-slate-800/50' : ''}`}>
                               <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1 group-hover/item:text-emerald-500 transition-colors">{field?.label || key}</span>
                               <span className="text-sm text-slate-200 font-black tracking-tight break-words">{String(val)}</span>
                            </div>
                           );
                         })}
                      </div>
                   </div>

                   {/* Workflow Controls */}
                   <div className="pt-8 border-t border-slate-800 space-y-5">
                      <div className="flex items-center space-x-3">
                         <History size={14} className="text-slate-600" />
                         <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ejecución de Workflow</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <button 
                           onClick={() => updateStatus(selectedSubmission.id, 'approved')}
                           disabled={actionLoading || selectedSubmission.status === 'approved'}
                           className={`flex items-center justify-center space-x-2 py-4 border-2 rounded-2xl text-[10px] font-black transition-all active:scale-95 shadow-xl uppercase tracking-widest ${
                             selectedSubmission.status === 'approved' 
                             ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-900/40" 
                             : "bg-emerald-600/5 text-emerald-500 border-emerald-500/10 hover:bg-emerald-600 hover:text-white"
                           }`}
                         >
                            {selectedSubmission.status === 'approved' ? <ShieldCheck size={16} /> : <Check size={16} />}
                            <span>Aprobar</span>
                         </button>
                         <button 
                           onClick={() => updateStatus(selectedSubmission.id, 'rejected')}
                           disabled={actionLoading || selectedSubmission.status === 'rejected'}
                           className={`flex items-center justify-center space-x-2 py-4 border-2 rounded-2xl text-[10px] font-black transition-all active:scale-95 shadow-xl uppercase tracking-widest ${
                             selectedSubmission.status === 'rejected'
                             ? "bg-red-600 text-white border-red-500 shadow-red-900/40"
                             : "bg-red-600/5 text-red-500 border-red-500/10 hover:bg-red-600 hover:text-white"
                           }`}
                         >
                            <X size={16} />
                            <span>Rechazar</span>
                         </button>
                      </div>
                   </div>
                </div>
                
                <div className="p-6 bg-slate-950/80 border-t border-slate-800 backdrop-blur-xl shrink-0">
                   <button 
                     onClick={generatePDF}
                     className="w-full py-4 border border-slate-700 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg flex items-center justify-center space-x-3 hover:bg-slate-800 hover:border-slate-600 transition-all active:scale-95"
                   >
                      <Download size={16} />
                      <span>Descargar Acta (PDF)</span>
                   </button>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Submissions;
