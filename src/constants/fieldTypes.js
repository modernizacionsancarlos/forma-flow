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
