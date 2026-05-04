import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Users, UserPlus, UserCircle2, Search, X } from "lucide-react";
import { useUsers } from "../api/useUsers";
import { useTenants } from "../api/useTenants";
import { useAreas } from "../api/useAreas";
import { useInvitations } from "../api/useInvitations";
import { useAuth } from "../lib/AuthContext";
import Guard from "../components/auth/Guard";
import { PERMISSIONS } from "../lib/permissions";
import { hasPermission } from "../lib/permissions";

/* ── Roles config ─────────────────────────────────────────────────── */
const ROLES = [
    { id: "super_admin",      label: "Super Admin",   cls: "bg-red-900/50 text-red-300",     numCls: "text-red-400" },
    { id: "admin",            label: "Admin",         cls: "bg-amber-900/50 text-amber-300", numCls: "text-amber-400" },
    { id: "admin_empresa",    label: "Admin Empresa",  cls: "bg-amber-900/50 text-amber-300", numCls: "text-amber-400" },
    { id: "responsable_area", label: "Resp. Área",     cls: "bg-blue-900/50 text-blue-300",   numCls: "text-blue-400" },
    { id: "operador",         label: "Operador",       cls: "bg-emerald-900/50 text-emerald-300", numCls: "text-emerald-400" },
    { id: "visualizador",     label: "Visualizador",   cls: "bg-slate-800 text-slate-400",    numCls: "text-slate-400" },
];

const STATUS_STYLES = {
    active:         { label: "Activo",    cls: "text-emerald-400", dotCls: "bg-emerald-400" },
    inactive:       { label: "Inactivo",  cls: "text-slate-500",   dotCls: "bg-slate-500" },
    pending_invite: { label: "Pendiente", cls: "text-amber-400",   dotCls: "bg-amber-400" },
};

/* ══════════════════════════════════════════════════════════════════ */
export default function Usuarios() {
    const [searchParams] = useSearchParams();
    const tenantParam = searchParams.get("tenant");

    const { claims } = useAuth();
    const canManageUsers = hasPermission(claims?.role, PERMISSIONS.MANAGE_TENANT_USERS);
    const { users, isLoading, createUser, updateUser } = useUsers();
    const { tenants = [] } = useTenants();
    const { areas = [] } = useAreas();
    const { inviteUser } = useInvitations();

    const [search, setSearch] = useState("");
    const [filterTenant, setFilterTenant] = useState(tenantParam || "all");
    const [filterRole, setFilterRole] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [selected, setSelected] = useState(null);
    /** Flujo para usuarios nuevos: invitación (colección invitations + correo) o creación directa (userProfiles + correo). */
    const [modalIntent, setModalIntent] = useState("create");

    const usersList = useMemo(() => users || [], [users]);
    const tenantMap = Object.fromEntries(tenants.map(t => [t.id, t.name]));

    /* ── Filtering ────────────────────────────────────────────── */
    const filtered = useMemo(() => {
        return usersList.filter(u => {
            const name = u.user_name || u.displayName || u.email || "";
            const email = u.user_email || u.email || "";
            const matchSearch = !search ||
                name.toLowerCase().includes(search.toLowerCase()) ||
                email.toLowerCase().includes(search.toLowerCase());
            const matchTenant = filterTenant === "all" || u.tenant_id === filterTenant || u.tenantId === filterTenant;
            const matchRole = filterRole === "all" || u.role === filterRole;
            return matchSearch && matchTenant && matchRole;
        });
    }, [usersList, search, filterTenant, filterRole]);

    /* ── Actions ──────────────────────────────────────────────── */
    const toggleStatus = async (u) => {
        if (!canManageUsers) return;
        const newStatus = u.status === "active" ? "inactive" : "active";
        try {
            await updateUser.mutateAsync({ id: u.id, status: newStatus });
        } catch (err) {
            toast.error(err?.message || "No se pudo actualizar el estado del usuario.");
        }
    };

    const handleSave = async (data) => {
        if (!canManageUsers) return;
        const wasEdit = Boolean(selected);
        const intentUsed = modalIntent;
        try {
            if (selected) {
                await updateUser.mutateAsync({ id: selected.id, ...data });
            } else {
                const email = (data.user_email || data.email || "").trim().toLowerCase();
                const tenantId = data.tenant_id || data.tenantId || "";
                const tenantName = tenants.find((t) => t.id === tenantId)?.name || tenantId;

                if (!email) {
                    toast.error("Indicá un correo electrónico válido.");
                    return;
                }
                if (!tenantId) {
                    toast.error("Seleccioná una empresa.");
                    return;
                }

                if (modalIntent === "invite") {
                    await inviteUser.mutateAsync({
                        email,
                        role: data.role || "operador",
                        tenantId,
                        tenantName,
                        user_name: data.user_name || "",
                        phone: data.phone || "",
                        area_ids: data.area_ids || [],
                    });
                } else {
                    await createUser.mutateAsync({
                        email,
                        role: data.role || "operador",
                        tenantId,
                        tenantDisplayName: tenantName,
                        user_name: data.user_name || "",
                        phone: data.phone || "",
                        status: data.status || "active",
                        area_ids: data.area_ids || [],
                    });
                }
            }
            setShowModal(false);
            setSelected(null);
            setModalIntent("create");
            if (wasEdit) {
                toast.success("Usuario actualizado.");
            } else if (intentUsed === "invite") {
                toast.success("Invitación registrada. Revisá la bandeja del correo (enlace de Firebase para definir contraseña).");
            } else {
                toast.success("Usuario creado. Se envió un correo de Firebase para definir contraseña.");
            }
        } catch (err) {
            toast.error(err?.message || "No se pudo guardar el usuario.");
        }
    };

    /* ── Helpers ──────────────────────────────────────────────── */
    const getRoleBadge = (role) => {
        const r = ROLES.find(x => x.id === role);
        return r || { label: role || "—", cls: "bg-slate-800 text-slate-400" };
    };

    const getStatusInfo = (status) => STATUS_STYLES[status] || STATUS_STYLES.inactive;

    const formatDate = (ts) => {
        try {
            if (ts?.toDate) return ts.toDate().toLocaleDateString("es-AR");
            if (ts?.seconds != null) return new Date(ts.seconds * 1000).toLocaleDateString("es-AR");
            const d = new Date(ts);
            if (Number.isNaN(d.getTime())) return "—";
            return d.toLocaleDateString("es-AR");
        } catch {
            return "—";
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6">

            {/* ─── HEADER ──────────────────────────────────── */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Users size={22} className="text-emerald-400" />
                        Usuarios
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Control de acceso y roles multi-tenant
                    </p>
                </div>
                <Guard permission={PERMISSIONS.MANAGE_TENANT_USERS} fallback={null}>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setSelected(null);
                                setModalIntent("invite");
                                setShowModal(true);
                            }}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            <UserPlus size={16} /> Invitar usuario
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setSelected(null);
                                setModalIntent("create");
                                setShowModal(true);
                            }}
                            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            <UserCircle2 size={16} /> Crear usuario
                        </button>
                    </div>
                </Guard>
            </div>

            {/* ─── STATS ROW — 5 Roles ─────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                {ROLES.map(role => (
                    <div key={role.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center">
                        <p className={`text-2xl font-bold ${role.numCls}`}>
                            {usersList.filter(u => u.role === role.id).length}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">{role.label}</p>
                    </div>
                ))}
            </div>

            {/* ─── FILTERS ─────────────────────────────────── */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-[12rem]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por nombre o email..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                </div>

                <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500">
                    <option value="all">Todos los roles</option>
                    {ROLES.map(r => (
                        <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                </select>

                <select value={filterTenant} onChange={e => setFilterTenant(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500">
                    <option value="all">Todas las empresas</option>
                    {tenants.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
            </div>

            {/* ─── TABLE ───────────────────────────────────── */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                {isLoading ? (
                    <div className="text-center py-16 text-slate-500">
                        <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
                        Cargando usuarios...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs uppercase text-slate-400 border-b border-slate-800">
                                    <th className="px-4 py-3">Usuario</th>
                                    <th className="px-4 py-3 hidden md:table-cell">Empresa</th>
                                    <th className="px-4 py-3">Rol</th>
                                    <th className="px-4 py-3 hidden lg:table-cell">Áreas</th>
                                    <th className="px-4 py-3">Estado</th>
                                    <th className="px-4 py-3 hidden lg:table-cell">Registro</th>
                                    <th className="px-4 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-slate-500">
                                            No hay usuarios
                                        </td>
                                    </tr>
                                ) : filtered.map((u, i) => {
                                    const roleBadge = getRoleBadge(u.role);
                                    const statusInfo = getStatusInfo(u.status);
                                    const userName = u.user_name || u.displayName || "Sin nombre";
                                    const userEmail = u.user_email || u.email || "—";

                                    return (
                                        <tr key={u.id}
                                            className={`border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${i % 2 !== 0 ? "bg-slate-900/40" : ""}`}
                                        >
                                            {/* Usuario */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                                                        {userName[0]?.toUpperCase() || "?"}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{userName}</p>
                                                        <p className="text-xs text-slate-500">{userEmail}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Empresa */}
                                            <td className="px-4 py-3 text-xs text-slate-400 hidden md:table-cell">
                                                {tenantMap[u.tenant_id] || tenantMap[u.tenantId] || "—"}
                                            </td>

                                            {/* Rol */}
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${roleBadge.cls}`}>
                                                    {roleBadge.label}
                                                </span>
                                            </td>

                                            {/* Áreas */}
                                            <td className="px-4 py-3 text-xs text-slate-400 hidden lg:table-cell">
                                                {u.area_ids?.length || 0} área(s)
                                            </td>

                                            {/* Estado */}
                                            <td className="px-4 py-3">
                                                <span className={`text-xs font-medium flex items-center gap-1 ${statusInfo.cls}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotCls}`} />
                                                    {statusInfo.label}
                                                </span>
                                            </td>

                                            {/* Registro */}
                                            <td className="px-4 py-3 text-xs text-slate-500 hidden lg:table-cell">
                                                {formatDate(u.created_date || u.createdAt)}
                                            </td>

                                            {/* Acciones */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Guard permission={PERMISSIONS.MANAGE_TENANT_USERS} fallback={null}>
                                                        <button onClick={() => { setSelected(u); setShowModal(true); }}
                                                            className="text-xs text-slate-400 hover:text-white hover:bg-slate-800 px-2 py-1 rounded transition-colors">
                                                            Editar
                                                        </button>
                                                        <button onClick={() => toggleStatus(u)}
                                                            className={`text-xs px-2 py-1 rounded transition-colors ${
                                                                u.status === "active"
                                                                    ? "text-red-400 hover:text-red-300 hover:bg-slate-800"
                                                                    : "text-emerald-400 hover:text-emerald-300 hover:bg-slate-800"
                                                            }`}>
                                                            {u.status === "active" ? "Desactivar" : "Activar"}
                                                        </button>
                                                    </Guard>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ─── MODAL ───────────────────────────────────── */}
            {showModal && (
                <UserModal
                    key={
                        selected
                            ? (selected.email || selected.id)
                            : `new-${modalIntent}-${tenants.map((t) => t.id).sort().join(",")}`
                    }
                    user={selected}
                    intent={selected ? "edit" : modalIntent}
                    tenants={tenants}
                    areas={areas}
                    onSave={handleSave}
                    onClose={() => {
                        setShowModal(false);
                        setSelected(null);
                        setModalIntent("create");
                    }}
                />
            )}
        </div>
    );
}

/* ── UserModal ────────────────────────────────────────────────────── */
function UserModal({ user, intent = "create", tenants, areas, onSave, onClose }) {
    // tenant por defecto si solo hay una empresa (evita useEffect + setState: el key del modal remonta al cargar tenants).
    const defaultTenantId = !user && tenants.length === 1 ? tenants[0].id : "";

    const [data, setData] = useState(user ? {
        user_name: user.user_name || user.displayName || "",
        user_email: user.user_email || user.email || "",
        phone: user.phone || "",
        role: user.role || "operador",
        tenant_id: user.tenant_id || user.tenantId || "",
        status: user.status || "active",
        area_ids: user.area_ids || [],
    } : {
        user_name: "", user_email: "", phone: "",
        role: "operador",
        tenant_id: defaultTenantId,
        status: "active",
        area_ids: [],
    });

    const set = (k, v) => setData(prev => ({ ...prev, [k]: v }));

    const filteredAreas = areas.filter(a =>
        a.tenant_id === data.tenant_id || a.tenantId === data.tenant_id
    );

    return (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl relative z-[201]" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-800">
                    <div>
                        <h2 className="text-white font-semibold flex items-center gap-2">
                            <UserPlus size={16} className="text-emerald-400" />
                            {user ? "Editar usuario" : intent === "invite" ? "Invitar usuario" : "Crear usuario"}
                        </h2>
                        <p className="text-slate-500 text-xs mt-0.5">
                            {user
                                ? "Modifica los datos del usuario"
                                : intent === "invite"
                                    ? "Se enviará un correo de Firebase con enlace para definir contraseña y acceder al panel"
                                    : "Se creará la cuenta en Firebase, el perfil en el sistema y el mismo correo de acceso"}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    {/* Row 1: Name + Email */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-400 block mb-1.5">Nombre completo</label>
                            <input value={data.user_name} onChange={e => set("user_name", e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                placeholder="Juan Pérez" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 block mb-1.5">Email *</label>
                            <input value={data.user_email} onChange={e => set("user_email", e.target.value)}
                                type="email" required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                placeholder="usuario@empresa.com" />
                        </div>
                    </div>

                    {/* Row 2: Phone */}
                    <div>
                        <label className="text-xs text-slate-400 block mb-1.5">Teléfono</label>
                        <input value={data.phone} onChange={e => set("phone", e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                            placeholder="+54 11 1234-5678" />
                    </div>

                    {/* Row 3: Role + Tenant */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-400 block mb-1.5">Rol</label>
                            <select value={data.role} onChange={e => set("role", e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500">
                                {ROLES.map(r => (
                                    <option key={r.id} value={r.id}>{r.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 block mb-1.5">Empresa</label>
                            <select value={data.tenant_id} onChange={e => set("tenant_id", e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500">
                                <option value="">Seleccionar...</option>
                                {tenants.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Estado: solo al crear perfil directo (no en modo invitación por correo) */}
                    {user || intent !== "invite" ? (
                        <div>
                            <label className="text-xs text-slate-400 block mb-1.5">Estado</label>
                            <select value={data.status} onChange={e => set("status", e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500">
                                <option value="active">Activo</option>
                                <option value="inactive">Inactivo</option>
                                <option value="pending_invite">Pendiente</option>
                            </select>
                        </div>
                    ) : (
                        <p className="text-xs text-amber-400/90 bg-amber-950/30 border border-amber-900/40 rounded-lg px-3 py-2">
                            La invitación quedará pendiente hasta que la persona inicie sesión y pulse <strong>Aceptar</strong> en el aviso del sistema.
                        </p>
                    )}

                    {/* Row 5: Areas multiselect */}
                    {data.tenant_id && (
                        <div>
                            <label className="text-xs text-slate-400 block mb-2">Áreas Asignadas</label>
                            <div className="bg-slate-800 rounded-lg p-3 max-h-36 overflow-y-auto space-y-1.5">
                                {filteredAreas.length > 0 ? filteredAreas.map(area => (
                                    <label key={area.id} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={(data.area_ids || []).includes(area.id)}
                                            onChange={e => {
                                                const current = data.area_ids || [];
                                                set("area_ids", e.target.checked
                                                    ? [...current, area.id]
                                                    : current.filter(id => id !== area.id)
                                                );
                                            }}
                                            className="accent-emerald-500"
                                        />
                                        <span className="text-xs text-slate-300">{area.name}</span>
                                    </label>
                                )) : (
                                    <p className="text-xs text-slate-600">No hay áreas para esta empresa</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-5 border-t border-slate-800">
                    <button onClick={onClose}
                        className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-lg transition-colors">
                        Cancelar
                    </button>
                    <button onClick={() => onSave(data)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors">
                        {user ? (
                            "Guardar cambios"
                        ) : intent === "invite" ? (
                            <>
                                <UserPlus size={14} />
                                Enviar invitación por correo
                            </>
                        ) : (
                            <>
                                <UserCircle2 size={14} />
                                Crear usuario y notificar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
