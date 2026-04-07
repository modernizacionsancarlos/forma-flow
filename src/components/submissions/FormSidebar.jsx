import React from "react";
import { Layers, Inbox, FileText } from "lucide-react";

const FormSidebar = ({ forms, submissions, selectedFormId, onSelectForm }) => {
  return (
    <div className="w-80 bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col z-10">
       <div className="p-6 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center space-x-2">
             <Layers size={14} />
             <span>Agrupación</span>
          </span>
          <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-[9px] font-bold">{forms?.length || 0}</span>
       </div>
       <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          <button 
            onClick={() => onSelectForm(null)}
            className={`w-full flex items-center space-x-4 p-4 rounded-2xl border-2 transition-all text-left ${
              selectedFormId === null 
              ? "bg-emerald-600/10 border-emerald-500/30 text-emerald-500" 
              : "bg-slate-950/50 border-transparent hover:border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
             <div className="p-2 bg-slate-900 rounded-xl shadow-inner border border-white/5">
                <Inbox size={18} />
             </div>
             <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-xs font-black uppercase tracking-tight truncate">Inbox Global</span>
                <span className="text-[10px] opacity-70 font-medium">Todas las respuestas</span>
             </div>
             <span className="text-xs font-bold font-mono opacity-50">{submissions.length}</span>
          </button>
          
          <div className="pt-4 pb-2">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-4">Por Formulario</span>
          </div>

          {forms?.map(form => {
            const count = submissions.filter(s => s.schema_id === form.id).length;
            const isSelected = selectedFormId === form.id;
            
            return (
              <button 
                key={form.id}
                onClick={() => onSelectForm(form.id)}
                className={`w-full flex items-center space-x-4 p-4 rounded-2xl border-2 transition-all text-left group ${
                  isSelected 
                  ? "bg-slate-800/80 border-slate-600 text-white shadow-lg" 
                  : "bg-transparent border-transparent hover:bg-slate-950/50 hover:border-slate-800 text-slate-400 hover:text-slate-300"
                }`}
              >
                 <div className={`p-2 rounded-xl border shadow-inner transition-colors ${
                   isSelected ? "bg-slate-700 border-white/10 text-white" : "bg-slate-900 border-white/5 group-hover:bg-slate-800"
                 }`}>
                    <FileText size={18} />
                 </div>
                 <div className="flex flex-col flex-1 overflow-hidden">
                    <span className={`text-xs font-black uppercase tracking-tight truncate ${isSelected ? "text-white" : ""}`}>
                      {form.title || "Formulario Anónimo"}
                    </span>
                    <span className="text-[10px] opacity-70 font-medium truncate">{form.id.substring(0, 10)}...</span>
                 </div>
                 <span className="text-xs font-bold font-mono opacity-50">{count}</span>
              </button>
            )
          })}
       </div>
    </div>
  );
};

export default FormSidebar;
