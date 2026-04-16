import { Copy, EyeOff, GripVertical, Lock, Pencil, Trash2 } from "lucide-react";
import { FIELD_TYPES } from "../../../constants/fieldTypes";

const FieldItem = ({
  field,
  isActive,
  onSelect,
  onCopy,
  onRemove,
  onChange,
  provided,
  snapshot,
}) => {
  const { innerRef, draggableProps, dragHandleProps } = provided;
  const fieldDef = FIELD_TYPES.find((type) => type.id === field.type) || FIELD_TYPES[0];
  const Icon = fieldDef.icon;
  const canInlineEdit = fieldDef.inlineEditable;

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      onClick={onSelect}
      className={`rounded-xl border bg-slate-900/95 transition-all ${
        isActive ? "border-emerald-500 shadow-[0_0_0_1px_rgba(16,185,129,0.25)]" : "border-slate-800 hover:border-slate-700"
      } ${snapshot.isDragging ? "rotate-[1deg] shadow-2xl" : ""}`}
    >
      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <button
            {...dragHandleProps}
            onClick={(e) => e.stopPropagation()}
            className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-white"
          >
            <GripVertical size={13} />
          </button>
          <Icon size={13} className={fieldDef.color} />
          <span className="text-slate-300">{fieldDef.label}</span>
          <span className="font-medium text-white">{field.label || "Campo"}</span>
        </div>

        <div className="flex items-center gap-1 text-slate-500">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="rounded p-1 hover:bg-slate-800 hover:text-emerald-300"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={(e) => onCopy(field, e)}
            className="rounded p-1 hover:bg-slate-800 hover:text-white"
          >
            <Copy size={12} />
          </button>
          <button
            onClick={(e) => onRemove(field.id, e)}
            className="rounded p-1 hover:bg-slate-800 hover:text-red-400"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className="space-y-3 px-3 py-3">
        {canInlineEdit ? (
          <>
            <div className="grid gap-2 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-[10px] text-slate-500">Etiqueta</span>
                <input
                  value={field.label || ""}
                  onChange={(e) => onChange({ label: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[10px] text-slate-500">Valor por defecto</span>
                <input
                  value={field.default_value || ""}
                  onChange={(e) => onChange({ default_value: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                />
              </label>
            </div>

            <label className="space-y-1">
              <span className="text-[10px] text-slate-500">Placeholder</span>
              <input
                value={field.placeholder || ""}
                onChange={(e) => onChange({ placeholder: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
              />
            </label>
          </>
        ) : (
          <div className="rounded-md border border-dashed border-slate-700 bg-slate-950/60 px-3 py-3 text-center text-xs text-slate-500">
            Edita las propiedades de este campo desde el panel derecho.
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!field.required}
              onChange={(e) => onChange({ required: e.target.checked })}
              onClick={(e) => e.stopPropagation()}
              className="accent-emerald-500"
            />
            Obligatorio
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!field.readonly}
              onChange={(e) => onChange({ readonly: e.target.checked })}
              onClick={(e) => e.stopPropagation()}
              className="accent-emerald-500"
            />
            Solo lectura
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!field.hidden}
              onChange={(e) => onChange({ hidden: e.target.checked })}
              onClick={(e) => e.stopPropagation()}
              className="accent-emerald-500"
            />
            Oculto
          </label>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          {field.readonly && (
            <span className="flex items-center gap-1">
              <Lock size={11} />
              Solo lectura
            </span>
          )}
          {field.hidden && (
            <span className="flex items-center gap-1">
              <EyeOff size={11} />
              Oculto
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FieldItem;
