import React from "react";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { cn } from "@/lib/utils";
import { resolveHelp } from "@/lib/appHelpRegistry";

/**
 * ℹ️ con tooltip; disparador tipo span para poder colocarlo junto a &lt;button&gt; sin anidar otro botón.
 */
export default function HelpInfoIcon({ helpSection, title, content, className }) {
  let tip = "";
  if (helpSection) {
    const h = resolveHelp(helpSection);
    tip = [h.tooltip, h.what].filter(Boolean).join("\n\n");
  } else {
    tip = [title, content].filter(Boolean).join(" — ");
  }
  if (!tip) return null;

  const hMeta = helpSection ? resolveHelp(helpSection) : null;
  const label = hMeta?.tooltip?.slice?.(0, 80) || title || "Información contextual";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex shrink-0 cursor-help rounded-full p-0.5 text-slate-500 outline-none hover:bg-white/5 hover:text-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500/60",
            className,
          )}
          role="img"
          aria-label={`Información: ${label}`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.preventDefault()}
        >
          <Info size={14} strokeWidth={2.25} />
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        className="max-w-[260px] whitespace-pre-line border border-slate-700 bg-slate-900 px-3 py-2 text-[11px] leading-snug text-slate-100"
      >
        {tip}
      </TooltipContent>
    </Tooltip>
  );
}
