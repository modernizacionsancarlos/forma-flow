import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { SplitSquareHorizontal } from "lucide-react";
import { useForms } from "../api/useForms";

// Modular Components
import BuilderHeader from "../components/forms/builder/BuilderHeader";
import FieldPalette from "../components/forms/builder/FieldPalette";
import FieldItem from "../components/forms/builder/FieldItem";
import PropertyPanel from "../components/forms/builder/PropertyPanel";

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

  useEffect(() => {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
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
      validation: null,
      logic: [] // Phase 2: Visibility rules
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
    } catch (err) {
      setSaveStatus("error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-slate-950 items-center justify-center font-inter text-slate-300">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-900 border-t-emerald-500"></div>
        <p className="text-slate-500 mt-6 font-black tracking-widest uppercase text-[10px]">Cargando Bóveda Central...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 font-inter text-slate-300">
      <BuilderHeader 
        formId={formId}
        title={title} setTitle={setTitle}
        description={description} setDescription={setDescription}
        acceptsResponses={acceptsResponses} setAcceptsResponses={setAcceptsResponses}
        isPublic={isPublic} setIsPublic={setIsPublic}
        onSave={handleSave} saveStatus={saveStatus}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <FieldPalette onAddField={addField} />

        {/* Canvas Area */}
        <div className="flex-1 bg-slate-950/40 p-12 overflow-y-auto custom-scrollbar relative flex flex-col items-center pb-40">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/5 blur-[150px] rounded-full pointer-events-none" />

          {fields.length === 0 ? (
            <div className="w-full max-w-2xl border-2 border-dashed border-slate-800/60 rounded-[3rem] h-[400px] flex flex-col items-center justify-center bg-slate-900/30 mt-10 backdrop-blur-md relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
               <div className="w-20 h-20 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-8 shadow-3xl group-hover:scale-110 transition-transform duration-500">
                 <SplitSquareHorizontal size={32} className="text-slate-500" />
               </div>
               <p className="text-white text-lg font-black tracking-tight mb-3 italic uppercase">Construye tu Visión</p>
               <p className="text-slate-500 text-xs text-center max-w-xs leading-relaxed font-bold opacity-70">Selecciona componentes de la paleta izquierda para diseñar tu recolección de datos.</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="fields-canvas">
                {(provided) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                    className="w-full max-w-2xl space-y-6 mt-8"
                  >
                    {fields.map((field, index) => (
                      <Draggable key={field.id} draggableId={field.id} index={index}>
                        {(p, s) => (
                          <FieldItem 
                            field={field}
                            index={index}
                            isActive={activeField?.id === field.id}
                            onSelect={() => setActiveField(field)}
                            onCopy={copyField}
                            onRemove={removeField}
                            provided={p}
                            snapshot={s}
                          />
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>

        <PropertyPanel 
           activeField={activeField}
           allFields={fields}
           onClose={() => setActiveField(null)}
           onUpdate={updateActiveField}
        />
      </div>
    </div>
  );
};

export default FormBuilder;
