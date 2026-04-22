import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import {
    ClipboardList, Filter, Search, Trash2, X, FileText, RefreshCw
} from "lucide-react";
import { collection, query, where, getDocs, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import { useForms } from "../api/useForms";
import { useAreas } from "../api/useAreas";
import { toast } from "react-hot-toast";

/* ── Status config ────────────────────────────────────────────────── */
const STATUS_CONFIG = {
    draft:          { label: "Borrador", cls: "bg-slate-700 text-slate-300" },
    submitted:      { label: "Enviado", cls: "bg-blue-900/40 text-blue-400" },
    pending_review: { label: "En Revisión", cls: "bg-amber-900/40 text-amber-400" },
    in_review:      { label: "En Revisión", cls: "bg-amber-900/40 text-amber-400" },
    request_info:   { label: "Info Requerida", cls: "bg-cyan-900/40 text-cyan-400" },
    approved:       { label: "Aprobado", cls: "bg-emerald-900/40 text-emerald-400" },
    rejected:       { label: "Rechazado", cls: "bg-red-900/40 text-red-400" },
    archived:       { label: "Archivado", cls: "bg-slate-700 text-slate-400" },
    closed:         { label: "Cerrado", cls: "bg-slate-800 text-slate-500" },
};

/* ══════════════════════════════════════════════════════════════════ */
export default function Submissions() {
    const { claims } = useAuth();
    const [searchParams] = useSearchParams();
    const formParam = searchParams.get("form");

    const { forms } = useForms();
    const { areas = [] } = useAreas();
    const formsList = forms || [];

    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFormId, setSelectedFormId] = useState(formParam || "all");
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [submissionToDelete, setSubmissionToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [sidebarSearch, setSidebarSearch] = useState("");
    const [filters, setFilters] = useState({
        status: "all",
        dateFrom: "",
        dateTo: "",
        search: "",
    });
    const [datePreset, setDatePreset] = useState("any");

    /* ── Fetch submissions ────────────────────────────────────── */
    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            let q = query(collection(db, "Submissions"), orderBy("created_date", "desc"));
            if (claims.role !== "super_admin" && claims.tenantId) {
                q = query(
                    collection(db, "Submissions"),
                    where("tenant_id", "==", claims.tenantId),
                    orderBy("created_date", "desc")
                );
            }
            const snap = await getDocs(q);
            setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.error("Error fetching submissions:", err);
            toast.error("No se pudieron recargar las respuestas");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSubmissions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [claims.tenantId]);

    useEffect(() => {
        const timer = setInterval(() => {
            fetchSubmissions();
        }, 30000);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [claims.tenantId, claims.role]);

    /* ── Filtering ────────────────────────────────────────────── */
    const activeFiltersCount = [
        filters.status !== "all",
        filters.dateFrom !== "",
        filters.dateTo !== "",
        filters.search !== "",
    ].filter(Boolean).length;

    const filtered = useMemo(() => {
        return submissions.filter(sub => {
            const matchForm = selectedFormId === "all" || sub.form_id === selectedFormId || sub.schema_id === selectedFormId;
            const matchStatus = filters.status === "all" || sub.status === filters.status;
            const matchSearch = !filters.search ||
                sub.document_code?.toLowerCase().includes(filters.search.toLowerCase()) ||
                sub.submitted_by_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
                sub.id.toLowerCase().includes(filters.search.toLowerCase());

            let matchDateFrom = true;
            let matchDateTo = true;
            if (filters.dateFrom) {
                const subDate = sub.submitted_at?.toDate?.() || sub.created_date?.toDate?.() || new Date(sub.submitted_at || sub.created_date);
                matchDateFrom = subDate >= new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                const subDate = sub.submitted_at?.toDate?.() || sub.created_date?.toDate?.() || new Date(sub.submitted_at || sub.created_date);
                matchDateTo = subDate <= new Date(filters.dateTo + "T23:59:59");
            }

            return matchForm && matchStatus && matchSearch && matchDateFrom && matchDateTo;
        });
    }, [submissions, selectedFormId, filters]);

    /* ── Sidebar forms filter ─────────────────────────────────── */
    const sidebarForms = formsList.filter(f =>
        f.name?.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
        f.title?.toLowerCase().includes(sidebarSearch.toLowerCase())
    );

    /* ── Actions ──────────────────────────────────────────────── */
    const updateStatus = async (sub, newStatus) => {
        try {
            await updateDoc(doc(db, "Submissions", sub.id), { status: newStatus });
            setSubmissions(prev => prev.map(s => s.id === sub.id ? { ...s, status: newStatus } : s));
            if (selectedSubmission?.id === sub.id) {
                setSelectedSubmission(prev => ({ ...prev, status: newStatus }));
            }
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    const deleteSubmission = async () => {
        if (!submissionToDelete?.id) return;
        setIsDeleting(true);
        try {
            await deleteDoc(doc(db, "Submissions", submissionToDelete.id));
            setSubmissions(prev => prev.filter(s => s.id !== submissionToDelete.id));
            if (selectedSubmission?.id === submissionToDelete.id) setSelectedSubmission(null);
            toast.success("Respuesta eliminada correctamente");
        } catch (err) {
            console.error("Error deleting submission:", err);
            toast.error(err?.message || "No se pudo eliminar la respuesta");
        } finally {
            setIsDeleting(false);
            setSubmissionToDelete(null);
        }
    };

    const clearFilters = () => setFilters({ status: "all", dateFrom: "", dateTo: "", search: "" });

    const applyDatePreset = (preset) => {
        setDatePreset(preset);

        if (preset === "any") {
            setFilters(prev => ({ ...prev, dateFrom: "", dateTo: "" }));
            return;
        }

        if (preset === "custom") {
            setShowFilters(true);
            return;
        }

        const now = new Date();
        const from = new Date(now);
        if (preset === "today") {
            from.setHours(0, 0, 0, 0);
        } else if (preset === "7d") {
            from.setDate(now.getDate() - 7);
        } else if (preset === "30d") {
            from.setDate(now.getDate() - 30);
        }

        const formatInputDate = (date) => date.toISOString().split("T")[0];
        setFilters(prev => ({
            ...prev,
            dateFrom: formatInputDate(from),
            dateTo: formatInputDate(now),
        }));
    };

    /* ── Helpers ──────────────────────────────────────────────── */
    const getFormName = (id) => formsList.find(f => f.id === id)?.name || formsList.find(f => f.id === id)?.title || "—";
    const getAreaName = (id) => areas.find(a => a.id === id)?.name || "—";
    const formatDate = (ts) => {
        try {
            const d = ts?.toDate?.() || (typeof ts === "number" ? new Date(ts) : new Date(ts));
            if (Number.isNaN(d.getTime())) return "—";
            return format(d, "dd/MM/yy HH:mm");
        } catch { return "—"; }
    };

    const selectedTitle = selectedFormId === "all"
        ? "Todas las Respuestas"
        : getFormName(selectedFormId);

    return (
        <div className="min-h-screen bg-slate-950 text-white flex">

            {/* ════════ SIDEBAR ════════ */}
            <div className="w-64 bg-slate-900 border-r border-slate-800 flex-col hidden md:flex flex-shrink-0">
                <div className="p-4 border-b border-slate-800">
                    <p className="text-xs text-slate-500 uppercase font-medium mb-3">Respuestas</p>
                    <div className="relative">
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            value={sidebarSearch}
                            onChange={e => setSidebarSearch(e.target.value)}
                            placeholder="Buscar formulario..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-2">
                    {/* All */}
                    <button
                        onClick={() => setSelectedFormId("all")}
                        className={`w-full text-left flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                            selectedFormId === "all"
                                ? "bg-emerald-600/20 text-emerald-400"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        }`}
                    >
                        <span>Todos los formularios</span>
                        <span className="text-xs bg-slate-800 px-1.5 py-0.5 rounded">{submissions.length}</span>
                    </button>

                    {sidebarForms.map(form => {
                        const count = submissions.filter(s => s.form_id === form.id || s.schema_id === form.id).length;
                        return (
                            <button
                                key={form.id}
                                onClick={() => setSelectedFormId(form.id)}
                                className={`w-full text-left flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                                    selectedFormId === form.id
                                        ? "bg-emerald-600/20 text-emerald-400"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                }`}
                            >
                                <span className="truncate pr-2">{form.name || form.title}</span>
                                <span className="text-xs bg-slate-800 px-1.5 py-0.5 rounded flex-shrink-0">{count}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ════════ MAIN AREA ════════ */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* ─── Header ─────────────────────────────────────── */}
                <div className="bg-slate-900 border-b border-slate-800 px-6 py-4">
                    <div className="flex justify-between items-center gap-4">
                        <div>
                            <h1 className="text-lg font-bold text-white">{selectedTitle}</h1>
                            <p className="text-slate-500 text-sm">{filtered.length} entradas</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchSubmissions}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-slate-800 text-slate-300 hover:text-white transition-colors"
                                title="Recargar respuestas"
                            >
                                <RefreshCw size={14} />
                                Recargar
                            </button>
                            <button onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                    showFilters
                                        ? "bg-emerald-600/20 text-emerald-400 border border-emerald-700/50"
                                        : "bg-slate-800 text-slate-400 hover:text-white"
                                }`}
                            >
                                <Filter size={14} />
                                Filtros
                                {activeFiltersCount > 0 && (
                                    <span className="bg-emerald-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Filters row — always visible search + selects */}
                    <div className="flex flex-wrap gap-3 mt-4">
                        <div className="relative flex-1 min-w-[12rem]">
                            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                value={filters.search}
                                onChange={e => setFilters({ ...filters, search: e.target.value })}
                                placeholder="Buscar por código, usuario..."
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>
                        <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}
                            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500">
                            <option value="all">Todos los estados</option>
                            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                <option key={k} value={k}>{v.label}</option>
                            ))}
                        </select>
                        <select
                            value={datePreset}
                            onChange={(e) => applyDatePreset(e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500 hidden sm:block"
                        >
                            <option value="any">Cualquier fecha</option>
                            <option value="today">Hoy</option>
                            <option value="7d">Últimos 7 días</option>
                            <option value="30d">Últimos 30 días</option>
                            <option value="custom">Rango personalizado</option>
                        </select>
                    </div>
                </div>

                {/* ─── Extended Filters Panel ─────────────────────── */}
                {showFilters && (
                    <div className="bg-slate-900 border-b border-slate-800 px-6 py-4">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs text-slate-500 font-medium">Filtros avanzados</p>
                            {activeFiltersCount > 0 && (
                                <button onClick={clearFilters} className="text-xs text-emerald-400 hover:underline">
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Desde</label>
                                <input type="date" value={filters.dateFrom}
                                    onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Hasta</label>
                                <input type="date" value={filters.dateTo}
                                    onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Estado</label>
                                <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-emerald-500">
                                    <option value="all">Todos</option>
                                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                        <option key={k} value={k}>{v.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <span className="text-xs text-slate-600">{filtered.length} resultados</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Table ──────────────────────────────────────── */}
                <div className="flex-1 overflow-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-16 text-slate-500">
                            <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full mr-3" />
                            Cargando respuestas...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-600">
                            <ClipboardList size={40} className="mb-3 opacity-30" />
                            <p className="text-lg font-medium text-slate-500">
                                {selectedFormId === "all" ? "Selecciona un formulario de la lista" : "No hay respuestas para mostrar"}
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-slate-900 sticky top-0 z-10">
                                <tr className="text-xs uppercase text-slate-400 border-b border-slate-800">
                                    <th className="px-4 py-3 text-left w-10">#</th>
                                    <th className="px-4 py-3 text-left">Código</th>
                                    {selectedFormId === "all" && (
                                        <th className="px-4 py-3 text-left hidden md:table-cell">Formulario</th>
                                    )}
                                    <th className="px-4 py-3 text-left hidden sm:table-cell">Área</th>
                                    <th className="px-4 py-3 text-left">Enviado por</th>
                                    <th className="px-4 py-3 text-left">Estado</th>
                                    <th className="px-4 py-3 text-left hidden sm:table-cell">Fecha</th>
                                    <th className="px-4 py-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((sub, idx) => (
                                    <tr
                                        key={sub.id}
                                        onClick={() => setSelectedSubmission(sub)}
                                        className="border-b border-slate-800 hover:bg-slate-800/30 cursor-pointer transition-colors"
                                    >
                                        <td className="px-4 py-3 text-slate-600 text-xs">{idx + 1}</td>
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-xs text-slate-300">
                                                {sub.document_code || sub.id}
                                            </span>
                                        </td>
                                        {selectedFormId === "all" && (
                                            <td className="px-4 py-3 text-xs text-slate-400 hidden md:table-cell">
                                                {getFormName(sub.form_id || sub.schema_id)}
                                            </td>
                                        )}
                                        <td className="px-4 py-3 text-xs text-slate-400 hidden sm:table-cell">
                                            {getAreaName(sub.area_id)}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-300">
                                            {sub.submitted_by_name || "Anónimo"}
                                        </td>
                                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                            <select
                                                value={sub.status || "pending_review"}
                                                onChange={e => updateStatus(sub, e.target.value)}
                                                className="text-xs px-2 py-1 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer min-w-[130px]"
                                            >
                                                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                                    <option key={k} value={k} className="bg-slate-900 text-slate-100">
                                                        {v.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500 hidden sm:table-cell">
                                            {formatDate(sub.submitted_at || sub.created_date)}
                                        </td>
                                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => setSubmissionToDelete(sub)}
                                                className="p-1 text-slate-700 hover:text-red-400 transition-colors">
                                                <Trash2 size={13} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* ════════ DETAIL MODAL ════════ */}
            {selectedSubmission && (
                <SubmissionDetailModal
                    submission={selectedSubmission}
                    form={formsList.find(f => f.id === (selectedSubmission.form_id || selectedSubmission.schema_id))}
                    area={areas.find(a => a.id === selectedSubmission.area_id)}
                    onClose={() => setSelectedSubmission(null)}
                    onStatusChange={updateStatus}
                    formatDate={formatDate}
                />
            )}

            {submissionToDelete && (
                <DeleteSubmissionModal
                    submission={submissionToDelete}
                    isDeleting={isDeleting}
                    onCancel={() => setSubmissionToDelete(null)}
                    onConfirm={deleteSubmission}
                />
            )}
        </div>
    );
}

function DeleteSubmissionModal({ submission, isDeleting, onCancel, onConfirm }) {
    const displayCode = submission?.document_code || submission?.id?.slice(0, 8)?.toUpperCase();
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onCancel}>
            <div
                className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5 border-b border-slate-800">
                    <h3 className="text-white font-semibold">Eliminar respuesta</h3>
                    <p className="text-slate-400 text-sm mt-1">
                        Esta acción no se puede deshacer.
                    </p>
                </div>
                <div className="p-5">
                    <p className="text-sm text-slate-300">
                        ¿Seguro que querés eliminar la respuesta <span className="font-mono text-white">{displayCode}</span>?
                    </p>
                </div>
                <div className="p-5 border-t border-slate-800 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50"
                    >
                        {isDeleting ? "Eliminando..." : "Eliminar"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── SubmissionDetailModal (local) ────────────────────────────────── */
function SubmissionDetailModal({ submission, form, area, onClose, onStatusChange, formatDate }) {
    /* Parse data */
    let parsedData = {};
    try {
        parsedData = typeof submission.data === "string" ? JSON.parse(submission.data) : (submission.data || {});
    } catch { parsedData = {}; }

    let parsedFields = [];
    try {
        if (form?.fields_schema) {
            parsedFields = typeof form.fields_schema === "string" ? JSON.parse(form.fields_schema) : form.fields_schema;
        } else if (form?.sections) {
            parsedFields = form.sections.flatMap(s => s.fields || []);
        } else if (form?.fields) {
            parsedFields = form.fields;
        }
    } catch { parsedFields = []; }

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-start justify-between p-5 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
                    <div>
                        <p className="text-xs text-slate-500 font-mono mb-1">
                            {submission.document_code || submission.id}
                        </p>
                        <h2 className="text-white font-semibold">{form?.name || form?.title || "Respuesta"}</h2>
                        <p className="text-slate-500 text-xs mt-1">
                            Enviado por {submission.submitted_by_name || "Anónimo"} • {area?.name || "—"}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={submission.status || "pending_review"}
                            onChange={e => onStatusChange(submission, e.target.value)}
                            className="text-xs px-3 py-1.5 rounded-lg cursor-pointer border border-slate-700 bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[130px]"
                        >
                            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                <option key={k} value={k} className="bg-slate-900 text-slate-100">
                                    {v.label}
                                </option>
                            ))}
                        </select>
                        <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Body — fields */}
                <div className="p-5 space-y-4">
                    {parsedFields.length > 0 ? (
                        parsedFields.map(field => {
                            const value = parsedData[field.id] ?? parsedData[field.name];
                            if (value === undefined || value === null || value === "") return null;

                            return (
                                <div key={field.id || field.name} className="border-b border-slate-800 pb-3 last:border-0">
                                    <p className="text-xs text-slate-500 mb-1">{field.label || field.name}</p>

                                    {field.type === "image" && typeof value === "string" && value.startsWith("http") ? (
                                        <img src={value} className="max-h-40 rounded-lg border border-slate-700 object-contain" alt="" />
                                    ) : field.type === "signature" && value ? (
                                        <img src={value} className="max-h-24 bg-white rounded p-1" alt="Firma" />
                                    ) : field.type === "gps" ? (
                                        <p className="text-sm text-slate-300 font-mono">{String(value)}</p>
                                    ) : field.type === "boolean" || field.type === "yesno" ? (
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${value ? "bg-emerald-900 text-emerald-400" : "bg-red-900 text-red-400"}`}>
                                            {value ? "Sí" : "No"}
                                        </span>
                                    ) : (
                                        <p className="text-sm text-white">{String(value)}</p>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <pre className="text-xs text-slate-400 bg-slate-800 rounded-lg p-3 overflow-auto max-h-60">
                            {JSON.stringify(parsedData, null, 2)}
                        </pre>
                    )}
                </div>

                {/* Metadata footer */}
                <div className="px-5 py-4 border-t border-slate-800 bg-slate-950/50">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                            <p className="text-slate-500">Fecha envío</p>
                            <p className="text-slate-300">{formatDate(submission.submitted_at || submission.created_date)}</p>
                        </div>
                        <div>
                            <p className="text-slate-500">Versión</p>
                            <p className="text-slate-300">v{submission.form_version || 1}</p>
                        </div>
                        {submission.geo_lat && (
                            <div>
                                <p className="text-slate-500">Ubicación GPS</p>
                                <p className="text-slate-300 font-mono">{submission.geo_lat}, {submission.geo_lng}</p>
                            </div>
                        )}
                        {submission.device_id && (
                            <div>
                                <p className="text-slate-500">Dispositivo</p>
                                <p className="text-slate-300 font-mono truncate">{submission.device_id}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
