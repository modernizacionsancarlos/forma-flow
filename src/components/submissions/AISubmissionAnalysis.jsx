import React, { useState, useEffect, useCallback } from "react";
import { Sparkles, AlertCircle, CheckCircle2, Zap, BrainCircuit, MessageSquareText } from "lucide-react";
import { AnimatePresence, motion as Motion } from "framer-motion";

export default function AISubmissionAnalysis({ submission, schema }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = useCallback(() => {
    // Evitar renderizado en cascada moviendo el setState fuera del flujo síncrono del efecto
    setTimeout(() => setAnalyzing(true), 0);
    // Simulación de procesamiento de IA (Gemini)
    setTimeout(() => {
      const data = submission.data || {};
      const fieldsCount = Object.keys(data).length;
      
      // Lógica de "Simulación Inteligente" basada en los datos reales
      const hasLargeText = Object.values(data).some(v => typeof v === 'string' && v.length > 50);
      const riskScore = hasLargeText ? 15 : 5;
      const urgency = submission.status === 'pendiente' ? 85 : 40;

      setAnalysis({
        summary: `Trámite de tipo "${schema?.title || 'General'}" con ${fieldsCount} campos completados. El ciudadano solicita revisión de la documentación adjunta.`,
        urgency: urgency,
        risk: riskScore,
        flags: [
          { type: 'success', text: 'Documentación obligatoria detectada.' },
          { type: 'info', text: 'Coherencia de datos: Alta.' }
        ],
        suggestion: "Este trámite cumple con los requisitos base. Se recomienda avanzar a la fase de 'Aprobación Técnica'."
      });
      setAnalyzing(false);
    }, 1500);
  }, [submission, schema]);

  useEffect(() => {
    if (submission) {
      handleAnalyze();
    } else {
      setTimeout(() => setAnalysis(null), 0);
    }
  }, [submission, handleAnalyze]);

  if (!submission) return null;

  return (
    <div className="bg-slate-900/50 border border-emerald-500/20 rounded-2xl overflow-hidden mt-6 mb-2">
      <div className="bg-emerald-500/10 px-4 py-3 border-b border-emerald-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-400 animate-pulse" />
            <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest">Análisis por IA (Gemini)</h4>
        </div>
        {!analyzing && analysis && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Procesado</span>
            </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        <AnimatePresence mode="wait">
          {analyzing ? (
            <Motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 flex flex-col items-center justify-center gap-3"
            >
              <div className="relative">
                <BrainCircuit size={40} className="text-emerald-500/40 animate-pulse" />
                <Motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-emerald-500 rounded-full opacity-20 scale-150"
                />
              </div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Analizando expediente...</p>
            </Motion.div>
          ) : analysis ? (
            <Motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
            >
              {/* Summary */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-slate-400">
                    <MessageSquareText size={14} />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Resumen Ejecutivo</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium bg-slate-950/50 p-3 rounded-xl border border-white/5">
                    {analysis.summary}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                <MetricBox 
                    label="Urgencia" 
                    value={`${analysis.urgency}%`} 
                    icon={Zap} 
                    color="amber" 
                />
                <MetricBox 
                    label="Riesgo" 
                    value={`${analysis.risk}%`} 
                    icon={AlertCircle} 
                    color={analysis.risk > 30 ? "red" : "emerald"} 
                />
              </div>

              {/* Flags */}
              <div className="space-y-2">
                  {analysis.flags.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/5">
                          {f.type === 'success' ? <CheckCircle2 size={12} className="text-emerald-500" /> : <AlertCircle size={12} className="text-blue-500" />}
                          <span className="text-[10px] font-medium text-slate-400">{f.text}</span>
                      </div>
                  ))}
              </div>

              {/* AI Suggestion */}
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase mb-1 flex items-center gap-1">
                      <Zap size={10} /> Sugerencia de la IA
                  </p>
                  <p className="text-[11px] text-emerald-400/80 font-medium italic">
                    "{analysis.suggestion}"
                  </p>
              </div>
            </Motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MetricBox({ label, value, icon: iconProp, color }) {
    const IconComponent = iconProp;
    const colors = {
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        red: "text-red-400 bg-red-500/10 border-red-500/20",
        blue: "text-blue-400 bg-blue-500/10 border-blue-500/20"
    };
    return (
        <div className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 ${colors[color]}`}>
            <IconComponent size={14} className="opacity-70" />
            <span className="text-lg font-black tracking-tighter">{value}</span>
            <span className="text-[9px] uppercase font-bold opacity-60 tracking-widest">{label}</span>
        </div>
    );
}
