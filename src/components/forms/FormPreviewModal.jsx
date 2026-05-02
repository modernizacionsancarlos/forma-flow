import { X } from "lucide-react";

/**
 * Vista previa embebida: iframe con misma sesión Firebase (usuario logueado puede ver formularios internos).
 * La ruta del formulario añade ?preview=1 para ocultar envío en PublicForm.
 */
export default function FormPreviewModal({ formId, isOpen, basePath = "/view", onClose }) {
  if (!isOpen || !formId) return null;

  const path = `${basePath.replace(/\/$/, "")}/${encodeURIComponent(formId)}?preview=1`;
  const src = `${typeof window !== "undefined" ? window.location.origin : ""}${path}`;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-6">
      <div className="flex h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#070b16] shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-white">Vista previa</p>
            <p className="text-[11px] text-slate-500">
              Así verán el formulario (sin envío). Muestra la última versión guardada en el servidor.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
            aria-label="Cerrar vista previa"
          >
            <X size={18} />
          </button>
        </div>
        <iframe title="Vista previa del formulario" src={src} className="min-h-0 flex-1 w-full bg-slate-950" />
      </div>
    </div>
  );
}
