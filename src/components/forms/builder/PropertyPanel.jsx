import React, { useState } from "react";
import { Settings, ChevronDown, ShieldCheck, Eye, Zap, Trash2, PlusCircle, Layout, ShieldAlert } from "lucide-react";

const PropertyPanel = ({ activeField, allFields, submissionRules = [], setSubmissionRules, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState("general");
  const [globalTab, setGlobalTab] = useState("settings");

  const addSubmissionRule = () => {
    const newRule = {
      id: crypto.randomUUID(),
      fieldId: "",
      operator: "==",
      value: "",
      action: { type: "setStatus", value: "Pendiente" }
    };
    setSubmissionRules([...submissionRules, newRule]);
  };

  const updateSubmissionRule = (id, updates) => {
    setSubmissionRules(submissionRules.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const removeSubmissionRule = (id) => {
    setSubmissionRules(submissionRules.filter(r => r.id !== id));
  };

  if (!activeField) {
    return (
      <div className="w-80 border-l border-white/5 bg-slate-950 flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.8)] relative z-20 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-7 border-b border-white/5 bg-slate-950/80 flex justify-between items-center backdrop-blur-md shrink-0">
          <div className="flex items-center space-x-3">
            <Settings size={16} className="text-slate-500" />
            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Ajustes Globales</h3>
          </div>
        </div>

        {/* Global Tabs Navigation */}
        <div className="flex border-b border-white/5 bg-slate-950/40">
          <button 
            onClick={() => setGlobalTab("settings")} 
            className={`flex-1 py-4 text-[9px] font-black uppercase tracking-widest transition-all relative flex items-center justify-center space-x-2 ${globalTab === "settings" ? 'text-emerald-500 bg-emerald-500/5' : 'text-slate-600 hover:text-slate-400'}`}
          >
            <Layout size={12} />
            <span>Config</span>
            {globalTab === "settings" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
          </button>
          <button 
            onClick={() => setGlobalTab("automation")} 
            className={`flex-1 py-4 text-[9px] font-black uppercase tracking-widest transition-all relative flex items-center justify-center space-x-2 ${globalTab === "automation" ? 'text-amber-500 bg-amber-500/5' : 'text-slate-600 hover:text-slate-400'}`}
          >
            <Zap size={12} />
            <span>Automatización</span>
            {globalTab === "automation" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>}
          </button>
        </div>

        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar pb-32">
          {globalTab === "settings" && (
            <div className="space-y-8 animate-in fade-in duration-300">
               <div className="py-20 text-center opacity-30">
                  <Layout size={40} className="mx-auto mb-4 text-slate-700" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">Ajustes del Formulario</p>
                  <p className="text-[8px] mt-2 font-bold max-w-[150px] mx-auto leading-relaxed">Usa la barra superior del constructor para cambiar los metadatos básicos.</p>
               </div>
            </div>
          )}

          {globalTab === "automation" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center space-x-2">
                   <Zap size={14} />
                   <span>Reglas de Envío</span>
                </h4>
                <p className="text-[9px] text-slate-500 font-bold opacity-70">Define estados automáticos basados en los datos del formulario.</p>
              </div>

              <div className="space-y-4">
                {submissionRules.length > 0 ? submissionRules.map((rule) => (
                  <div key={rule.id} className="p-5 bg-slate-900/50 border border-slate-800 rounded-[2rem] space-y-4 relative group hover:border-amber-500/20 transition-all">
                    <button 
                      onClick={() => removeSubmissionRule(rule.id)}
                      className="absolute -top-2 -right-2 p-2 bg-slate-950 border border-slate-800 text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                    >
                      <Trash2 size={10} />
                    </button>

                    <div className="space-y-3">
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Si el campo...</label>
                      <select 
                        value={rule.fieldId}
                        onChange={(e) => updateSubmissionRule(rule.id, { fieldId: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[10px] text-white focus:outline-none focus:border-amber-500/30"
                      >
                        <option value="">Seleccionar Campo</option>
                        {allFields.map(f => (
                          <option key={f.id} value={f.id}>{f.label || f.id}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-[8px] font-black text-slate-600 uppercase">Es...</label>
                        <select 
                          value={rule.operator}
                          onChange={(e) => updateSubmissionRule(rule.id, { operator: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[10px] text-white focus:outline-none"
                        >
                          <option value="==">Igual a</option>
                          <option value="!=">Diferente a</option>
                          <option value="greater">Mayor que</option>
                          <option value="less">Menor que</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] font-black text-slate-600 uppercase">Valor</label>
                        <input 
                          type="text"
                          value={rule.value}
                          onChange={(e) => updateSubmissionRule(rule.id, { value: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[10px] text-white focus:outline-none"
                          placeholder="Valor..."
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 space-y-3">
                      <label className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Asignar Estado:</label>
                      <select 
                        value={rule.action.value}
                        onChange={(e) => updateSubmissionRule(rule.id, { action: { ...rule.action, value: e.target.value } })}
                        className="w-full bg-slate-950 border border-emerald-500/20 rounded-xl px-3 py-2 text-[10px] text-emerald-500 font-black focus:outline-none"
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Urgente">Urgente</option>
                        <option value="Prioridad Alta">Prioridad Alta</option>
                        <option value="Revisión Técnica">Revisión Técnica</option>
                        <option value="Auditoría">Auditoría</option>
                      </select>
                    </div>
                  </div>
                )) : (
                  <div className="py-12 border-2 border-dashed border-slate-900 rounded-[2.5rem] flex flex-col items-center justify-center opacity-20">
                     <Zap size={24} className="text-slate-600 mb-2" />
                     <span className="text-[8px] font-black uppercase tracking-widest">Sin Automatizaciones</span>
                  </div>
                )}

                <button 
                  onClick={addSubmissionRule}
                  className="w-full py-5 border-2 border-dashed border-slate-800 rounded-[2.5rem] text-[9px] font-black text-slate-500 uppercase tracking-widest hover:border-amber-500/30 hover:text-amber-500 transition-all flex items-center justify-center space-x-2 group hover:bg-amber-500/5"
                >
                  <PlusCircle size={14} className="group-hover:rotate-90 transition-transform duration-500" />
                  <span>Añadir Regla de Workflow</span>
                </button>
              </div>
            </div>
          )}
        </div>
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
    onUpdate({ 
      logic: newLogic,
      logicAction: activeField.logicAction || "show" // Default action
    });
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

  const getTabClass = (tabId) => {
    const isActive = activeTab === tabId;
    return `flex-1 py-4 text-[9px] font-black uppercase tracking-widest transition-all relative flex items-center justify-center space-x-2 ${
      isActive ? 'text-emerald-500 bg-emerald-500/5' : 'text-slate-600 hover:text-slate-400 hover:bg-white/5'
    }`;
  };

  return (
    <div className="w-80 border-l border-white/5 bg-slate-950 flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.8)] relative z-20">
      {/* Header */}
      <div className="px-8 py-7 border-b border-white/5 bg-slate-950/80 flex justify-between items-center backdrop-blur-md shrink-0">
         <div className="flex items-center space-x-3">
           <ShieldCheck size={16} className="text-emerald-500" />
           <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Configuración</h3>
         </div>
         <button onClick={onClose} className="text-slate-600 hover:text-white transition-all bg-slate-900 border border-white/5 rounded-full p-2 active:scale-90 hover:shadow-lg">
           <ChevronDown size={14} className="rotate-[-90deg]" />
         </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/5 bg-slate-950/40">
        <button onClick={() => setActiveTab("general")} className={getTabClass("general")}>
          <Layout size={12} />
          <span>General</span>
          {activeTab === "general" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
        </button>
        <button onClick={() => setActiveTab("logic")} className={getTabClass("logic")}>
          <Zap size={12} />
          <span>Lógica</span>
          {activeTab === "logic" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
        </button>
        <button onClick={() => setActiveTab("validation")} className={getTabClass("validation")}>
          <ShieldAlert size={12} />
          <span>Validación</span>
          {activeTab === "validation" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
        </button>
      </div>

      <div className="p-8 flex-1 overflow-y-auto custom-scrollbar pb-32">
        {/* TAB: GENERAL */}
        {activeTab === "general" && (
          <div className="space-y-8 animate-in fade-in duration-300">
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

            {(activeField.type === "number" || activeField.type === "text") && (
              <div className="pt-4 border-t border-white/5 space-y-4">
                <div className="flex items-center justify-between group cursor-pointer" onClick={() => onUpdate({ isCalculated: !activeField.isCalculated })}>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tight group-hover:text-amber-500 transition-colors">Campo de Fórmula</span>
                    <span className="text-[8px] text-slate-600 font-bold opacity-60 italic">Calculado automáticamente</span>
                  </div>
                  <div 
                    className={`w-10 h-5 rounded-full relative transition-all duration-300 ${activeField.isCalculated ? 'bg-amber-600' : 'bg-slate-900 border border-white/10'}`}
                  >
                    <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all duration-300 ${activeField.isCalculated ? 'left-[22px]' : 'left-1'}`}></div>
                  </div>
                </div>

                {activeField.isCalculated && (
                  <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                      <span>Fórmula Matemática</span>
                      <span className="text-amber-500/50 lowercase font-mono">eval(js)</span>
                    </label>
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-inner">
                      <textarea 
                        value={activeField.formula || ""}
                        onChange={(e) => onUpdate({ formula: e.target.value })}
                        className="w-full bg-transparent border-none text-xs font-mono text-emerald-500 focus:outline-none resize-none scrollbar-hide h-20"
                        placeholder="Ej: {{cantidad}} * {{precio}}"
                      />
                      <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                        {otherFields.filter(f => f.type === "number").slice(0, 4).map(f => (
                           <button 
                             key={f.id}
                             onClick={() => onUpdate({ formula: (activeField.formula || "") + `{{${f.id}}}` })}
                             className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-md text-[8px] font-black text-slate-500 hover:text-white transition-colors"
                           >
                             + {f.label || f.id}
                           </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-[8px] text-slate-600 font-bold italic leading-relaxed">Usa doble llave para referenciar IDs de otros campos.</p>
                  </div>
                )}
              </div>
            )}

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

            {(activeField.type === "select" || activeField.type === "multiselect" || activeField.type === "radio") && (
              <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Opciones del Selector</label>
                <div className="space-y-2">
                  {(activeField.options || []).map((opt, idx) => (
                    <div key={idx} className="flex items-center space-x-2 group/opt">
                      <input 
                        type="text" 
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...activeField.options];
                          newOpts[idx] = e.target.value;
                          onUpdate({ options: newOpts });
                        }}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-[10px] text-white focus:outline-none focus:border-emerald-500/30"
                        placeholder={`Opción ${idx + 1}`}
                      />
                      <button 
                        onClick={() => {
                          const newOpts = activeField.options.filter((_, i) => i !== idx);
                          onUpdate({ options: newOpts });
                        }}
                        className="p-2 text-slate-700 hover:text-rose-500 opacity-0 group-hover/opt:opacity-100 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => onUpdate({ options: [...(activeField.options || []), ""] })}
                    className="w-full py-3 border border-dashed border-slate-800 rounded-xl text-[9px] font-black text-slate-600 uppercase hover:text-emerald-500 hover:border-emerald-500/20 transition-all flex items-center justify-center space-x-2"
                  >
                    <PlusCircle size={12} />
                    <span>Añadir Opción</span>
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-white/5">
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
          </div>
        )}

        {/* TAB: LOGIC */}
        {activeTab === "logic" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center space-x-2">
                 <Zap size={14} className="fill-emerald-500/10" />
                 <span>Visibilidad Condicional</span>
              </h4>
              <button 
                onClick={addLogicRule}
                className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all active:scale-90"
              >
                <PlusCircle size={16} />
              </button>
            </div>
            
             <div className="space-y-4">
              <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Ejecutar Acción:</label>
              <select 
                value={activeField.logicAction || "show"}
                onChange={(e) => onUpdate({ logicAction: e.target.value })}
                className="w-full bg-slate-900 border border-emerald-500/30 rounded-2xl px-4 py-3 text-[10px] font-black text-emerald-500 uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="show">MOSTRAR campo si...</option>
                <option value="hide">OCULTAR campo si...</option>
                <option value="require">REQUERIR campo si...</option>
                <option value="disable">DESHABILITAR campo si...</option>
              </select>
              <p className="text-[9px] text-slate-500 font-bold opacity-70 italic leading-relaxed">
                {activeField.logicAction === 'require' ? "El campo será opcional por defecto, pero obligatorio si se cumple la condición." : 
                 activeField.logicAction === 'disable' ? "El campo se bloqueará (solo lectura) si se cumple la condición." :
                 "Control de flujo dinámico basado en entradas previas."}
              </p>
            </div>

            {/* AND/OR Toggle */}
            {activeField.logic && activeField.logic.length > 1 && (
              <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                 <span className="text-[9px] font-black text-slate-400 uppercase">Unión de Reglas</span>
                 <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5">
                    <button 
                      onClick={() => onUpdate({ logicMatchType: "AND" })}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${activeField.logicMatchType !== "OR" ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-600'}`}
                    >
                      Y (AND)
                    </button>
                    <button 
                      onClick={() => onUpdate({ logicMatchType: "OR" })}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${activeField.logicMatchType === "OR" ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-600'}`}
                    >
                      O (OR)
                    </button>
                 </div>
              </div>
            )}

            <div className="space-y-4">
              {activeField.logic && activeField.logic.length > 0 ? (
                activeField.logic.map((rule) => {
                  const targetField = allFields.find(f => f.id === rule.fieldId);
                  
                  return (
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
                          onChange={(e) => updateLogicRule(rule.id, { fieldId: e.target.value, value: "" })}
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
                            
                            {(targetField?.type === "text" || targetField?.type === "textarea" || targetField?.type === "multiselect" || targetField?.type === "select") && (
                              <option value="contains">Contiene</option>
                            )}
                            
                            {(targetField?.type === "number" || targetField?.type === "currency" || targetField?.type === "calculation") && (
                              <>
                                <option value="greater">Mayor que</option>
                                <option value="less">Menor que</option>
                              </>
                            )}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[8px] font-black text-slate-600 uppercase">Valor</label>
                          
                          {/* DYNAMIC VALUE INPUT */}
                          {targetField?.type === "boolean" ? (
                            <select 
                              value={rule.value}
                              onChange={(e) => updateLogicRule(rule.id, { value: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[10px] text-emerald-500 font-black focus:outline-none"
                            >
                              <option value="true">SÍ (Activo)</option>
                              <option value="false">NO (Inactivo)</option>
                            </select>
                          ) : (targetField?.type === "select" || targetField?.type === "radio" || targetField?.type === "multiselect") && targetField.options ? (
                            <select 
                              value={rule.value}
                              onChange={(e) => updateLogicRule(rule.id, { value: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[10px] text-white focus:outline-none"
                            >
                              <option value="">Cualquiera</option>
                              {targetField.options.map((opt, i) => (
                                <option key={i} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <input 
                              type="text" 
                              value={rule.value}
                              onChange={(e) => updateLogicRule(rule.id, { value: e.target.value })}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[10px] text-white focus:outline-none focus:border-emerald-500/50"
                              placeholder="Valor..."
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 bg-slate-900/50 border border-slate-800 border-dashed rounded-[2rem] flex flex-col items-center justify-center opacity-40">
                   <Eye size={20} className="text-slate-700 mb-2" />
                   <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Sin reglas activas</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: VALIDATION */}
        {activeTab === "validation" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center space-x-2">
                 <ShieldAlert size={14} />
                 <span>Restricciones de Integridad</span>
              </h4>
              <p className="text-[9px] text-slate-500 font-bold opacity-70">Configura validaciones específicas para asegurar la calidad de la respuesta.</p>
            </div>

            <div className="space-y-6">
              {/* Type-based quick validations */}
              <div className="space-y-4">
                 <label className="block text-[8px] font-black text-slate-600 uppercase">Validación Predefinida</label>
                 <select 
                   value={activeField.validation?.type || ""}
                   onChange={(e) => onUpdate({ validation: { ...activeField.validation, type: e.target.value } })}
                   className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-[11px] font-bold text-slate-300 focus:outline-none focus:border-emerald-500/30"
                 >
                   <option value="">Ninguna (Libre)</option>
                   <option value="email">Correo Electrónico</option>
                   <option value="institutional_email">Email Institucional (@municipio)</option>
                   <option value="cuit">CUIT/CUIL Argentino</option>
                   <option value="dni">DNI (8 dígitos)</option>
                   <option value="phone">Teléfono Móvil</option>
                   <option value="regex">Patrón Personalizado (Regex)</option>
                 </select>
              </div>

               {/* Advanced Range Validations */}
               {(activeField.type === "number" || activeField.type === "text") && (
                 <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-500">
                   <div className="space-y-2">
                     <label className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">Mínimo {activeField.type === 'text' ? '(chars)' : '(valor)'}</label>
                     <input 
                       type="number"
                       value={activeField.validation?.min || ""}
                       onChange={(e) => onUpdate({ validation: { ...activeField.validation, min: e.target.value } })}
                       className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[10px] text-white focus:outline-none"
                       placeholder="Ej: 0"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">Máximo {activeField.type === 'text' ? '(chars)' : '(valor)'}</label>
                     <input 
                       type="number"
                       value={activeField.validation?.max || ""}
                       onChange={(e) => onUpdate({ validation: { ...activeField.validation, max: e.target.value } })}
                       className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[10px] text-white focus:outline-none"
                       placeholder="Ej: 100"
                     />
                   </div>
                 </div>
               )}

               {activeField.type === "date" && (
                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-500">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">Fecha Mínima</label>
                    <input 
                      type="date"
                      value={activeField.validation?.min || ""}
                      onChange={(e) => onUpdate({ validation: { ...activeField.validation, min: e.target.value } })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[10px] text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">Fecha Máxima</label>
                    <input 
                      type="date"
                      value={activeField.validation?.max || ""}
                      onChange={(e) => onUpdate({ validation: { ...activeField.validation, max: e.target.value } })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[10px] text-white focus:outline-none"
                    />
                  </div>
                </div>
               )}

              {activeField.validation?.type === "regex" && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Expresión Regular</label>
                  <input 
                    type="text" 
                    value={activeField.validation?.pattern || ""}
                    onChange={(e) => onUpdate({ validation: { ...activeField.validation, pattern: e.target.value } })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 font-mono text-[10px] text-emerald-500 focus:outline-none focus:border-emerald-500/50"
                    placeholder="^([a-z0-9]+)$"
                  />
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Mensaje de Error Personalizado</label>
                <input 
                  type="text" 
                  value={activeField.validation?.errorMessage || ""}
                  onChange={(e) => onUpdate({ validation: { ...activeField.validation, errorMessage: e.target.value } })}
                  className="w-full bg-slate-900/30 border border-slate-800 rounded-xl px-4 py-3 text-[10px] text-slate-400 focus:outline-none focus:border-rose-500/30 transition-all"
                  placeholder="Ej: Formato no válido..."
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyPanel;
