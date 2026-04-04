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
                <label className="text-sm font-black text-white tracking-tight uppercase italic flex items-center">
                  {field.label} {field.required && <span className="text-red-500 ml-1.5">*</span>}
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

          {/* Preview Mock */}
          <div className="bg-slate-950/60 border border-white/5 rounded-2xl px-5 py-3.5 text-xs text-slate-600 w-full font-bold italic pointer-events-none relative overflow-hidden group/input">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-emerald-500/5 opacity-0 group-hover/input:opacity-100 transition-opacity"></div>
            {field.type === 'textarea' ? 'Entrada de texto largo (multilínea)...' : 
             field.type === 'boolean' ? 'Interruptor Toggle ON/OFF' : 
             field.type === 'section' ? 'Separador de Sección (Sin campos)' :
             `Ingrese dato de ${fieldDef.label.toLowerCase()}...`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldItem;
