import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
    Building2, FileText, ClipboardList, Users, Download,
    Shield, Plus, Clock, Zap, Activity, GitBranch
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useGlobalStats, useRecentActivity } from "@/api/useGlobalStats";
import { useTenants } from "@/api/useTenants";
import { useForms } from "@/api/useForms";
import { useUsers } from "@/api/useUsers";
import { useDashboardSubmissions } from "@/api/useDashboardSubmissions";

/* ── Status badge config ──────────────────────────────────────────── */
const STATUS = {
    draft:     { label: "Borrador",     cls: "bg-slate-700 text-slate-300" },
    submitted: { label: "Enviado",      cls: "bg-blue-900 text-blue-300" },
    in_review: { label: "En revisión",  cls: "bg-amber-900 text-amber-300" },
    approved:  { label: "Aprobado",     cls: "bg-emerald-900 text-emerald-300" },
    rejected:  { label: "Rechazado",    cls: "bg-red-900 text-red-300" },
    closed:    { label: "Cerrado",      cls: "bg-slate-800 text-slate-500" },
    pending_review: { label: "Pendiente", cls: "bg-amber-900 text-amber-300" },
};

const PLAN_COLORS = {
    free:       "bg-slate-700 text-slate-300",
    starter:    "bg-blue-900 text-blue-300",
    pro:        "bg-violet-900 text-violet-300",
    enterprise: "bg-amber-900 text-amber-300",
};

/* ══════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
    const { currentProfile } = useAuth();

    const isSuperAdmin = currentProfile?.role === "super_admin";
    const effectiveTenantId = isSuperAdmin ? null : (currentProfile?.tenantId || null);

    const { data: stats, isLoading: loadingStats } = useGlobalStats(effectiveTenantId);
    const { data: activityLogs, isLoading: loadingActivity } = useRecentActivity(effectiveTenantId);
    const { tenants = [] } = useTenants();
    const { forms } = useForms();
    const { users } = useUsers();
    const { submissions } = useDashboardSubmissions(effectiveTenantId);

    const isLoading = loadingStats || loadingActivity;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-950">
                <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-500 text-sm">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    const formsList = forms || [];
    const usersList = users || [];
    const subsList = submissions || [];
    const logs = activityLogs || [];

    /* Computed values */
    const activeTenants = tenants.filter(t => t.status === "active").length;
    const activeForms = formsList.filter(f => f.status === "active").length;
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const submissionsToday = subsList.filter(s => {
        const d = s.submitted_at || s.created_date;
        if (!d) return false;
        const date = d.toDate ? d.toDate() : new Date(d);
        return date >= todayStart;
    }).length;
    const inReview = subsList.filter(s =>
        s.status === "in_review" || s.status === "pending_review"
    ).length;
    const trialTenants = tenants.filter(t => t.subscription_status === "trial").length;

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* ─── 1. GRID DE 4 KPI CARDS ─────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-6 py-4">
                <KpiCard
                    title="Empresas activas"
                    value={activeTenants}
                    icon={<Building2 size={18} />}
                    colorClass="text-emerald-400 border-emerald-800"
                    href="/empresas"
                />
                <KpiCard
                    title="Formularios activos"
                    value={activeForms}
                    icon={<FileText size={18} />}
                    colorClass="text-blue-400 border-blue-800"
                    href="/forms"
                />
                <KpiCard
                    title="Respuestas hoy"
                    value={submissionsToday}
                    icon={<ClipboardList size={18} />}
                    colorClass="text-violet-400 border-violet-800"
                    href="/submissions"
                />
                <KpiCard
                    title="En revisión"
                    value={inReview}
                    icon={<Clock size={18} />}
                    colorClass="text-amber-400 border-amber-800"
                    href="/submissions"
                    pulse={inReview > 0}
                />
            </div>

            {/* ─── 3. GRID PRINCIPAL (2+1 cols) ───────────────────────── */}
            <div className="grid lg:grid-cols-3 gap-6 px-6 pb-6">

                {/* ── LEFT: Respuestas Recientes (col-span-2) ──────── */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                            <Activity size={16} className="text-violet-400" />
                            <h2 className="text-sm font-semibold text-white">Respuestas recientes</h2>
                            <span className="text-xs bg-slate-800 text-slate-400 rounded-full px-2 py-0.5">{subsList.length}</span>
                        </div>
                        <Link to="/submissions" className="text-xs text-slate-500 hover:text-emerald-400 transition-colors">
                            Ver todas →
                        </Link>
                    </div>

                    {subsList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-600">
                            <ClipboardList size={36} className="mb-3 opacity-30" />
                            <p className="text-sm">Sin respuestas aún</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-slate-500 border-b border-slate-800">
                                        <th className="text-left px-5 py-3">Código</th>
                                        <th className="text-left px-4 py-3 hidden md:table-cell">Formulario</th>
                                        <th className="text-left px-4 py-3">Estado</th>
                                        <th className="text-left px-4 py-3 hidden lg:table-cell">Enviado por</th>
                                        <th className="text-left px-4 py-3 hidden sm:table-cell">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subsList.slice(0, 8).map(s => {
                                        const formName = formsList.find(f => f.id === s.schema_id)?.title || "—";
                                        const st = STATUS[s.status] || { label: s.status || "—", cls: "bg-slate-700 text-slate-300" };
                                        const rawDate = s.submitted_at || s.created_date;
                                        const dateObj = rawDate ? (rawDate.toDate ? rawDate.toDate() : new Date(rawDate)) : null;
                                        const dateStr = dateObj ? format(dateObj, "dd/MM/yyyy HH:mm") : "—";
                                        return (
                                            <tr key={s.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                                                <td className="px-5 py-3 font-mono text-xs text-slate-300">{s.document_code || "—"}</td>
                                                <td className="px-4 py-3 text-slate-300 hidden md:table-cell">{formName}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.cls}`}>{st.label}</span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">{s.submitted_by_name || s.created_by || "—"}</td>
                                                <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">{dateStr}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* ── RIGHT: Panel lateral (col-span-1) ────────────── */}
                <div className="space-y-4">

                    {/* A) Resumen del Sistema */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                            <ClipboardList size={15} className="text-slate-400" /> Resumen del sistema
                        </h3>
                        <div className="space-y-3">
                            {[
                                { emoji: "👥", label: "Usuarios totales", val: usersList.length },
                                { emoji: "📋", label: "Formularios", val: formsList.length },
                                { emoji: "🏢", label: "Empresas", val: tenants.length },
                                { emoji: "✅", label: "Respuestas totales", val: subsList.length || stats?.totalSubmissions || 0 },
                                { emoji: "🔄", label: "Trial activos", val: trialTenants },
                            ].map(item => (
                                <div key={item.label} className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400 flex items-center gap-2">
                                        <span>{item.emoji}</span> {item.label}
                                    </span>
                                    <span className="font-bold text-white">{item.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* B) Acciones Rápidas */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                            <Zap size={15} className="text-amber-400" /> Acciones rápidas
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: "Nueva empresa", icon: Building2, cls: "text-emerald-400 bg-emerald-900/30", href: "/empresas" },
                                { label: "Nuevo form", icon: Plus, cls: "text-blue-400 bg-blue-900/30", href: "/forms/new" },
                                { label: "Usuarios", icon: Users, cls: "text-amber-400 bg-amber-900/30", href: "/usuarios" },
                                { label: "Exportar", icon: Download, cls: "text-pink-400 bg-pink-900/30", href: "/exportaciones" },
                                { label: "Workflows", icon: GitBranch, cls: "text-violet-400 bg-violet-900/30", href: "/workflows" },
                                { label: "Auditoría", icon: Shield, cls: "text-slate-400 bg-slate-800", href: "/auditoria" },
                            ].map(item => {
                                const Icon = item.icon;
                                return (
                                    <Link key={item.href + item.label} to={item.href}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium hover:opacity-80 transition-opacity ${item.cls}`}>
                                        <Icon size={18} />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* C) Actividad Reciente */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                            <Activity size={15} className="text-violet-400" /> Actividad reciente
                        </h3>
                        {logs.length === 0 ? (
                            <p className="text-xs text-slate-600 text-center py-4">Sin actividad reciente</p>
                        ) : (
                            <div className="space-y-2">
                                {logs.slice(0, 8).map(log => {
                                    const dotColor = log.action?.includes("create") ? "bg-emerald-500"
                                        : log.action?.includes("update") ? "bg-blue-500"
                                        : log.action?.includes("delete") || log.action?.includes("suspend") ? "bg-red-500"
                                        : "bg-slate-500";
                                    return (
                                        <div key={log.id} className="flex items-start gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${dotColor}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-slate-400 truncate">{log.title}</p>
                                                <p className="text-[10px] text-slate-600">
                                                    {log.performer_name || log.user_email || ""} · {log.time}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── 4. TABLA DE EMPRESAS REGISTRADAS ────────────────── */}
            {isSuperAdmin && tenants.length > 0 && (
                <div className="px-6 pb-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                                <Building2 size={16} className="text-emerald-400" />
                                <h2 className="text-sm font-semibold text-white">Empresas registradas</h2>
                                <span className="text-xs bg-slate-800 text-slate-400 rounded-full px-2 py-0.5">{tenants.length}</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-slate-500 border-b border-slate-800">
                                        <th className="text-left px-5 py-3">Empresa</th>
                                        <th className="text-left px-4 py-3 hidden md:table-cell">Industria</th>
                                        <th className="text-left px-4 py-3 hidden sm:table-cell">Plan</th>
                                        <th className="text-left px-4 py-3">Estado</th>
                                        <th className="text-left px-4 py-3 hidden lg:table-cell">Registro</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tenants.slice(0, 8).map(t => {
                                        const created = t.created_date?.toDate
                                            ? format(t.created_date.toDate(), "dd/MM/yyyy")
                                            : "—";
                                        const planCls = PLAN_COLORS[t.plan] || "bg-slate-700 text-slate-300";
                                        const statusColor = t.status === "active" ? "bg-emerald-500"
                                            : t.status === "suspended" ? "bg-red-500"
                                            : "bg-amber-500";
                                        const statusLabel = t.status === "active" ? "Activo"
                                            : t.status === "suspended" ? "Suspendido"
                                            : t.status || "—";
                                        return (
                                            <tr key={t.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {t.logo_url ? (
                                                            <img src={t.logo_url} className="w-8 h-8 rounded-lg object-cover" alt="" />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-lg bg-emerald-900 flex items-center justify-center text-emerald-400 font-bold text-sm">
                                                                {(t.name || "?")[0].toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-white font-medium text-sm">{t.name}</p>
                                                            <p className="text-xs text-slate-500">{t.contact_email || "—"}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-400 text-xs capitalize hidden md:table-cell">{t.industry || "General"}</td>
                                                <td className="px-4 py-3 hidden sm:table-cell">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planCls}`}>
                                                        {(t.plan || "free").toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${statusColor}`} />
                                                        <span className="text-xs text-slate-300 capitalize">{statusLabel}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 text-xs hidden lg:table-cell">{created}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Sub-component: KPI Card ────────────────────────────────────── */
function KpiCard({ title, value, icon, colorClass, href, pulse }) {
    const [borderColor] = colorClass.split(" ").filter(c => c.startsWith("border-"));
    const [textColor] = colorClass.split(" ").filter(c => c.startsWith("text-"));
    return (
        <Link to={href}
            className={`bg-slate-900 border rounded-xl p-4 hover:border-opacity-60 transition-all ${borderColor}`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 uppercase">{title}</span>
                <span className={textColor}>{icon}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className={`text-3xl font-bold ${textColor}`}>{value}</span>
                {pulse && <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
            </div>
        </Link>
    );
}
