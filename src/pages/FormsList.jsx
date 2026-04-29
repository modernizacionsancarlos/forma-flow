import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Plus, Search, FileText, Edit3, Archive, Trash2,
    Clock, FolderOpen, Link2, Copy, Globe, Lock, Sliders
} from "lucide-react";
import { useForms } from "../api/useForms";
import { useTenants } from "../api/useTenants";
import { collection, doc, getDocs, query, updateDoc, deleteDoc, where, writeBatch, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import ResponseLimitModal from "../components/forms/ResponseLimitModal";

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

const countFields = (form) => {
    if (form.sections?.length) {
        return form.sections.reduce((acc, section) => acc + (section.fields?.length || 0), 0);
    }

    if (form.fields?.length) {
        return form.fields.length;
    }

    if (typeof form.fields_schema === "string") {
        try {
            const parsed = JSON.parse(form.fields_schema);
            return Array.isArray(parsed) ? parsed.filter(field => field.type !== "section").length : 0;
        } catch {
            return 0;
        }
    }

    return 0;
};

const formatResponseLimit = (responseLimit) => {
    if (!responseLimit || responseLimit.type === "none") return "Sin límite";
    if (responseLimit.type === "count") return `Máx. ${responseLimit.count || 0} resp.`;
    if (responseLimit.type === "duration") return `${responseLimit.days || 0} días`;
    if (responseLimit.type === "datetime") return responseLimit.deadline || "Fecha límite";
    return "Límite personalizado";
};

const MiniToggle = ({ checked, onChange, label, disabled }) => (
    <button
        type="button"
        disabled={disabled}
        onClick={onChange}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-800/30 px-2 py-1.5 text-left text-[11px] text-slate-300 hover:border-slate-600 disabled:opacity-50"
    >
        <span className="text-slate-400">{label}</span>
        <div
            className={`relative h-4 w-8 shrink-0 rounded-full transition-colors ${
                checked ? "bg-emerald-500" : "bg-slate-600"
            }`}
        >
            <div
                className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all ${
                    checked ? "left-[18px]" : "left-0.5"
                }`}
            />
        </div>
    </button>
);

/* ══════════════════════════════════════════════════════════════════ */
export default function FormsList() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const tenantParam = searchParams.get("tenant");

    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterTenant, setFilterTenant] = useState(tenantParam || "all");
    const [savingFormId, setSavingFormId] = useState(null);
    /** Formulario cuyo límite de respuestas se está editando (id). */
    const [responseLimitFormId, setResponseLimitFormId] = useState(null);

    const { forms } = useForms();
    const { tenants = [] } = useTenants();

    const formsList = forms || [];
    const tenantMap = Object.fromEntries(tenants.map(t => [t.id, t.name]));

    useEffect(() => {
        // Warm up del chunk del constructor para navegación más fluida.
        import("./FormBuilder");
    }, []);

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
            toast.error(err?.message || "No se pudo archivar el formulario");
        }
    };

    const patchFormFields = async (form, partial) => {
        setSavingFormId(form.id);
        try {
            const next = { ...partial, updated_date: Timestamp.now() };
            if (partial.accepts_responses !== undefined) {
                next.status = partial.accepts_responses ? "active" : "draft";
            }
            if (partial.is_public !== undefined) {
                next.visibility = partial.is_public ? "public" : "private";
            }
            await updateDoc(doc(db, "FormSchemas", form.id), next);
            toast.success("Cambios guardados");
            queryClient.invalidateQueries({ queryKey: ["forms"] });
        } catch (err) {
            toast.error(err?.message || "Error al actualizar el formulario");
        } finally {
            setSavingFormId(null);
        }
    };

    const copyToClipboard = async (url) => {
        try {
            await navigator.clipboard.writeText(url);
            toast.success("Enlace copiado al portapapeles");
        } catch {
            toast.error("No se pudo copiar el enlace");
        }
    };

    const formForResponseLimit = responseLimitFormId
        ? formsList.find((f) => f.id === responseLimitFormId)
        : null;

    const normalizedResponseLimitForModal = (() => {
        const rl = formForResponseLimit?.response_limit;
        if (!rl || rl.type === "none") return { type: "none" };
        if (rl.type === "count") return { type: "count", count: rl.count || 1 };
        return { type: "none" };
    })();

    const handleResponseLimitSave = (rl) => {
        if (!formForResponseLimit) return;
        let next = rl;
        if (rl?.type === "count") {
            next = { type: "count", count: Math.max(1, Number(rl.count) || 1) };
        }
        patchFormFields(formForResponseLimit, { response_limit: next });
        setResponseLimitFormId(null);
    };

    const handleDelete = async (id) => {
        if (
            !confirm(
                "¿Eliminar este formulario? También se eliminarán las respuestas asociadas a este formulario en la base de datos."
            )
        ) {
            return;
        }
        try {
            const bySchema = query(collection(db, "Submissions"), where("schema_id", "==", id));
            const byForm = query(collection(db, "Submissions"), where("form_id", "==", id));
            const [snap1, snap2] = await Promise.all([getDocs(bySchema), getDocs(byForm)]);
            const subIds = new Set([
                ...snap1.docs.map((d) => d.id),
                ...snap2.docs.map((d) => d.id),
            ]);
            const BATCH = 400;
            let batch = writeBatch(db);
            let n = 0;
            for (const sid of subIds) {
                batch.delete(doc(db, "Submissions", sid));
                n++;
                if (n >= BATCH) {
                    await batch.commit();
                    batch = writeBatch(db);
                    n = 0;
                }
            }
            if (n > 0) await batch.commit();

            await deleteDoc(doc(db, "FormSchemas", id));
            queryClient.invalidateQueries({ queryKey: ["forms"] });
        } catch (err) {
            toast.error(err?.message || "No se pudo eliminar el formulario");
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
                    <button
                        onMouseEnter={() => import("./FormBuilder")}
                        onFocus={() => import("./FormBuilder")}
                        onClick={() => navigate("/forms/new")}
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
                            const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
                            const isPublic =
                                form.is_public === true || form.visibility === "public";
                            const publicUrl = `${baseUrl}/public-form/${form.id}`;
                            const internalUrl = `${baseUrl}/view/${form.id}`;
                            const copyUrl = isPublic ? publicUrl : internalUrl;
                            const accepts =
                                form.accepts_responses !== undefined
                                    ? form.accepts_responses
                                    : form.status === "active" || form.status === "published";
                            const rowBusy = savingFormId === form.id;

                            return (
                                <div
                                    key={form.id}
                                    className={`bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all group ${
                                        rowBusy ? "opacity-80" : ""
                                    }`}
                                >
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
                                        {/* Bloque principal: título, descripción, metadatos */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-slate-800 flex items-center justify-center">
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

                                            {form.description && (
                                                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{form.description}</p>
                                            )}

                                            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-600">
                                                {form.category && (
                                                    <span className="bg-slate-800 px-2 py-0.5 rounded">
                                                        {CATEGORY_LABELS[form.category] || form.category}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock size={10} /> v{form.version || 1}
                                                </span>
                                                {(form.sections || form.fields || form.fields_schema) && (
                                                    <span>{countFields(form)} campos</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Accesos: enlace, acepta respuestas, público, límite */}
                                        <div className="flex w-full flex-col gap-2 lg:w-56 lg:min-w-[14rem] lg:border-l lg:border-slate-800 lg:pl-4">
                                            <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/40 px-2 py-1.5">
                                                {isPublic ? (
                                                    <Globe size={12} className="shrink-0 text-cyan-400" title="Enlace público" />
                                                ) : (
                                                    <Lock size={12} className="shrink-0 text-amber-400" title="Enlace con permisos" />
                                                )}
                                                <span
                                                    className="min-w-0 flex-1 truncate text-[10px] text-slate-400"
                                                    title={copyUrl}
                                                >
                                                    {isPublic ? "Público (anónimo)" : "Solo con sesión"}
                                                </span>
                                                <button
                                                    type="button"
                                                    title="Copiar enlace"
                                                    disabled={rowBusy}
                                                    onClick={() => copyToClipboard(copyUrl)}
                                                    className="shrink-0 rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-white disabled:opacity-50"
                                                >
                                                    <Copy size={12} />
                                                </button>
                                                <a
                                                    href={copyUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    title="Abrir en nueva pestaña"
                                                    className="shrink-0 rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-emerald-400"
                                                >
                                                    <Link2 size={12} />
                                                </a>
                                            </div>

                                            <MiniToggle
                                                label="Acepta respuestas"
                                                checked={accepts}
                                                disabled={rowBusy}
                                                onChange={() => patchFormFields(form, { accepts_responses: !accepts })}
                                            />
                                            <MiniToggle
                                                label="Hacer público"
                                                checked={isPublic}
                                                disabled={rowBusy}
                                                onChange={() => patchFormFields(form, { is_public: !isPublic })}
                                            />
                                            <button
                                                type="button"
                                                disabled={rowBusy}
                                                onClick={() => setResponseLimitFormId(form.id)}
                                                className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-800/30 px-2 py-1.5 text-left text-[11px] text-slate-300 hover:border-slate-600 disabled:opacity-50"
                                            >
                                                <span className="text-slate-400">Límite de respuestas</span>
                                                <span className="flex items-center gap-1 truncate text-slate-200">
                                                    <Sliders size={12} className="shrink-0" />
                                                    {formatResponseLimit(form.response_limit)}
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 mt-4 pt-3 border-t border-slate-800">
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/forms/new?id=${form.id}`)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                        >
                                            <Edit3 size={12} /> Editar
                                        </button>

                                        {form.status !== "archived" && (
                                            <button
                                                type="button"
                                                onClick={() => archiveForm(form)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                                            >
                                                <Archive size={12} /> Archivar
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(form.id)}
                                            className="ml-auto p-1.5 text-slate-700 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <ResponseLimitModal
                isOpen={!!formForResponseLimit}
                value={normalizedResponseLimitForModal}
                onClose={() => setResponseLimitFormId(null)}
                onSave={handleResponseLimitSave}
            />
        </div>
    );
}
