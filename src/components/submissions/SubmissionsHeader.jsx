import React from "react";
import { Globe, RefreshCw, Trash2 } from "lucide-react";

const SubmissionsHeader = ({ 
  isOnline, 
  syncFeedback, 
  handleManualSync, 
  isSyncing, 
  queueCount, 
  clearQueue,
  selectedCount,
  onExport
}) => {
  const showExport = selectedCount > 0;

  return (
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
      
      <div className="flex items-center space-x-6">
        {showExport && (
          <div className="flex items-center bg-slate-950/80 border border-emerald-500/20 rounded-3xl p-1.5 pr-6 space-x-4 animate-in slide-in-from-right-10 duration-500 shadow-[0_10px_30px_rgba(16,185,129,0.05)]">
            <div className="bg-emerald-500 text-white px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-emerald-900/40">
              {selectedCount} {selectedCount === 1 ? 'Seleccionado' : 'Seleccionados'}
            </div>
            <div className="flex space-x-1.5">
              <button 
                onClick={() => onExport('excel')}
                className="px-4 py-2 bg-slate-900 text-emerald-400 hover:text-white border border-slate-800 hover:bg-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center space-x-2"
              >
                <span>Exportar XLS</span>
              </button>
              <button 
                onClick={() => onExport('pdf')}
                className="px-4 py-2 bg-slate-900 text-emerald-400 hover:text-white border border-slate-800 hover:bg-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center space-x-2"
              >
                <span>Reporte PDF</span>
              </button>
            </div>
          </div>
        )}

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
  );
};

export default SubmissionsHeader;
