import React from "react";
import { Settings, ChevronDown, ShieldCheck, Eye, Zap, Trash2, PlusCircle } from "lucide-react";

const PropertyPanel = ({ activeField, allFields, onClose, onUpdate }) => {
  if (!activeField) {
    return (
      <div className="w-80 border-l border-white/5 bg-slate-950 flex flex-col items-center justify-center p-12 text-center bg-slate-950/20 backdrop-blur-3xl shadow-[-20px_0_40px_rgba(0,0,0,0.5)]">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-white/5 flex items-center justify-center mb-6 shadow-2xl group transition-all hover:scale-110">
          <Settings size={28} className="text-slate-800 opacity-50 group-hover:text-slate-400" />
        </div>
        <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-2">Panel de Edición</h4>
        <p className="text-[10px] font-bold text-slate-700 leading-relaxed max-w-[160px]">Selecciona un elemento en el lienzo para configurar su comportamiento.</p>
      </div>
    );
  }

  const otherFields = allFields.filter(f => f.id !== activeField.id);

  const addLogicRule = () => {
    const newLogic = [...(activeField.logic || []), { 
      id: crypto.randomUUID(),
      fieldId: "", 
      operator: "==", 
      value: "" 
    }];
    onUpdate({ logic: newLogic });
  };

  const updateLogicRule = (ruleId, updates) => {
    const newLogic = activeField.logic.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    );
    onUpdate({ logic: newLogic });
  };

  const removeLogicRule = (ruleId) => {
    const newLogic = activeField.logic.filter(rule => rule.id !== ruleId);
    onUpdate({ logic: newLogic });
  };

  return (
    <div className="w-80 border-l border-white/5 bg-slate-950 flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.8)] relative z-20">
      <div className="px-8 py-7 border-b border-white/5 bg-slate-950/80 flex justify-between items-center backdrop-blur-md shrink-0">
         <div className="flex items-center space-x-3">
           <ShieldCheck size={16} className="text-emerald-500" />
           <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Configuración</h3>
         </div>
         <button onClick={onClose} className="text-slate-600 hover:text-white transition-all bg-slate-900 border border-white/5 rounded-full p-2 active:scale-90 hover:shadow-lg">
           <ChevronDown size={14} className="rotate-[-90deg]" />
         </button>
      </div>

      <div className="p-8 flex-1 overflow-y-auto space-y-10 custom-scrollbar pb-32">
        
        {/* ID - Read Only Premium */}
        <div className="space-y-3">
          <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.15em] flex items-center space-x-2">
            <span>Identificador Técnico</span>
            <span className="h-0.5 w-6 bg-slate-800/40 rounded-full"></span>
          </label>
          <div className="px-5 py-4 bg-slate-950 border border-slate-900 rounded-2xl font-mono text-[10px] text-emerald-500/60 shadow-inner group transition-colors hover:border-emerald-500/20">
            {activeField.id}
            <p className="text-[8px] text-slate-700 mt-2 font-sans font-bold uppercase tracking-widest opacity-60">Clave única de BDD</p>
          </div>
        </div>

        {/* Etiqueta */}
        <div className="space-y-3">
          <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Etiqueta Visual (Label)</label>
          <input 
            type="text" 
            value={activeField.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="w-full bg-slate-900/50 border-2 border-slate-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-black text-white shadow-xl placeholder:text-slate-800"
            placeholder="Título del campo..."
          />
        </div>

        {/* Placeholder - Only for text inputs */}
        {(activeField.type === "text" || activeField.type === "number" || activeField.type === "textarea") && (
          <div className="space-y-3">
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Placeholder</label>
            <input 
              type="text" 
              value={activeField.placeholder || ""}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              className="w-full bg-slate-900/30 border border-slate-800 rounded-xl px-5 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all font-medium text-slate-300"
              placeholder="Ej: Escriba aquí..."
            />
          </div>
        )}

        {/* Toggles */}
        <div className="space-y-6 pt-2 border-t border-white/5">
           <div className="flex items-center justify-between group cursor-pointer" onClick={() => onUpdate({ required: !activeField.required })}>
             <div className="flex flex-col">
               <span className="text-[11px] font-black text-slate-300 uppercase tracking-tight group-hover:text-white transition-colors">Campo Obligatorio</span>
               <span className="text-[9px] text-slate-600 font-bold opacity-60">Impide el envío si está vacío</span>
             </div>
             <div 
                className={`w-11 h-6 rounded-full relative transition-all duration-300 ${activeField.required ? 'bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.35)]' : 'bg-slate-900 border border-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-xl ${activeField.required ? 'left-[24px]' : 'left-1'}`}></div>
              </div>
           </div>
        </div>

        {/* Conditional Logic Section */}
        <div className="pt-8 border-t border-white/5 space-y-6">
           <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center space-x-2">
                 <Zap size={14} className="fill-emerald-500/10" />
                 <span>Lógica de Visibilidad</span>
              </h4>
              <button 
                onClick={addLogicRule}
                className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all active:scale-90"
              >
                <PlusCircle size={16} />
              </button>
           </div>
           
           <p className="text-[9px] text-slate-500 font-bold opacity-70">Define cuándo debe mostrarse este campo basándote en otros valores.</p>

           <div className="space-y-4">
              {activeField.logic && activeField.logic.length > 0 ? (
                activeField.logic.map((rule) => (
                  <div key={rule.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 relative group/rule">
                    <button 
                      onClick={() => removeLogicRule(rule.id)}
                      className="absolute top-3 right-3 text-slate-700 hover:text-red-500 transition-colors opacity-0 group-hover/rule:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>

                    <div className="space-y-2">
                      <label className="text-[8px] font-black text-slate-600 uppercase">Si el campo...</label>
                      <select 
                        value={rule.fieldId}
                        onChange={(e) => updateLogicRule(rule.id, { fieldId: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[10px] text-slate-300 focus:outline-none focus:border-emerald-500/50"
                      >
                        <option value="">Seleccionar campo...</option>
                        {otherFields.map(f => (
                          <option key={f.id} value={f.id}>{f.label || f.id}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                       <div className="space-y-2">
                        <label className="text-[8px] font-black text-slate-600 uppercase">Es...</label>
                        <select 
                          value={rule.operator}
                          onChange={(e) => updateLogicRule(rule.id, { operator: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[10px] text-slate-300 focus:outline-none focus:border-emerald-500/50 uppercase font-black"
                        >
                          <option value="==">Igual a</option>
                          <option value="!=">Diferente a</option>
                          <option value="contains">Contiene</option>
                          <option value="greater">Mayor que</option>
                          <option value="less">Menor que</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] font-black text-slate-600 uppercase">Valor</label>
                        <input 
                          type="text" 
                          value={rule.value}
                          onChange={(e) => updateLogicRule(rule.id, { value: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[10px] text-white focus:outline-none focus:border-emerald-500/50"
                          placeholder="Valor..."
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 bg-slate-900/50 border border-slate-800 border-dashed rounded-[2rem] flex flex-col items-center justify-center opacity-40">
                   <Eye size={20} className="text-slate-700 mb-2" />
                   <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Sin reglas activas</span>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPanel;
