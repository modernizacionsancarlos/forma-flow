import React, { useState } from "react";
import { Search, Download, FileSpreadsheet, MoreVertical, X } from "lucide-react";

const Exportaciones = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mockExports = [
    { id: "EXP-892", name: "Reporte Q3 Ventas", format: "CSV", size: "2.4 MB", date: "Hace 2 horas" },
    { id: "EXP-891", name: "Auditoría de Sistemas", format: "XLSX", size: "15.1 MB", date: "Ayer" },
    { id: "EXP-890", name: "Usuarios Inactivos", format: "JSON", size: "845 KB", date: "12 Oct 2026" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Exportaciones</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Gestión de datos salientes y reportes</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 bg-orange-600 hover:bg-orange-700 text-white shadow-orange-500/20"
        >
          <Download size={18} className="group-hover:translate-y-1 transition-transform" />
          <span>Nueva Exportación</span>
        </button>
      </div>

      <div className="bg-slate-950/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
           <div className="relative group w-full max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-orange-500 transition-colors" />
               <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar reportes..."
                className="w-full bg-slate-950/80 border border-white/5 pl-12 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-all font-medium text-slate-200 placeholder:text-slate-700"
              />
           </div>
        </div>

        <div className="overflow-x-auto rounded-[1.5rem] border border-white/5 bg-slate-950/20">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-white/5 border-b border-white/5">
                 <th className="py-5 pl-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Archivo Generado</th>
                 <th className="py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Formato / Tamaño</th>
                 <th className="py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Fecha</th>
                 <th className="py-5 pr-8 text-right"></th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
                {mockExports.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-900/30 transition-colors group">
                    <td className="py-4 pl-8">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                          <FileSpreadsheet size={20} className="text-slate-400 group-hover:text-orange-500 transition-colors" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{exp.name}</p>
                          <p className="text-[10px] font-mono text-slate-600">{exp.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                       <div className="flex items-center space-x-2">
                         <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border tracking-tighter ${
                           exp.format === 'CSV' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
                           exp.format === 'JSON' ? 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' :
                           'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                         }`}>
                           {exp.format}
                         </span>
                         <span className="text-[10px] font-mono text-slate-500">{exp.size}</span>
                       </div>
                    </td>
                    <td className="py-4">
                      <span className="text-[11px] font-medium text-slate-400">{exp.date}</span>
                    </td>
                    <td className="py-4 pr-8 text-right">
                       <button className="p-2 text-slate-600 hover:text-orange-500 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <Download size={16} />
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
            <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-orange-500/5 blur-3xl rounded-full" />
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-2 flex items-center space-x-2">
               <Download className="text-orange-500" />
               <span>Generar Exportación</span>
            </h2>
            <p className="text-slate-500 text-sm mb-8 italic">Extrae datos del sistema en el formato necesario.</p>
            <button onClick={() => setIsModalOpen(false)} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exportaciones;
