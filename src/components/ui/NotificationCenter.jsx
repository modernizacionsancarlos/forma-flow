import React, { useState } from "react";
import { Bell, Check, Trash2, Clock, AlertCircle, Info, Mail } from "lucide-react";
import { useNotifications } from "../../api/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const getIcon = () => {
    switch (notification.type) {
      case "submission": return <Mail className="text-blue-400" size={16} />;
      case "workflow": return <Clock className="text-amber-400" size={16} />;
      case "system": return <Info className="text-emerald-400" size={16} />;
      default: return <AlertCircle className="text-slate-400" size={16} />;
    }
  };

  return (
    <div 
      onClick={() => onMarkAsRead(notification.id)}
      className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer relative group ${!notification.read ? 'bg-emerald-500/5' : ''}`}
    >
      {!notification.read && (
        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
      )}
      <div className="flex items-start space-x-3">
        <div className="mt-1">{getIcon()}</div>
        <div className="flex-1">
          <p className={`text-sm ${!notification.read ? 'text-white font-bold' : 'text-slate-300'}`}>
            {notification.title}
          </p>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-[10px] text-slate-600 mt-2 uppercase tracking-widest font-black">
            {notification.timestamp ? formatDistanceToNow(notification.timestamp.toDate(), { addSuffix: true, locale: es }) : "Recientemente"}
          </p>
        </div>
      </div>
    </div>
  );
};

const NotificationCenter = ({ primaryColor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-800/50 border border-white/5 hover:bg-slate-700/50 transition-all active:scale-95 group"
      >
        <Bell size={20} className={unreadCount > 0 ? "text-white animate-pulse" : "text-slate-400 group-hover:text-white"} />
        {unreadCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-black text-white rounded-full shadow-lg px-1"
            style={{ backgroundColor: primaryColor }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 w-80 bg-[#0a101b] border border-slate-800/50 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Notificaciones</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllAsRead.mutate()}
                  className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-wider flex items-center space-x-1"
                >
                  <Check size={12} />
                  <span>Marcar todo</span>
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    onMarkAsRead={(id) => markAsRead.mutate(id)}
                  />
                ))
              ) : (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4 border border-white/5">
                    <Bell size={20} className="text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-500 font-medium">No hay notificaciones</p>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-950/50 border-t border-white/5 text-center">
               <button className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">
                 Ver todo el historial
               </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
