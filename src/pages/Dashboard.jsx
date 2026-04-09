import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
    FileText, Users, Building2, CheckCircle, TrendingUp, 
    Plus, ArrowUpRight, Clock, AlertCircle, BarChart3, 
    Shield, Download, GitBranch, Activity, ChevronRight 
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useGlobalStats, useRecentActivity } from "@/api/useGlobalStats";
import { useTenants } from "@/api/useTenants";

const STATUS_CONFIG = {
    draft: { label: "Borrador", bg: "bg-slate-700", text: "text-slate-300" },
    submitted: { label: "Enviado", bg: "bg-blue-900/60", text: "text-blue-300" },
    in_review: { label: "En revisión", bg: "bg-amber-900/60", text: "text-amber-300" },
    approved: { label: "Aprobado", bg: "bg-emerald-900/60", text: "text-emerald-300" },
    rejected: { label: "Rechazado", bg: "bg-red-900/60", text: "text-red-300" },
    closed: { label: "Cerrado", bg: "bg-slate-700", text: "text-slate-400" },
    // aliases
    Aprobado: { label: "Aprobado", bg: "bg-emerald-900/60", text: "text-emerald-300" },
    Rechazado: { label: "Rechazado", bg: "bg-red-900/60", text: "text-red-300" },
    pendiente: { label: "Pendiente", bg: "bg-amber-900/60", text: "text-amber-300" }
};

export default function Dashboard() {
    const { user, currentProfile } = useAuth();
    
    // Determine which tenantId to use for stats
    const isSuperAdmin = currentProfile?.role === 'super_admin';
    const effectiveTenantId = currentProfile?.tenantId || null;

    const { data: stats, isLoading: loadingStats } = useGlobalStats(effectiveTenantId);
    const { data: activityLogs, isLoading: loadingActivity } = useRecentActivity(effectiveTenantId);
    const { tenants = [] } = useTenants();

    if (loadingStats || loadingActivity) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-950">
                <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-500 text-sm">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    // Default fallbacks in case stats are null
    const usersCount = stats?.totalUsers || 0;
    const formsCount = stats?.submissionsPerForm?.length || 0; 
    const tenantsCount = stats?.totalTenants || tenants.length;
    const submissionsCount = stats?.totalSubmissions || 0;
    const activeTenants = tenants.filter(t => t.status === "active").length;
    
    const logs = activityLogs || [];

    const now = new Date();
    const greeting = now.getHours() < 12 ? "Buenos días" : now.getHours() < 18 ? "Buenas tardes" : "Buenas noches";

    return (
        <div className="min-h-screen bg-slate-950 text-white w-full">
            {/* Top Header Bar */}
            <div className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 py-4 sticky top-0 z-10 w-full animate-in slide-in-from-top duration-700">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{greeting},</p>
                        <h1 className="text-xl md:text-2xl font-bold text-white leading-tight mt-1">{user?.displayName || currentProfile?.full_name || user?.email}</h1>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Link
                            to="/forms"
                            className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-lg text-sm transition-all border border-slate-700 hover:border-slate-600 shadow-sm"
                        >
                            <FileText size={15} /> Formularios
                        </Link>
                        <Link
                            to="/forms/new"
                            className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                        >
                            <Plus size={15} /> Nuevo formulario
                        </Link>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6 mx-auto animate-in fade-in slide-in-from-bottom duration-700">

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard
                        label="Empresas activas"
                        value={activeTenants}
                        total={tenants.length}
                        icon={<Building2 size={20} />}
                        color="emerald"
                        href="/empresas"
                    />
                    <KpiCard
                        label="Plantillas activas"
                        value={formsCount}
                        total={formsCount}
                        icon={<FileText size={20} />}
                        color="blue"
                        href="/forms"
                    />
                    <KpiCard
                        label="Respuestas la última semana"
                        value={stats?.recentSubmissionsCount || 0}
                        total={submissionsCount}
                        icon={<CheckCircle size={20} />}
                        color="violet"
                        href="/submissions"
                        suffix={`de ${submissionsCount} totales`}
                    />
                    <KpiCard
                        label="Fuera de término"
                        value={stats?.overdueCount || 0}
                        total={submissionsCount}
                        icon={<AlertCircle size={20} />}
                        color={stats?.overdueCount > 0 ? "red" : "amber"}
                        href="/submissions"
                        alert={stats?.overdueCount > 0}
                    />
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* Left Column (Main Charts/Stats) */}
                    <div className="xl:col-span-2 space-y-6">
                        
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-colors shadow-lg">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
                                <h2 className="font-semibold text-white text-sm flex items-center gap-2">
                                    <TrendingUp size={16} className="text-emerald-400" />
                                    Métricas de Sistema
                                </h2>
                            </div>
                            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden group">
                                    <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10 bg-emerald-500 blur-3xl`} />
                                    <p className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-widest">Tasa de Resolución</p>
                                    <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform duration-300 origin-left">
                                      {stats?.resolutionRate || 0}%
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden group">
                                    <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10 bg-blue-500 blur-3xl`} />
                                    <p className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-widest">Tiempo Promedio</p>
                                    <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform duration-300 origin-left">
                                      {stats?.avgResolutionTime || 0}h
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Logs list */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 transition-colors">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
                                <h2 className="font-semibold text-white text-sm flex items-center gap-2">
                                    <Activity size={16} className="text-violet-400" />
                                    Actividad reciente
                                </h2>
                                <Link to="/auditoria" className="text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors font-medium">
                                    Ver auditoría completa <ChevronRight size={14} />
                                </Link>
                            </div>
                            {logs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-600">
                                    <Activity size={32} className="mb-3 opacity-30" />
                                    <p className="text-sm">Sin actividad reciente</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-800/50">
                                    {logs.slice(0, 6).map(log => (
                                        <div key={log.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-800/40 transition-colors group">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-slate-200 font-medium truncate group-hover:text-emerald-400 transition-colors">{log.title}</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Clock size={12} />
                                                <p className="text-xs font-mono">{log.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="space-y-6">

                        {/* System Summary */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors shadow-lg">
                            <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2 uppercase tracking-widest">
                                <BarChart3 size={16} className="text-slate-400" /> Resumen Global
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { label: "Usuarios activos", val: usersCount, icon: Users, color: "text-amber-400" },
                                    { label: "Plantillas Form", val: formsCount, icon: FileText, color: "text-blue-400" },
                                    { label: "Organizaciones", val: tenantsCount, icon: Building2, color: "text-emerald-400" },
                                    { label: "Trámites totales", val: submissionsCount, icon: CheckCircle, color: "text-violet-400" },
                                ].map(({ label, val, icon: Icon, color }) => (
                                    <div key={label} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`p-1.5 rounded-md bg-slate-800 ${color} group-hover:scale-110 transition-transform`}>
                                                <Icon size={14} />
                                            </div>
                                            <span className="text-sm text-slate-300 font-medium">{label}</span>
                                        </div>
                                        <span className="text-base font-bold text-white">{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        {isSuperAdmin && (
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors shadow-lg">
                            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-widest">Acceso Rápido Administrador</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Empresas", page: "empresas", icon: Building2, color: "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/10 hover:border-emerald-500/30" },
                                    { label: "Usuarios", page: "usuarios", icon: Users, color: "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/10 hover:border-amber-500/30" },
                                    { label: "Auditoría", page: "auditoria", icon: Shield, color: "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/10 hover:border-rose-500/30" },
                                    { label: "Ajustes", page: "configuracion", icon: GitBranch, color: "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/10 hover:border-cyan-500/30" },
                                ].map(({ label, page, icon: Icon, color }) => (
                                    <Link key={page} to={`/${page}`}
                                        className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl transition-all text-center group shadow-sm ${color}`}>
                                        <Icon size={20} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-bold leading-tight tracking-wide">{label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                        )}

                    </div>
                </div>

                {/* Tenant Overview Table */}
                {isSuperAdmin && tenants.length > 0 && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 transition-colors">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/50">
                            <h2 className="font-semibold text-white text-sm flex items-center gap-2">
                                <Building2 size={16} className="text-emerald-400" />
                                Organismos (Empresas) registradas
                            </h2>
                            <Link to={`/empresas`} className="text-xs font-medium text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors">
                                Gestionar <ChevronRight size={14} />
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-slate-400 text-xs border-b border-slate-800 bg-slate-950/50 uppercase tracking-widest font-semibold">
                                        <th className="text-left px-5 py-3.5">Organismo</th>
                                        <th className="text-left px-4 py-3.5 hidden md:table-cell">Plan</th>
                                        <th className="text-left px-4 py-3.5 hidden lg:table-cell">Región / Industria</th>
                                        <th className="text-left px-4 py-3.5">Estado</th>
                                        <th className="text-right px-5 py-3.5 hidden sm:table-cell">Registro</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tenants.slice(0, 5).map(t => (
                                        <tr key={t.id} className="border-b border-slate-800/50 hover:bg-slate-800/60 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-sm font-bold text-emerald-400 flex-shrink-0 shadow-sm border border-slate-700">
                                                        {(t.name || "?")[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white text-sm leading-tight group-hover:text-emerald-400 transition-colors">{t.name}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5">{t.contact_email || "—"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 hidden md:table-cell">
                                                <PlanBadge plan={t.plan} />
                                            </td>
                                            <td className="px-4 py-4 text-xs text-slate-400 hidden lg:table-cell capitalize font-medium">{t.industry || "General"}</td>
                                            <td className="px-4 py-4">
                                                <StatusDot status={t.status || 'active'} />
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-500 text-right hidden sm:table-cell font-mono">
                                                {t.created_date?.toDate ? new Date(t.created_date.toDate()).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

// ---- Sub-components ----

function KpiCard({ label, value, ...props }) {
    const { icon, color, href, suffix, alert } = props;
    const colors = {
        emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "text-emerald-400", val: "text-emerald-300", hoverbg: "hover:bg-emerald-500/20" },
        blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", icon: "text-blue-400", val: "text-blue-300", hoverbg: "hover:bg-blue-500/20" },
        violet: { bg: "bg-violet-500/10", border: "border-violet-500/20", icon: "text-violet-400", val: "text-violet-300", hoverbg: "hover:bg-violet-500/20" },
        amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", icon: "text-amber-400", val: "text-amber-300", hoverbg: "hover:bg-amber-500/20" },
        red: { bg: "bg-red-500/10", border: "border-red-500/20", icon: "text-red-400", val: "text-red-300", hoverbg: "hover:bg-red-500/20" },
    };
    const c = colors[color] || colors.emerald;
    return (
        <Link to={href} className={`group block rounded-2xl border p-5 transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-lg ${c.bg} ${c.border} ${c.hoverbg}`}>
            <div className="flex items-start justify-between mb-3">
                <div className={`${c.icon} opacity-80 group-hover:scale-110 transition-transform duration-300`}>{icon}</div>
                {alert && <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />}
                <ArrowUpRight size={14} className="text-slate-600 group-hover:text-white transition-colors" />
            </div>
            <p className={`text-4xl font-black tracking-tight ${c.val} mb-1.5`}>{value}</p>
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">{label}</p>
            {suffix && <p className="text-xs text-slate-500 mt-1 font-medium">{suffix}</p>}
        </Link>
    );
}

function PlanBadge({ plan }) {
    const map = {
        free: "bg-slate-800 text-slate-300 border-slate-700",
        starter: "bg-blue-950 text-blue-400 border-blue-900/50",
        pro: "bg-violet-950 text-violet-400 border-violet-900/50",
        enterprise: "bg-amber-950 text-amber-500 border-amber-900/50",
    };
    const st = map[plan] || "bg-slate-800 text-slate-400 border-slate-700";
    return (
        <span className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-bold border ${st}`}>
            {plan || "GRATUITO"}
        </span>
    );
}

function StatusDot({ status }) {
    const map = {
        active: { label: "Activo", cls: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]", text: "text-emerald-400" },
        suspended: { label: "Suspendido", cls: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]", text: "text-red-400" },
        pending: { label: "Pendiente", cls: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]", text: "text-amber-400" },
    };
    const s = map[status] || { label: status, cls: "bg-slate-500", text: "text-slate-400" };
    return (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${s.cls}`} />
            <span className={`text-xs font-semibold ${s.text}`}>{s.label}</span>
        </div>
    );
}
