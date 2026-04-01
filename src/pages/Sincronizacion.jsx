import React, { useState } from "react";
import { Search, RefreshCw, AlertTriangle, ArrowUpCircle, CheckCircle2, Server } from "lucide-react";

const Sincronizacion = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const isSyncing = false;

  const mockSyncQueue = [
    { id: "SYNC-1299", entity: "Respuesta Formulario #44", status: "pending", time: "Hace 2 min" },
    { id: "SYNC-1298", entity: "Geolocalización Inspector", status: "error", time: "Hace 14 min" },
    { id: "SYNC-1297", entity: "Actualización de Área", status: "success", time: "Hace 1 hora" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Sincronización</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Monitor offline-first y cola de subida</p>
        </div>
        <button 
          className={`group flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
            isSyncing ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
          }`}
        >
          <RefreshCw size={18} className={isSyncing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
          <span>{isSyncing ? "Sincronizando..." : "Sincronizar Ahora"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-950/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-emerald-500/10 blur-3xl rounded-full" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
               <Server size={24} className="text-emerald-500" />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Estado Conexión</p>
            <h3 className="text-4xl font-black text-white tracking-tighter mb-2">Online</h3>
            <p className="text-emerald-500 text-xs font-medium flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span> Firebase Conectado</p>
          </div>
        </div>

        <div className="bg-slate-950/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-amber-500/10 blur-3xl rounded-full" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
               <ArrowUpCircle size={24} className="text-amber-500" />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">En Cola</p>
            <h3 className="text-4xl font-black text-white tracking-tighter mb-2">1<span className="text-lg text-slate-500 ml-2">Pendiente</span></h3>
            <p className="text-slate-500 text-xs font-medium">Esperando procesamiento</p>
          </div>
        </div>

        <div className="bg-slate-950/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-red-500/10 blur-3xl rounded-full" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
               <AlertTriangle size={24} className="text-red-500" />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Conflictos</p>
            <h3 className="text-4xl font-black text-white tracking-tighter mb-2">1<span className="text-lg text-slate-500 ml-2">Error</span></h3>
            <p className="text-red-400 text-xs font-medium">Requiere revisión manual</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-950/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
           <div className="relative group w-full max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
               <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar eventos de red..."
                className="w-full bg-slate-950/80 border border-white/5 pl-12 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium text-slate-200 placeholder:text-slate-700"
              />
           </div>
        </div>

        <div className="overflow-x-auto rounded-[1.5rem] border border-white/5 bg-slate-950/20">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-white/5 border-b border-white/5">
                 <th className="py-5 pl-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Paquete de Datos</th>
                 <th className="py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Estado</th>
                 <th className="py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Marca de Tiempo</th>
                 <th className="py-5 pr-8 text-right"></th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
                {mockSyncQueue.map(item => (
                  <tr key={item.id} className="hover:bg-slate-900/30 transition-colors group">
                    <td className="py-4 pl-8">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                           {item.status === 'success' ? <CheckCircle2 size={20} className="text-emerald-500" /> :
                            item.status === 'error' ? <AlertTriangle size={20} className="text-red-500" /> :
                            <RefreshCw size={20} className="text-amber-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{item.entity}</p>
                          <p className="text-[10px] font-mono text-slate-600">{item.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                       <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border tracking-tighter ${
                         item.status === 'success' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                         item.status === 'error' ? 'text-red-400 bg-red-400/10 border-red-400/20' :
                         'text-amber-400 bg-amber-400/10 border-amber-400/20'
                       }`}>
                         {item.status === 'pending' ? 'Pendiente' : item.status === 'error' ? 'Error' : 'Sincronizado'}
                       </span>
                    </td>
                    <td className="py-4">
                      <span className="text-[11px] font-medium text-slate-400">{item.time}</span>
                    </td>
                    <td className="py-4 pr-8 text-right">
                       <button className="p-2 text-slate-600 hover:text-emerald-500 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <MoreVertical size={16} />
                       </button>
                    </td>
                  </tr>
                ))}
             </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default Sincronizacion;
