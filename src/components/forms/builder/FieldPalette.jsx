import { Draggable, Droppable } from "@hello-pangea/dnd";
import { GripVertical, Plus } from "lucide-react";
import { FIELD_TYPES } from "../../../constants/fieldTypes";
import { useRef } from "react";

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

const DRAG_THRESHOLD_PX = 6;

const FieldPalette = ({ onAddField, onOpenCustomField }) => {
  const availableTypes = FIELD_TYPES.filter((type) => BASE_TYPES.includes(type.id));
  const pointerStateRef = useRef({
    startX: 0,
    startY: 0,
    dragged: false,
  });

  const handlePointerDown = (event) => {
    pointerStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      dragged: false,
    };
  };

  const handlePointerMove = (event) => {
    const dx = Math.abs(event.clientX - pointerStateRef.current.startX);
    const dy = Math.abs(event.clientY - pointerStateRef.current.startY);
    if (dx > DRAG_THRESHOLD_PX || dy > DRAG_THRESHOLD_PX) {
      pointerStateRef.current.dragged = true;
    }
  };

  const handleCardClick = (typeId) => {
    if (pointerStateRef.current.dragged) return;
    onAddField(typeId, "root", null);
  };

  return (
    <div className="flex w-[14rem] shrink-0 flex-col border-r border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Campos disponibles</p>
        <p className="mt-1 text-[10px] text-slate-600">Clic o arrastra al canvas</p>
      </div>

      <Droppable droppableId="palette" type="builder-field" isDropDisabled>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="flex-1 overflow-y-auto px-2 py-3 custom-scrollbar">
            <div className="space-y-1">
              {availableTypes.map((type, index) => (
                <Draggable key={`palette-${type.id}`} draggableId={`palette-${type.id}`} index={index}>
                  {(dragProvided) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      onMouseDown={handlePointerDown}
                      onMouseMove={handlePointerMove}
                      onClick={() => handleCardClick(type.id)}
                      className="flex w-full cursor-grab items-center gap-2 rounded-lg border border-transparent px-2 py-1 text-left text-xs text-slate-300 transition-all hover:border-slate-700 hover:bg-slate-800/80 active:cursor-grabbing"
                      title="Clic para insertar o arrastra al formulario"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3 rounded-md px-1 py-1.5 text-left">
                        <type.icon size={14} className={type.color} />
                        <span className="truncate">{type.label}</span>
                      </div>
                      <div
                        className="rounded p-1 text-slate-500 hover:bg-slate-700 hover:text-white"
                        title="Arrastrar al formulario"
                      >
                        <GripVertical size={13} />
                      </div>
                    </div>
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
