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
    <div className="min-h-screen bg-slate-950 text-white animate-in fade-in duration-500">
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-full text-[10px] font-semibold uppercase tracking-wide">Compliance</span>
              <span className="text-xs text-slate-500">Trazabilidad</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Centro de <span className="text-purple-500">auditoría</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1 max-w-2xl">
              Registro de cambios críticos en la infraestructura.
            </p>
          </div>
          <button
            type="button"
            className="flex w-full lg:w-auto shrink-0 items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800/80 transition-colors"
          >
            <Download size={16} />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 -mr-32 -mt-32 bg-purple-500/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col gap-4 mb-6 sm:mb-8">
           <div className="relative group w-full max-w-lg">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-500 transition-colors pointer-events-none" />
               <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por acción, usuario o entidad..."
                className="w-full bg-slate-800 border border-slate-700 pl-9 pr-3 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500 transition-all placeholder:text-slate-500"
              />
           </div>

           <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin sm:flex-wrap sm:overflow-visible sm:pb-0">
             {[
               { id: 'all', label: 'Todo', icon: Activity },
               { id: 'create', label: 'Creación', icon: Database },
               { id: 'update', label: 'Cambios', icon: Filter },
               { id: 'delete', label: 'Eliminación', icon: AlertCircle },
             ].map(tab => (
               <button
                 type="button"
                 key={tab.id}
                 onClick={() => setFilterType(tab.id)}
                 className={`flex shrink-0 items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-semibold uppercase tracking-wide transition-all ${
                   filterType === tab.id 
                   ? 'bg-purple-600 text-white shadow-md' 
                   : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:text-slate-200'
                 }`}
               >
                 <tab.icon size={12} className="shrink-0" />
                 <span>{tab.label}</span>
               </button>
             ))}
           </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/40 -mx-0">
           <table className="w-full min-w-[720px] text-left text-sm border-collapse">
             <thead>
               <tr className="bg-slate-800/50 border-b border-slate-800">
                 <th className="py-3 sm:py-4 pl-3 sm:pl-5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider w-[35%]">Evento / acción</th>
                 <th className="py-3 sm:py-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider w-[22%] hidden sm:table-cell">Responsable</th>
                 <th className="py-3 sm:py-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider w-[25%]">Fecha</th>
                 <th className="py-3 sm:py-4 pr-3 sm:pr-5 text-right w-20"></th>
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
                    <tr key={log.id} className="hover:bg-slate-800/30 border-b border-slate-800/60 transition-colors group">
                      <td className="py-3 sm:py-4 pl-3 sm:pl-5 align-top">
                        <div className="flex items-start gap-2 sm:gap-4 min-w-0">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl flex items-center justify-center border shrink-0 ${getActionStyles(log.action)}`}>
                             <Activity size={14} className="sm:w-4 sm:h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${getActionStyles(log.action)}`}>
                              {log.action?.replace("_", " ")}
                            </span>
                            <p className="text-[10px] text-slate-500 sm:hidden mt-1">{log.performer_name || "Sistema"}</p>
                            <div className="flex items-center gap-2 mt-1.5 min-w-0">
                               <Globe size={10} className="text-slate-600 shrink-0" />
                               <p className="text-[11px] text-slate-400 font-medium truncate">
                                 {log.tenant_name || log.tenant_id || "Infraestructura"}
                               </p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 hidden sm:table-cell align-middle">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                             <UserIcon size={14} className="text-slate-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-200 truncate">{log.performer_name || "Sistema"}</p>
                            <p className="text-[9px] text-slate-600 font-mono uppercase truncate">{log.performer_id?.split("_")[0] || "ROOT"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 align-top sm:align-middle">
                        <div className="flex items-center gap-2">
                           <Calendar size={12} className="text-slate-600 shrink-0 hidden sm:block" />
                           <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 leading-tight">{formatDate(log.timestamp)}</p>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 pr-3 sm:pr-5 text-right align-middle">
                         <div className="flex justify-end gap-1 sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-opacity">
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
                    <td colSpan="4" className="py-20 sm:py-32 text-center px-4">
                       <div className="bg-slate-950 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl mx-auto flex items-center justify-center mb-4 sm:mb-6 border border-slate-800">
                         <AlertCircle size={32} className="text-slate-600 sm:w-10 sm:h-10" />
                       </div>
                       <h3 className="text-slate-500 font-semibold text-sm">Registro vacío</h3>
                       <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto">No hay eventos que coincidan con los filtros. Ajustá la búsqueda e intentá de nuevo.</p>
                    </td>
                  </tr>
                )}
             </tbody>
           </table>
        </div>
        
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 sm:py-4 px-3 sm:px-4 bg-slate-950/50 rounded-lg sm:rounded-xl border border-slate-800/80">
           <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 sm:items-center">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shrink-0" />
                 <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">Feed activo</span>
              </div>
              <div className="flex items-center gap-2">
                 <Database size={12} className="text-slate-600 shrink-0" />
                 <span className="text-[10px] text-slate-500 font-medium">Registro inmutable</span>
              </div>
           </div>
           <p className="text-[10px] text-slate-600">Protocolo v4.0.1</p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Auditoria;
