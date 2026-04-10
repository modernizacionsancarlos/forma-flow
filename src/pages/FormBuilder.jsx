import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { SplitSquareHorizontal, Plus } from "lucide-react";
import { useForms } from "../api/useForms";

// Modular Components
import BuilderHeader from "../components/forms/builder/BuilderHeader";
import FieldPalette from "../components/forms/builder/FieldPalette";
import FieldItem from "../components/forms/builder/FieldItem";
import SectionItem from "../components/forms/builder/SectionItem";
import PropertyPanel from "../components/forms/builder/PropertyPanel";

const FormBuilder = () => {
  const { saveForm, getFormById } = useForms();
  const [searchParams] = useSearchParams();
  const formId = searchParams.get("id");
  
  const [title, setTitle] = useState("Nuevo Formulario");
  const [description, setDescription] = useState("");
  // Change state to sections
  const [sections, setSections] = useState([
    { id: "sec_default", title: "Sección Principal", description: "Configura los campos de esta sección", fields: [] }
  ]);
  const [activeField, setActiveField] = useState(null);
  
  const [acceptsResponses, setAcceptsResponses] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [submissionRules, setSubmissionRules] = useState([]);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [isLoading, setIsLoading] = useState(!!formId);

  useEffect(() => {
    if (formId && getFormById) {
      const loadForm = async () => {
         const schema = await getFormById(formId);
         if (schema) {
            setTitle(schema.title || "Sin título");
            setDescription(schema.description || "");
            
            // Handle legacy data or sectioned data
            if (schema.sections && schema.sections.length > 0) {
              setSections(schema.sections);
            } else if (schema.fields) {
              setSections([{ id: "sec_default", title: "Sección Principal", description: "", fields: schema.fields }]);
            }

            setAcceptsResponses(schema.status === "active" || schema.status === "published");
            setIsPublic(!!schema.is_public);
            setSubmissionRules(schema.submissionRules || []);
         }
         setIsLoading(false);
      };
      loadForm();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  const onDragEnd = (result) => {
    const { destination, source, type } = result;
    if (!destination) return;

    // Movement Case 1: Reordering Sections
    if (type === "section") {
      const newSections = Array.from(sections);
      const [reorderedSection] = newSections.splice(source.index, 1);
      newSections.splice(destination.index, 0, reorderedSection);
      setSections(newSections);
      return;
    }

    // Movement Case 2: Reordering/Moving Fields
    if (type === "field") {
      const sourceSectionIndex = sections.findIndex(s => s.id === source.droppableId);
      const destSectionIndex = sections.findIndex(s => s.id === destination.droppableId);
      
      if (sourceSectionIndex === -1 || destSectionIndex === -1) return;

      const newSections = Array.from(sections);
      const sourceFields = Array.from(newSections[sourceSectionIndex].fields);
      const [movedField] = sourceFields.splice(source.index, 1);

      if (sourceSectionIndex === destSectionIndex) {
        // Same section
        sourceFields.splice(destination.index, 0, movedField);
        newSections[sourceSectionIndex].fields = sourceFields;
      } else {
        // Cross section
        const destFields = Array.from(newSections[destSectionIndex].fields);
        destFields.splice(destination.index, 0, movedField);
        newSections[sourceSectionIndex].fields = sourceFields;
        newSections[destSectionIndex].fields = destFields;
      }

      setSections(newSections);
    }
  };

  const addSection = () => {
    const newSection = {
      id: `sec_${crypto.randomUUID().split('-')[0]}`,
      title: "Nueva Sección",
      description: "Descripción breve de la sección",
      fields: []
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (id, updates) => {
    setSections(sections.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeSection = (id) => {
    if (sections.length <= 1) return; // Keep at least one section
    setSections(sections.filter(s => s.id !== id));
  };

  const addField = (type, targetSectionId = null) => {
    const newField = {
      id: `field_${crypto.randomUUID().split('-')[0]}`,
      type: type.id,
      label: `Nuevo campo ${type.label}`,
      required: false,
      validation: null,
      logic: []
    };

    const targetId = targetSectionId || sections[0].id;
    setSections(sections.map(s => s.id === targetId ? { ...s, fields: [...s.fields, newField] } : s));
    setActiveField(newField);
  };

  const removeField = (sectionId, fieldId, e) => {
    e.stopPropagation();
    setSections(sections.map(s => s.id === sectionId ? { ...s, fields: s.fields.filter(f => f.id !== fieldId) } : s));
    if (activeField?.id === fieldId) setActiveField(null);
  };

  const copyField = (sectionId, field, e) => {
    e.stopPropagation();
    const newField = {
      ...field,
      id: `field_${crypto.randomUUID().split('-')[0]}`,
      label: `${field.label} (Copia)`,
    };
    
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        const index = s.fields.findIndex(f => f.id === field.id);
        const newFields = [...s.fields];
        newFields.splice(index + 1, 0, newField);
        return { ...s, fields: newFields };
      }
      return s;
    }));
    setActiveField(newField);
  };

  const updateActiveField = (updates) => {
    const updated = { ...activeField, ...updates };
    setActiveField(updated);
    setSections(sections.map(s => ({
      ...s,
      fields: s.fields.map(f => f.id === updated.id ? updated : f)
    })));
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      if (saveForm) {
        await saveForm.mutateAsync({
           id: formId || undefined,
           title,
           description,
           sections, // Saving sections array directly
           submissionRules,
           is_public: isPublic,
           status: acceptsResponses ? "active" : "draft"
        });
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (saveError) {
      console.error("Error saving form:", saveError);
      setSaveStatus("error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-slate-950 items-center justify-center font-inter text-slate-300">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-900 border-t-emerald-500"></div>
        <p className="text-slate-500 mt-6 font-black tracking-widest uppercase text-[10px]">Cargando Arquitectura...</p>
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
        <FieldPalette onAddField={(type) => addField(type)} />

        {/* Canvas Area */}
        <div className="flex-1 bg-slate-950/40 p-12 overflow-y-auto custom-scrollbar relative flex flex-col items-center pb-80">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[180px] rounded-full pointer-events-none" />
          
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="builder-sections" type="section">
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className="w-full max-w-3xl space-y-2 mt-8"
                >
                  {sections.map((section, index) => (
                    <SectionItem 
                      key={section.id}
                      section={section}
                      index={index}
                      onUpdateSection={updateSection}
                      onRemoveSection={removeSection}
                      onAddField={(sid) => addField({ id: "text", label: "Texto" }, sid)}
                      onCopyField={copyField}
                      onRemoveField={removeField}
                      activeFieldId={activeField?.id}
                      onSelectField={setActiveField}
                    />
                  ))}
                  {provided.placeholder}

                  {/* Add Section Button */}
                  <div className="flex justify-center pt-8">
                     <button 
                        onClick={addSection}
                        className="group flex items-center space-x-4 bg-slate-900/50 hover:bg-blue-600/10 border border-white/5 hover:border-blue-500/30 px-12 py-6 rounded-[2.5rem] transition-all duration-500 hover:scale-105 active:scale-95"
                     >
                        <div className="p-3 rounded-2xl bg-slate-950 border border-white/10 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xl">
                          <Plus size={24} />
                        </div>
                        <div className="flex flex-col items-start translate-y-[-1px]">
                          <span className="text-white text-sm font-black uppercase tracking-tighter italic">Insertar Nueva Sección</span>
                          <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Organiza tu flujo de datos</span>
                        </div>
                     </button>
                  </div>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <PropertyPanel 
           activeField={activeField}
           allFields={sections.flatMap(s => s.fields)}
           submissionRules={submissionRules}
           setSubmissionRules={setSubmissionRules}
           onClose={() => setActiveField(null)}
           onUpdate={updateActiveField}
        />
      </div>
    </div>
  );
};

export default FormBuilder;
