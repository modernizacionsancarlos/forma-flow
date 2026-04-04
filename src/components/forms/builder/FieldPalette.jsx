import React from "react";
import { 
  SplitSquareHorizontal, 
  Type, 
  AlignLeft, 
  Hash, 
  Calendar, 
  Clock, 
  ChevronDown, 
  ListChecks, 
  CheckCircle2, 
  ToggleLeft,
  UploadCloud,
  PenTool,
  MapPin
} from "lucide-react";

export const FIELD_TYPES = [
  { id: "section", label: "Sección", icon: SplitSquareHorizontal, color: "text-[#10b981]" },
  { id: "text", label: "Texto", icon: Type, color: "text-slate-300" },
  { id: "textarea", label: "Texto Largo", icon: AlignLeft, color: "text-slate-300" },
  { id: "number", label: "Número", icon: Hash, color: "text-slate-300" },
  { id: "date", label: "Fecha", icon: Calendar, color: "text-amber-500" },
  { id: "time", label: "Hora", icon: Clock, color: "text-rose-500" },
  { id: "select", label: "Selector", icon: ChevronDown, color: "text-blue-500" },
  { id: "multiselect", label: "Multi-select", icon: ListChecks, color: "text-indigo-400" },
  { id: "radio", label: "Radio", icon: CheckCircle2, color: "text-blue-400" },
  { id: "boolean", label: "Sí / No", icon: ToggleLeft, color: "text-orange-500" },
  { id: "file", label: "Archivos", icon: UploadCloud, color: "text-emerald-400" },
  { id: "signature", label: "Firma", icon: PenTool, color: "text-purple-400" },
  { id: "gps", label: "Ubicación GPS", icon: MapPin, color: "text-rose-400" },
];

const FieldPalette = ({ onAddField }) => {
  return (
    <div className="w-64 border-r border-white/5 bg-slate-950 flex flex-col overflow-y-auto custom-scrollbar shadow-xl relative z-10">
      <div className="p-6">
        <h3 className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-[0.2em] opacity-80">Paleta de Componentes</h3>
        <p className="text-[10px] text-slate-600 mb-6 font-medium italic">Haz clic para añadir al canvas</p>
        
        <div className="space-y-[4px]">
          {FIELD_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => onAddField(type)}
              className="w-full flex items-center space-x-4 px-3.5 py-4 rounded-2xl hover:bg-slate-900 transition-all group text-left border border-transparent hover:border-white/5 group active:scale-95 duration-200"
            >
              <div className={`p-2 rounded-xl bg-slate-950/80 border border-white/5 group-hover:bg-slate-800/80 group-hover:shadow-[0_0_10px_rgba(255,255,255,0.05)] transition-all`}>
                <type.icon size={16} className={`${type.color} group-hover:scale-110 transition-transform duration-300`} />
              </div>
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-[11px] text-slate-400 font-black uppercase tracking-tight group-hover:text-white transition-colors">{type.label}</span>
                <span className="text-[9px] text-slate-600 font-medium truncate opacity-60">Control {type.id}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FieldPalette;
