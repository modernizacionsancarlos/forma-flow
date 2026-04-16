import { Draggable, Droppable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { FIELD_TYPES } from "../../../constants/fieldTypes";

const BASE_TYPES = [
  "section",
  "text",
  "textarea",
  "number",
  "date",
  "time",
  "selector",
  "multiselect",
  "radio",
  "boolean",
  "email",
  "phone",
  "image",
  "signature",
  "gps",
  "rating",
  "slider",
];

const FieldPalette = ({ onAddField, onOpenCustomField }) => {
  const availableTypes = FIELD_TYPES.filter((type) => BASE_TYPES.includes(type.id));

  return (
    <div className="flex w-[14rem] shrink-0 flex-col border-r border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Campos disponibles</p>
        <p className="mt-1 text-[10px] text-slate-600">Clic o arrastra al canvas</p>
      </div>

      <Droppable droppableId="palette" isDropDisabled>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="flex-1 overflow-y-auto px-2 py-3 custom-scrollbar">
            <div className="space-y-1">
              {availableTypes.map((type, index) => (
                <Draggable key={`palette-${type.id}`} draggableId={`palette-${type.id}`} index={index}>
                  {(dragProvided) => (
                    <button
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      onClick={() => onAddField(type.id, "root", null)}
                      className="flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-left text-xs text-slate-300 transition-all hover:border-slate-700 hover:bg-slate-800/80"
                    >
                      <type.icon size={14} className={type.color} />
                      <span>{type.label}</span>
                    </button>
                  )}
                </Draggable>
              ))}
            </div>
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="border-t border-slate-800 px-3 py-3">
        <button
          onClick={onOpenCustomField}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-500/10"
        >
          <Plus size={14} />
          Campo personalizado
        </button>
      </div>
    </div>
  );
};

export default FieldPalette;
