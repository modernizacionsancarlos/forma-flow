import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    Building2, Plus, Search, CheckCircle, XCircle,
    Clock, Users, FileText, MapPin, X
} from "lucide-react";
import { useTenants } from "../api/useTenants";
import { useUsers } from "../api/useUsers";
import { useForms } from "../api/useForms";
import { useAreas } from "../api/useAreas";
import HelpInfoIcon from "@/components/ui/HelpInfoIcon";
import { ActionWithTooltip } from "@/components/help/HelpPrimitives.jsx";

/* ── Constants ────────────────────────────────────────────────────── */
const PLAN_COLORS = {
    free:       "bg-slate-700 text-slate-300",
    starter:    "bg-blue-900 text-blue-300",
    trial:      "bg-amber-900 text-amber-300",
    pro:        "bg-violet-900 text-violet-300",
    enterprise: "bg-amber-900 text-amber-300",
};

const STATUS_COLORS = {
    active:    "text-emerald-400",
    suspended: "text-red-400",
    pending:   "text-amber-400",
};

const INDUSTRIES = [
    "construccion", "salud", "retail", "logistica", "educacion",
    "manufactura", "alimentos", "mineria", "otro",
];

/* ══════════════════════════════════════════════════════════════════ */
export default function Empresas() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selected, setSelected] = useState(null);

    const { tenants = [], isLoading, createTenant, updateTenant } = useTenants();
    const { users = [] } = useUsers();
    const { forms } = useForms();
    const { areas = [] } = useAreas();

    const formsList = forms || [];
    const usersList = users || [];
    const areasList = areas || [];

    const filtered = tenants.filter(t =>
        t.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.contact_email?.toLowerCase().includes(search.toLowerCase())
    );

    /* ── Actions ──────────────────────────────────────────────── */
    const openEdit = (t) => { setSelected(t); setShowModal(true); };
    const openNew = () => { setSelected(null); setShowModal(true); };

    const toggleStatus = async (t) => {
        const newStatus = t.status === "active" ? "suspended" : "active";
        try {
            await updateTenant.mutateAsync({ id: t.id, status: newStatus });
        } catch (err) {
            toast.error(err?.message || "No se pudo actualizar el estado de la empresa.");
        }
    };

    const handleSave = async (data) => {
        try {
            if (selected) {
                await updateTenant.mutateAsync({ id: selected.id, ...data });
            } else {
                await createTenant.mutateAsync({
                    ...data,
                    status: "active",
                    subscription_status: "trial",
                });
            }
            setShowModal(false);
            setSelected(null);
        } catch (err) {
            toast.error(err?.message || "Error al guardar empresa.");
        }
    };

    /* ── Stats ────────────────────────────────────────────────── */
    const activeTenants = tenants.filter(t => t.status === "active").length;
    const trialTenants = tenants.filter(t => t.subscription_status === "trial").length;
    const suspendedTenants = tenants.filter(t => t.status === "suspended").length;

    return (
        <div data-help-section="empresas" className="min-h-screen bg-slate-950 text-white">

            <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-4 sm:py-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-2">
                        <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Building2 size={20} className="text-emerald-400 shrink-0" />
                            <h1 className="text-xl font-bold text-white">Empresas (tenants)</h1>
                            <HelpInfoIcon helpSection="empresas" className="text-slate-600" />
                        </div>
                        <p className="text-slate-500 text-sm mt-0.5 pl-0 sm:pl-7">Gestión multi-tenant del sistema</p>
                        </div>
                    </div>
                <ActionWithTooltip section="empresas.new">
                <button type="button" onClick={openNew}
                    className="flex w-full sm:w-auto shrink-0 items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
                    <Plus size={16} /> Nueva empresa
                </button>
                </ActionWithTooltip>
                </div>
                <div className="relative mt-4">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar por nombre o email..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                </div>
            </div>

            <div className="p-4 sm:p-6">
            {/* ─── STATS ROW ──────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                    { label: "Total", value: tenants.length, color: "text-white" },
                    { label: "Activas", value: activeTenants, color: "text-emerald-400" },
                    { label: "Trial", value: trialTenants, color: "text-amber-400" },
                    { label: "Suspendidas", value: suspendedTenants, color: "text-red-400" },
                ].map(s => (
                    <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-slate-400 text-xs mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* ─── TABLE ──────────────────────────────────────────── */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                {isLoading ? (
                    <div className="text-center py-20 text-slate-500">
                        <div className="w-8 h-8 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        Cargando...
                    </div>
                ) : (
                    <div className="overflow-x-auto -mx-px">
                        <table className="w-full min-w-[640px] text-sm">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                                    <th className="px-4 py-3 text-left">Empresa</th>
                                    <th className="px-4 py-3 text-left hidden md:table-cell">Industria</th>
                                    <th className="px-4 py-3 text-left">Plan</th>
                                    <th className="px-4 py-3 text-left hidden sm:table-cell">Estado</th>
                                    <th className="px-4 py-3 text-left hidden lg:table-cell">Vínculos</th>
                                    <th className="px-4 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-slate-500">
                                            No se encontraron empresas
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((t, i) => {
                                        const tUsers = usersList.filter(u => u.tenantId === t.id).length;
                                        const tAreas = areasList.filter(a => a.tenantId === t.id || a.tenant_id === t.id).length;
                                        const tForms = formsList.filter(f => f.tenant_id === t.id).length;
                                        const planCls = PLAN_COLORS[t.plan] || "bg-slate-700 text-slate-400";
                                        const statusColor = STATUS_COLORS[t.status] || "text-slate-400";

                                        return (
                                            <tr key={t.id}
                                                className={`border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${i % 2 !== 0 ? "bg-slate-900/50" : ""}`}>
                                                {/* Empresa */}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-emerald-900 flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">
                                                            {t.logo_url
                                                                ? <img src={t.logo_url} className="w-full h-full object-cover rounded-lg" alt="" />
                                                                : (t.name?.[0]?.toUpperCase() || "?")
                                                            }
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-white">{t.name}</p>
                                                            <p className="text-slate-500 text-xs">{t.contact_email || "—"}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Industria */}
                                                <td className="px-4 py-3 text-slate-300 capitalize hidden md:table-cell">
                                                    {t.industry || "—"}
                                                </td>

                                                {/* Plan */}
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${planCls}`}>
                                                        {t.plan || "—"}
                                                    </span>
                                                </td>

                                                {/* Estado */}
                                                <td className="px-4 py-3 hidden sm:table-cell">
                                                    <span className={`flex items-center gap-1 text-xs font-medium ${statusColor}`}>
                                                        {t.status === "active"
                                                            ? <CheckCircle size={12} />
                                                            : t.status === "suspended"
                                                                ? <XCircle size={12} />
                                                                : <Clock size={12} />
                                                        }
                                                        {t.status || "—"}
                                                    </span>
                                                </td>

                                                {/* Vínculos */}
                                                <td className="px-4 py-3 hidden lg:table-cell">
                                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                                        <button onClick={() => navigate(`/usuarios?tenant=${t.id}`)}
                                                            className="flex items-center gap-1 hover:text-amber-300 transition-colors">
                                                            <Users size={11} /> {tUsers}
                                                        </button>
                                                        <button onClick={() => navigate(`/areas?tenant=${t.id}`)}
                                                            className="flex items-center gap-1 hover:text-rose-300 transition-colors">
                                                            <MapPin size={11} /> {tAreas}
                                                        </button>
                                                        <button onClick={() => navigate(`/forms?tenant=${t.id}`)}
                                                            className="flex items-center gap-1 hover:text-emerald-300 transition-colors">
                                                            <FileText size={11} /> {tForms}
                                                        </button>
                                                    </div>
                                                </td>

                                                {/* Acciones */}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => openEdit(t)}
                                                            className="text-xs text-emerald-400 hover:underline">
                                                            Editar
                                                        </button>
                                                        <button onClick={() => toggleStatus(t)}
                                                            className={`text-xs ${t.status === "active"
                                                                ? "text-red-400 hover:text-red-300"
                                                                : "text-emerald-400 hover:text-emerald-300"
                                                                }`}>
                                                            {t.status === "active" ? "Suspender" : "Activar"}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            </div>

            {/* ─── MODAL ──────────────────────────────────────────── */}
            {showModal && (
                <TenantModal
                    tenant={selected}
                    onSave={handleSave}
                    onClose={() => { setShowModal(false); setSelected(null); }}
                />
            )}
        </div>
    );
}

/* ── TenantModal (local component) ────────────────────────────────── */
function TenantModal({ tenant, onSave, onClose }) {
    const [data, setData] = useState({
        name: tenant?.name || "",
        slug: tenant?.slug || "",
        contact_email: tenant?.contact_email || "",
        contact_phone: tenant?.contact_phone || "",
        country: tenant?.country || "",
        timezone: tenant?.timezone || "",
        plan: tenant?.plan || "free",
        subscription_status: tenant?.subscription_status || "trial",
        max_users: tenant?.max_users || "",
        max_forms: tenant?.max_forms || "",
        trial_ends_at: tenant?.trial_ends_at || "",
        industry: tenant?.industry || "",
        primary_color: tenant?.primary_color || "#10b981",
        notes: tenant?.notes || "",
    });

    const set = (field, value) => setData(prev => ({ ...prev, [field]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(data);
    };

    const inputCls = "bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 w-full";

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                    <h2 className="text-lg font-bold text-white">
                        {tenant ? "Editar Empresa" : "Nueva Empresa"}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Datos básicos */}
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Datos básicos</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Nombre Empresa</label>
                            <input required type="text" value={data.name} onChange={e => set("name", e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Slug</label>
                            <input type="text" value={data.slug} onChange={e => set("slug", e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Email Contacto</label>
                            <input type="email" value={data.contact_email} onChange={e => set("contact_email", e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Teléfono</label>
                            <input type="text" value={data.contact_phone} onChange={e => set("contact_phone", e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">País</label>
                            <input type="text" value={data.country} onChange={e => set("country", e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Zona Horaria</label>
                            <input type="text" value={data.timezone} onChange={e => set("timezone", e.target.value)} className={inputCls} />
                        </div>
                    </div>

                    {/* Plan y límites */}
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider pt-2">Plan y límites</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Plan</label>
                            <select value={data.plan} onChange={e => set("plan", e.target.value)} className={inputCls}>
                                {["free", "starter", "pro", "enterprise"].map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Suscripción</label>
                            <select value={data.subscription_status} onChange={e => set("subscription_status", e.target.value)} className={inputCls}>
                                {["trial", "active", "suspended", "cancelled"].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Máx. Usuarios</label>
                            <input type="number" value={data.max_users} onChange={e => set("max_users", e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Máx. Formularios</label>
                            <input type="number" value={data.max_forms} onChange={e => set("max_forms", e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Trial Vence</label>
                            <input type="date" value={data.trial_ends_at} onChange={e => set("trial_ends_at", e.target.value)} className={inputCls} />
                        </div>
                    </div>

                    {/* Personalización */}
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider pt-2">Personalización</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Industria</label>
                            <select value={data.industry} onChange={e => set("industry", e.target.value)} className={inputCls}>
                                <option value="">Seleccionar...</option>
                                {INDUSTRIES.map(ind => (
                                    <option key={ind} value={ind}>{ind}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Color Principal</label>
                            <input type="color" value={data.primary_color} onChange={e => set("primary_color", e.target.value)}
                                className="h-9 w-full rounded-lg border border-slate-700 bg-slate-800 cursor-pointer" />
                        </div>
                    </div>

                    {/* Notas */}
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Notas Internas</label>
                        <textarea value={data.notes} onChange={e => set("notes", e.target.value)} rows={3} className={inputCls} />
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                        <button type="button" onClick={onClose}
                            className="border border-slate-700 text-slate-400 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors">
                            Cancelar
                        </button>
                        <button type="submit"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            {tenant ? "Guardar" : "Crear Empresa"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
