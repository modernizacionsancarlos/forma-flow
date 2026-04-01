import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Link } from "react-router-dom";
import { 
  ArrowLeft,
  Settings,
  Save,
  Infinity,
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
  Plus
} from "lucide-react";
import { useForms } from "../api/useForms";

const FIELD_TYPES = [
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
];

const FormBuilder = () => {
  const { saveForm } = useForms();
  
  const [title, setTitle] = useState("Nuevo Formulario");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState([]);
  
  const [acceptsResponses, setAcceptsResponses] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");

  const onDragEnd = (result) => {
    // simplified drag and drop for mock
    if (!result.destination) return;
    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFields(items);
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      if (saveForm) {
        await saveForm.mutateAsync({
           title,
           description,
           sections: [{ id: "default", title: "Default", fields }],
           is_public: isPublic,
        });
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      setSaveStatus("error");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#060b13]">
      {/* Header */}
      <div className="flex justify-between items-center px-8 py-4 border-b border-[#1e293b]">
        <div className="flex items-start space-x-6">
          <Link to="/forms" className="pt-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex flex-col">
            <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent text-xl font-bold text-white focus:outline-none placeholder:text-slate-600 mb-1"
              placeholder="Title"
            />
            <input 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              className="bg-transparent text-sm text-slate-400 focus:outline-none placeholder:text-slate-600"
              placeholder="Añade una descripción..."
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="p-2.5 bg-[#0f172a] hover:bg-[#1e293b] border border-[#1e293b] rounded-lg text-slate-400 hover:text-white transition-colors">
            <Settings size={18} />
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center space-x-2 bg-[#10b981] hover:bg-[#059669] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Save size={16} />
            <span>Guardar</span>
          </button>
        </div>
      </div>

      {/* Sub Header Settings */}
      <div className="flex items-center space-x-8 px-8 py-3 border-b border-[#1e293b] bg-[#0a101b]/50 text-sm">
        <div className="flex items-center space-x-2 text-slate-400">
          <Infinity size={16} />
          <span>Límite de Respuestas:</span>
          <span className="text-white">Sin límite</span>
        </div>

        <div className="flex items-center space-x-3 text-slate-300">
          <button 
            onClick={() => setAcceptsResponses(!acceptsResponses)}
            className={`w-10 h-5 rounded-full relative transition-colors ${acceptsResponses ? 'bg-[#10b981]' : 'bg-slate-700'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${acceptsResponses ? 'left-5.5' : 'left-0.5'}`} style={{ transform: acceptsResponses ? 'translateX(20px)' : 'translateX(0)' }}></div>
          </button>
          <span>Acepta Respuestas</span>
        </div>

        <div className="flex items-center space-x-3 text-slate-300">
          <button 
            onClick={() => setIsPublic(!isPublic)}
            className={`w-10 h-5 rounded-full relative transition-colors ${isPublic ? 'bg-[#10b981]' : 'bg-slate-700'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${isPublic ? 'left-5.5' : 'left-0.5'}`} style={{ transform: isPublic ? 'translateX(20px)' : 'translateX(0)' }}></div>
          </button>
          <span>Hacer Público</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Fields */}
        <div className="w-64 border-r border-[#1e293b] bg-[#0a101b]/80 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="p-6 pb-2">
            <h3 className="text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Campos Disponibles</h3>
            <p className="text-[10px] text-slate-600 mb-6">Clic o arrastra al canvas</p>
            
            <div className="space-y-1">
              {FIELD_TYPES.map((type) => (
                <button
                  key={type.id}
                  className="w-full flex items-center space-x-4 px-3 py-2.5 rounded-lg hover:bg-[#1e293b]/50 transition-colors group text-left"
                >
                  <type.icon size={16} className={`${type.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-sm text-slate-300 font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-[#060b13] p-12 overflow-y-auto overflow-x-hidden relative flex items-center justify-center">
            {fields.length === 0 ? (
                <div className="w-full max-w-4xl border-2 border-dashed border-[#1e293b] rounded-2xl h-[400px] flex flex-col items-center justify-center bg-[#0a101b]/30">
                   <p className="text-slate-400 text-sm mb-1">Arrastra campos aquí o haz clic en el panel izquierdo</p>
                   <p className="text-slate-600 text-[11px] mb-6">También puedes crear campos personalizados</p>
                   
                   <button className="flex items-center space-x-2 bg-transparent text-[#10b981] border border-[#10b981] hover:bg-[#10b981]/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                     <Plus size={16} />
                     <span>Campo personalizado</span>
                   </button>
                </div>
            ) : (
                <div className="w-full max-w-4xl space-y-4">
                     {/* Fields will render here when added */}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;
