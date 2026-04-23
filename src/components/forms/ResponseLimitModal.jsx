import { useEffect, useState } from "react";

/**
 * Modal simple para fijar límite de respuestas: sin límite o por cantidad máxima.
 * Se reutiliza en el constructor y en el listado de formularios.
 */
const ResponseLimitModal = ({ isOpen, value, onClose, onSave }) => {
  const [draft, setDraft] = useState(value || { type: "none" });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDraft(value || { type: "none" });
    }, 0);
    return () => clearTimeout(timer);
  }, [value]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="border-b border-slate-800 px-5 py-4">
          <h3 className="text-sm font-semibold text-white">Límite de respuestas</h3>
        </div>
        <div className="space-y-4 px-5 py-4">
          <label className="space-y-2">
            <span className="text-xs text-slate-300">Tipo</span>
            <select
              value={draft?.type || "none"}
              onChange={(e) => setDraft({ type: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
            >
              <option value="none">Sin límite</option>
              <option value="count">Por cantidad</option>
            </select>
          </label>

          {draft?.type === "count" && (
            <label className="space-y-2">
              <span className="text-xs text-slate-300">Cantidad máxima</span>
              <input
                type="number"
                min="1"
                value={draft.count || ""}
                onChange={(e) =>
                  setDraft((current) => ({
                    ...current,
                    count: Number(e.target.value || 0),
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
              />
            </label>
          )}
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-800 px-5 py-4">
          <button type="button" onClick={onClose} className="text-sm text-slate-400 hover:text-white">
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onSave(draft?.type === "none" ? null : draft)}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResponseLimitModal;
