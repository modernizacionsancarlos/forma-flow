import React, { useState } from "react";
import { Search, Folder, Plus, ChevronDown, FileText, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useForms } from "../api/useForms";

const FormsList = () => {
  const { data: forms, isLoading } = useForms();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredForms = forms?.filter(f => 
    f.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter w-fit flex flex-col">
             <span className="bg-gradient-to-r from-emerald-400 to-teal-600 bg-clip-text text-transparent">Modelos de Formularios</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium italic">Gestión de plantillas publicadas y borradores</p>
        </div>
        <Link 
          to="/forms/new" 
          className="flex items-center space-x-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all bg-emerald-600 hover:bg-emerald-700 shadow-glow-emerald text-white active:scale-95"
        >
           <Plus size={18} />
           <span>Crear Nuevo</span>
        </Link>
      </div>

      <div className="flex-1 bg-slate-950/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] -mr-[250px] -mt-[250px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 relative z-10">
           <div className="relative group w-full max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
               <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título..."
                className="w-full bg-slate-950/80 border border-white/5 pl-12 pr-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium text-slate-200 placeholder:text-slate-700"
              />
           </div>
           
           <div className="flex space-x-3">
             <button className="flex items-center space-x-2 bg-slate-900 border border-white/5 hover:border-emerald-500/30 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-400 transition-all uppercase tracking-widest">
               <span>Todos</span>
               <ChevronDown size={14} className="text-slate-500" />
             </button>
           </div>
        </div>

        {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
               <div className="inline-block h-10 w-10 animate-spin rounded-full border-[3px] border-solid border-emerald-500 border-r-transparent align-[-0.125em]" role="status"></div>
               <p className="mt-6 text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">Cargando repositorios...</p>
            </div>
        ) : filteredForms?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {filteredForms.map(form => (
                 <div key={form.id} className="bg-slate-900 border border-white/5 hover:border-emerald-500/30 rounded-3xl p-6 transition-all duration-300 group hover:-translate-y-1 shadow-lg hover:shadow-emerald-500/10 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                       <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-colors">
                          <FileText size={24} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                       </div>
                       <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border tracking-tighter ${
                         form.status === 'published' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                       }`}>
                          {form.status === 'published' ? 'Público' : 'Borrador'}
                       </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{form.title || 'Formulario sin título'}</h3>
                    <p className="text-xs text-slate-500 font-mono mb-6 line-clamp-1 flex-1">{form.description || 'Sin descripción detallada.'}</p>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                       <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                          {form.sections?.reduce((acc, s) => acc + (s.fields?.length || 0), 0) || form.fields?.length || 0} Campos
                       </p>
                       <Link to={`/forms/new?id=${form.id}`} className="text-slate-400 hover:text-emerald-500 transition-colors">
                          <ArrowRight size={18} />
                       </Link>
                    </div>
                 </div>
              ))}
            </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center relative z-10">
            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 border border-white/5 shadow-inner">
              <Folder size={32} className="text-slate-600" />
            </div>
            <h3 className="text-slate-300 font-bold uppercase tracking-widest text-sm mb-2">Directorio Vacío</h3>
            <p className="text-[10px] text-slate-600 font-medium italic">Comienza creando un nuevo modelo de formulario.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormsList;
