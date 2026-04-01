import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { 
  Type, 
  Hash, 
  CheckSquare, 
  Calendar, 
  MapPin, 
  Signature, 
  Camera, 
  Star,
  Plus,
  Trash2,
  Settings2,
  GripVertical,
  Send,
  LayoutGrid,
  Eye,
  Save,
  CheckCircle,
  AlertCircle,
  FileCode,
  Layers,
  Layout
} from "lucide-react";
import { useSubmissions } from "../api/useSubmissions";
import { useForms } from "../api/useForms";

const FIELD_TYPES = [
  { id: "text", label: "Texto", icon: Type },
  { id: "number", label: "Número", icon: Hash },
  { id: "checkbox", label: "Checkbox", icon: CheckSquare },
  { id: "date", label: "Fecha", icon: Calendar },
  { id: "gps", label: "GPS", icon: MapPin },
  { id: "signature", label: "Firma", icon: Signature },
  { id: "photo", label: "Foto", icon: Camera },
  { id: "rating", label: "Rating", icon: Star },
];

const FormBuilder = () => {
  const { saveForm } = useForms();
  
  const [title, setTitle] = useState("Formulario Enterprise v2");
  const [description, setDescription] = useState("Sistema de captura avanzado con secciones dinámicas.");
  const [sections, setSections] = useState([
    { id: "sec_" + Math.random().toString(36).substr(2, 5), title: "Sección 1", fields: [] }
  ]);
  const [selectedField, setSelectedField] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [saveStatus, setSaveStatus] = useState("idle");

  const onDragEnd = (result) => {
    const { destination, source, type } = result;
    if (!destination) return;

    if (type === "section") {
      const items = Array.from(sections);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      setSections(items);
      return;
    }

    // Dragging fields within or between sections
    const sourceSectionIndex = sections.findIndex(s => s.id === source.droppableId);
    const destSectionIndex = sections.findIndex(s => s.id === destination.droppableId);
    
    if (sourceSectionIndex === -1 || destSectionIndex === -1) return;

    const newSections = Array.from(sections);
    const sourceFields = Array.from(newSections[sourceSectionIndex].fields);
    const [movedField] = sourceFields.splice(source.index, 1);

    if (sourceSectionIndex === destSectionIndex) {
      sourceFields.splice(destination.index, 0, movedField);
      newSections[sourceSectionIndex].fields = sourceFields;
    } else {
      const destFields = Array.from(newSections[destSectionIndex].fields);
      destFields.splice(destination.index, 0, movedField);
      newSections[sourceSectionIndex].fields = sourceFields;
      newSections[destSectionIndex].fields = destFields;
    }
    
    setSections(newSections);
  };

  const addSection = () => {
    const newSection = {
      id: "sec_" + Math.random().toString(36).substr(2, 5),
      title: "Nueva Sección",
      fields: []
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (sectionId) => {
    if (sections.length <= 1) return;
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const addField = (type, sectionId) => {
    const targetSectionId = sectionId || sections[0].id;
    const newField = {
      id: "field_" + Math.random().toString(36).substr(2, 9),
      type: type.id,
      label: `Nuevo campo de ${type.label}`,
      placeholder: "Escribe aquí...",
      required: false,
      validation: { pattern: "", message: "" },
      order: 0,
    };

    setSections(sections.map(s => 
      s.id === targetSectionId 
      ? { ...s, fields: [...s.fields, newField] } 
      : s
    ));
    setSelectedField(newField);
  };

  const removeField = (fieldId) => {
    setSections(sections.map(s => ({
      ...s,
      fields: s.fields.filter(f => f.id !== fieldId)
    })));
    if (selectedField?.id === fieldId) setSelectedField(null);
  };

  const updateField = (fieldId, updates) => {
    setSections(sections.map(s => ({
      ...s,
      fields: s.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f)
    })));
    if (selectedField?.id === fieldId) setSelectedField({ ...selectedField, ...updates });
  };

  const updateSectionTitle = (sectionId, title) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, title } : s));
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      // Flatten for the hook if it expects a flat list, or update hook to support sections
      // FormFlow Phase 2: We save sections directly
      await saveForm.mutateAsync({
        title,
        description,
        sections,
        is_public: isPublic,
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      setSaveStatus("error");
    }
  };

  if (isPreview) {
    return (
      <div className="flex flex-col h-[calc(100vh-160px)] bg-slate-950 overflow-hidden rounded-3xl border border-slate-800 shadow-2xl">
         <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
            <span className="flex items-center space-x-2 text-emerald-500 font-bold text-xs uppercase">
               <Eye size={16} />
               <span>Modo Previsualización</span>
            </span>
            <button onClick={() => setIsPreview(false)} className="px-4 py-1.5 bg-slate-950 text-white border border-slate-800 rounded-lg text-xs hover:bg-slate-800 transition-all">Ssalir de Vista Previa</button>
         </div>
         <div className="flex-1 overflow-y-auto p-12 bg-slate-950 flex justify-center">
            <div className="w-full max-w-2xl space-y-12">
               <header className="space-y-4">
                  <h1 className="text-4xl font-bold text-white tracking-tight">{title}</h1>
                  <p className="text-slate-500 text-lg">{description}</p>
               </header>
               <div className="space-y-16">
                  {sections.map(s => (
                    <div key={s.id} className="space-y-8">
                       <h2 className="text-xl font-bold text-emerald-500 border-b border-slate-800 pb-2">{s.title}</h2>
                       <div className="space-y-8">
                          {s.fields.map(f => (
                            <div key={f.id} className="space-y-4">
                               <label className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
                                  <span>{f.label}</span>
                                  {f.required && <span className="text-red-500">*</span>}
                               </label>
                               <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-slate-500 opacity-50 italic">
                                  {f.placeholder}
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-160px)] gap-6 overflow-hidden">
      {/* Component Palette */}
      <div className="w-72 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600"></div>
        <h3 className="text-xs font-bold text-emerald-500 mb-8 uppercase tracking-widest flex items-center space-x-2">
           <FileCode size={16} />
           <span>Elementos</span>
        </h3>
        <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
          {FIELD_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => addField(type)}
              className="flex items-center space-x-4 p-4 bg-slate-950/50 border border-slate-800/50 rounded-2xl hover:border-emerald-500/50 hover:bg-slate-900/50 transition-all group active:scale-95 text-left"
            >
              <div className="p-3 bg-slate-900 rounded-xl group-hover:bg-emerald-600/10 group-hover:text-emerald-500 transition-colors shadow-inner">
                <type.icon size={18} />
              </div>
              <span className="text-sm font-medium text-slate-300">{type.label}</span>
              <Plus size={14} className="ml-auto text-slate-700 group-hover:text-emerald-500" />
            </button>
          ))}
          <div className="mt-6 pt-6 border-t border-slate-800/50">
            <button 
              onClick={addSection}
              className="w-full flex items-center justify-center space-x-2 p-4 bg-emerald-600/10 text-emerald-500 border border-emerald-500/30 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all font-bold text-xs uppercase tracking-widest"
            >
              <Layout size={16} />
              <span>Nueva Sección</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas with Nested Sections */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col shadow-2xl overflow-hidden relative">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/60 backdrop-blur-md z-10">
           <div className="flex items-center space-x-4">
              <div className="p-2 bg-emerald-600/10 rounded-lg">
                <LayoutGrid size={18} className="text-emerald-500" />
              </div>
              <div className="flex flex-col">
                <input 
                   value={title} 
                   onChange={(e) => setTitle(e.target.value)}
                   className="bg-transparent text-lg font-bold text-white focus:outline-none placeholder:text-slate-700"
                   placeholder="Título del Formulario"
                />
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Entorno Enterprise de Desarrollo</span>
              </div>
           </div>
           <div className="flex space-x-3">
              <button 
                onClick={() => setIsPreview(true)}
                className="px-5 py-2.5 flex items-center space-x-2 text-slate-300 hover:text-white bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium transition-all hover:bg-slate-800"
              >
                <Eye size={16} />
                <span>Vista Previa</span>
              </button>
              <button 
                onClick={handleSave}
                disabled={saveStatus === "saving"}
                className={`px-6 py-2.5 flex items-center space-x-2 rounded-xl text-sm font-bold shadow-xl transition-all ${
                  saveStatus === "saved" ? "bg-green-600 text-white" : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-900/20"
                }`}
              >
                {saveStatus === "saving" ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 
                 saveStatus === "saved" ? <CheckCircle size={16} /> : <Save size={16} />}
                <span>{saveStatus === "saving" ? "Guardando..." : saveStatus === "saved" ? "¡Publicado!" : "Publicar"}</span>
              </button>
           </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
          <div className="max-w-3xl mx-auto space-y-12">
            <textarea 
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               className="w-full bg-transparent text-slate-500 text-sm focus:outline-none resize-none border-none p-0 h-12 leading-relaxed"
               placeholder="Describe el objetivo de recolección de datos..."
            />

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="form-sections" type="section">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-12 pb-20">
                    {sections.map((section, sIndex) => (
                      <Draggable key={section.id} draggableId={section.id} index={sIndex}>
                        {(provided) => (
                          <div 
                            ref={provided.innerRef} 
                            {...provided.draggableProps}
                            className="bg-slate-950/40 border border-slate-800 rounded-[2.5rem] p-8 shadow-inner relative group/sec"
                          >
                            <div className="flex justify-between items-center mb-8 pr-4">
                               <div className="flex items-center space-x-4">
                                  <div {...provided.dragHandleProps} className="p-2 text-slate-800 hover:text-emerald-500 transition-colors">
                                    <GripVertical size={20} />
                                  </div>
                                  <input 
                                    value={section.title}
                                    onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                                    className="bg-transparent text-xl font-black text-white focus:outline-none border-b border-transparent focus:border-emerald-600/30"
                                    placeholder="Nombre de la Sección"
                                  />
                               </div>
                               <button 
                                 onClick={() => removeSection(section.id)}
                                 className="opacity-0 group-hover/sec:opacity-100 p-2 text-slate-700 hover:text-red-500 transition-all"
                               >
                                  <Trash2 size={18} />
                               </button>
                            </div>

                            <Droppable droppableId={section.id} type="field">
                              {(fieldProvided, snapshot) => (
                                <div 
                                  {...fieldProvided.droppableProps} 
                                  ref={fieldProvided.innerRef}
                                  className={`min-h-[120px] rounded-3xl transition-all px-4 py-6 border-2 border-dashed ${snapshot.isDraggingOver ? "bg-emerald-600/5 border-emerald-500/30" : "border-transparent"}`}
                                >
                                  <div className="space-y-4">
                                    {section.fields.map((field, fIndex) => (
                                      <Draggable key={field.id} draggableId={field.id} index={fIndex}>
                                        {(fProv, fSnap) => (
                                          <div
                                            ref={fProv.innerRef}
                                            {...fProv.draggableProps}
                                            onClick={() => setSelectedField(field)}
                                            className={`p-6 bg-slate-950 border-2 rounded-3xl transition-all cursor-pointer relative group/field ${
                                              fSnap.isDragging ? "shadow-dark-2xl border-emerald-500" : 
                                              selectedField?.id === field.id ? "border-emerald-600/50 shadow-2xl" : "border-slate-800/80 hover:border-slate-700"
                                            }`}
                                          >
                                            <div {...fProv.dragHandleProps} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-slate-800 opacity-0 group-hover/field:opacity-100">
                                              <GripVertical size={16} />
                                            </div>
                                            
                                            <div className="flex justify-between items-start pl-6">
                                               <div className="space-y-1">
                                                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">{field.type}</span>
                                                  <h4 className="text-sm text-white font-bold">{field.label}</h4>
                                               </div>
                                               <button 
                                                 onClick={(e) => { e.stopPropagation(); removeField(field.id); }}
                                                 className="p-2 text-slate-800 hover:text-red-400 opacity-0 group-hover/field:opacity-100"
                                               >
                                                 <Trash2 size={16} />
                                               </button>
                                            </div>
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {fieldProvided.placeholder}
                                    {section.fields.length === 0 && (
                                      <div className="h-24 flex items-center justify-center text-slate-700 italic text-xs">
                                        Arrastra elementos aquí o selecciona uno de la izquierda
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </Droppable>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-80 bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col shadow-2xl overflow-hidden">
        <h3 className="text-xs font-black text-slate-500 mb-8 uppercase tracking-[0.2em] flex items-center space-x-2 leading-none">
           <Settings2 size={14} />
           <span>Configuración</span>
        </h3>
        
        {selectedField ? (
          <div className="space-y-8 overflow-y-auto pr-3 custom-scrollbar flex-1 pb-10">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Etiqueta Principal</label>
              <input 
                type="text" 
                value={selectedField.label}
                onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-xs text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-inner"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Input Guía (Placeholder)</label>
              <input 
                type="text" 
                value={selectedField.placeholder}
                onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-xs text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all shadow-inner"
              />
            </div>

            <div className="flex items-center justify-between p-5 bg-slate-950 border border-slate-800 rounded-2xl">
               <span className="text-xs font-bold text-slate-300">Obligatorio</span>
               <div 
                 onClick={() => updateField(selectedField.id, { required: !selectedField.required })}
                 className={`w-12 h-6 rounded-full transition-all cursor-pointer relative ${selectedField.required ? "bg-emerald-600" : "bg-slate-800"}`}
               >
                 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${selectedField.required ? "left-7" : "left-1"}`}></div>
               </div>
            </div>

            <div className="pt-8 border-t border-slate-800 space-y-6">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Reglas de Negocio</span>
                
                <div className="space-y-3">
                  <label className="text-xs font-medium text-slate-400">Patrón Regex</label>
                  <input 
                    type="text"
                    placeholder="Ej: ^[0-9]+$"
                    value={selectedField.validation?.pattern || ""}
                    onChange={(e) => updateField(selectedField.id, { validation: { ...selectedField.validation, pattern: e.target.value } })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-[10px] text-white font-mono focus:ring-1 focus:ring-emerald-600 outline-none transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-medium text-slate-400">Alerta de Error</label>
                  <input 
                    type="text"
                    placeholder="Mensaje de validación..."
                    value={selectedField.validation?.message || ""}
                    onChange={(e) => updateField(selectedField.id, { validation: { ...selectedField.validation, message: e.target.value } })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-xs text-white focus:ring-1 focus:ring-emerald-600 outline-none transition-all"
                  />
                </div>
            </div>

            <div className="p-6 bg-emerald-600/5 border border-emerald-500/10 rounded-3xl">
               <div className="flex items-center space-x-2 text-emerald-500 mb-4">
                  <Layers size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Ajustes Globales</span>
               </div>
               <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Acceso Público</span>
                  <input 
                    type="checkbox" 
                    checked={isPublic} 
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer" 
                  />
               </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-10">
             <div className="w-16 h-16 bg-slate-800/10 border border-slate-800/30 rounded-2xl flex items-center justify-center mb-6">
                <Settings2 size={24} className="text-slate-700" />
             </div>
             <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Propiedades Inactivas</p>
             <p className="text-xs text-slate-700 mt-2">Selecciona un elemento del canvas para editar sus parámetros avanzados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormBuilder;
