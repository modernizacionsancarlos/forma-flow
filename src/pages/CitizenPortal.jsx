import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Loader2,
  FileText,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Download,
  Info
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { jsPDF } from "jspdf";
import { toast } from "react-hot-toast";

const CitizenPortal = () => {
  const [searchParams] = useSearchParams();
  const [searchId, setSearchId] = useState(searchParams.get("id") || "");
  const [loading, setLoading] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [formInfo, setFormInfo] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = useCallback(async (e, idOverride) => {
    if (e) e.preventDefault();
    const idToSearch = idOverride || searchId;
    if (!idToSearch.trim()) return;

    setLoading(true);
    setError(null);
    setSubmission(null);
    setFormInfo(null);

    try {
      const docRef = doc(db, "Submissions", idToSearch.trim());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setSubmission({ id: docSnap.id, ...data });
        
        if (data.schema_id) {
          const formRef = doc(db, "Forms", data.schema_id);
          const formSnap = await getDoc(formRef);
          if (formSnap.exists()) {
            setFormInfo(formSnap.data());
          }
        }
      } else {
        setError("No se encontró ningún trámite con ese código de seguimiento.");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Ocurrió un error al buscar. Por favor intente más tarde.");
    } finally {
      setLoading(false);
    }
  }, [searchId]);

  // Auto-search if ID is in URL
  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
       handleSearch(null, id);
    }
  }, [searchParams, handleSearch]);

  const getStatusConfig = (status) => {
    switch (status) {
      case "approved":
        return { label: "Aprobado", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: CheckCircle2, step: 3, desc: "Trámite finalizado con éxito" };
      case "rejected":
        return { label: "Rechazado", color: "text-rose-500", bg: "bg-rose-500/10", icon: AlertCircle, step: 3, desc: "Trámite denegado / observación final" };
      case "request_info":
        return { label: "Información Requerida", color: "text-cyan-500", bg: "bg-cyan-500/10", icon: Info, step: 2, desc: "Acción requerida por el ciudadano" };
      case "archived":
        return { label: "Archivado", color: "text-slate-500", bg: "bg-slate-500/10", icon: ExternalLink, step: 3, desc: "Expediente guardado en archivo central" };
      case "pending_review":
      default:
        return { label: "Recibido - En Espera", color: "text-amber-500", bg: "bg-amber-500/10", icon: Clock, step: 1, desc: "Esperando validación inicial" };
    }
  };

  const downloadCertificate = () => {
    if (!submission || !formInfo) return;

    try {
      const doc = new jsPDF();
      const timestamp = submission.created_at?.toDate().toLocaleString() || new Date().toLocaleString();
      
      // Estilo Base
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("COMPROBANTE DE TRÁMITE", 20, 30);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text("Sistema de Modernización - FormaFlow Municipal", 20, 40);
      doc.text(`Fecha de Emisión: ${new Date().toLocaleString()}`, 20, 45);
      
      doc.setDrawColor(200);
      doc.line(20, 50, 190, 50);
      
      // Datos del Trámite
      doc.setTextColor(0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Detalles de la Gestión", 20, 65);
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Expediente ID: ${submission.id}`, 20, 75);
      doc.text(`Formulario: ${formInfo.title}`, 20, 82);
      doc.text(`Fecha de Presentación: ${timestamp}`, 20, 89);
      doc.text(`Estado Actual: ${getStatusConfig(submission.status).label}`, 20, 96);
      
      // Marca de Agua / Footer
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("Este documento es un comprobante de recepción electrónica y tiene carácter de declaración jurada.", 20, 280);
      
      doc.save(`Comprobante_${submission.id.substring(0, 8)}.pdf`);
      toast.success("Certificado descargado correctamente");
    } catch (err) {
      console.error("PDF Error:", err);
      toast.error("Error al generar el PDF");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-inter selection:bg-emerald-500/30 overflow-x-hidden relative">
      {/* Background Orbs */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-600/5 blur-[180px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
        <header className="mb-20 space-y-6 text-center">
           <div className="inline-flex items-center space-x-3 px-6 py-2.5 bg-slate-900/50 border border-white/5 rounded-full backdrop-blur-xl mb-4">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.3em]">Portal Público de Seguimiento</span>
           </div>
           <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none italic uppercase">
             Seguimiento de <span className="text-emerald-500">Trámites</span>
           </h1>
           <p className="text-slate-500 text-lg font-medium italic opacity-70 border-t border-white/5 pt-4 inline-block mt-4">Consulta el estado de tu gestión en tiempo real con tu código único.</p>
        </header>

        <div className="relative mb-20 animate-in fade-in slide-in-from-top-10 duration-700">
           <form onSubmit={(e) => handleSearch(e)} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center bg-slate-900/80 border border-white/10 p-2 rounded-[2.5rem] backdrop-blur-2xl">
                 <div className="pl-6 text-slate-500">
                    <Search size={24} />
                 </div>
                 <input 
                    type="text" 
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder="Ingrese su Código de Seguimiento (ej: 4e9f...)"
                    className="flex-1 bg-transparent border-none focus:ring-0 text-white font-bold px-6 py-4 placeholder:text-slate-700"
                 />
                 <button 
                    disabled={loading}
                    className="px-10 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 flex items-center space-x-3"
                 >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <span>Buscar Trámite</span>}
                 </button>
              </div>
           </form>
           {error && (
             <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center space-x-3 text-rose-500 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
             </div>
           )}
        </div>

        {submission && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
             <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 transition-opacity group-hover:opacity-10">
                   <FileText size={120} className="text-white" />
                </div>
                
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                   <div>
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-2 block">Identificación del Trámite</span>
                      <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">{formInfo?.title || "Formulario de Gestión"}</h2>
                      <p className="text-slate-500 text-[10px] font-bold mt-1 uppercase tracking-widest italic opacity-60">ID: {submission.id}</p>
                   </div>
                   <div className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center space-x-3 border ${getStatusConfig(submission.status).bg} ${getStatusConfig(submission.status).color} border-current/20 shadow-lg shadow-black/20`}>
                      {React.createElement(getStatusConfig(submission.status).icon, { size: 16 })}
                      <span>{getStatusConfig(submission.status).label}</span>
                   </div>
                </div>

                <div className="space-y-12">
                   <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 hidden md:block"></div>
                      <div 
                        className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 hidden md:block transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                        style={{ width: submission.status === 'pending_review' ? '25%' : submission.status === 'request_info' ? '60%' : '100%' }}
                      ></div>

                      {[
                        { label: "PRESENTACIÓN", status: "pending_review", step: 1 },
                        { label: "VALIDACIÓN", status: "request_info", step: 2 },
                        { label: "RESOLUCIÓN", status: "approved", step: 3 },
                      ].map((s) => {
                        const config = getStatusConfig(submission.status);
                        const isPast = config.step > s.step;
                        const isCurrent = config.step === s.step;
                        const isTerminal = s.step === 3 && (submission.status === 'approved' || submission.status === 'rejected' || submission.status === 'archived');
                        const isActive = isPast || isCurrent || isTerminal;

                        return (
                          <div key={s.step} className={`flex flex-row md:flex-col items-center gap-4 text-center relative z-10 bg-slate-900 border ${isActive ? 'border-emerald-500/30' : 'border-white/5'} rounded-3xl p-6 md:p-4 min-w-[200px] transition-all hover:scale-105`}>
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700 ${isActive ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                                {isTerminal ? <CheckCircle2 size={24} /> : (isActive ? <Clock size={24} /> : <div className="w-2 h-2 bg-slate-700 rounded-full" />)}
                             </div>
                             <div>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-600'}`}>{s.label}</p>
                                <p className="text-[9px] text-slate-500 font-bold italic opacity-60 mt-1 uppercase">
                                   {isCurrent ? config.desc : (isPast ? 'Completado' : 'Pendiente')}
                                </p>
                             </div>
                          </div>
                        )
                      })}
                   </div>
                </div>

                <div className="mt-16 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="flex items-center space-x-4">
                      <div className="p-3 bg-slate-950 rounded-xl text-slate-500 border border-white/5 font-black text-xs">
                         <div className="flex items-center space-x-2">
                           <Clock size={14} className="text-emerald-500" />
                           <span>Ubicación: SEDE CENTRAL</span>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center space-x-4">
                      <button 
                        onClick={downloadCertificate}
                        className="flex items-center space-x-3 text-emerald-500 hover:text-emerald-400 font-black uppercase tracking-widest text-[10px] cursor-pointer group/link bg-emerald-500/5 px-4 py-2 rounded-xl transition-all"
                      >
                         <Download size={14} />
                         <span>Descargar Certificado</span>
                      </button>
                   </div>
                </div>
             </div>

             <div className="flex flex-col md:flex-row items-center justify-center gap-8 pt-10">
                <button 
                  onClick={() => window.print()}
                  className="px-8 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center space-x-3"
                >
                   <FileText size={16} />
                   <span>Imprimir Resumen</span>
                </button>
                <div className="h-px w-20 bg-slate-900"></div>
                <button 
                  onClick={() => {
                     setSubmission(null);
                     setSearchId("");
                     window.history.replaceState({}, '', '/portal');
                  }}
                  className="px-8 py-4 text-slate-600 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest flex items-center space-x-3"
                >
                   <ArrowLeft size={16} />
                   <span>Nueva Búsqueda</span>
                </button>
             </div>
          </div>
        )}

        {!submission && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-32 animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-500">
             <div className="space-y-4 group">
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                   <Clock size={24} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest italic tracking-tighter">Tiempo Real</h3>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase opacity-70">Recibe actualizaciones instantáneas cada vez que un funcionario revise tu expediente.</p>
             </div>
             <div className="space-y-4 group">
                <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                   <ShieldCheck size={24} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest italic tracking-tighter">Seguridad SSL</h3>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase opacity-70">Tus datos están protegidos bajo protocolos de cifrado de grado bancario institucional.</p>
             </div>
             <div className="space-y-4 group">
                <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                   <Download size={24} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest italic tracking-tighter">Descarga PDF</h3>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase opacity-70">Genera comprobantes oficiales con validez institucional para tus trámites públicos.</p>
             </div>
          </div>
        )}

        <footer className="mt-48 pt-20 border-t border-white/5 opacity-30 text-center space-y-6">
           <div className="flex items-center justify-center space-x-4">
              <div className="w-10 h-10 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center font-black text-emerald-500 text-xl tracking-tighter">F</div>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white">FormaFlow Citizen Node</span>
           </div>
           <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest text-[9px]">
                SISTEMA OFICIAL DE MODERNIZACIÓN DEL ESTADO<br/>
                &copy; 2026 MUNICIPALIDAD DE SAN CARLOS. TODOS LOS DERECHOS RESERVADOS.
           </p>
        </footer>
      </div>
    </div>
  );
};

export default CitizenPortal;

