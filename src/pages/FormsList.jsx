import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Plus, Search, FileText, Edit3, Archive, Trash2,
    Clock, FolderOpen
} from "lucide-react";
import { useForms } from "../api/useForms";
import { useTenants } from "../api/useTenants";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useQueryClient } from "@tanstack/react-query";

/* ── Constants ────────────────────────────────────────────────────── */
const STATUS_BADGE = {
    draft:    { label: "Borrador",  cls: "bg-slate-700 text-slate-300" },
    active:   { label: "Activo",    cls: "bg-emerald-900/40 text-emerald-400" },
    published:{ label: "Publicado", cls: "bg-emerald-900/40 text-emerald-400" },
    archived: { label: "Archivado", cls: "bg-amber-900/30 text-amber-400" },
};

const CATEGORY_LABELS = {
    inspeccion:      "Inspección",
    auditoria:       "Auditoría",
    encuesta:        "Encuesta",
    control_calidad: "Control Calidad",
    compliance:      "Compliance",
    reporte:         "Reporte",
    otro:            "Otro",
};

/* ══════════════════════════════════════════════════════════════════ */
export default function FormsList() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const tenantParam = searchParams.get("tenant");

    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterTenant, setFilterTenant] = useState(tenantParam || "all");

    const { forms } = useForms();
    const { tenants = [] } = useTenants();

    const formsList = forms || [];
    const tenantMap = Object.fromEntries(tenants.map(t => [t.id, t.name]));

    /* ── Filtering ────────────────────────────────────────────── */
    const filtered = formsList.filter(f => {
        const matchSearch =
            f.name?.toLowerCase().includes(search.toLowerCase()) ||
            f.title?.toLowerCase().includes(search.toLowerCase()) ||
            f.description?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === "all" || f.status === filterStatus;
        const matchTenant = filterTenant === "all" || f.tenant_id === filterTenant;
        return matchSearch && matchStatus && matchTenant;
    });

    /* ── Actions ──────────────────────────────────────────────── */
    const archiveForm = async (form) => {
        try {
            await updateDoc(doc(db, "FormSchemas", form.id), { status: "archived" });
            queryClient.invalidateQueries({ queryKey: ["forms"] });
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("¿Eliminar este formulario?")) return;
        try {
            await deleteDoc(doc(db, "FormSchemas", id));
            queryClient.invalidateQueries({ queryKey: ["forms"] });
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white">

            {/* ─── HEADER ─────────────────────────────────────────── */}
            <div className="bg-slate-900 border-b border-slate-800 px-6 py-5">
                {/* Top row */}
                <div className="flex justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-white">Formularios</h1>
                        <p className="text-slate-500 text-sm mt-0.5">
                            {formsList.length} formularios en total
                        </p>
                    </div>
                    <button onClick={() => navigate("/forms/new")}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        <Plus size={16} /> Nuevo Formulario
                    </button>
                </div>

                {/* Filters row */}
                <div className="flex flex-wrap gap-3 mt-4">
                    <div className="relative flex-1 min-w-[12rem]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar formularios..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>

                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500">
                        <option value="all">Todos los estados</option>
                        <option value="draft">Borrador</option>
                        <option value="active">Activo</option>
                        <option value="published">Publicado</option>
                        <option value="archived">Archivado</option>
                    </select>

                    <select value={filterTenant} onChange={e => setFilterTenant(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500">
                        <option value="all">Todas las empresas</option>
                        {tenants.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ─── CONTENT ────────────────────────────────────────── */}
            <div className="p-6">
                {!forms ? (
                    <div className="flex items-center justify-center py-16 text-slate-500">
                        <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mr-3" />
                        Cargando formularios...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                        <FolderOpen size={40} className="mb-3 opacity-40" />
                        <p className="text-lg font-medium text-slate-500">No hay formularios</p>
                        <p className="text-sm mt-1">Crea tu primer formulario con el botón de arriba</p>
                    </div>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {filtered.map(form => {
                            const badge = STATUS_BADGE[form.status] || STATUS_BADGE.draft;
                            const displayName = form.name || form.title || "Sin nombre";

                            return (
                                <div key={form.id}
                                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all group">

                                    {/* Top row */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                                                <FileText size={15} className="text-emerald-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                                                {form.tenant_id && (
                                                    <p className="text-xs text-slate-500 truncate">
                                                        {tenantMap[form.tenant_id] || "Sin empresa"}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${badge.cls}`}>
                                            {badge.label}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    {form.description && (
                                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">{form.description}</p>
                                    )}

                                    {/* Metadata */}
                                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-600">
                                        {form.category && (
                                            <span className="bg-slate-800 px-2 py-0.5 rounded">
                                                {CATEGORY_LABELS[form.category] || form.category}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Clock size={10} /> v{form.version || 1}
                                        </span>
                                        {(form.sections || form.fields) && (
                                            <span>
                                                {form.sections?.reduce((acc, s) => acc + (s.fields?.length || 0), 0) || form.fields?.length || 0} campos
                                            </span>
                                        )}
                                    </div>

                                    {/* Footer actions */}
                                    <div className="flex items-center gap-1 mt-4 pt-3 border-t border-slate-800">
                                        <button onClick={() => navigate(`/forms/new?id=${form.id}`)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                                            <Edit3 size={12} /> Editar
                                        </button>

                                        {form.status !== "archived" && (
                                            <button onClick={() => archiveForm(form)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors">
                                                <Archive size={12} /> Archivar
                                            </button>
                                        )}

                                        <button onClick={() => handleDelete(form.id)}
                                            className="ml-auto p-1.5 text-slate-700 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
