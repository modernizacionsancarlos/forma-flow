const FieldPalette = ({ onAddField }) => {
  return (
    <div className="w-80 border-r border-white/5 bg-slate-950 flex flex-col overflow-y-auto custom-scrollbar shadow-2xl relative z-10 select-none">
      <div className="p-8">
        <h3 className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.4em] opacity-80">Arquitectura de Datos</h3>
        <p className="text-[10px] text-slate-600 mb-8 font-medium italic">Selecciona para insertar en la zona activa</p>
        
        <div className="space-y-2">
          {FIELD_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => onAddField(type)}
              className="w-full flex items-center space-x-5 px-5 py-5 rounded-3xl bg-slate-900/20 hover:bg-slate-900 transition-all group text-left border border-white/5 hover:border-emerald-500/30 active:scale-[0.97] duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className={`p-3 rounded-2xl bg-slate-950 border border-white/10 group-hover:bg-slate-800 group-hover:border-emerald-500/30 transition-all shadow-xl group-hover:shadow-emerald-500/10`}>
                <type.icon size={18} className={`${type.color} group-hover:scale-110 transition-transform duration-500`} />
              </div>
              
              <div className="flex flex-col flex-1 overflow-hidden relative z-10">
                <span className="text-[11px] text-slate-300 font-black uppercase tracking-tight group-hover:text-emerald-400 transition-colors">{type.label}</span>
                <span className="text-[9px] text-slate-600 font-bold truncate opacity-60 group-hover:opacity-100 uppercase tracking-widest mt-0.5">Módulo {type.id}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto p-8 border-t border-white/5 bg-slate-950/40">
        <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 text-center">
           <p className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest mb-2">Capacidad del Sistema</p>
           <div className="flex justify-center space-x-1">
              {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />)}
           </div>
        </div>
      </div>
    </div>
  );
};


export default FieldPalette;
