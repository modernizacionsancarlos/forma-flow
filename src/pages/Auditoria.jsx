import React, { useState } from "react";
import { Search, Activity, MoreVertical, AlertCircle } from "lucide-react";
import { useAuditLogs } from "../api/useAuditLogs";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const Auditoria = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: auditLogs, isLoading } = useAuditLogs();

  const filteredLogs = auditLogs?.filter(l => 
    l.action?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.performer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action) => {
    if (action.includes("create")) return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    if (action.includes("suspend") || action.includes("delete")) return "text-red-400 bg-red-400/10 border-red-400/20";
    if (action.includes("update")) return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    return "text-blue-400 bg-blue-400/10 border-blue-400/20";
  };

  const formatDate = (ts) => {
    if (!ts) return "---";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return format(date, "d MMM, HH:mm", { locale: es });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Registro de Auditoría</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Trazabilidad de cambios y acciones del sistema</p>
        </div>
        <div className="px-6 py-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center space-x-2">
           <Activity size={18} className="text-purple-500 animate-pulse" />
           <span className="text-xs font-black text-purple-500 uppercase tracking-widest">Activo</span>
        </div>
      </div>

      <div className="bg-slate-950/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
           <div className="relative group w-full max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-purple-500 transition-colors" />
               <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar en logs por acción o usuario..."
                className="w-full bg-slate-950/80 border border-white/5 pl-12 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all font-medium text-slate-200 placeholder:text-slate-700"
              />
           </div>
           
           <div className="px-4 py-2 bg-slate-900 border border-white/5 rounded-xl whitespace-nowrap">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Eventos: </span>
             <span className="text-xs font-black text-white ml-1">{filteredLogs?.length || 0}</span>
           </div>
        </div>

        <div className="overflow-x-auto rounded-[1.5rem] border border-white/5 bg-slate-950/20">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-white/5 border-b border-white/5">
                 <th className="py-5 pl-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Acción Registrada</th>
                 <th className="py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Responsable</th>
                 <th className="py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Marca de Tiempo</th>
                 <th className="py-5 pr-8 text-right"></th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="py-24 text-center">
                       <div className="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-solid border-purple-500 border-r-transparent align-[-0.125em]" role="status"></div>
                       <p className="mt-4 text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">Analizando Registros...</p>
                    </td>
                  </tr>
                ) : filteredLogs?.length > 0 ? (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-900/30 transition-colors group">
                      <td className="py-4 pl-8">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                             <AlertCircle size={14} className="text-slate-500 group-hover:text-purple-400 transition-colors" />
                          </div>
                          <div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border tracking-tighter ${getActionColor(log.action)}`}>
                              {log.action?.replace("_", " ")}
                            </span>
                            <p className="text-[10px] text-slate-400 font-medium mt-1">
                              {log.tenant_name || log.tenant_id || log.user_email || "Recurso Sistema"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                             <span className="text-[8px] font-bold text-slate-300">{log.performer_name?.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold text-slate-300">{log.performer_name}</p>
                            <p className="text-[9px] text-slate-600 font-mono tracking-tighter">{log.performer_id?.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <p className="text-[11px] font-medium text-slate-400">{formatDate(log.timestamp)}</p>
                      </td>
                      <td className="py-4 pr-8 text-right">
                         <button className="p-2 text-slate-700 hover:text-purple-500 hover:bg-purple-500/10 rounded-lg transition-colors">
                            <MoreVertical size={14} />
                         </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-32 text-center">
                       <div className="bg-slate-900 w-16 h-16 rounded-3xl mx-auto flex items-center justify-center mb-6 border border-white/5">
                         <Activity size={32} className="text-slate-800" />
                       </div>
                       <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Sin Eventos</p>
                       <p className="text-[10px] text-slate-600 mt-2 font-medium italic">No se encontraron logs de auditoría.</p>
                    </td>
                  </tr>
                )}
             </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default Auditoria;
