import React from "react";
import { CheckCircle2, Clock, AlertCircle, Archive, MessageSquare, User, Shield } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const EVENT_CONFIG = {
  submitted: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    label: "Enviado"
  },
  status_change: {
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    label: "Cambio de Estado"
  },
  comment: {
    icon: MessageSquare,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    label: "Observación"
  },
  archived: {
    icon: Archive,
    color: "text-slate-500",
    bg: "bg-slate-500/10",
    label: "Archivado"
  },
  default: {
    icon: Shield,
    color: "text-slate-400",
    bg: "bg-slate-400/5",
    label: "Evento"
  }
};

const AuditTimeline = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <div className="p-8 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center space-y-3">
        <Clock size={24} className="text-slate-700" />
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Sin historial de eventos</p>
      </div>
    );
  }

  // Sort history by timestamp descending (newest first)
  const sortedHistory = [...history].sort((a, b) => {
    const tA = a.timestamp?.toMillis ? a.timestamp.toMillis() : (a.timestamp || 0);
    const tB = b.timestamp?.toMillis ? b.timestamp.toMillis() : (b.timestamp || 0);
    return tB - tA;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center space-x-3">
          <Clock size={14} />
          <span>Línea de Tiempo Operativa</span>
        </h4>
        <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.2em]">{history.length} Eventos</span>
      </div>

      <div className="relative space-y-4 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-slate-800 before:via-slate-800/20 before:to-transparent">
        {sortedHistory.map((event, idx) => {
          const config = EVENT_CONFIG[event.type] || EVENT_CONFIG.default;
          const Icon = config.icon;
          const date = event.timestamp?.toDate ? event.timestamp.toDate() : new Date(event.timestamp);
          
          return (
            <div key={idx} className="relative pl-12 group">
              {/* Timeline Indicator */}
              <div className={`absolute left-0 top-1 w-10 h-10 rounded-2xl ${config.bg} border border-slate-800 flex items-center justify-center z-10 transition-transform group-hover:scale-110`}>
                <Icon size={16} className={config.color} />
              </div>

              {/* Event Content */}
              <div className="flex flex-col space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-tighter ${config.color}`}>
                    {event.type === 'status_change' ? `Estado: ${event.status}` : config.label}
                  </span>
                  <span className="text-[9px] text-slate-500 font-medium tracking-tight">
                    {format(date, "HH:mm 'hs' · d MMM", { locale: es })}
                  </span>
                </div>
                
                {event.note && (
                  <p className="text-xs text-slate-400 font-medium leading-relaxed bg-slate-950/40 p-3 rounded-2xl border border-slate-900 shadow-inner">
                    {event.note}
                  </p>
                )}

                <div className="flex items-center space-x-2">
                  <User size={10} className="text-slate-700" />
                  <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">
                    {event.by_user_email || "Anonimo"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AuditTimeline;
