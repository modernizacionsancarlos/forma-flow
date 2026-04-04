import React from "react";
import { Search, Filter, Database, ChevronRight, Inbox } from "lucide-react";

const STATUS_CONFIG = {
  pending_sync: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Pendiente Sinc" },
  pending_review: { color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", label: "En Revisión" },
  approved: { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Aprobado" },
  rejected: { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", label: "Rechazado" },
};

const SubmissionList = ({ 
  loading, 
  searchQuery, 
  onSearchChange, 
  filteredSubmissions, 
  selectedSubmission, 
  onSelectSubmission,
  selectedIds = [], // Added prop
  onToggleSelect,    // Added prop
  onSelectAll        // Added prop
}) => {
  const isAllSelected = filteredSubmissions.length > 0 && selectedIds.length === filteredSubmissions.length;

  return (
    <div className="flex-1 bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col z-10 transition-all duration-300">
      <div className="p-6 bg-slate-950/40 border-b border-slate-800 flex items-center space-x-4">
         <div className="flex items-center space-x-4 shrink-0">
            <button 
              onClick={onSelectAll}
              className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${
                isAllSelected ? "bg-emerald-600 border-emerald-500 text-white" : "bg-slate-950 border-slate-800 text-slate-700 hover:border-slate-700"
              }`}
              title={isAllSelected ? "Deseleccionar todo" : "Seleccionar todo"}
            >
               <Database size={16} className={isAllSelected ? "animate-pulse" : ""} />
            </button>
         </div>
         <div className="relative flex-1">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
            <input 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar registros..." 
              className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-2xl pl-14 pr-6 py-4 text-sm font-medium focus:outline-none focus:border-emerald-600/50 transition-all text-white placeholder:text-slate-700 font-mono" 
            />
         </div>
         <button className="p-4 bg-slate-950 text-slate-400 hover:text-white border-2 border-slate-800 rounded-2xl transition-all shadow-inner">
            <Filter size={18} />
         </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
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
          <div className="space-y-3">
             {filteredSubmissions.map((sub, idx) => {
                const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending_review;
                const isSelected = selectedSubmission?.id === sub.id;
                const isChecked = selectedIds.includes(sub.id);
                const date = sub.created_date?.seconds ? new Date(sub.created_date.seconds * 1000).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : "Offline";
                
                return (
                  <div 
                     key={sub.id} 
                     className={`group transition-all rounded-3xl border-2 flex items-center ${
                       isSelected 
                       ? "bg-emerald-600/10 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.05)]" 
                       : "bg-slate-950/50 border-transparent hover:border-slate-800 hover:bg-slate-800/40"
                     }`}
                  >
                     <div 
                        onClick={() => onToggleSelect(sub.id)}
                        className={`p-5 self-stretch flex items-center justify-center border-r transition-all cursor-pointer ${isChecked ? "bg-emerald-500/10 border-emerald-500/20" : "border-transparent"}`}
                     >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          isChecked ? "bg-emerald-500 border-emerald-400 text-white" : "border-slate-800 group-hover:border-slate-600"
                        }`}>
                           {isChecked && <Check size={12} strokeWidth={4} />}
                        </div>
                     </div>
                     
                     <div 
                        onClick={() => onSelectSubmission(sub)}
                        className="flex-1 p-5 flex items-center justify-between cursor-pointer"
                     >
                        <div className="flex items-center space-x-5">
                           <div className={`p-3 rounded-xl flex items-center justify-center border transition-all ${
                             isSelected ? "bg-emerald-500 border-emerald-400 shadow-lg text-white" : "bg-slate-900 border-slate-800 text-slate-500 group-hover:text-emerald-500 font-black"
                           }`}>
                              <span className="text-[10px] uppercase font-black">{idx + 1}</span>
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
                              <span className="text-[10px] text-slate-500 font-medium tracking-tight">
                                {date} • {sub.created_by?.substring(0,6) || "Público"}
                              </span>
                           </div>
                        </div>
                        <ChevronRight size={18} className={`transition-all duration-300 ${isSelected ? "text-emerald-500 translate-x-1" : "text-slate-700 opacity-50 group-hover:opacity-100 group-hover:text-white"}`} />
                     </div>
                  </div>
                );
             })}
          </div>
        )}
      </div>
    </div>
  );
};


export default SubmissionList;
