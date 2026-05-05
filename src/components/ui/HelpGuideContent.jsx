import React from "react";

/**
 * Interpreta texto de ayuda con bloques separados por líneas en blanco, listas con guión
 * o viñeta, y pasos numerados (1. 2. …) para mostrar guías didácticas en diálogos.
 */
export default function HelpGuideContent({ text, className = "" }) {
  if (!text?.trim()) {
    return (
      <p className="text-sm italic text-slate-500">
        No hay texto extendido cargado para esta sección todavía. Podés usar el menú o informar
        a sistemas para completarlo.
      </p>
    );
  }

  const blocks = text
    .trim()
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className={`space-y-4 text-left text-sm leading-relaxed text-slate-200 ${className}`}>
      {blocks.map((block, i) => (
        <HelpGuideBlock key={i} block={block} index={i} />
      ))}
    </div>
  );
}

function HelpGuideBlock({ block, index: i }) {
  const lines = block.split("\n").map((l) => l.trim());
  const nonEmpty = lines.filter(Boolean);
  if (nonEmpty.length === 0) return null;

  const allBullet = nonEmpty.every((l) => /^[-•]\s+/.test(l));
  if (nonEmpty.length >= 1 && allBullet) {
    return (
      <ul className="list-disc space-y-2 pl-5 marker:text-emerald-400/90">
        {nonEmpty.map((l, j) => (
          <li key={`${i}-${j}`} className="pl-0.5">
            {l.replace(/^[-•]\s+/, "").trim()}
          </li>
        ))}
      </ul>
    );
  }

  const allNumbered = nonEmpty.every((l) => /^\d+\.\s*/.test(l));
  if (nonEmpty.length >= 1 && allNumbered) {
    return (
      <ol className="list-decimal space-y-2 pl-5 marker:font-semibold marker:text-emerald-400/90">
        {nonEmpty.map((l, j) => (
          <li key={`${i}-${j}`} className="pl-1">
            {l.replace(/^\d+\.\s*/, "").trim()}
          </li>
        ))}
      </ol>
    );
  }

  if (nonEmpty.length === 1) {
    return <p className="whitespace-pre-line text-slate-200">{nonEmpty[0]}</p>;
  }

  return (
    <div className="space-y-2 whitespace-pre-line text-slate-200">
      {nonEmpty.map((l, j) => (
        <p key={`${i}-${j}`} className={j === 0 ? "font-medium text-slate-100" : ""}>
          {l}
        </p>
      ))}
    </div>
  );
}
