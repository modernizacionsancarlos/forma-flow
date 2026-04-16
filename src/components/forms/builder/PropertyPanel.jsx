import React from "react";
import { Settings2 } from "lucide-react";

const VISIBILITY_OPTIONS = [
  { id: "always", label: "Siempre visible" },
  { id: "conditional", label: "Condicional" },
  { id: "hidden", label: "Oculto por defecto" },
];

const PropertyPanel = ({ activeField, allFields, onUpdate }) => {
  if (!activeField) {
    return (
      <div className="flex w-[17rem] shrink-0 flex-col border-l border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 px-4 py-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
            <Settings2 size={14} />
            Propiedades del campo
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 text-center text-xs text-slate-600">
          Selecciona un campo o sección para editar sus propiedades.
        </div>
      </div>
    );
  }

  const otherFields = allFields.filter((field) => field.id !== activeField.id);

  return (
    <div className="flex w-[17rem] shrink-0 flex-col border-l border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 px-4 py-3">
        <div className="text-xs uppercase tracking-wide text-slate-400">Propiedades del campo</div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 custom-scrollbar">
        <label className="space-y-2">
          <span className="text-[11px] text-slate-300">Etiqueta</span>
          <input
            value={activeField.label || ""}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500"
          />
        </label>

        {(activeField.type === "text" ||
          activeField.type === "textarea" ||
          activeField.type === "number" ||
          activeField.type === "email" ||
          activeField.type === "phone" ||
          activeField.type === "barcode" ||
          activeField.type === "url") && (
          <label className="space-y-2">
            <span className="text-[11px] text-slate-300">Placeholder</span>
            <input
              value={activeField.placeholder || ""}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500"
            />
          </label>
        )}

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={!!activeField.required}
            onChange={(e) => onUpdate({ required: e.target.checked })}
            className="accent-emerald-500"
          />
          Campo obligatorio
        </label>

        <label className="space-y-2">
          <span className="text-[11px] text-slate-300">Lógica Condicional</span>
          <select
            value={activeField.conditional?.mode || "always"}
            onChange={(e) =>
              onUpdate({
                conditional:
                  e.target.value === "always"
                    ? null
                    : {
                        mode: e.target.value,
                        field_id: activeField.conditional?.field_id || "",
                        value: activeField.conditional?.value || "",
                      },
              })
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500"
          >
            {VISIBILITY_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {activeField.conditional?.mode === "conditional" && (
          <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
            <select
              value={activeField.conditional?.field_id || ""}
              onChange={(e) =>
                onUpdate({
                  conditional: { ...activeField.conditional, field_id: e.target.value },
                })
              }
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
            >
              <option value="">Selecciona un campo</option>
              {otherFields.map((field) => (
                <option key={field.id} value={field.id}>
                  {field.label || field.id}
                </option>
              ))}
            </select>
            <input
              value={activeField.conditional?.value || ""}
              onChange={(e) =>
                onUpdate({
                  conditional: { ...activeField.conditional, value: e.target.value },
                })
              }
              placeholder="Valor esperado"
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>
        )}

        {activeField.type === "section" && (
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={!!activeField.repeatable}
              onChange={(e) => onUpdate({ repeatable: e.target.checked })}
              className="accent-emerald-500"
            />
            Sección repetible
          </label>
        )}

        {(activeField.type === "selector" || activeField.type === "multiselect" || activeField.type === "radio") && (
          <label className="space-y-2">
            <span className="text-[11px] text-slate-300">Opciones</span>
            <textarea
              value={(activeField.options || []).join("\n")}
              onChange={(e) =>
                onUpdate({
                  options: e.target.value
                    .split("\n")
                    .map((value) => value.trim())
                    .filter(Boolean),
                })
              }
              rows={5}
              className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500"
            />
          </label>
        )}

        <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-500">
          <div>ID Field: {activeField.id}</div>
          <div>Tipo: {activeField.type}</div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPanel;
