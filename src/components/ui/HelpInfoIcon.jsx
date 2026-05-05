import React from "react";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { cn } from "@/lib/utils";

/**
 * Ícono ℹ️ pequeño con tooltip; evita propagación al padre (ej. enlaces del menú).
 */
export default function HelpInfoIcon({ title, content, className }) {
  if (!title && !content) return null;
  const text = [title, content].filter(Boolean).join(" — ");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex shrink-0 rounded-full p-0.5 text-slate-500 hover:text-emerald-400 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60",
            className,
          )}
          aria-label={`Información: ${title || "Ayuda"}`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.preventDefault()}
        >
          <Info size={14} strokeWidth={2.25} />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        className="max-w-[220px] border border-slate-700 bg-slate-900 text-slate-100 text-[11px] leading-snug px-2.5 py-2"
      >
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
