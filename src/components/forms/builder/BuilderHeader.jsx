import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Infinity as InfinityIcon, Save, Settings2 } from "lucide-react";

const Toggle = ({ checked, onChange, label }) => (
  <button type="button" onClick={onChange} className="flex items-center gap-2 text-xs text-slate-300">
    <div className={`relative h-5 w-10 rounded-full transition-colors ${checked ? "bg-emerald-500" : "bg-slate-600"}`}>
      <div
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`}
      />
    </div>
    <span>{label}</span>
  </button>
);

const formatResponseLimit = (responseLimit) => {
  if (!responseLimit || responseLimit.type === "none") return "Sin límite";
  if (responseLimit.type === "count") return `${responseLimit.count || 0} respuestas`;
  if (responseLimit.type === "duration") return `${responseLimit.days || 0} días`;
  if (responseLimit.type === "datetime") return responseLimit.deadline || "Fecha definida";
  return "Sin límite";
};

const BuilderHeader = ({
  name,
  description,
  onChangeName,
  onChangeDescription,
  acceptsResponses,
  setAcceptsResponses,
  isPublic,
  setIsPublic,
  responseLimit,
  onOpenResponseLimit,
  onSave,
  saveStatus,
}) => {
  return (
    <div className="shrink-0 border-b border-slate-800 bg-slate-900">
      <div className="flex items-center justify-between gap-4 px-6 py-3">
        <div className="flex min-w-0 items-start gap-3">
          <Link to="/forms" className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white">
            <ArrowLeft size={16} />
          </Link>

          <div className="min-w-0">
            <input
              value={name}
              onChange={(e) => onChangeName(e.target.value)}
              className="w-[20rem] max-w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-slate-500"
              placeholder="Nuevo Formulario"
            />
            <input
              value={description}
              onChange={(e) => onChangeDescription(e.target.value)}
              className="mt-1 w-[24rem] max-w-full bg-transparent text-xs text-slate-500 outline-none placeholder:text-slate-600"
              placeholder="Añade una descripción..."
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-400 transition-colors hover:text-white">
            <Settings2 size={14} />
          </button>
          <button
            onClick={onSave}
            disabled={saveStatus === "saving"}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
          >
            <Save size={14} className={saveStatus === "saving" ? "animate-spin" : ""} />
            {saveStatus === "saving" ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-5 border-t border-slate-800 px-10 py-2 text-xs text-slate-400">
        <button
          type="button"
          onClick={onOpenResponseLimit}
          className="flex items-center gap-2 rounded-md px-1 py-1 transition-colors hover:text-white"
        >
          <InfinityIcon size={14} className="text-slate-500" />
          <span>Límite de respuestas:</span>
          <span className="text-white">{formatResponseLimit(responseLimit)}</span>
        </button>

        <Toggle checked={acceptsResponses} onChange={() => setAcceptsResponses((prev) => !prev)} label="Acepta Respuestas" />
        <Toggle checked={isPublic} onChange={() => setIsPublic((prev) => !prev)} label="Hacer Público" />
      </div>
    </div>
  );
};

export default BuilderHeader;
