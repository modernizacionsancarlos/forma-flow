import React, { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { HelpCircle, Target, Wrench } from "lucide-react";
import { NAV_HELP } from "@/lib/navHelpContent";

/**
 * Clic derecho en el layout: menú propio (no el del navegador) con entradas de ayuda.
 */
export default function ContextHelpLayer({ children }) {
  const [menu, setMenu] = useState(null);
  const [dialog, setDialog] = useState(null);

  const closeMenu = useCallback(() => setMenu(null), []);

  const openDialog = useCallback((sectionKey, mode) => {
    const key = sectionKey && NAV_HELP[sectionKey] ? sectionKey : "general";
    const copy = NAV_HELP[key];
    const titles = {
      what: "¿Qué es?",
      purpose: "¿Para qué sirve?",
      how: "¿Cómo se usa?",
    };
    const bodies = {
      what: copy.what,
      purpose: copy.purpose,
      how: copy.how,
    };
    setMenu(null);
    setDialog({ title: titles[mode], body: bodies[mode] });
  }, []);

  const onContextMenu = useCallback(
    (e) => {
      const el = e.target;
      if (el.closest("[data-no-context-help]")) return;
      if (el.closest("input, textarea, select, [contenteditable='true']")) return;
      e.preventDefault();
      const section = el.closest("[data-help-section]");
      const key = section?.getAttribute("data-help-section") || "general";
      setMenu({ x: e.clientX, y: e.clientY, sectionKey: key });
    },
    [],
  );

  useEffect(() => {
    if (!menu) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeMenu();
    };
    const onClick = () => closeMenu();
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, [menu, closeMenu]);

  const menuContent =
    menu &&
    createPortal(
      <div
        className="fixed z-[200] min-w-[200px] rounded-xl border border-slate-700 bg-[#0b1726] py-1 shadow-2xl text-left"
        style={{ left: menu.x, top: menu.y }}
        role="menu"
        onClick={(e) => e.stopPropagation()}
      >
        <ContextRow
          icon={<HelpCircle size={14} />}
          label="¿Qué es?"
          onClick={() => openDialog(menu.sectionKey, "what")}
        />
        <ContextRow
          icon={<Target size={14} />}
          label="¿Para qué sirve?"
          onClick={() => openDialog(menu.sectionKey, "purpose")}
        />
        <ContextRow
          icon={<Wrench size={14} />}
          label="¿Cómo se usa?"
          onClick={() => openDialog(menu.sectionKey, "how")}
        />
        <div className="my-1 h-px bg-slate-800" />
        <ContextRow icon={<HelpCircle size={14} />} label="Ocultar menú" onClick={closeMenu} />
      </div>,
      document.body,
    );

  const dialogPortal =
    dialog &&
    createPortal(
      <div
        className="fixed inset-0 z-[210] flex items-center justify-center bg-black/60 p-4"
        role="dialog"
        aria-modal
        onClick={() => setDialog(null)}
      >
        <div
          className="max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-base font-semibold text-white">{dialog.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{dialog.body}</p>
          <button
            type="button"
            className="mt-5 w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-500"
            onClick={() => setDialog(null)}
          >
            Entendido
          </button>
        </div>
      </div>,
      document.body,
    );

  return (
    <div className="contents" onContextMenu={onContextMenu}>
      {children}
      {menuContent}
      {dialogPortal}
    </div>
  );
}

function ContextRow({ icon, label, onClick }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-200 hover:bg-white/10"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      <span className="text-emerald-400">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
