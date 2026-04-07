import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, Infinity as InfinityIcon, Eye, ExternalLink } from "lucide-react";

const BuilderHeader = ({ 
  formId,
  title, setTitle, 
  description, setDescription, 
  acceptsResponses, setAcceptsResponses, 
  isPublic, setIsPublic, 
  onSave, saveStatus 
}) => {
  return (
    <>
      {/* Header Fila 1 */}
      <div className="flex justify-between items-center px-8 py-4 border-b border-white/5 bg-slate-950/80 backdrop-blur shrink-0 relative z-50 shadow-2xl">
        <div className="flex items-center space-x-6">
          <Link to="/forms" className="p-3 text-slate-500 hover:text-white bg-slate-900 rounded-2xl border border-white/5 transition-all shadow-xl hover:scale-105 active:scale-95">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex flex-col justify-center">
             <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent text-xl font-black text-white focus:outline-none placeholder:text-slate-700 tracking-tighter w-96 uppercase italic transition-all focus:placeholder:opacity-0"
              placeholder="Nombre del formulario..."
            />
            <input 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              className="bg-transparent text-[11px] text-slate-600 font-bold focus:outline-none placeholder:text-slate-800 mt-1 w-[32rem] uppercase tracking-wider transition-all focus:placeholder:opacity-0"
              placeholder="Añade una descripción estratégica..."
            />
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {formId && (
            <a 
              href={`/public-form/${formId}`} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center space-x-3 text-slate-500 hover:text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-900 border border-transparent hover:border-white/5 active:scale-95 group"
            >
              <Eye size={16} className="text-slate-600 group-hover:text-emerald-500 transition-colors" />
              <span>Vista Previa</span>
              <ExternalLink size={12} className="opacity-30" />
            </a>
          )}
          
          <button 
            onClick={onSave}
            disabled={saveStatus === "saving"}
            className="flex items-center space-x-4 bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50 relative overflow-hidden group/save"
          >
            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover/save:translate-x-0 transition-transform duration-700"></div>
            <Save size={18} className={saveStatus === "saving" ? "animate-spin" : "relative z-10"} />
            <span className="relative z-10">{saveStatus === "saving" ? "Guardando..." : "Sincronizar"}</span>
          </button>
        </div>
      </div>

      <div className="flex items-center px-8 py-4 border-b border-white/5 bg-slate-950/20 backdrop-blur-3xl text-[9px] font-black uppercase tracking-[0.2em] gap-12 text-slate-500 shrink-0 select-none">
        <div className="flex items-center space-x-4 group">
          <InfinityIcon size={14} className="text-slate-700 group-hover:text-emerald-500 transition-colors" />
          <span className="group-hover:text-slate-300 transition-colors">Límite:</span>
          <span className="text-emerald-500/60 bg-emerald-500/5 px-3 py-1 rounded-lg border border-emerald-500/10 font-mono tracking-normal shadow-inner">ILIMITADO</span>
        </div>

        <div className="h-4 w-[1px] bg-white/5"></div>

        <div className="flex items-center space-x-5 cursor-pointer group" onClick={() => setAcceptsResponses(!acceptsResponses)}>
          <div 
            className={`w-12 h-6 rounded-full relative transition-all duration-500 ease-out ${acceptsResponses ? 'bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-slate-900 border border-white/10'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 shadow-xl ${acceptsResponses ? 'left-[26px]' : 'left-1'}`}></div>
          </div>
          <span className={`transition-all duration-500 ${acceptsResponses ? "text-emerald-500" : "group-hover:text-slate-300"}`}>Acepta Respuestas</span>
        </div>

        <div className="flex items-center space-x-5 cursor-pointer group" onClick={() => setIsPublic(!isPublic)}>
          <div 
            className={`w-12 h-6 rounded-full relative transition-all duration-500 ease-out ${isPublic ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'bg-slate-900 border border-white/10'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 shadow-xl ${isPublic ? 'left-[26px]' : 'left-1'}`}></div>
          </div>
          <span className={`transition-all duration-500 ${isPublic ? "text-blue-500" : "group-hover:text-slate-300"}`}>Acceso Público {isPublic ? "(LIVE)" : "(DRAFT)"}</span>
        </div>
      </div>
    </>
  );
};

export default BuilderHeader;
