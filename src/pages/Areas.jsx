import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    MapPin, Plus, Search, Edit3, Trash2,
    FileText, ChevronRight, User, X
} from "lucide-react";
import { useAreas } from "../api/useAreas";
import { useTenants } from "../api/useTenants";
import { useUsers } from "../api/useUsers";
import { useForms } from "../api/useForms";

/* ── Constants ────────────────────────────────────────────────────── */
const STATUS_BADGE = {
    active:   "bg-emerald-900/40 text-emerald-400",
    inactive: "bg-slate-700 text-slate-400",
};

/* ══════════════════════════════════════════════════════════════════ */
export default function Areas() {
    const [searchParams] = useSearchParams();
    const tenantParam = searchParams.get("tenant");

    const [search, setSearch] = useState("");
    const [filterTenant, setFilterTenant] = useState(tenantParam || "all");
    const [showModal, setShowModal] = useState(false);
    const [selected, setSelected] = useState(null);

    const { areas = [], isLoading, createArea, updateArea, deleteArea } = useAreas();
    const { tenants = [] } = useTenants();
    const { users = [] } = useUsers();
    const { forms } = useForms();
    const formsList = forms || [];

    /* ── Filtering ────────────────────────────────────────────── */
    const filtered = areas.filter(a => {
        const matchSearch =
            a.name?.toLowerCase().includes(search.toLowerCase()) ||
            a.code?.toLowerCase().includes(search.toLowerCase());
        const matchTenant = filterTenant === "all" || a.tenant_id === filterTenant || a.tenantId === filterTenant;
        return matchSearch && matchTenant;
    });

    /* ── Stats ────────────────────────────────────────────────── */
    const activeAreas = areas.filter(a => a.status === "active").length;
    const inactiveAreas = areas.filter(a => a.status === "inactive").length;

    /* ── Actions ──────────────────────────────────────────────── */
    const openNew = () => { setSelected(null); setShowModal(true); };
    const openEdit = (area) => { setSelected(area); setShowModal(true); };

    const handleDelete = async (id) => {
        if (!confirm("¿Eliminar esta área?")) return;
        try {
            await deleteArea.mutateAsync(id);
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    const handleSave = async (data) => {
        try {
            if (selected) {
                await updateArea.mutateAsync({ id: selected.id, ...data });
            } else {
                await createArea.mutateAsync(data);
            }
            setShowModal(false);
            setSelected(null);
        } catch (err) {
            alert("Error al guardar área: " + err.message);
        }
    };

    /* ── Helpers ──────────────────────────────────────────────── */
    const getTenantName = (id) => tenants.find(t => t.id === id)?.name || "—";
    const getAreaName = (id) => areas.find(a => a.id === id)?.name || null;
    const getUserName = (id) => {
        const u = users.find(u => u.id === id);
        return u ? (u.displayName || u.name || u.email) : null;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6">

            {/* ─── HEADER ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <MapPin size={22} className="text-emerald-400" />
                        <h1 className="text-2xl font-bold text-white">Áreas</h1>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">Aislamiento por unidades organizativas</p>
                </div>
                <button onClick={openNew}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <Plus size={16} /> Nueva Área
                </button>
            </div>

            {/* ─── FILTERS ROW ────────────────────────────────────── */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-[12rem]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar área..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                </div>
                <select
                    value={filterTenant}
                    onChange={e => setFilterTenant(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
                >
                    <option value="all">Todas las empresas</option>
                    {tenants.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
            </div>

            {/* ─── STATS ROW ──────────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                    { label: "Total Áreas", value: areas.length, color: "text-white" },
                    { label: "Activas", value: activeAreas, color: "text-emerald-400" },
                    { label: "Inactivas", value: inactiveAreas, color: "text-slate-400" },
                ].map(s => (
                    <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-slate-500 text-xs mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* ─── GRID DE CARDS ──────────────────────────────────── */}
            {isLoading ? (
                <div className="text-center py-20 text-slate-500">
                    <div className="w-8 h-8 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    Cargando...
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                    <MapPin size={40} className="mb-3 opacity-40" />
                    <p className="text-lg font-medium text-slate-500">No hay áreas configuradas</p>
                    <p className="text-sm mt-1">Crea la primera área con el botón de arriba</p>
                </div>
            ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {filtered.map(area => {
                        const parentName = getAreaName(area.parent_area_id);
                        const managerName = getUserName(area.manager_user_id);
                        const badge = STATUS_BADGE[area.status] || STATUS_BADGE.active;

                        return (
                            <div key={area.id}
                                className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all">

                                {/* Top row */}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                                            <MapPin size={14} className="text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">{area.name}</p>
                                            {area.code && (
                                                <p className="text-xs text-slate-500">{area.code}</p>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${badge}`}>
                                        {area.status === "active" ? "Activa" : "Inactiva"}
                                    </span>
                                </div>

                                {/* Description */}
                                {area.description && (
                                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{area.description}</p>
                                )}

                                {/* Metadata */}
                                <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-600">
                                    <span>{getTenantName(area.tenant_id || area.tenantId)}</span>
                                    {parentName && (
                                        <span className="flex items-center gap-0.5">
                                            <ChevronRight size={10} /> {parentName}
                                        </span>
                                    )}
                                    {managerName && (
                                        <span className="flex items-center gap-0.5">
                                            <User size={10} /> {managerName}
                                        </span>
                                    )}
                                </div>

                                {/* Allowed forms */}
                                {area.allowed_form_ids?.length > 0 && (
                                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                                        <FileText size={11} />
                                        <span>{area.allowed_form_ids.length} formulario(s) permitido(s)</span>
                                    </div>
                                )}

                                {/* Footer actions */}
                                <div className="flex items-center gap-1 mt-4 pt-3 border-t border-slate-800">
                                    <button onClick={() => openEdit(area)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                                        <Edit3 size={12} /> Editar
                                    </button>
                                    <button onClick={() => handleDelete(area.id)}
                                        className="ml-auto p-1.5 text-slate-700 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ─── MODAL ──────────────────────────────────────────── */}
            {showModal && (
                <AreaModal
                    area={selected}
                    areas={areas}
                    tenants={tenants}
                    users={users}
                    forms={formsList}
                    onSave={handleSave}
                    onClose={() => { setShowModal(false); setSelected(null); }}
                />
            )}
        </div>
    );
}

/* ── AreaModal (local component) ──────────────────────────────────── */
function AreaModal({ area, areas, tenants, users, onSave, onClose }) {
    const [data, setData] = useState({
        name: area?.name || "",
        code: area?.code || "",
        tenant_id: area?.tenant_id || area?.tenantId || "",
        parent_area_id: area?.parent_area_id || "",
        description: area?.description || "",
        manager_user_id: area?.manager_user_id || "",
        status: area?.status || "active",
        allowed_form_ids: area?.allowed_form_ids || [],
        geo_coordinates: area?.geo_coordinates || "",
        metadata: area?.metadata || "",
    });

    const set = (field, value) => setData(prev => ({ ...prev, [field]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(data);
    };

    const inputCls = "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500";

    // Filter users by selected tenant if applicable
    const filteredUsers = data.tenant_id
        ? users.filter(u => u.tenantId === data.tenant_id || u.tenant_id === data.tenant_id)
        : users;

    // Filter areas for parent (exclude self)
    const parentOptions = areas.filter(a => a.id !== area?.id);

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-800">
                    <h2 className="text-white font-semibold">
                        {area ? "Editar Área" : "Nueva Área"}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Name + Code */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Nombre Área *</label>
                            <input required type="text" value={data.name} onChange={e => set("name", e.target.value)} className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">Código</label>
                            <input type="text" value={data.code} onChange={e => set("code", e.target.value)} placeholder="Ej: PROD-01" className={inputCls} />
                        </div>
                    </div>

                    {/* Empresa */}
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Empresa</label>
                        <select value={data.tenant_id} onChange={e => set("tenant_id", e.target.value)} className={inputCls}>
                            <option value="">Seleccionar empresa...</option>
                            {tenants.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Área Padre */}
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Área Padre</label>
                        <select value={data.parent_area_id} onChange={e => set("parent_area_id", e.target.value)} className={inputCls}>
                            <option value="">Sin área padre</option>
                            {parentOptions.map(a => (
                                <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Descripción</label>
                        <textarea value={data.description} onChange={e => set("description", e.target.value)} rows={3} className={inputCls} />
                    </div>

                    {/* Responsable */}
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Responsable</label>
                        <select value={data.manager_user_id} onChange={e => set("manager_user_id", e.target.value)} className={inputCls}>
                            <option value="">Sin responsable</option>
                            {filteredUsers.map(u => (
                                <option key={u.id} value={u.id}>{u.displayName || u.name || u.email}</option>
                            ))}
                        </select>
                    </div>

                    {/* Estado */}
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">Estado</label>
                        <select value={data.status} onChange={e => set("status", e.target.value)} className={inputCls}>
                            <option value="active">Activa</option>
                            <option value="inactive">Inactiva</option>
                        </select>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-5 border-t border-slate-800">
                    <button type="button" onClick={onClose}
                        className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-lg transition-colors">
                        Cancelar
                    </button>
                    <button type="button" onClick={() => onSave(data)}
                        className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors">
                        {area ? "Guardar" : "Crear Área"}
                    </button>
                </div>
            </div>
        </div>
    );
}
