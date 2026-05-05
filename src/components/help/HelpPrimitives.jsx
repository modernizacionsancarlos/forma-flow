import React from "react";
import { cn } from "@/lib/utils";
import HelpInfoIcon from "@/components/ui/HelpInfoIcon";

/**
 * Título de sección con ℹ️ y zona de clic derecho.
 */
export function SectionTitle({ children, helpSection, className, right }) {
  return (
    <div data-help-section={helpSection} className={cn("flex items-center gap-2 flex-wrap min-w-0", className)}>
      {children}
      {helpSection && <HelpInfoIcon helpSection={helpSection} />}
      {right ? <span className="ml-auto shrink-0 flex items-center gap-2">{right}</span> : null}
    </div>
  );
}

/**
 * Ícono flotante al costado derecho fuera del &lt;button&gt; para no anidar interactivos.
 */
export function HelpAside({ section, reserve = "pr-10", children, className }) {
  return (
    <div data-help-section={section} className={cn("relative w-full", className)}>
      <div className={cn(reserve)}>{children}</div>
      <div className="absolute right-3 top-1/2 z-10 -translate-y-1/2">
        <HelpInfoIcon helpSection={section} className="text-slate-400 hover:text-emerald-400" />
      </div>
    </div>
  );
}

/**
 * Agrupa botón/enlace nativo + ℹ️ alineados (dos nodos hermanos).
 */
export function ActionWithTooltip({ section, gap = "gap-1.5", className, children }) {
  return (
    <span data-help-section={section} className={cn("inline-flex items-center", gap, className)}>
      {children}
      <HelpInfoIcon helpSection={section} />
    </span>
  );
}
