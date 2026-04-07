import React, { useState } from "react";
import { 
  Search, 
  Activity, 
  MoreVertical, 
  AlertCircle, 
  Filter, 
  Download, 
  Calendar,
  User as UserIcon,
  Globe,
  Database,
  ArrowRight,
  Info
} from "lucide-react";
import { useAuditLogs } from "../api/useAuditLogs";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const Auditoria = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const { data: auditLogs, isLoading } = useAuditLogs();

  const getActionCategory = (action = "") => {
    if (action.includes("create")) return "create";
    if (action.includes("update")) return "update";
    if (action.includes("delete") || action.includes("suspend")) return "delete";
    return "system";
  };

  const filteredLogs = auditLogs?.filter(l => {
    const matchesSearch = 
      l.action?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.performer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === "all") return matchesSearch;
    return matchesSearch && getActionCategory(l.action) === filterType;
  });

  const getActionStyles = (action = "") => {
    if (action.includes("create")) return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    if (action.includes("suspend") || action.includes("delete")) return "text-rose-400 bg-rose-400/10 border-rose-400/20";
    if (action.includes("update")) return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    return "text-cyan-400 bg-cyan-400/10 border-cyan-400/20";
  };

  const formatDate = (ts) => {
    if (!ts) return "---";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return format(date, "d MMM yyyy, HH:mm:ss", { locale: es });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
           <div className="flex items-center space-x-2 mb-2">
             <span className="px-2 py-0.5 bg-purple-500/10 text-purple-500 border border-purple-500/30 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Security Compliance</span>
             <span className="h-1 w-1 bg-slate-700 rounded-full"></span>
             <span className="text-xs font-bold text-slate-400">Trazabilidad Total</span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
             Centro de <span className="text-purple-500">Auditoría</span>
           </h1>
           <p className="text-slate-500 text-sm mt-3 font-medium italic max-w-xl leading-relaxed">
             Monitorea cada cambio crítico en la infraestructura. Este registro es inmutable y cumple con los estándares de seguridad institucional.
           </p>
        </div>
        
        <div className="flex items-center space-x-3">
           <button className="flex items-center space-x-2 px-5 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-800 hover:border-slate-700 transition-all active:scale-95 shadow-xl">
              <Download size={16} />
              <span>Exportar Logs (CSV)</span>
           </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-8 shadow-dark-3xl backdrop-blur-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 -mr-48 -mt-48 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        {/* Filters & Search */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-10 gap-6">
           <div className="relative group w-full lg:max-w-md">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-purple-500 transition-colors pointer-events-none" />
               <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por acción, usuario o entidad..."
                className="w-full bg-slate-950/80 border border-slate-800 pl-14 pr-6 py-4 rounded-[1.5rem] text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-medium text-white placeholder:text-slate-700 shadow-inner"
              />
           </div>

           <div className="flex bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800">
             {[
               { id: 'all', label: 'Todo', icon: Activity },
               { id: 'create', label: 'Creación', icon: Database },
               { id: 'update', label: 'Cambios', icon: Filter },
               { id: 'delete', label: 'Eliminación', icon: AlertCircle },
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setFilterType(tab.id)}
                 className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                   filterType === tab.id 
                   ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20 scale-105' 
                   : 'text-slate-500 hover:text-slate-300'
                 }`}
               >
                 <tab.icon size={12} />
                 <span>{tab.label}</span>
               </button>
             ))}
           </div>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto rounded-[2rem] border border-slate-800 bg-slate-950/30">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-slate-900/60 border-b border-slate-800">
                 <th className="py-6 pl-10 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] w-[35%]">Evento / Acción</th>
                 <th className="py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] w-[25%]">Responsable</th>
                 <th className="py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] w-[25%]">Marca Temporal</th>
                 <th className="py-6 pr-10 text-right w-[15%]"></th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-800/50">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="py-40 text-center">
                       <div className="inline-block h-12 w-12 animate-spin rounded-full border-[4px] border-solid border-purple-500 border-r-transparent mb-6"></div>
                       <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] animate-pulse">Sincronizando Ledger Digital...</p>
                    </td>
                  </tr>
                ) : filteredLogs?.length > 0 ? (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-5 pl-10">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-110 ${getActionStyles(log.action)} shadow-xl`}>
                             <Activity size={16} />
                          </div>
                          <div>
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border tracking-[0.1em] ${getActionStyles(log.action)}`}>
                              {log.action?.replace("_", " ")}
                            </span>
                            <div className="flex items-center space-x-2 mt-1.5 overflow-hidden">
                               <Globe size={10} className="text-slate-600 flex-shrink-0" />
                               <p className="text-[11px] text-slate-400 font-bold truncate max-w-[200px]">
                                 {log.tenant_name || log.tenant_id || "Infraestructura"}
                               </p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner group-hover:border-purple-500/30 transition-colors">
                             <UserIcon size={14} className="text-slate-500 group-hover:text-purple-400" />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-slate-200 tracking-tight">{log.performer_name || "Sistema"}</p>
                            <p className="text-[9px] text-slate-600 font-mono tracking-tighter uppercase">{log.performer_id?.split("_")[0] || "ROOT"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-5">
                        <div className="flex items-center space-x-2">
                           <Calendar size={12} className="text-slate-700" />
                           <p className="text-[11px] font-black text-slate-400 tracking-tighter">{formatDate(log.timestamp)}</p>
                        </div>
                      </td>
                      <td className="py-5 pr-10 text-right">
                         <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2.5 bg-slate-900 text-slate-500 hover:text-purple-400 hover:bg-slate-800 rounded-xl transition-all border border-slate-800 shadow-lg active:scale-90">
                               <Info size={16} />
                            </button>
                            <button className="p-2.5 bg-slate-900 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all border border-slate-800 shadow-lg active:scale-90">
                               <ArrowRight size={16} />
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-48 text-center px-10">
                       <div className="bg-slate-950 w-24 h-24 rounded-[2rem] mx-auto flex items-center justify-center mb-8 border border-white/5 shadow-2xl">
                         <AlertCircle size={40} className="text-slate-800" />
                       </div>
                       <h3 className="text-slate-500 font-black uppercase tracking-[0.3em] text-sm">Registro Vacío</h3>
                       <p className="text-xs text-slate-600 mt-3 font-medium italic max-w-sm mx-auto leading-relaxed"> No se han detectado eventos que coincidan con los criterios de búsqueda actuales. Ajuste sus filtros e intente nuevamente.</p>
                    </td>
                  </tr>
                )}
             </tbody>
           </table>
        </div>
        
        {/* Footer Info */}
        <div className="mt-8 flex items-center justify-between px-6 py-4 bg-slate-950/40 rounded-2xl border border-slate-800/50">
           <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Feed en Vivo Activado</span>
              </div>
              <div className="flex items-center space-x-3">
                 <Database size={10} className="text-slate-600" />
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Inmutabilidad Blockchain (Simulada)</span>
              </div>
           </div>
           <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest italic">Protocolo de Seguridad v4.0.1</p>
        </div>
      </div>
    </div>
  );
};

export default Auditoria;
