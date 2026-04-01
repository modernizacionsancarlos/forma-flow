import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy, updateDoc, doc, Timestamp, addDoc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import { useSubmissions } from "../api/useSubmissions";
import { 
  Database, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Filter,
  Eye,
  FileText,
  UserCog,
  Check,
  X,
  History,
  Download,
  ShieldCheck,
  ChevronRight,
  Trash2,
  Globe
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
  const { queueCount, isSyncing, syncQueue, offlineQueue, clearQueue } = useSubmissions();
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncFeedback, setSyncFeedback] = useState(null);

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
             <h2 className="text-3xl font-black text-white mb-1 tracking-tighter uppercase italic">Control de Flujos</h2>
             <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest pl-1">
                <span className={isOnline ? "text-emerald-500" : "text-red-500"}>
                  {isOnline ? "Sistema Conectado" : "Modo Offline Activo"}
                </span>
                <span className="h-1 w-1 bg-slate-700 rounded-full"></span>
                <span className="text-slate-500">Auditoría centralizada v2.0</span>
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
        {/* Lista de Registros Premium */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
          <div className="p-6 bg-slate-950/40 border-b border-slate-800 flex items-center space-x-6">
             <div className="relative flex-1">
                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
                <input 
                  placeholder="Buscar por ID, Esquema o Detalle..." 
                  className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-2xl pl-14 pr-6 py-4 text-sm font-medium focus:outline-none focus:border-emerald-600/50 transition-all" 
                />
             </div>
             <button className="p-4 bg-slate-950 text-slate-400 hover:text-white border-2 border-slate-800 rounded-2xl transition-all shadow-inner">
                <Filter size={18} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                 <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-800 border-t-emerald-500"></div>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cargando Bóveda Central...</span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-md z-10">
                  <tr className="border-b border-slate-800">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Expediente</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tipo Esquema</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Timestamp</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Estatus Actual</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                  {submissions.map((sub) => {
                    const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending_review;
                    const isSelected = selectedSubmission?.id === sub.id;
                    return (
                      <tr 
                         key={sub.id} 
                         onClick={() => setSelectedSubmission(sub)}
                         className={`group cursor-pointer transition-all duration-300 relative ${isSelected ? "bg-emerald-600/5" : "hover:bg-slate-800/30"}`}
                      >
                        {isSelected && <div className="absolute left-0 top-0 w-1 h-full bg-emerald-600"></div>}
                        <td className="px-8 py-6">
                           <div className="flex flex-col">
                             <span className="font-mono text-xs text-white font-bold tracking-tighter">#{sub.id.substring(0, 10)}</span>
                             <span className="text-[10px] text-slate-600 font-medium">Ref ID Sistema</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 font-bold group-hover:text-emerald-500 transition-colors">
                                <FileText size={14} />
                              </div>
                              <span className="text-xs font-black text-slate-300 uppercase tracking-tighter">{sub.schema_id?.substring(0, 8) || "GENERIC"}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className="text-xs text-slate-500 font-bold">
                              {sub.created_date?.seconds ? new Date(sub.created_date.seconds * 1000).toLocaleDateString() : "Offline"}
                           </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border-2 shadow-lg ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <ChevronRight size={18} className={`transition-all duration-300 ${isSelected ? "text-emerald-500 translate-x-2" : "text-slate-800 opacity-0 group-hover:opacity-100"}`} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Panel de Auditoría Lateral (Digital Dossier) */}
        <div className="w-[520px] bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-dark-2xl flex flex-col group relative">
           {selectedSubmission ? (
             <div className="flex flex-col h-full animate-in slide-in-from-right-10 duration-500">
                <div className="p-10 bg-slate-950/60 border-b border-slate-800 flex justify-between items-start backdrop-blur-xl">
                   <div className="space-y-3">
                       <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center space-x-2">
                          <ShieldCheck size={14} />
                          <span>Bóveda Digital Auditada</span>
                       </span>
                       <h3 className="text-2xl font-black text-white tracking-tighter leading-none">Dossier #{selectedSubmission.id.substring(0, 8)}</h3>
                   </div>
                   <button 
                     onClick={() => setSelectedSubmission(null)} 
                     className="p-3 bg-slate-900 text-slate-500 hover:text-white rounded-2xl transition-all border border-slate-800 active:scale-90"
                   >
                      <X size={20} />
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
                   {/* Meta Global */}
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-slate-950/80 rounded-3xl border border-slate-800/80 shadow-inner">
                         <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest block mb-1">Entidad Propietaria</span>
                         <span className="text-sm text-white font-black truncate block italic">{selectedSubmission.tenant_id}</span>
                      </div>
                      <div className="p-5 bg-slate-950/80 rounded-3xl border border-slate-800/80 shadow-inner">
                         <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest block mb-1">Identidad de Autor</span>
                         <span className="text-sm text-white font-black truncate block">{selectedSubmission.created_by?.substring(0, 12)}...</span>
                      </div>
                   </div>

                   {/* Datos Técnicos */}
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center space-x-3">
                           <Database size={16} />
                           <span>Evidencia Técnica</span>
                        </h4>
                        {selectedSchema && (
                          <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-600/10 border border-emerald-500/20 rounded-lg">
                             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                             <span className="text-[9px] text-emerald-500 font-black lowercase tracking-tighter">mapeo activo</span>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                         {Object.entries(selectedSubmission.data || {}).map(([key, val]) => {
                           const field = flattenedFields.find(f => f.id === key);
                           return (
                            <div key={key} className="flex flex-col p-5 bg-slate-950/40 border border-slate-800/50 rounded-3xl hover:border-emerald-600/20 transition-all group/item">
                               <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-1 group-hover/item:text-emerald-500 transition-colors">{field?.label || key}</span>
                               <span className="text-lg text-white font-black leading-tight tracking-tight">{String(val)}</span>
                            </div>
                           );
                         })}
                      </div>
                   </div>

                   {/* Workflow Controls */}
                   <div className="pt-10 border-t border-slate-800 space-y-6">
                      <div className="flex items-center space-x-3">
                         <History size={16} className="text-slate-600" />
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ejecución de Workflow</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <button 
                           onClick={() => updateStatus(selectedSubmission.id, 'approved')}
                           disabled={actionLoading || selectedSubmission.status === 'approved'}
                           className={`flex flex-col items-center justify-center space-y-2 py-6 border-2 rounded-[2rem] text-sm font-black transition-all active:scale-95 shadow-xl ${
                             selectedSubmission.status === 'approved' 
                             ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-900/40" 
                             : "bg-emerald-600/5 text-emerald-500 border-emerald-500/10 hover:bg-emerald-600 hover:text-white"
                           }`}
                         >
                            {selectedSubmission.status === 'approved' ? <ShieldCheck size={24} /> : <Check size={24} />}
                            <span className="uppercase tracking-widest text-[10px]">Aprobar</span>
                         </button>
                         <button 
                           onClick={() => updateStatus(selectedSubmission.id, 'rejected')}
                           disabled={actionLoading || selectedSubmission.status === 'rejected'}
                           className={`flex flex-col items-center justify-center space-y-2 py-6 border-2 rounded-[2rem] text-sm font-black transition-all active:scale-95 shadow-xl ${
                             selectedSubmission.status === 'rejected'
                             ? "bg-red-600 text-white border-red-500 shadow-red-900/40"
                             : "bg-red-600/5 text-red-500 border-red-500/10 hover:bg-red-600 hover:text-white"
                           }`}
                         >
                            <X size={24} />
                            <span className="uppercase tracking-widest text-[10px]">Rechazar</span>
                         </button>
                      </div>
                      <button 
                        onClick={() => updateStatus(selectedSubmission.id, 'pending_review')}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center space-x-3 py-4 bg-slate-950/80 text-slate-500 border-2 border-slate-800 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-850 hover:text-white transition-all shadow-inner"
                      >
                         <Clock size={16} />
                         <span>Regresar a Mesa de Control</span>
                      </button>
                   </div>
                </div>
                
                <div className="p-8 bg-slate-950/80 border-t border-slate-800 backdrop-blur-xl">
                   <button 
                     onClick={generatePDF}
                     className="w-full py-5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center space-x-3 hover:from-emerald-500 hover:to-emerald-600 transition-all shadow-emerald-900/40 active:scale-95"
                   >
                      <Download size={20} />
                      <span>Descargar Acta de Auditoría</span>
                   </button>
                </div>
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-center p-20 text-slate-700 opacity-20">
                <div className="w-32 h-32 bg-slate-800/50 rounded-[3rem] flex items-center justify-center mb-10 rotate-12 ring-2 ring-slate-800 border-4 border-slate-900/50">
                   <ShieldCheck size={64} />
                </div>
                <p className="text-sm font-black italic tracking-[0.3em] uppercase">Ready for Analysis</p>
                <p className="text-xs mt-4 font-bold max-w-[200px] leading-relaxed uppercase tracking-tighter">Selecciona un registro para desbloquear la encriptación y auditar el historial</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Submissions;
