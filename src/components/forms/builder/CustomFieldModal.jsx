import React, { useMemo, useState } from "react";
import { X } from "lucide-react";
import { FIELD_TYPES } from "../../../constants/fieldTypes";
import { createFieldFromType } from "../../../lib/formBuilder";

const CUSTOM_MODAL_TYPES = [
  "text",
  "textarea",
  "number",
  "date",
  "datetime",
  "time",
  "selector",
  "multiselect",
  "radio",
  "boolean",
  "image",
  "signature",
  "gps",
  "email",
  "phone",
  "rating",
  "slider",
  "file",
  "barcode",
  "color",
  "url",
  "readonly_text",
  "section",
];

const VALIDATION_OPTIONS = [
  { id: "", label: "Sin validación" },
  { id: "email", label: "Correo electrónico" },
  { id: "phone", label: "Teléfono" },
  { id: "number", label: "Solo números" },
  { id: "regex", label: "Regex personalizado" },
];

const TYPE_ALIAS = {
  text: "Texto corto",
  textarea: "Texto largo",
  number: "Número",
  date: "Fecha",
  datetime: "Fecha y hora",
  time: "Hora",
  selector: "Selector (dropdown)",
  multiselect: "Selección múltiple",
  radio: "Radio buttons",
  boolean: "Sí / No (toggle)",
  image: "Imagen / Foto",
  signature: "Firma digital",
  gps: "Ubicación GPS",
  email: "Email",
  phone: "Teléfono",
  rating: "Calificación (1-5)",
  slider: "Slider numérico",
  file: "Archivo adjunto",
  barcode: "Código de barras / QR",
  color: "Color",
  url: "URL / Enlace",
  readonly_text: "Solo lectura",
  section: "Separador / Sección",
};

const FORM_TYPES = FIELD_TYPES.filter((type) => CUSTOM_MODAL_TYPES.includes(type.id));

const requiresOptions = (type) => ["selector", "multiselect", "radio"].includes(type);

const buildCustomField = (draft) => {
  const options = requiresOptions(draft.type)
    ? draft.optionsText
        .split("\n")
        .map((value) => value.trim())
        .filter(Boolean)
    : undefined;

  return createFieldFromType(draft.type, {
    label: draft.label || TYPE_ALIAS[draft.type] || "Campo personalizado",
    placeholder: draft.placeholder,
    default_value: draft.defaultValue,
    description: draft.description,
    required: draft.required,
    readonly: draft.readonly,
    hidden: draft.hidden,
    repeatable: draft.repeatable,
    add_button_text: draft.addButtonText,
    options,
    validation: draft.validationType
      ? {
          type: draft.validationType,
        }
      : null,
  });
};

const CustomFieldModal = ({ isOpen, onClose, onCreate }) => {
  const [draft, setDraft] = useState({
    type: "text",
    label: "",
    defaultValue: "",
    placeholder: "",
    description: "",
    validationType: "",
    required: false,
    readonly: false,
    hidden: false,
    repeatable: false,
    addButtonText: "",
    optionsText: "Opción 1\nOpción 2",
  });

  const selectedType = useMemo(
    () => FORM_TYPES.find((type) => type.id === draft.type) || FORM_TYPES[0],
    [draft.type]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Nuevo campo personalizado</h3>
            <p className="mt-1 text-xs text-slate-500">Configura el tipo y los atributos iniciales del campo.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-6 py-5 custom-scrollbar">
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Tipo de campo</p>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {FORM_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setDraft((current) => ({ ...current, type: type.id }))}
                    className={`rounded-lg border px-3 py-2 text-left text-[11px] transition-all ${
                      draft.type === type.id
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                        : "border-slate-700 bg-slate-800/80 text-slate-300 hover:border-slate-500"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <type.icon size={14} className={type.color} />
                      <span>{TYPE_ALIAS[type.id] || type.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[11px] font-medium text-slate-300">Etiqueta *</span>
                <input
                  value={draft.label}
                  onChange={(e) => setDraft((current) => ({ ...current, label: e.target.value }))}
                  placeholder="Nombre del campo"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500"
                />
              </label>
              <label className="space-y-2">
                <span className="text-[11px] font-medium text-slate-300">Valor por defecto</span>
                <input
                  value={draft.defaultValue}
                  onChange={(e) => setDraft((current) => ({ ...current, defaultValue: e.target.value }))}
                  placeholder="Opcional"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500"
                />
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-[11px] font-medium text-slate-300">Texto de ayuda / placeholder</span>
              <input
                value={draft.placeholder}
                onChange={(e) => setDraft((current) => ({ ...current, placeholder: e.target.value }))}
                placeholder="Ej: Escribe aquí..."
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500"
              />
            </label>

            <label className="space-y-2">
              <span className="text-[11px] font-medium text-slate-300">Descripción / instrucciones</span>
              <textarea
                value={draft.description}
                onChange={(e) => setDraft((current) => ({ ...current, description: e.target.value }))}
                placeholder="Instrucciones adicionales para el usuario"
                rows={3}
                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500"
              />
            </label>

            {requiresOptions(draft.type) && (
              <label className="space-y-2">
                <span className="text-[11px] font-medium text-slate-300">Opciones</span>
                <textarea
                  value={draft.optionsText}
                  onChange={(e) => setDraft((current) => ({ ...current, optionsText: e.target.value }))}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-500">Una opción por línea.</span>
              </label>
            )}

            {draft.type === "section" && (
              <label className="space-y-2">
                <span className="text-[11px] font-medium text-slate-300">Texto del botón para repetir</span>
                <input
                  value={draft.addButtonText}
                  onChange={(e) => setDraft((current) => ({ ...current, addButtonText: e.target.value }))}
                  placeholder="Ej: Agregar ítem"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500"
                />
              </label>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[11px] font-medium text-slate-300">Validación</span>
                <select
                  value={draft.validationType}
                  onChange={(e) => setDraft((current) => ({ ...current, validationType: e.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-emerald-500"
                >
                  {VALIDATION_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="space-y-2">
                <span className="text-[11px] font-medium text-slate-300">Vista previa</span>
                <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-400">
                  {selectedType.label}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-medium text-slate-300">Opciones</p>
              <div className="grid gap-2 md:grid-cols-3">
                {[
                  { key: "required", label: "Obligatorio" },
                  { key: "readonly", label: "Solo lectura" },
                  { key: "hidden", label: "Campo oculto" },
                  { key: "repeatable", label: "Múltiple selección", enabled: draft.type === "multiselect" || draft.type === "section" },
                ].map((option) => {
                  const isEnabled = option.enabled ?? true;
                  return (
                    <label
                      key={option.key}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                        isEnabled ? "border-slate-700 bg-slate-800 text-slate-300" : "border-slate-800 bg-slate-800/40 text-slate-600"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!draft[option.key]}
                        disabled={!isEnabled}
                        onChange={(e) => setDraft((current) => ({ ...current, [option.key]: e.target.checked }))}
                        className="accent-emerald-500"
                      />
                      {option.label}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-800 px-6 py-4">
          <button onClick={onClose} className="text-sm text-slate-400 transition-colors hover:text-white">
            Cancelar
          </button>
          <button
            onClick={() => {
              onCreate(buildCustomField(draft));
              onClose();
            }}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
          >
            Agregar campo
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomFieldModal;
