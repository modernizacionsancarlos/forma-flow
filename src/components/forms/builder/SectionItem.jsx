import React from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { Copy, GripVertical, Plus, Trash2 } from "lucide-react";
import FieldItem from "./FieldItem";

const SectionItem = ({
  section,
  index,
  childrenFields,
  isActive,
  activeFieldId,
  onSelectSection,
  onUpdateSection,
  onRemoveSection,
  onCopySection,
  onAddField,
  onCopyField,
  onRemoveField,
  onSelectField,
  onUpdateField,
}) => {
  return (
    <Draggable draggableId={section.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          onClick={onSelectSection}
          className={`rounded-xl border bg-slate-900 transition-all ${
            isActive ? "border-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.2)]" : "border-slate-800"
          } ${snapshot.isDragging ? "rotate-[1deg] shadow-2xl" : ""}`}
        >
          <div className="flex items-start justify-between border-b border-slate-800 px-3 py-3">
            <div className="flex items-start gap-2">
              <button
                {...provided.dragHandleProps}
                onClick={(e) => e.stopPropagation()}
                className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-white"
              >
                <GripVertical size={13} />
              </button>

              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-wide text-emerald-400">Sección</div>
                <input
                  value={section.label || ""}
                  onChange={(e) => onUpdateSection(section.id, { label: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-transparent text-sm font-semibold text-white outline-none"
                  placeholder="Nombre de la sección"
                />
                <input
                  value={section.description || ""}
                  onChange={(e) => onUpdateSection(section.id, { description: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-transparent text-xs text-slate-500 outline-none placeholder:text-slate-600"
                  placeholder="No repetible"
                />
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-500">
              <button
                onClick={(e) => onCopySection(section, e)}
                className="rounded p-1 hover:bg-slate-800 hover:text-white"
              >
                <Copy size={12} />
              </button>
              <button
                onClick={(e) => onRemoveSection(section.id, e)}
                className="rounded p-1 hover:bg-slate-800 hover:text-red-400"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          <Droppable droppableId={`section:${section.id}`} type="builder-field">
            {(dropProvided, dropSnapshot) => (
              <div
                ref={dropProvided.innerRef}
                {...dropProvided.droppableProps}
                className={`space-y-3 px-3 py-3 ${dropSnapshot.isDraggingOver ? "bg-emerald-500/5" : ""}`}
              >
                {childrenFields.length ? (
                  childrenFields.map((field, fieldIndex) => (
                    <Draggable key={field.id} draggableId={field.id} index={fieldIndex}>
                      {(fieldProvided, fieldSnapshot) => (
                        <FieldItem
                          field={field}
                          isActive={activeFieldId === field.id}
                          onSelect={() => onSelectField(field)}
                          onCopy={(selectedField, event) => onCopyField(section.id, selectedField, event)}
                          onRemove={(fieldId, event) => onRemoveField(section.id, fieldId, event)}
                          onChange={(updates) => onUpdateField(field.id, updates)}
                          provided={fieldProvided}
                          snapshot={fieldSnapshot}
                        />
                      )}
                    </Draggable>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-700 bg-slate-950/60 px-4 py-6 text-center text-xs text-slate-500">
                    Arrastra campos aquí
                  </div>
                )}
                {dropProvided.placeholder}
              </div>
            )}
          </Droppable>

          <div className="border-t border-slate-800 px-3 py-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddField("text", `section:${section.id}`, null);
              }}
              className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-300 transition-colors hover:bg-emerald-500/10"
            >
              <Plus size={12} />
              Añadir campo aquí
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default SectionItem;
