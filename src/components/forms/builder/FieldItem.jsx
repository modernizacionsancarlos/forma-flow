import { GripVertical, Copy, Trash2, Zap, ShieldAlert, Calculator, Info } from "lucide-react";
import { FIELD_TYPES } from "../../../constants/fieldTypes";

const FieldItem = ({ 
  field, 
  isActive, 
  onSelect, 
  onCopy, 
  onRemove, 
  provided, 
  snapshot 
}) => {
  const { innerRef, draggableProps, dragHandleProps } = provided;
  const fieldDef = FIELD_TYPES.find(t => t.id === field.type) || FIELD_TYPES[1];
  const Icon = fieldDef.icon;

  const hasLogic = field.logic && field.logic.length > 0;
  const hasValidation = field.validation && (field.validation.type || field.validation.pattern);
  const isCalculated = field.isCalculated && field.formula;

  return (
    <div
      ref={(node) => innerRef(node)}
      {...draggableProps}
      onClick={onSelect}
      className={`
        rounded-3xl border relative transition-all duration-300 group overflow-hidden bg-slate-900/40 backdrop-blur-md
        ${isActive 
            ? 'border-emerald-500/40 shadow-[0_20px_40px_rgba(16,185,129,0.1)] ring-1 ring-emerald-500/10' 
            : 'border-slate-800/60 hover:border-slate-700/80 hover:shadow-2xl hover:bg-slate-800/30'}
        ${snapshot.isDragging ? 'shadow-3xl scale-[1.03] border-emerald-500/80 z-[100] rotate-1 bg-slate-900' : ''}
      `}
    >
      <div className="flex min-h-[6rem]">
        {/* Drag Handle */}
        <div 
          {...dragHandleProps}
          className={`w-12 flex items-center justify-center border-r transition-all ${isActive ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-slate-950/20 border-slate-800/40 group-hover:bg-slate-900/50'}`}
        >
          <GripVertical size={18} className={isActive ? "text-emerald-500 animate-pulse" : "text-slate-700 group-hover:text-slate-500"} />
        </div>
        
        {/* Content */}
        <div className="flex-1 p-6 py-5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-2xl bg-slate-950 border border-white/5 transition-transform group-hover:scale-110 duration-500`}>
                <Icon size={16} className={fieldDef.color} />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-black text-white tracking-tight uppercase italic flex items-center group/label">
                  {field.label} {field.required && <span className="text-red-500 ml-1.5">*</span>}
                  
                  {/* Indicators */}
                  <div className="flex items-center ml-4 space-x-2 opacity-60 group-hover/label:opacity-100 transition-opacity">
                    {hasLogic && (
                      <div className="group/logic relative">
                        <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-500 shadow-lg shadow-emerald-500/5 antialiased">
                          <Zap size={10} fill="currentColor" />
                          <span className="text-[7px] font-black uppercase">
                            {field.logicAction === 'hide' ? 'Ocultar' : 
                             field.logicAction === 'require' ? 'Requerir' :
                             field.logicAction === 'disable' ? 'Bloquear' : 'Mostrar'}
                          </span>
                        </div>
                        {/* Tooltip Detallado */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-950 border border-emerald-500/30 rounded-xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover/logic:opacity-100 group-hover/logic:translate-y-0 transition-all z-[110] backdrop-blur-xl">
                           <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                              <Zap size={8} /> Reglas de Lógica
                           </p>
                           <div className="space-y-1.5">
                              {field.logic.map((r, i) => (
                                <div key={i} className="text-[7px] text-slate-300 font-bold leading-tight border-l-2 border-emerald-500/20 pl-2">
                                  Si <span className="text-white italic">{r.fieldId}</span> {r.operator === '==' ? 'es' : r.operator === '!=' ? 'no es' : r.operator} <span className="text-emerald-400">"{r.value}"</span>
                                </div>
                              ))}
                              <p className="text-[6px] text-slate-500 font-black uppercase mt-1 pt-1 border-t border-white/5">
                                Acción: {field.logicAction || 'mostrar'}
                              </p>
                           </div>
                        </div>
                      </div>
                    )}
                    {hasValidation && (
                      <div className="group/val relative">
                        <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded-md text-rose-500 shadow-lg shadow-rose-500/5 antialiased">
                          <ShieldAlert size={10} />
                          {(field.validation?.min || field.validation?.max) && (
                            <span className="text-[7px] font-black uppercase">Rango</span>
                          )}
                        </div>
                        {/* Tooltip Detallado */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-950 border border-rose-500/30 rounded-xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover/val:opacity-100 group-hover/val:translate-y-0 transition-all z-[110] backdrop-blur-xl">
                           <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                              <ShieldAlert size={8} /> Validaciones
                           </p>
                           <div className="space-y-1">
                              {field.validation?.type && <p className="text-[7px] text-white font-black italic uppercase">Tipo: {field.validation.type}</p>}
                              {field.validation?.min && <p className="text-[7px] text-slate-300 font-bold">Mín: <span className="text-rose-400">{field.validation.min}</span></p>}
                              {field.validation?.max && <p className="text-[7px] text-slate-300 font-bold">Máx: <span className="text-rose-400">{field.validation.max}</span></p>}
                              {field.validation?.pattern && <p className="text-[7px] text-slate-500 font-mono truncate">Regex: {field.validation.pattern}</p>}
                           </div>
                        </div>
                      </div>
                    )}
                    {isCalculated && (
                      <div className="group/calc relative">
                        <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-500 shadow-lg shadow-amber-500/5 antialiased">
                          <Calculator size={10} />
                          <span className="text-[7px] font-black uppercase">Calc</span>
                        </div>
                        {/* Tooltip Detallado */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-950 border border-amber-500/30 rounded-xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover/calc:opacity-100 group-hover/calc:translate-y-0 transition-all z-[110] backdrop-blur-xl">
                           <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                              <Calculator size={8} /> Fórmula
                           </p>
                           <div className="p-2 bg-slate-900 rounded-lg border border-amber-500/10">
                              <code className="text-[7px] text-amber-400 font-mono break-all">{field.formula}</code>
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                </label>
                <span className="text-[9px] text-slate-600 font-bold tracking-widest uppercase">ID: {field.id}</span>
              </div>
            </div>

            {/* Actions */}
            <div className={`flex items-center space-x-2 transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 uppercase'}`}>
              <button 
                onClick={(e) => onCopy(field, e)}
                className="p-2 text-slate-500 hover:text-emerald-400 rounded-xl hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all active:scale-90"
                title="Duplicar"
              >
                <Copy size={14} />
              </button>
              <button 
                onClick={(e) => onRemove(field.id, e)}
                className="p-2 text-slate-500 hover:text-red-500 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all active:scale-90"
                title="Eliminar"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Visual field preview */}
          <div className="bg-slate-950/60 border border-white/5 rounded-2xl px-5 py-3.5 text-xs text-slate-600 w-full font-bold italic pointer-events-none relative overflow-hidden group/input">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-emerald-500/5 opacity-0 group-hover/input:opacity-100 transition-opacity"></div>
            {field.type === 'textarea' ? 'Entrada de texto largo (multilínea)...' : 
             field.type === 'boolean' ? 'Interruptor Toggle ON/OFF' : 
             field.type === 'section' ? 'Separador de Sección (Sin campos)' :
             field.type === 'signature' ? 'ÁREA DE FIRMA DIGITAL REQUERIDA' :
             field.type === 'gps' ? 'CAPTURA AUTOMÁTICA DE COORDENADAS' :
             `Ingrese dato de ${fieldDef.label.toLowerCase()}...`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldItem;
