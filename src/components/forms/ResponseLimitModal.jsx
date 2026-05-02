import { useEffect, useState } from "react";
import { CalendarClock, Infinity as InfinityIcon } from "lucide-react";
import { datetimeLocalToIso, isoToDatetimeLocal } from "../../lib/formSchedule";

/**
 * Límite de respuestas: cantidad máxima opcional + cierre por fecha/hora + apertura programada.
 * onSave envía objeto { response_limit, opens_at, closes_at }; los valores nulos borran agenda.
 */
const ResponseLimitModal = ({ isOpen, value, onClose, onSave }) => {
  const [draft, setDraft] = useState({
    countType: "none",
    count: 1,
    closeEnabled: false,
    closeLocal: "",
    openEnabled: false,
    openLocal: "",
  });

  /** Sincronizar borrador con props al abrir (diferido: evita setState síncrono en effect). */
  useEffect(() => {
    if (!isOpen) return;
    const rl = value?.response_limit;
    const countType = rl?.type === "count" ? "count" : "none";
    const tid = window.setTimeout(() => {
      setDraft({
        countType,
        count: Math.max(1, Number(rl?.count) || 1),
        closeEnabled: !!value?.closes_at,
        closeLocal: isoToDatetimeLocal(value?.closes_at),
        openEnabled: !!value?.opens_at,
        openLocal: isoToDatetimeLocal(value?.opens_at),
      });
    }, 0);
    return () => window.clearTimeout(tid);
  }, [isOpen, value]);

  if (!isOpen) return null;

  const handleSaveClick = () => {
    const response_limit = draft.countType === "none" ? null : { type: "count", count: Math.max(1, Number(draft.count) || 1) };

    if (draft.openEnabled && !draft.openLocal.trim()) {
      alert("Si programás la apertura, elegí fecha y hora.");
      return;
    }
    if (draft.closeEnabled && !draft.closeLocal.trim()) {
      alert("Si ponés fecha de cierre, completá fecha y hora.");
      return;
    }

    const opens_at = draft.openEnabled ? datetimeLocalToIso(draft.openLocal) : null;
    const closes_at = draft.closeEnabled ? datetimeLocalToIso(draft.closeLocal) : null;

    if (opens_at && closes_at) {
      if (new Date(opens_at) >= new Date(closes_at)) {
        alert("La apertura debe ser anterior al cierre.");
        return;
      }
    }

    onSave({
      response_limit,
      opens_at,
      closes_at,
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-slate-800 bg-slate-900 px-5 py-4">
          <InfinityIcon size={18} className="shrink-0 text-slate-500" />
          <h3 className="text-sm font-semibold text-white">Límite y calendario de respuestas</h3>
        </div>

        <div className="space-y-5 px-5 py-4">
          <label className="space-y-2">
            <span className="text-xs text-slate-300">Máximo de respuestas</span>
            <select
              value={draft.countType}
              onChange={(e) => setDraft((d) => ({ ...d, countType: e.target.value }))}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
            >
              <option value="none">Sin límite de cantidad</option>
              <option value="count">Limitar por cantidad</option>
            </select>
          </label>

          {draft.countType === "count" && (
            <label className="space-y-2">
              <span className="text-xs text-slate-300">Cantidad máxima</span>
              <input
                type="number"
                min="1"
                value={draft.count}
                onChange={(e) => setDraft((d) => ({ ...d, count: Number(e.target.value || 1) }))}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
              />
            </label>
          )}

          <hr className="border-slate-800" />

          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-800/30 p-3">
            <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-300">
              <input
                type="checkbox"
                checked={draft.closeEnabled}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    closeEnabled: e.target.checked,
                    ...(e.target.checked ? {} : { closeLocal: "" }),
                  }))
                }
                className="rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
              />
              <CalendarClock size={14} className="text-emerald-500/90" />
              Fecha y hora límite para responder (cierre automático)
            </label>
            {draft.closeEnabled && (
              <input
                type="datetime-local"
                value={draft.closeLocal}
                onChange={(e) => setDraft((d) => ({ ...d, closeLocal: e.target.value }))}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
              />
            )}
          </div>

          <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-800/30 p-3">
            <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-300">
              <input
                type="checkbox"
                checked={draft.openEnabled}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    openEnabled: e.target.checked,
                    ...(e.target.checked ? {} : { openLocal: "" }),
                  }))
                }
                className="rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
              />
              Programar apertura (pantalla de espera con cuenta regresiva)
            </label>
            {draft.openEnabled && (
              <>
                <input
                  type="datetime-local"
                  value={draft.openLocal}
                  onChange={(e) => setDraft((d) => ({ ...d, openLocal: e.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Quien entre al enlace antes de esa fecha verá el contador; al llegar el momento el formulario se abre automáticamente.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-800 px-5 py-4">
          <button type="button" onClick={onClose} className="text-sm text-slate-400 hover:text-white">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
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
