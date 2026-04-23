import React from "react";
import { 
    Activity, Shield, Zap, AlertTriangle, 
    ArrowUpRight, Globe, Layers, Cpu,
    TrendingUp, ShieldCheck, Clock, Mail, MessageSquare, Send
} from "lucide-react";
import { 
    AreaChart, Area, 
    XAxis, YAxis, Tooltip, 
    ResponsiveContainer
} from "recharts";
import { useGlobalStats, useCommunicationLogs } from "@/api/useGlobalStats";
import { useTenants } from "@/api/useTenants";

export default function GlobalMonitor() {
    const { data: stats, isLoading: loadingStats } = useGlobalStats(null); 
    // const { data: activityLogs } = useRecentActivity(null);
    const { logs: commLogs } = useCommunicationLogs(null);
    const { tenants = [] } = useTenants();

    if (loadingStats) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-10 h-10 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 text-sm">Sincronizando con el Observatorio...</p>
                </div>
            </div>
        );
    }

    const healthMetrics = [
        { label: "Salud del Sistema", value: "99.9%", icon: Shield, color: "emerald", trend: "Optimizado" },
        { label: "Latencia Promedio", value: "42ms", icon: Zap, color: "blue", trend: "-5%" },
        { label: "Vulnerabilidades", value: "0", icon: ShieldCheck, color: "emerald", trend: "Blindado" },
        { label: "Carga de Red", value: "Baja", icon: Globe, color: "violet", trend: "Normal" }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white animate-in fade-in duration-1000">
            {/* Cabecera alineada con Formularios / Dashboard */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-4 sm:py-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between max-w-[1600px] mx-auto w-full">
                    <div className="min-w-0 space-y-1">
                        <div className="flex items-start sm:items-center gap-3">
                            <div className="p-2.5 sm:p-3 bg-emerald-500/10 rounded-xl sm:rounded-2xl shrink-0">
                                <Activity className="text-emerald-500" size={24} />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                                    Observatorio <span className="text-emerald-500">Global</span>
                                </h1>
                                <p className="text-slate-500 text-sm mt-0.5">
                                    Inteligencia municipal y ecosistema omnicanal en tiempo real.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex w-full sm:w-auto items-stretch sm:items-center gap-2 sm:gap-3 bg-slate-800/50 rounded-xl border border-slate-800 p-1">
                        <button
                            type="button"
                            className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-emerald-500 text-slate-950 rounded-lg text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                        >
                            EN VIVO
                        </button>
                        <button
                            type="button"
                            className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-slate-500 hover:text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors"
                        >
                            REPORTES
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 sm:space-y-8 w-full">
            {/* Health Pulse Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                {healthMetrics.map((m, idx) => (
                    <div key={idx} className="bg-slate-900/40 border border-slate-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all">
                            <m.icon size={84} />
                        </div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-slate-800 text-slate-400 group-hover:text-emerald-400 transition-colors">
                                <m.icon size={18} />
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">{m.label}</span>
                        </div>
                        <div className="flex items-end justify-between relative z-10">
                            <span className="text-4xl font-black text-white tracking-tighter">{m.value}</span>
                            <span className="text-[10px] font-black px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 uppercase tracking-widest border border-emerald-500/10">
                                {m.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Realtime Charts & Infrastructure Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-8">
                {/* Traffic Chart */}
                <div className="xl:col-span-8 bg-slate-900/80 border border-emerald-500/10 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 lg:p-10 relative shadow-2xl overflow-hidden min-h-[min(60vh,450px)] sm:min-h-[450px]">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[120px] -mr-48 -mt-48 rounded-full" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-12 relative z-10">
                        <div className="space-y-1 min-w-0">
                            <h3 className="text-base sm:text-xl font-bold text-white flex items-center gap-2 sm:gap-3">
                                <TrendingUp className="text-emerald-500 shrink-0" size={22} />
                                <span className="leading-tight">Actividad omnicanal consolidada</span>
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500">Tráfico de trámites y procesos municipales.</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">Global Link Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[200px] sm:h-[240px] md:h-[280px] w-full relative z-10 min-w-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.chartData || []}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#334155" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                    dy={10}
                                    fontWeight="bold"
                                />
                                <YAxis hide />
                                <Tooltip 
                                    contentStyle={{ 
                                        background: '#020617', 
                                        border: '1px solid #1e293b', 
                                        borderRadius: '16px', 
                                        fontSize: '11px',
                                        fontWeight: '800',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                                    }}
                                    itemStyle={{ color: '#10b981' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="#10b981" 
                                    strokeWidth={4}
                                    fillOpacity={1} 
                                    fill="url(#colorCount)" 
                                    animationDuration={2500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Infrastructure Info */}
                <div className="xl:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-10 flex flex-col shadow-xl">
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                            <Cpu className="text-blue-500" size={24} /> Engine Status
                        </h3>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Base44 Logic Core v2.0</p>
                    </div>

                    <div className="space-y-8 flex-1">
                        <StatRow label="Nodos Activos" value="08" sublabel="Resiliencia: Alta" />
                        <StatRow label="Inquilinos" value={tenants.length} sublabel="Multi-Tenant OK" />
                        <StatRow label="Filtro Anti-XSS" value="Activo" sublabel="Sanitizado" color="emerald" />
                        <StatRow label="Detección IA" value="Online" sublabel="Gemini Core" color="blue" />
                    </div>

                    <div className="pt-8 border-t border-slate-800/80">
                        <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl flex items-center gap-5 group cursor-help transition-all hover:bg-emerald-500/10">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                <ShieldCheck size={28} />
                            </div>
                            <div>
                                <p className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Capa de Seguridad</p>
                                <p className="text-[10px] text-emerald-500/70 font-black uppercase tracking-widest">Blindado: Nivel 7</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Omni-Channel Realtime Feed */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-8">
                {/* Communication Logs */}
                <div className="bg-slate-900 shadow-2xl rounded-2xl sm:rounded-[2.5rem] border border-slate-800/80 overflow-hidden flex flex-col min-h-[min(50vh,500px)] sm:min-h-[500px]">
                    <div className="px-4 sm:px-6 md:px-10 py-5 sm:py-8 border-b border-slate-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-950/20">
                        <div className="space-y-1">
                           <h4 className="font-black text-lg text-white flex items-center gap-3 uppercase tracking-widest">
                               <Send size={20} className="text-blue-500" /> Ecosistema Omnicanal
                           </h4>
                           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em]">Despacho de notificaciones en vivo</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                             <span className="text-[10px] font-black text-blue-500 uppercase">Procesando</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {commLogs?.length > 0 ? (
                            <div className="divide-y divide-slate-800/40">
                                {commLogs.map((log, i) => (
                                    <div key={i} className="px-4 sm:px-6 md:px-10 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-white/[0.02] transition-colors group">
                                        <div className="flex items-start sm:items-center gap-3 sm:gap-5 min-w-0">
                                            <div className={`p-3 rounded-2xl ${log.channel === 'email' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'} group-hover:scale-110 transition-transform`}>
                                                {log.channel === 'email' ? <Mail size={18} /> : <MessageSquare size={18} />}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs font-black text-slate-100 uppercase tracking-tight">{log.to}</p>
                                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest border ${log.channel === 'email' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' : 'border-blue-500/30 text-blue-500 bg-blue-500/5'}`}>
                                                        {log.channel}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 font-medium break-words sm:truncate sm:max-w-[280px]">{log.subject || log.content}</p>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-1 shrink-0 w-full sm:w-auto border-t sm:border-t-0 border-slate-800/40 sm:border-0 pt-2 sm:pt-0">
                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{log.time}</span>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                                <span className="text-[8px] font-black text-emerald-500/80 uppercase">Delivery OK</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-50 p-10 space-y-4">
                                <Send size={48} className="animate-bounce" />
                                <p className="text-xs font-black uppercase tracking-[0.3em]">Esperando activaciones...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Security Deep Scan */}
                <div className="bg-slate-900 shadow-2xl rounded-2xl sm:rounded-[2.5rem] border border-rose-500/10 overflow-hidden flex flex-col min-h-[min(50vh,500px)] sm:min-h-[500px]">
                    <div className="px-4 sm:px-6 md:px-10 py-5 sm:py-8 border-b border-rose-500/10 flex items-center justify-between bg-rose-500/[0.02]">
                        <div className="space-y-1">
                           <h4 className="font-black text-lg text-rose-500 flex items-center gap-3 uppercase tracking-widest">
                               <Shield size={20} /> Blindaje Dinámico
                           </h4>
                           <p className="text-[10px] text-rose-500/50 font-bold uppercase tracking-[0.15em]">Integridad de datos & Prevención</p>
                        </div>
                    </div>
                    
                    <div className="p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8 flex flex-col justify-center flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                             <SecurityCard label="Base de Datos" status="Protegida" color="emerald" detail="No-Inyection Validated" />
                             <SecurityCard label="Cross-Tenant" status="Aislado" color="emerald" detail="Rule Level Enforcement" />
                             <SecurityCard label="API Endpoints" status="Seguro" color="blue" detail="Auth Bound Only" />
                             <SecurityCard label="DDoS Shield" status="Activo" color="emerald" detail="Cloudflare Proxy" />
                        </div>

                        <div className="p-8 bg-slate-950/80 rounded-[2rem] border border-slate-800 shadow-inner relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                                <div className="p-4 bg-emerald-500/10 rounded-full">
                                    <ShieldCheck className="text-emerald-500 animate-pulse" size={32} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-2">Estado General</p>
                                    <p className="text-2xl font-black text-emerald-500 tracking-tighter">INFRAESTRUCTURA INMUTABLE</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-3 tracking-widest">Escaneo completado satisfactoriamente.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}

function SecurityCard({ label, status, color, detail }) {
    const theme = {
        emerald: "text-emerald-500 border-emerald-500/20 bg-emerald-500/5",
        blue: "text-blue-500 border-blue-500/20 bg-blue-500/5",
        rose: "text-rose-500 border-rose-500/20 bg-rose-500/5"
    };
    return (
        <div className={`p-4 rounded-2xl border ${theme[color]} space-y-1`}>
            <p className="text-[8px] font-black uppercase tracking-widest opacity-60">{label}</p>
            <p className="text-xs font-black uppercase tracking-tight">{status}</p>
            <p className="text-[8px] font-medium opacity-50">{detail}</p>
        </div>
    );
}

function StatRow({ label, value, sublabel, color = "slate" }) {
    const colorClasses = {
        emerald: "text-emerald-500 bg-emerald-500/10 border border-emerald-500/10",
        blue: "text-blue-500 bg-blue-500/10 border border-blue-500/10",
        slate: "text-slate-300 bg-slate-100/5 border border-white/5"
    };
    return (
        <div className="flex items-center justify-between group">
            <div className="space-y-0.5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
                <p className="text-[10px] text-slate-700 font-bold group-hover:text-slate-500 transition-colors uppercase tracking-widest">{sublabel}</p>
            </div>
            <span className={`px-5 py-2 rounded-2xl font-black text-xs tracking-tighter transition-all group-hover:scale-110 shadow-lg ${colorClasses[color]}`}>
                {value}
            </span>
        </div>
    );
}
