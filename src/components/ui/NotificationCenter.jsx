import React, { useState } from "react";
import { Bell, Check, Mail, Clock, AlertCircle, Info } from "lucide-react";
import { useNotificationInbox } from "../../context/NotificationInboxContext";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const NUEVO_MS = 48 * 60 * 60 * 1000;

function isNuevo(n) {
  if (n.read || !n.timestamp?.toMillis) return false;
  return Date.now() - n.timestamp.toMillis() < NUEVO_MS;
}

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const getIcon = () => {
    switch (notification.type) {
      case "submission":
      case "status_change":
        return <Mail className="text-blue-400" size={16} />;
      case "workflow":
        return <Clock className="text-amber-400" size={16} />;
      case "system":
        return <Info className="text-emerald-400" size={16} />;
      default:
        return <AlertCircle className="text-slate-400" size={16} />;
    }
  };

  const nuevo = isNuevo(notification);

  return (
    <div
      onClick={() => onMarkAsRead(notification.id)}
      className={`relative p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${!notification.read ? "bg-emerald-500/5" : ""}`}
    >
      {!notification.read && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-6 rounded-r-full bg-white/90 opacity-90 shadow-[0_0_8px_rgba(255,255,255,0.35)]" aria-hidden />
      )}
      <div className="flex items-start gap-3 pl-2">
        <div className="mt-1">{getIcon()}</div>
        <div className="min-w-0 flex-1 pr-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className={`text-sm truncate ${!notification.read ? "text-white font-bold" : "text-slate-300"}`}>
              {notification.title}
            </p>
            {nuevo && (
              <span className="shrink-0 rounded bg-red-600 px-1.5 py-px text-[9px] font-black uppercase tracking-wide text-white shadow">
                Nuevo
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notification.message}</p>
          <p className="text-[10px] text-slate-600 mt-2 uppercase tracking-widest font-black">
            {notification.timestamp ? formatDistanceToNow(notification.timestamp.toDate(), { addSuffix: true, locale: es }) : "Recientemente"}
          </p>
        </div>
      </div>
    </div>
  );
};

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationInbox();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-xl border border-white/5 bg-slate-800/50 p-2 transition-all hover:bg-slate-700/50 active:scale-95 group"
        aria-label={unreadCount ? `Notificaciones, ${unreadCount} sin leer` : "Notificaciones"}
      >
        <Bell size={20} className={unreadCount > 0 ? "text-white animate-pulse" : "text-slate-400 group-hover:text-white"} />
        {unreadCount > 0 && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white shadow-lg ring-2 ring-slate-900">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-50 mt-3 w-[min(100vw-2rem,20rem)] animate-in fade-in slide-in-from-top-2 overflow-hidden rounded-2xl border border-slate-800/50 bg-[#0a101b] shadow-2xl duration-200">
            <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/50 p-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Notificaciones</h3>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsRead.mutate()}
                  className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300"
                >
                  <Check size={12} />
                  <span>Marcar todo</span>
                </button>
              )}
            </div>

            <div className="custom-scrollbar max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} onMarkAsRead={(id) => markAsRead.mutate(id)} />
                ))
              ) : (
                <div className="p-12 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/5 bg-slate-800/50">
                    <Bell size={20} className="text-slate-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">No hay notificaciones</p>
                </div>
              )}
            </div>

            <div className="border-t border-white/5 bg-slate-950/50 p-3 text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Últimos avisos in-app</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
