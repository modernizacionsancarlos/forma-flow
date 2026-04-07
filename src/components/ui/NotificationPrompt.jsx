import React, { useState, useEffect } from "react";
import { Bell, X, ShieldAlert, CheckCircle2, Loader2 } from "lucide-react";
import { useNotifications } from "../../lib/useNotifications";
import { useAuth } from "../../lib/AuthContext";

const NotificationPrompt = () => {
    const { currentUser } = useAuth();
    const { permission, requestPermission, loading } = useNotifications(currentUser);
    const [isVisible, setIsVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    const showCondition = permission === "default" && !dismissed && currentUser;

    useEffect(() => {
        let timer;
        if (showCondition) {
            timer = setTimeout(() => setIsVisible(true), 2000);
        }
        return () => clearTimeout(timer);
    }, [showCondition]);

    if (!showCondition || !isVisible) return null;

    const handleEnable = async () => {
        await requestPermission();
        // El hook actualizará el estado de 'permission'
    };

    const handleDismiss = () => {
        setIsVisible(false);
        setDismissed(true);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-xl animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 md:gap-6">
                <div className="hidden md:flex w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-500 items-center justify-center shrink-0 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <Bell size={24} className="animate-pulse" />
                </div>
                
                <div className="flex-1">
                    <h3 className="text-sm font-black text-white uppercase tracking-tighter mb-1 flex items-center gap-2">
                        <span className="md:hidden"><Bell size={16} className="text-emerald-500" /></span>
                        Mantente Actualizado
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                        Activa las notificaciones para recibir alertas sobre nuevos formularios, aprobaciones y actualizaciones de tu municipio.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch gap-2 shrink-0">
                    <button 
                        onClick={handleEnable}
                        disabled={loading}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                        <span>Activar</span>
                    </button>
                    <button 
                        onClick={handleDismiss}
                        className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-white/5"
                    >
                        Luego
                    </button>
                </div>

                <button 
                    onClick={handleDismiss}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-slate-950 border border-white/10 rounded-full flex items-center justify-center text-slate-500 hover:text-white transition-colors shadow-lg"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};

export default NotificationPrompt;
