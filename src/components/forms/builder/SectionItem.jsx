import React from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { GripVertical, Trash2, Plus, LayoutPanelTop, ChevronDown } from "lucide-react";
import FieldItem from "./FieldItem";

const SectionItem = ({ 
  section, 
  index, 
  onAddField, 
  onRemoveSection, 
  onUpdateSection,
  onCopyField,
  onRemoveField,
  activeFieldId,
  onSelectField
}) => {
  return (
    <Draggable draggableId={section.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`
            mb-12 rounded-[2.5rem] border transition-all duration-500 overflow-hidden
            ${snapshot.isDragging 
              ? 'border-blue-500/50 shadow-2xl scale-[1.02] bg-slate-900/90 z-50' 
              : 'border-slate-800/40 bg-slate-900/20 backdrop-blur-xl'}
          `}
        >
          {/* Section Header */}
          <div className="flex items-center px-6 py-5 bg-slate-950/40 border-b border-white/5 group">
            <div {...provided.dragHandleProps} className="p-2 cursor-grab active:cursor-grabbing text-slate-700 hover:text-blue-400 transition-colors">
              <GripVertical size={20} />
            </div>
            
            <div className="flex-1 ml-4 flex flex-col">
              <input 
                value={section.title || ""} 
                onChange={(e) => onUpdateSection(section.id, { title: e.target.value })}
                className="bg-transparent text-lg font-black text-white focus:outline-none placeholder:text-slate-700 tracking-tighter uppercase italic"
                placeholder="Título de la Sección..."
              />
              <input 
                value={section.description || ""} 
                onChange={(e) => onUpdateSection(section.id, { description: e.target.value })}
                className="bg-transparent text-[10px] text-slate-500 font-bold focus:outline-none placeholder:text-slate-800 mt-0.5 uppercase tracking-widest"
                placeholder="Añade contexto a esta sección..."
              />
            </div>

            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => onRemoveSection(section.id)}
                className="p-2.5 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                title="Eliminar Sección"
              >
                <Trash2 size={16} />
              </button>
              <div className="p-2.5 text-slate-700">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          {/* Fields Droppable Area */}
          <Droppable droppableId={section.id} type="field">
            {(fieldProvided, fieldSnapshot) => (
              <div
                ref={fieldProvided.innerRef}
                {...fieldProvided.droppableProps}
                className={`
                  p-8 space-y-4 min-h-[120px] transition-colors duration-300
                  ${fieldSnapshot.isDraggingOver ? 'bg-emerald-500/5' : ''}
                `}
              >
                {section.fields && section.fields.length > 0 ? (
                  section.fields.map((field, fIndex) => (
                    <Draggable key={field.id} draggableId={field.id} index={fIndex}>
                      {(p, s) => (
                        <FieldItem 
                          field={field}
                          index={fIndex}
                          isActive={activeFieldId === field.id}
                          onSelect={() => onSelectField(field)}
                          onCopy={(f, e) => onCopyField(section.id, f, e)}
                          onRemove={(id, e) => onRemoveField(section.id, id, e)}
                          provided={p}
                          snapshot={s}
                        />
                      )}
                    </Draggable>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-24 border border-dashed border-slate-800 rounded-3xl bg-slate-950/20">
                    <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.2em]">Sección Vacía - Arrastra campos aquí</p>
                  </div>
                )}
                {fieldProvided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Section Footer / Quick Add */}
          <div className="px-8 py-5 bg-slate-950/20 border-t border-white/5 flex justify-center">
             <button 
                onClick={() => onAddField(section.id)}
                className="flex items-center space-x-2 text-slate-600 hover:text-emerald-500 text-[10px] font-black uppercase tracking-widest transition-all group/add"
             >
                <div className="p-1.5 rounded-lg bg-slate-900 border border-white/5 group-hover/add:border-emerald-500/30 transition-all">
                  <Plus size={12} />
                </div>
                <span>Añadir Campo a esta Sección</span>
             </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default SectionItem;
