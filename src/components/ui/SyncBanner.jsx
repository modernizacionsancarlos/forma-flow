import React, { useState, useEffect } from "react";
import { RefreshCw, CloudOff, Cloud, CheckCircle, AlertCircle } from "lucide-react";
import { useSubmissions } from "../../api/useSubmissions";

const SyncBanner = () => {
  const { queueCount, isSyncing, syncQueue } = useSubmissions();
  const [lastSyncResult, setLastSyncResult] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleStatusChange);
    window.addEventListener("offline", handleStatusChange);
    return () => {
      window.removeEventListener("online", handleStatusChange);
      window.removeEventListener("offline", handleStatusChange);
    };
  }, []);

  const handleSync = async () => {
    if (!isOnline) return;
    const result = await syncQueue();
    if (result) {
      setLastSyncResult(result);
      setTimeout(() => setLastSyncResult(null), 5000);
    }
  };

  if (!isOnline) {
    return (
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-bottom duration-300">
        <div className="bg-red-500/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-red-400/30 shadow-2xl flex items-center space-x-4">
          <CloudOff size={20} className="text-white animate-pulse" />
          <div>
            <p className="text-sm font-black text-white uppercase tracking-tight">Sin Conexión</p>
            <p className="text-[10px] text-white/80 font-medium italic">Modo offline activado. Tus cambios se guardarán localmente.</p>
          </div>
        </div>
      </div>
    );
  }

  if (queueCount > 0 || isSyncing) {
    return (
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-bottom duration-300">
        <div className="bg-slate-900/95 backdrop-blur-md px-6 py-4 rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center space-x-6 min-w-[320px]">
          <div className="relative">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isSyncing ? "bg-emerald-600 animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.4)]" : "bg-slate-800"}`}>
               <RefreshCw size={24} className={`text-white ${isSyncing ? "animate-spin" : ""}`} />
            </div>
            {queueCount > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-black italic">
                {queueCount}
              </span>
            )}
          </div>
          
          <div className="flex-1">
             <p className="text-sm font-black text-white uppercase tracking-tighter">
               {isSyncing ? "Sincronizando Datos..." : "Pendiente de Sincronización"}
             </p>
             <p className="text-[10px] text-slate-500 font-medium italic">
               {isSyncing ? "Enviando registros al sistema central." : `${queueCount} items esperando conexión estable.`}
             </p>
          </div>

          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            Sincronizar
          </button>
        </div>
      </div>
    );
  }

  if (lastSyncResult) {
    return (
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-bottom duration-300">
        <div className="bg-emerald-600/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-emerald-400/30 shadow-2xl flex items-center space-x-4">
          <CheckCircle size={20} className="text-white" />
          <div>
             <p className="text-sm font-black text-white uppercase tracking-tight">Sincronización Completada</p>
             <p className="text-[10px] text-white/80 font-medium italic">Se han enviado {lastSyncResult.success} registros correctamente.</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SyncBanner;
