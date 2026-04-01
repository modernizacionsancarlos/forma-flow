import React, { useState } from "react";
import { Search, Plus, MapPin, MoreVertical, X } from "lucide-react";

const Areas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mockAreas = [
    { id: "AR-1001", name: "Recursos Humanos", tenant: "Acme Corp", users: 12, status: "active" },
    { id: "AR-1002", name: "Operaciones", tenant: "Acme Corp", users: 45, status: "active" },
    { id: "AR-1003", name: "Ventas Globales", tenant: "GlobalTech", users: 8, status: "paused" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Áreas</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Gestión de departamentos y ubicaciones</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" />
          <span>Nueva Área</span>
        </button>
      </div>

      <div className="bg-slate-950/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
           <div className="relative group w-full max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-rose-500 transition-colors" />
               <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar áreas o departamentos..."
                className="w-full bg-slate-950/80 border border-white/5 pl-12 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-rose-500/50 transition-all font-medium text-slate-200 placeholder:text-slate-700"
              />
           </div>
           
           <div className="px-4 py-2 bg-slate-900 border border-white/5 rounded-xl whitespace-nowrap">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Total Áreas: </span>
             <span className="text-xs font-black text-white ml-1">{mockAreas.length}</span>
           </div>
        </div>

        <div className="overflow-x-auto rounded-[1.5rem] border border-white/5 bg-slate-950/20">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-white/5 border-b border-white/5">
                 <th className="py-5 pl-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Nombre del Área</th>
                 <th className="py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Empresa (Tenant)</th>
                 <th className="py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Usuarios Asignados</th>
                 <th className="py-5 pr-8 text-right"></th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
                {mockAreas.map(area => (
                  <tr key={area.id} className="hover:bg-slate-900/30 transition-colors group">
                    <td className="py-4 pl-8">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                          <MapPin size={20} className="text-slate-400 group-hover:text-rose-500 transition-colors" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{area.name}</p>
                          <p className="text-[10px] font-mono text-slate-600">{area.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-mono text-[10px] text-slate-400">
                      <span className="bg-slate-900 px-2 py-0.5 rounded border border-white/5">{area.tenant}</span>
                    </td>
                    <td className="py-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-slate-500/10 text-slate-400 border-slate-500/30">
                        {area.users} Miembros
                      </span>
                    </td>
                    <td className="py-4 pr-8 text-right">
                       <button className="p-2 text-slate-600 hover:text-rose-500 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <MoreVertical size={16} />
                       </button>
                    </td>
                  </tr>
                ))}
             </tbody>
           </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-rose-500/5 blur-3xl rounded-full" />
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-2 flex items-center space-x-2">
               <MapPin className="text-rose-500" />
               <span>Registrar Área</span>
            </h2>
            <p className="text-slate-500 text-sm mb-8 italic">Define un nuevo segmento organizacional.</p>
            <button onClick={() => setIsModalOpen(false)} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Areas;
