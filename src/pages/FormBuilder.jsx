import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { 
  ArrowLeft,
  Settings,
  Save,
  Infinity as InfinityIcon,
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
  Plus,
  Trash2,
  Copy,
  GripVertical
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
  const { saveForm, getFormById } = useForms();
  const [searchParams] = useSearchParams();
  const formId = searchParams.get("id");
  
  const [title, setTitle] = useState("Nuevo Formulario");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState([]);
  const [activeField, setActiveField] = useState(null);
  
  const [acceptsResponses, setAcceptsResponses] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [isLoading, setIsLoading] = useState(!!formId);

  React.useEffect(() => {
    if (formId && getFormById) {
      const loadForm = async () => {
         const schema = await getFormById(formId);
         if (schema) {
            setTitle(schema.title || "Sin título");
            setDescription(schema.description || "");
            setFields(schema.sections?.[0]?.fields || schema.fields || []);
            setAcceptsResponses(schema.status === "active" || schema.status === "published");
            setIsPublic(!!schema.is_public);
         }
         setIsLoading(false);
      };
      loadForm();
    }
  }, [formId, getFormById]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    // Si arrastramos desde la paleta de campos disponibles (droppable-palette no existe aquí porque simplificamos)
    if (result.source.droppableId === "fields-canvas" && result.destination.droppableId === "fields-canvas") {
      const items = Array.from(fields);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      setFields(items);
    }
  };

  const addField = (type) => {
    const newField = {
      id: `field_${crypto.randomUUID().split('-')[0]}`,
      type: type.id,
      label: `Nuevo campo ${type.label}`,
      required: false,
    };
    setFields([...fields, newField]);
    setActiveField(newField);
  };

  const removeField = (id, e) => {
    e.stopPropagation();
    setFields(fields.filter(f => f.id !== id));
    if (activeField?.id === id) setActiveField(null);
  };

  const copyField = (field, e) => {
    e.stopPropagation();
    const newField = {
      ...field,
      id: `field_${crypto.randomUUID().split('-')[0]}`,
      label: `${field.label} (Copia)`,
    };
    
    // Insert it right after the copied field
    const index = fields.findIndex(f => f.id === field.id);
    const newFields = [...fields];
    newFields.splice(index + 1, 0, newField);
    
    setFields(newFields);
    setActiveField(newField);
  };

  const updateActiveField = (updates) => {
    const updated = { ...activeField, ...updates };
    setActiveField(updated);
    setFields(fields.map(f => f.id === updated.id ? updated : f));
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      if (saveForm) {
        await saveForm.mutateAsync({
           id: formId || undefined,
           title,
           description,
           sections: [{ id: "default", title: "Default", fields }],
           is_public: isPublic,
           status: acceptsResponses ? "active" : "draft"
        });
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-slate-950 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        <p className="text-slate-500 mt-4 font-bold tracking-widest uppercase text-xs">Cargando Formulario...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 font-inter">
      {/* Header Fila 1 */}
      <div className="flex justify-between items-center px-8 py-4 border-b border-white/5 bg-slate-950/80 backdrop-blur">
        <div className="flex items-center space-x-6">
          <Link to="/forms" className="p-2 text-slate-500 hover:text-white bg-slate-900 rounded-full border border-white/5 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div className="flex flex-col justify-center">
             <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent text-lg font-black text-white focus:outline-none placeholder:text-slate-600 tracking-tighter w-80"
              placeholder="Nombre del formulario..."
            />
            <input 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              className="bg-transparent text-xs text-slate-500 font-medium focus:outline-none placeholder:text-slate-700 mt-1 w-96"
              placeholder="Añade una descripción..."
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={handleSave}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
          >
            <Save size={16} className={saveStatus === "saving" ? "animate-pulse" : ""} />
            <span>{saveStatus === "saving" ? "Guardando..." : "Guardar"}</span>
          </button>
        </div>
      </div>

      <div className="flex items-center px-8 py-3 border-b border-white/5 bg-slate-950/50 text-xs font-bold uppercase tracking-widest gap-8">
        <div className="flex items-center space-x-2 text-slate-500">
          <InfinityIcon size={14} />
          <span>Límite de Respuestas:</span>
          <span className="text-white ml-1 font-mono tracking-normal">Sin límite</span>
        </div>

        <div className="flex items-center space-x-3 text-slate-400 cursor-pointer" onClick={() => setAcceptsResponses(!acceptsResponses)}>
          <button 
            className={`w-9 h-5 rounded-full relative transition-all ${acceptsResponses ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-800 border border-white/10'}`}
          >
            <div className={`absolute top-[2px] w-4 h-4 bg-white rounded-full transition-all ${acceptsResponses ? 'left-[18px]' : 'left-[2px]'}`}></div>
          </button>
          <span className={acceptsResponses ? "text-white" : ""}>Acepta Respuestas</span>
        </div>

        <div className="flex items-center space-x-3 text-slate-400 cursor-pointer" onClick={() => setIsPublic(!isPublic)}>
          <button 
            className={`w-9 h-5 rounded-full relative transition-all ${isPublic ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-800 border border-white/10'}`}
          >
            <div className={`absolute top-[2px] w-4 h-4 bg-white rounded-full transition-all ${isPublic ? 'left-[18px]' : 'left-[2px]'}`}></div>
          </button>
          <span className={isPublic ? "text-white" : ""}>Hacer Público</span>
        </div>
      </div>

      {/* Área Principal de Construcción */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Column - Módulo Campos */}
        <div className="w-64 border-r border-white/5 bg-slate-950 flex flex-col overflow-y-auto custom-scrollbar shadow-xl relative z-10">
          <div className="p-6">
            <h3 className="text-[10px] font-black text-slate-500 mb-1 uppercase tracking-[0.2em]">Campos Disponibles</h3>
            <p className="text-[10px] text-slate-600 mb-6 font-medium italic">Clic o arrastra al canvas</p>
            
            <div className="space-y-[2px]">
              {FIELD_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => addField(type)}
                  className="w-full flex items-center space-x-4 px-3 py-3 rounded-xl hover:bg-slate-900 transition-colors group text-left border border-transparent hover:border-white/5"
                >
                  <type.icon size={16} className={`${type.color} group-hover:scale-110 transition-transform origin-left`} />
                  <span className="text-xs text-slate-300 font-semibold group-hover:text-white transition-colors">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column - Canvas */}
        <div className="flex-1 bg-slate-950/40 p-10 overflow-y-auto custom-scrollbar relative flex flex-col items-center pb-32">
          {/* Ambient Glow Center */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

          {fields.length === 0 ? (
            <div className="w-full max-w-2xl border-2 border-dashed border-slate-800 rounded-3xl h-[300px] flex flex-col items-center justify-center bg-slate-900/30 mt-10 backdrop-blur-sm relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6 shadow-xl">
                 <SplitSquareHorizontal size={28} className="text-slate-500" />
               </div>
               <p className="text-white text-sm font-bold tracking-tight mb-2">Construye tu formulario</p>
               <p className="text-slate-500 text-xs text-center max-w-xs leading-relaxed">Arrastra elementos desde el panel izquierdo para comenzar a diseñar la recolección de datos.</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="fields-canvas">
                {(provided) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                    className="w-full max-w-2xl space-y-4 mt-6"
                  >
                    {fields.map((field, index) => {
                      const isActive = activeField?.id === field.id;
                      const fieldDef = FIELD_TYPES.find(t => t.id === field.type) || FIELD_TYPES[1];
                      const Icon = fieldDef.icon;

                      return (
                        <Draggable key={field.id} draggableId={field.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              onClick={() => setActiveField(field)}
                              className={`
                                rounded-2xl border relative transition-all duration-200 group overflow-hidden bg-slate-900/80 backdrop-blur-sm
                                ${isActive 
                                    ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20' 
                                    : 'border-slate-800 hover:border-slate-700 hover:shadow-lg'}
                                ${snapshot.isDragging ? 'shadow-2xl scale-[1.02] border-emerald-500 z-50' : ''}
                              `}
                            >
                              {/* Drag Handle & Content */}
                              <div className="flex min-h-[5rem]">
                                {/* Drag Handle */}
                                <div 
                                  {...provided.dragHandleProps}
                                  className={`w-10 flex items-center justify-center border-r transition-colors ${isActive ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-900/50 border-slate-800 group-hover:bg-slate-800/80'}`}
                                >
                                  <GripVertical size={16} className={isActive ? "text-emerald-500" : "text-slate-600"} />
                                </div>
                                
                                {/* Field Content */}
                                <div className="flex-1 p-5 py-4">
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center space-x-3">
                                      <div className={`p-1.5 rounded-lg bg-slate-950 border border-white/5`}>
                                        <Icon size={14} className={fieldDef.color} />
                                      </div>
                                      <label className="text-sm font-bold text-white tracking-tight">
                                        {field.label} {field.required && <span className="text-red-500 ml-1">*</span>}
                                      </label>
                                    </div>

                                    {/* Action buttons - appear on hover or active */}
                                    <div className={`flex items-center space-x-1 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                      <button 
                                        onClick={(e) => copyField(field, e)}
                                        className="p-1.5 text-slate-500 hover:text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition-colors"
                                        title="Duplicar Campo"
                                      >
                                        <Copy size={14} />
                                      </button>
                                      <button 
                                        onClick={(e) => removeField(field.id, e)}
                                        className="p-1.5 text-slate-500 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Field Mock Input Display */}
                                  <div className="bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-500 w-full font-medium italic pointer-events-none">
                                    {field.type === 'textarea' ? 'Entrada de texto largo...' : 
                                     field.type === 'boolean' ? 'Interruptor de encendido/apagado' : 
                                     `Entrada de ${fieldDef.label.toLowerCase()}...`}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>

        {/* Right Column - Property Rail (Conditional) */}
        <div className={`w-80 border-l border-white/5 bg-slate-950 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.5)] transition-all duration-300 absolute right-0 top-0 bottom-0 z-20 ${activeField ? 'translate-x-0' : 'translate-x-full'}`}>
          {activeField ? (
            <>
              <div className="px-6 py-5 border-b border-white/5 bg-slate-900/50 flex justify-between items-center">
                 <h3 className="text-xs font-black text-white uppercase tracking-widest">Propiedades</h3>
                 <button onClick={() => setActiveField(null)} className="text-slate-500 hover:text-white transition-colors bg-slate-800 rounded-full p-1">
                   <ChevronDown size={14} className="rotate-[-90deg]" />
                 </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
                
                {/* ID del Campo */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Identificador (Clave)</label>
                  </div>
                  <input 
                    type="text" 
                    value={activeField.id}
                    disabled
                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2 text-xs font-mono text-slate-400 opacity-70"
                  />
                  <p className="text-[9px] text-slate-600 mt-1 italic">Este ID es inmutable y se usa en la BDD.</p>
                </div>

                {/* Título/Etiqueta */}
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Etiqueta del Campo</label>
                  <input 
                    type="text" 
                    value={activeField.label}
                    onChange={(e) => updateActiveField({ label: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-semibold text-white"
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-4 pt-2 border-t border-white/5">
                   <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-slate-300">Obligatorio</span>
                     <button 
                        onClick={() => updateActiveField({ required: !activeField.required })}
                        className={`w-9 h-5 rounded-full relative transition-all ${activeField.required ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-800 border border-white/10'}`}
                      >
                        <div className={`absolute top-[2px] w-4 h-4 bg-white rounded-full transition-all ${activeField.required ? 'left-[18px]' : 'left-[2px]'}`}></div>
                      </button>
                   </div>
                   
                   <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-slate-300 text-opacity-50">Validación Regex (Avanzado)</span>
                     <button className="w-9 h-5 rounded-full bg-slate-800 border border-white/10 opacity-50 relative cursor-not-allowed">
                       <div className="absolute top-[2px] w-4 h-4 bg-white rounded-full left-[2px] opacity-20"></div>
                     </button>
                   </div>
                </div>

                {/* Panel Lógica Condicional */}
                <div className="pt-6 border-t border-white/5 opacity-50">
                   <div className="bg-slate-900 border border-slate-500/20 rounded-2xl p-4 relative overflow-hidden">
                     <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Lógica de Visibilidad</h4>
                     <p className="text-[10px] text-slate-500 mb-4 leading-relaxed font-medium">Condiciona este campo para que solo aparezca si se cumplen reglas.</p>
                     <button className="w-full py-2 bg-slate-500/10 text-slate-400 border border-slate-500/30 rounded-xl text-[11px] font-bold cursor-not-allowed">
                       Próximamente
                     </button>
                   </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-900/10">
              <Settings size={24} className="text-slate-800 mb-4" />
              <p className="text-slate-500 text-sm font-semibold">Propiedades</p>
              <p className="text-[10px] font-medium text-slate-600 mt-2">Selecciona un campo en el canvas para editarlo aquí.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default FormBuilder;
