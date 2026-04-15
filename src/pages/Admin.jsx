import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
    ShieldAlert, LayoutDashboard, Building2, Users, Activity,
    Server, ClipboardList, Clock, FileText, PieChart,
    ChevronRight, AlertTriangle, Download, Shield, GitBranch,
    MapPin, Settings, RefreshCw
} from "lucide-react";
import { useTenants } from "../api/useTenants";
import { useUsers } from "../api/useUsers";
import { useForms } from "../api/useForms";
import { useAuditLogs } from "../api/useAuditLogs";
import { useDashboardSubmissions } from "../api/useDashboardSubmissions";

/* ── Tab definitions ──────────────────────────────────────────────── */
const TABS = [
    { id: "overview",  label: "Overview",   icon: LayoutDashboard },
    { id: "tenants",   label: "Empresas",   icon: Building2 },
    { id: "users",     label: "Usuarios",   icon: Users },
    { id: "activity",  label: "Actividad",  icon: Activity },
    { id: "system",    label: "Sistema",    icon: Server },
];

const ROLES = [
    { id: "super_admin",       label: "Super Admin",    color: "text-red-400" },
    { id: "admin_empresa",     label: "Admin Empresa",  color: "text-amber-400" },
    { id: "admin",             label: "Admin",          color: "text-amber-400" },
    { id: "responsable_area",  label: "Responsable",    color: "text-blue-400" },
    { id: "operador",          label: "Operador",       color: "text-emerald-400" },
    { id: "user",              label: "Usuario",        color: "text-emerald-400" },
    { id: "visualizador",      label: "Visualizador",   color: "text-slate-400" },
];

const ROLE_STYLES = {
    super_admin:      "bg-red-900/50 text-red-300",
    admin_empresa:    "bg-amber-900/50 text-amber-300",
    admin:            "bg-amber-900/50 text-amber-300",
    responsable_area: "bg-blue-900/50 text-blue-300",
    operador:         "bg-emerald-900/50 text-emerald-300",
    user:             "bg-emerald-900/50 text-emerald-300",
    visualizador:     "bg-slate-800 text-slate-400",
};

const ACTION_COLORS = {
    submission_created: "bg-emerald-500",
    create_tenant:      "bg-emerald-500",
    link_user_profile:  "bg-violet-500",
    submission_deleted: "bg-red-500",
    suspend_tenant:     "bg-red-500",
    unlink_user:        "bg-red-500",
    status_changed:     "bg-amber-500",
    update_tenant:      "bg-blue-500",
    update_user_profile:"bg-blue-500",
    form_created:       "bg-blue-500",
    form_archived:      "bg-slate-500",
    user_invited:       "bg-violet-500",
    user_deactivated:   "bg-red-400",
    export_generated:   "bg-pink-500",
    login:              "bg-slate-400",
    logout:             "bg-slate-500",
    settings_changed:   "bg-orange-500",
};

const PLAN_STYLES = {
    free:       "bg-slate-700 text-slate-300",
    starter:    "bg-blue-900 text-blue-300",
    trial:      "bg-amber-900 text-amber-300",
    pro:        "bg-violet-900 text-violet-300",
    enterprise: "bg-amber-900 text-amber-300",
};

const PLAN_BAR_COLORS = {
    enterprise: "bg-amber-500",
    pro:        "bg-violet-500",
    starter:    "bg-blue-500",
    free:       "bg-slate-500",
};

const SERVICES = [
    { name: "API / Backend",      status: "operational" },
    { name: "Base de Datos",      status: "operational" },
    { name: "Autenticación",      status: "operational" },
    { name: "Storage / Archivos", status: "operational" },
    { name: "Exportaciones",      status: "operational" },
    { name: "Sincronización",     status: "operational" },
];

/* ══════════════════════════════════════════════════════════════════ */
export default function Admin() {
    const [activeTab, setActiveTab] = useState("overview");

    const { tenants = [], isLoading: lt } = useTenants();
    const { users = [], isLoading: lu } = useUsers();
    const { forms } = useForms();
    const { data: auditLogs, isLoading: la } = useAuditLogs();
    const { submissions, isLoading: ls } = useDashboardSubmissions();

    const formsList = forms || [];
    const usersList = users || [];
    const logsList = auditLogs || [];
    const subsList = submissions || [];

    const isLoading = lt || lu || la || ls;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-950">
                <div className="text-center space-y-3">
                    <div className="w-10 h-10 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-500 text-sm">Cargando panel administrativo...</p>
                </div>
            </div>
        );
    }

    /* ── Computed metrics ──────────────────────────────────────── */
    const activeTenants = tenants.filter(t => t.status === "active").length;
    const activeUsers = usersList.filter(u => u.status === "active" || !u.status).length;
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const subsToday = subsList.filter(s => {
        const d = s.submitted_at || s.created_date;
        if (!d) return false;
        const date = d.toDate ? d.toDate() : new Date(d);
        return date >= todayStart;
    }).length;
    const inReview = subsList.filter(s => s.status === "in_review" || s.status === "pending_review").length;
    const suspendedTenants = tenants.filter(t => t.status === "suspended");
    const trialTenants = tenants.filter(t => t.subscription_status === "trial").length;

    return (
        <div className="min-h-screen bg-slate-950 text-white">

            {/* ─── HEADER ─────────────────────────────────────────── */}
            <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShieldAlert size={22} className="text-emerald-400" />
                        <div>
                            <h1 className="text-xl font-bold text-white">Panel Administrativo</h1>
                            <p className="text-slate-500 text-sm">Control total del sistema SaaS</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link to="/empresas" className="flex items-center gap-1.5 bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-sm transition-colors">
                            <RefreshCw size={14} /> Actualizar
                        </Link>
                        <Link to="/configuracion" className="flex items-center gap-1.5 bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-sm transition-colors">
                            <Settings size={14} /> Configuración
                        </Link>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mt-3 border-b border-slate-800 -mb-[1px]">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors
                                    ${isActive
                                        ? "border-b-2 border-emerald-500 text-emerald-400"
                                        : "text-slate-500 hover:text-slate-300"
                                    }`}>
                                <Icon size={15} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ─── CONTENT ────────────────────────────────────────── */}
            <div className="p-6">

                {/* ═══ TAB 1: OVERVIEW ═══════════════════════════════ */}
                {activeTab === "overview" && (
                    <div className="space-y-4">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <AdminKpi title="Empresas activas" value={activeTenants} subtitle={`${tenants.length} registradas`} icon={Building2} color="emerald" to="/empresas" />
                            <AdminKpi title="Usuarios activos" value={activeUsers} subtitle={`${usersList.length} totales`} icon={Users} color="blue" to="/usuarios" />
                            <AdminKpi title="Respuestas hoy" value={subsToday} subtitle={`${subsList.length} totales`} icon={ClipboardList} color="violet" to="/submissions" />
                            <AdminKpi title="En revisión" value={inReview} subtitle="pendientes de atención" icon={Clock} color="amber" to="/submissions" />
                        </div>

                        {/* 2-column grid */}
                        <div className="grid lg:grid-cols-2 gap-4">
                            {/* Distribución de Planes */}
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                    <PieChart size={15} className="text-violet-400" /> Distribución de planes
                                </h3>
                                <div className="space-y-3">
                                    {["enterprise", "pro", "starter", "free"].map(plan => {
                                        const count = tenants.filter(t => t.plan === plan).length;
                                        const pct = tenants.length > 0 ? (count / tenants.length) * 100 : 0;
                                        const barColor = PLAN_BAR_COLORS[plan] || "bg-slate-500";
                                        return (
                                            <div key={plan}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm text-slate-300 capitalize">{plan}</span>
                                                    <span className="text-xs text-slate-500">{count} ({pct.toFixed(0)}%)</span>
                                                </div>
                                                <div className="w-full bg-slate-800 rounded-full h-2">
                                                    <div className={`h-2 rounded-full ${barColor} transition-all duration-500`}
                                                        style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Estado de Empresas */}
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                    <Activity size={15} className="text-emerald-400" /> Estado de empresas
                                </h3>
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="bg-emerald-900/20 border border-emerald-800/30 rounded-xl p-3 text-center">
                                        <p className="text-2xl font-bold text-emerald-400">{activeTenants}</p>
                                        <p className="text-xs text-slate-500">Activas</p>
                                    </div>
                                    <div className="bg-amber-900/20 border border-amber-800/30 rounded-xl p-3 text-center">
                                        <p className="text-2xl font-bold text-amber-400">{trialTenants}</p>
                                        <p className="text-xs text-slate-500">Trial</p>
                                    </div>
                                    <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-3 text-center">
                                        <p className="text-2xl font-bold text-red-400">{suspendedTenants.length}</p>
                                        <p className="text-xs text-slate-500">Suspendidas</p>
                                    </div>
                                </div>
                                {suspendedTenants.length > 0 ? (
                                    <div className="space-y-2">
                                        {suspendedTenants.map(t => (
                                            <div key={t.id} className="flex items-center gap-2 text-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                <span className="text-slate-300">{t.name}</span>
                                                <span className="text-xs bg-red-900 text-red-300 px-1.5 py-0.5 rounded">Suspendida</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-emerald-400 text-center">Sin empresas suspendidas</p>
                                )}
                            </div>
                        </div>

                        {/* Top Empresas más Activas */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
                                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <Activity size={15} className="text-emerald-400" /> Empresas más activas
                                </h3>
                                <Link to="/empresas" className="text-xs text-slate-500 hover:text-emerald-400 transition-colors">Ver todas →</Link>
                            </div>
                            {tenants.length === 0 ? (
                                <p className="text-sm text-slate-600 text-center py-8">Sin empresas registradas</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-xs text-slate-500 border-b border-slate-800">
                                                <th className="text-left px-5 py-3">Empresa</th>
                                                <th className="text-left px-4 py-3 hidden sm:table-cell">Plan</th>
                                                <th className="text-left px-4 py-3 hidden md:table-cell">Formularios</th>
                                                <th className="text-left px-4 py-3 hidden md:table-cell">Usuarios</th>
                                                <th className="text-left px-4 py-3 hidden lg:table-cell">Respuestas</th>
                                                <th className="text-left px-4 py-3">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[...tenants]
                                                .map(t => ({
                                                    ...t,
                                                    forms_count: formsList.filter(f => f.tenant_id === t.id).length,
                                                    users_count: usersList.filter(u => u.tenantId === t.id).length,
                                                    subs_count: subsList.filter(s => s.tenant_id === t.id).length,
                                                }))
                                                .sort((a, b) => b.forms_count - a.forms_count)
                                                .slice(0, 8)
                                                .map(t => (
                                                    <tr key={t.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                                                        <td className="px-5 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-7 h-7 rounded-lg bg-emerald-900 flex items-center justify-center text-emerald-400 font-bold text-xs">
                                                                    {(t.name || "?")[0].toUpperCase()}
                                                                </div>
                                                                <span className="text-white font-medium">{t.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 hidden sm:table-cell"><PlanBadge plan={t.plan} /></td>
                                                        <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{t.forms_count}</td>
                                                        <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{t.users_count}</td>
                                                        <td className="px-4 py-3 text-slate-400 hidden lg:table-cell">{t.subs_count}</td>
                                                        <td className="px-4 py-3"><StatusDot status={t.status} /></td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══ TAB 2: EMPRESAS ═══════════════════════════════ */}
                {activeTab === "tenants" && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl">
                        <div className="px-5 py-4 border-b border-slate-800">
                            <h3 className="text-sm font-semibold text-white">Todas las empresas ({tenants.length})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-slate-500 border-b border-slate-800">
                                        <th className="text-left px-5 py-3">Empresa</th>
                                        <th className="text-left px-4 py-3 hidden sm:table-cell">Plan</th>
                                        <th className="text-left px-4 py-3 hidden md:table-cell">Suscripción</th>
                                        <th className="text-left px-4 py-3 hidden lg:table-cell">País</th>
                                        <th className="text-left px-4 py-3 hidden md:table-cell">Forms</th>
                                        <th className="text-left px-4 py-3 hidden md:table-cell">Usuarios</th>
                                        <th className="text-left px-4 py-3">Estado</th>
                                        <th className="text-left px-4 py-3 hidden sm:table-cell">Registro</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tenants.map(t => {
                                        const created = t.created_date?.toDate ? format(t.created_date.toDate(), "dd/MM/yyyy") : "—";
                                        const tForms = formsList.filter(f => f.tenant_id === t.id).length;
                                        const tUsers = usersList.filter(u => u.tenantId === t.id).length;
                                        const subStyle = t.subscription_status === "trial" ? "bg-amber-900 text-amber-300"
                                            : t.subscription_status === "active" ? "bg-emerald-900 text-emerald-300"
                                            : t.subscription_status === "suspended" ? "bg-red-900 text-red-300"
                                            : "bg-slate-800 text-slate-500";
                                        return (
                                            <tr key={t.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {t.logo_url ? (
                                                            <img src={t.logo_url} className="w-7 h-7 rounded-lg object-cover" alt="" />
                                                        ) : (
                                                            <div className="w-7 h-7 rounded-lg bg-emerald-900 flex items-center justify-center text-emerald-400 font-bold text-xs">
                                                                {(t.name || "?")[0].toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-white font-medium">{t.name}</p>
                                                            <p className="text-xs text-slate-500">{t.contact_email || "—"}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 hidden sm:table-cell"><PlanBadge plan={t.plan} /></td>
                                                <td className="px-4 py-3 hidden md:table-cell">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${subStyle}`}>
                                                        {t.subscription_status || "—"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">{t.country || "AR"}</td>
                                                <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{tForms}</td>
                                                <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{tUsers}</td>
                                                <td className="px-4 py-3"><StatusDot status={t.status} /></td>
                                                <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">{created}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ═══ TAB 3: USUARIOS ═══════════════════════════════ */}
                {activeTab === "users" && (
                    <div className="space-y-4">
                        {/* Role summary */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {ROLES.filter(r => r.id !== "admin").map(role => {
                                const count = usersList.filter(u => u.role === role.id).length;
                                return (
                                    <div key={role.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                                        <p className={`text-2xl font-bold ${role.color}`}>{count}</p>
                                        <p className="text-xs text-slate-500 mt-1">{role.label}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Users table */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl">
                            <div className="px-5 py-4 border-b border-slate-800">
                                <h3 className="text-sm font-semibold text-white">Todos los usuarios ({usersList.length})</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-xs text-slate-500 border-b border-slate-800">
                                            <th className="text-left px-5 py-3">Usuario</th>
                                            <th className="text-left px-4 py-3">Rol</th>
                                            <th className="text-left px-4 py-3 hidden md:table-cell">Empresa</th>
                                            <th className="text-left px-4 py-3 hidden sm:table-cell">Estado</th>
                                            <th className="text-left px-4 py-3 hidden lg:table-cell">Registro</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usersList.map(u => {
                                            const tenant = tenants.find(t => t.id === u.tenantId);
                                            const created = u.createdAt?.toDate ? format(u.createdAt.toDate(), "dd/MM/yyyy") : "—";
                                            return (
                                                <tr key={u.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-7 h-7 rounded-lg bg-blue-900 flex items-center justify-center text-blue-400 font-bold text-xs">
                                                                {(u.full_name || u.email || "?")[0].toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-medium">{u.full_name || u.email}</p>
                                                                <p className="text-xs text-slate-500">{u.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                                                    <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">{tenant?.name || u.tenantId || "—"}</td>
                                                    <td className="px-4 py-3 hidden sm:table-cell"><StatusDot status={u.status || "active"} /></td>
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

                {/* ═══ TAB 4: ACTIVIDAD ══════════════════════════════ */}
                {activeTab === "activity" && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl">
                        <div className="px-5 py-4 border-b border-slate-800">
                            <h3 className="text-sm font-semibold text-white">Últimos {logsList.length} logs de auditoría</h3>
                        </div>
                        {logsList.length === 0 ? (
                            <p className="text-sm text-slate-600 text-center py-12">Sin actividad registrada</p>
                        ) : (
                            <div className="divide-y divide-slate-800">
                                {logsList.map(log => {
                                    const dotColor = ACTION_COLORS[log.action] || "bg-slate-600";
                                    const dateRaw = log.action_at || log.timestamp;
                                    const dateStr = dateRaw?.toDate
                                        ? format(dateRaw.toDate(), "dd/MM HH:mm")
                                        : dateRaw ? format(new Date(dateRaw), "dd/MM HH:mm") : "—";
                                    return (
                                        <div key={log.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors">
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-white font-mono">{log.action || "—"}</span>
                                                    {log.is_sensitive && <AlertTriangle size={12} className="text-amber-400" />}
                                                </div>
                                                <p className="text-xs text-slate-400">
                                                    {log.performer_name || log.user_email || log.performer_id || "Sistema"}
                                                    {log.tenant_name ? ` · ${log.tenant_name}` : ""}
                                                </p>
                                            </div>
                                            <span className="text-xs text-slate-500 flex-shrink-0">{dateStr}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ TAB 5: SISTEMA ════════════════════════════════ */}
                {activeTab === "system" && (
                    <div className="space-y-4">
                        {/* Entity counters */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {[
                                { label: "Tenants", val: tenants.length },
                                { label: "Formularios", val: formsList.length },
                                { label: "Usuarios", val: usersList.length },
                                { label: "Respuestas", val: subsList.length },
                                { label: "Logs", val: logsList.length },
                            ].map(item => (
                                <div key={item.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-white">{item.val}</p>
                                    <p className="text-xs text-slate-500 mt-1">{item.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* System Health */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                <Activity size={15} className="text-emerald-400" /> Estado del Sistema
                            </h3>
                            <div className="space-y-3">
                                {SERVICES.map(svc => {
                                    const badgeCls = svc.status === "operational" ? "bg-emerald-900 text-emerald-400"
                                        : svc.status === "degraded" ? "bg-amber-900 text-amber-400"
                                        : "bg-red-900 text-red-400";
                                    const label = svc.status === "operational" ? "Operacional"
                                        : svc.status === "degraded" ? "Degradado" : "Caído";
                                    return (
                                        <div key={svc.name} className="flex items-center justify-between">
                                            <span className="text-sm text-slate-300">{svc.name}</span>
                                            <div className="flex items-center gap-2">
                                                {svc.status === "operational" && (
                                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                                )}
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${badgeCls}`}>{label}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick links */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                            <h3 className="text-sm font-semibold text-white mb-3">Accesos directos</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {[
                                    { label: "Auditoría", icon: Shield, href: "/auditoria" },
                                    { label: "Exportaciones", icon: Download, href: "/exportaciones" },
                                    { label: "Sincronización", icon: RefreshCw, href: "/sincronizacion" },
                                    { label: "Workflows", icon: GitBranch, href: "/workflows" },
                                    { label: "Áreas", icon: MapPin, href: "/areas" },
                                    { label: "Configuración", icon: Settings, href: "/configuracion" },
                                ].map(item => {
                                    const Icon = item.icon;
                                    return (
                                        <Link key={item.href} to={item.href}
                                            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2.5 rounded-lg text-sm transition-colors">
                                            <Icon size={14} /> {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

/* ── Sub-components ───────────────────────────────────────────────── */

function AdminKpi({ title, value, subtitle, icon: Icon, color, to }) {
    const colors = {
        emerald: { border: "border-emerald-800", text: "text-emerald-400", bg: "bg-emerald-500/10" },
        blue:    { border: "border-blue-800",    text: "text-blue-400",    bg: "bg-blue-500/10" },
        violet:  { border: "border-violet-800",  text: "text-violet-400",  bg: "bg-violet-500/10" },
        amber:   { border: "border-amber-800",   text: "text-amber-400",   bg: "bg-amber-500/10" },
    };
    const c = colors[color] || colors.emerald;
    return (
        <Link to={to} className={`bg-slate-900 border ${c.border} rounded-xl p-5 hover:border-opacity-60 transition-all group`}>
            <div className="flex items-center justify-between mb-2">
                <Icon size={18} className={c.text} />
                <ChevronRight size={14} className="text-slate-600 group-hover:text-white transition-colors" />
            </div>
            <p className={`text-3xl font-bold ${c.text}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </Link>
    );
}

function PlanBadge({ plan }) {
    const cls = PLAN_STYLES[plan] || "bg-slate-700 text-slate-300";
    return <span className={`text-xs px-2 py-0.5 rounded-full ${cls}`}>{plan || "free"}</span>;
}

function StatusDot({ status }) {
    const color = status === "active" ? "bg-emerald-500"
        : status === "suspended" ? "bg-red-500"
        : "bg-amber-500";
    const label = status === "active" ? "Activo"
        : status === "suspended" ? "Suspendido"
        : status || "Pendiente";
    return (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-xs text-slate-300 capitalize">{label}</span>
        </div>
    );
}

function RoleBadge({ role }) {
    const cls = ROLE_STYLES[role] || "bg-slate-800 text-slate-400";
    const label = ROLES.find(r => r.id === role)?.label || role || "—";
    return <span className={`text-xs px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}
