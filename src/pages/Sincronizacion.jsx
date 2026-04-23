import React, { useState, useEffect } from "react";
import { Search, RefreshCw, AlertTriangle, ArrowUpCircle, CheckCircle2, Server, Trash2 } from "lucide-react";
import { useSubmissions } from "../api/useSubmissions";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const Sincronizacion = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const { 
    syncQueue, 
    clearQueue, 
    removeFromQueue,
    isSyncing, 
    queueCount, 
    offlineQueue 
  } = useSubmissions();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleManualSync = async () => {
    if (!isOnline) {
       alert("No tienes conexión a internet.");
       return;
    }
    await syncQueue();
  };

  const filteredQueue = offlineQueue.filter(item => 
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.schema_id && item.schema_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white animate-in fade-in duration-500">
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-white">Sincronización</h1>
            <p className="text-slate-500 text-sm mt-0.5">Monitor offline-first y cola de subida</p>
          </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
          {queueCount > 0 && (
            <button 
              type="button"
              onClick={clearQueue}
              className="flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors bg-slate-800 border border-slate-700 text-slate-200 hover:bg-red-950/40 hover:text-red-400 hover:border-red-900/50"
            >
              <Trash2 size={18} />
              <span>Limpiar cola</span>
            </button>
          )}
          
          <button 
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing || queueCount === 0 || !isOnline}
            className={`group flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              (isSyncing || queueCount === 0 || !isOnline) 
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700" 
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
            }`}
          >
            <RefreshCw size={18} className={isSyncing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
            <span>{isSyncing ? "Sincronizando…" : "Sincronizar ahora"}</span>
          </button>
        </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 blur-3xl rounded-full ${isOnline ? 'bg-emerald-500/10' : 'bg-red-500/10'}`} />
          <div className="relative z-10">
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-6 ${isOnline ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
               <Server size={24} className={isOnline ? "text-emerald-500" : "text-red-500"} />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Estado Conexión</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">{isOnline ? "Online" : "Offline"}</h3>
            <p className={`${isOnline ? 'text-emerald-500' : 'text-red-500'} text-xs font-medium flex items-center`}>
               <span className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span> 
               {isOnline ? "Firebase Conectado" : "Esperando Red"}
            </p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-amber-500/10 blur-3xl rounded-full" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
               <ArrowUpCircle size={24} className="text-amber-500" />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">En Cola</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">{queueCount}<span className="text-base sm:text-lg text-slate-500 ml-2">pendientes</span></h3>
            <p className="text-slate-500 text-xs font-medium">Esperando procesamiento</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-red-500/10 blur-3xl rounded-full" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
               <AlertTriangle size={24} className="text-red-500" />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Conflictos</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">0<span className="text-base sm:text-lg text-slate-500 ml-2">errores</span></h3>
            <p className="text-slate-500 text-xs font-medium">Sistema operando normalmente</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
        <div className="mb-4 sm:mb-6">
           <div className="relative group w-full max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors pointer-events-none" />
               <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar cola local..."
                className="w-full bg-slate-800 border border-slate-700 pl-9 pr-3 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 transition-all placeholder:text-slate-500"
              />
           </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/30">
           <table className="w-full min-w-[560px] text-sm text-left border-collapse">
             <thead>
               <tr className="bg-slate-800/50 border-b border-slate-800">
                 <th className="py-3 sm:py-4 pl-3 sm:pl-5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Referencia</th>
                 <th className="py-3 sm:py-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Estado</th>
                 <th className="py-3 sm:py-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Registrado</th>
                 <th className="py-3 sm:py-4 pr-3 sm:pr-5 text-right w-24"></th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
                {filteredQueue.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-slate-500">
                      <CheckCircle2 size={32} className="mx-auto mb-4 text-emerald-500 opacity-50" />
                      <p className="font-medium text-base">La cola está vacía</p>
                      <p className="text-sm mt-1">Todos los datos están sincronizados con la nube.</p>
                    </td>
                  </tr>
                ) : (
                  filteredQueue.map(item => (
                    <tr key={item.id} className="hover:bg-slate-800/40 border-b border-slate-800/50 transition-colors group">
                      <td className="py-3 sm:py-4 pl-3 sm:pl-5 align-top">
                        <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 shrink-0">
                             <RefreshCw size={18} className="text-amber-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">Subida {item.schema_id || "Desconocida"}</p>
                            <span className="inline-block sm:hidden mt-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase text-amber-400 bg-amber-400/10 border border-amber-400/20">Pendiente</span>
                            <p className="text-[10px] font-mono text-slate-600 truncate max-w-[220px] mt-0.5 sm:mt-0">{item.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 hidden sm:table-cell align-middle">
                         <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase border text-amber-400 bg-amber-400/10 border-amber-400/20">
                           Pendiente
                         </span>
                      </td>
                      <td className="py-3 sm:py-4 align-middle">
                        <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">
                           {item.created_date ? formatDistanceToNow(item.created_date, { locale: es, addSuffix: true }) : "Desconocido"}
                        </span>
                      </td>
                       <td className="py-3 sm:py-4 pr-3 sm:pr-5 text-right align-middle">
                          <div className="flex justify-end gap-1 sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-opacity">
                             <button 
                               onClick={() => handleManualSync()}
                               disabled={isSyncing || !isOnline}
                               className={`p-2 rounded-lg transition-colors text-emerald-500 hover:bg-emerald-500/10 ${isSyncing ? "opacity-50" : ""}`}
                               title="Reintentar Sincronización"
                             >
                                <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
                             </button>
                             <button 
                               onClick={() => removeFromQueue(item.id)}
                               className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                               title="Remover de la cola"
                             >
                                 <Trash2 size={16} />
                             </button>
                          </div>
                      </td>
                    </tr>
                  ))
                )}
             </tbody>
           </table>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Sincronizacion;
