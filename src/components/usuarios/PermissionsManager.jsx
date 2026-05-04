import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import toast from "react-hot-toast";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import {
  ALL_PERMISSION_IDS,
  PERMISSION_LABELS,
  ROLES,
  ROLE_LABELS,
  getBasePermissionsForRole,
  computeEffectivePermissions,
} from "../../lib/permissions";
import { PERMISSION_GROUPS } from "../../lib/permissionCatalog";
import { usePermissionConfig, useSavePermissionRoleDefaults } from "../../api/usePermissionConfig";
import { usePermissionPreview } from "../../context/PermissionPreviewContext";
import { useAuth } from "../../lib/AuthContext";
import { Shield, User, GripVertical, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";

function sortIds(ids) {
  const order = new Map(ALL_PERMISSION_IDS.map((id, i) => [id, i]));
  return [...ids].sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));
}

/** Ajustes por usuario: permisos extra y revocados respecto de la base del rol. */
function toUserGrantRevoke(effectiveSet, baseSet) {
  const eff = new Set(effectiveSet);
  const base = new Set(baseSet);
  const grant = [...eff].filter((x) => !base.has(x));
  const revoke = [...base].filter((x) => !eff.has(x));
  return { permission_grant: sortIds(grant), permission_revoke: sortIds(revoke) };
}

/**
 * Matriz de permisos estilo Django: por rol (Firestore global) o por usuario (grant/revoke).
 */
export default function PermissionsManager({ users = [] }) {
  const { claims, user: authUser } = useAuth();
  const { data: config, isLoading: loadingConfig } = usePermissionConfig();
  const saveRoleDefaults = useSavePermissionRoleDefaults();
  const permPreview = usePermissionPreview();
  const startPreview = permPreview?.startPreview;
  const stopPreview = permPreview?.stopPreview;
  const previewState = permPreview?.preview;

  const isSuperAdmin = claims?.role === ROLES.SUPER_ADMIN;
  const [mode, setMode] = useState("user"); // "role" | "user" — rol solo super_admin (Firestore systemConfig)
  const [selectedRole, setSelectedRole] = useState(ROLES.ADMIN);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [assigned, setAssigned] = useState(new Set());
  const [dirty, setDirty] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);

  const roleDefaults = useMemo(() => {
    const rd = config?.roleDefaults;
    return rd && typeof rd === "object" ? rd : {};
  }, [config?.roleDefaults]);

  const available = useMemo(() => {
    const a = new Set(assigned);
    return sortIds(ALL_PERMISSION_IDS.filter((id) => !a.has(id)));
  }, [assigned]);

  const assignedSorted = useMemo(() => sortIds([...assigned]), [assigned]);

  const loadRoleMatrix = useCallback(() => {
    const base = getBasePermissionsForRole(selectedRole, roleDefaults);
    setAssigned(new Set(base));
    setDirty(false);
  }, [selectedRole, roleDefaults]);

  const loadUserMatrix = useCallback(async () => {
    const email = (selectedEmail || "").trim().toLowerCase();
    if (!email) return;
    setLoadingUser(true);
    try {
      const ref = doc(db, "userProfiles", email);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        toast.error("No hay perfil para ese usuario.");
        setAssigned(new Set());
        setDirty(false);
        return;
      }
      const profile = snap.data();
      const eff = computeEffectivePermissions(profile, roleDefaults);
      setAssigned(new Set(eff));
      setDirty(false);
    } catch (e) {
      toast.error(e?.message || "No se pudo cargar el usuario.");
    } finally {
      setLoadingUser(false);
    }
  }, [selectedEmail, roleDefaults]);

  useEffect(() => {
    if (!isSuperAdmin && mode === "role") setMode("user");
  }, [isSuperAdmin, mode]);

  useEffect(() => {
    if (mode === "role") loadRoleMatrix();
  }, [mode, loadRoleMatrix]);

  useEffect(() => {
    if (mode === "user" && selectedEmail) loadUserMatrix();
  }, [mode, selectedEmail, loadUserMatrix]);

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;
    setAssigned((prev) => {
      const next = new Set(prev);
      if (destination.droppableId === "assigned") next.add(draggableId);
      else next.delete(draggableId);
      setDirty(true);
      return next;
    });
  };

  const moveBulk = (toAssigned, ids) => {
    setAssigned((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => {
        if (toAssigned) next.add(id);
        else next.delete(id);
      });
      setDirty(true);
      return next;
    });
  };

  const handleSave = async () => {
    const list = assignedSorted;
    if (mode === "role" && !isSuperAdmin) {
      toast.error("Solo Super Admin puede guardar la plantilla global por rol.");
      return;
    }
    if (mode === "role") {
      try {
        const nextDefaults = { ...roleDefaults, [selectedRole]: list };
        await saveRoleDefaults.mutateAsync({
          roleDefaults: nextDefaults,
          updatedBy: authUser?.email,
        });
        toast.success("Permisos del rol guardados en el servidor.");
        setDirty(false);
      } catch (e) {
        toast.error(e?.message || "No se pudo guardar.");
      }
      return;
    }

    const email = (selectedEmail || "").trim().toLowerCase();
    if (!email) {
      toast.error("Seleccioná un usuario.");
      return;
    }
    try {
      const ref = doc(db, "userProfiles", email);
      const snap = await getDoc(ref);
      if (!snap.exists()) throw new Error("Perfil inexistente.");
      const profile = snap.data();
      const base = getBasePermissionsForRole(profile.role, { ...roleDefaults, ...(config?.roleDefaults || {}) });
      const { permission_grant, permission_revoke } = toUserGrantRevoke(list, base);
      await updateDoc(ref, {
        permission_grant,
        permission_revoke,
      });
      toast.success("Permisos del usuario actualizados.");
      setDirty(false);
    } catch (e) {
      toast.error(e?.message || "No se pudo guardar el usuario.");
    }
  };

  const handlePreview = () => {
    if (!startPreview) return;
    const list = assignedSorted;
    const label =
      mode === "role"
        ? `Rol: ${ROLE_LABELS[selectedRole] || selectedRole}`
        : `Usuario: ${selectedEmail}`;
    startPreview({
      label,
      simulatedRole: mode === "role" ? selectedRole : claims?.role,
      simulatedPermissions: list,
    });
    toast.success("Vista previa activa: navegá el panel. Usá «Salir de vista previa» cuando termines.");
  };

  const roleKeys = useMemo(() => Object.keys(ROLE_LABELS), []);

  return (
    <div className="space-y-6">
      {previewState?.active && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-100">
          <p className="text-sm font-medium">
            <Eye size={16} className="inline mr-2" />
            Modo vista previa: {previewState?.label} — lo que ves simula permisos guardados o el borrador actual si
            usaste «Vista previa» antes de guardar.
          </p>
          <button
            type="button"
            onClick={() => stopPreview?.()}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-amber-500"
          >
            <EyeOff size={14} /> Salir de vista previa
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-2">
        {isSuperAdmin ? (
          <button
            type="button"
            onClick={() => setMode("role")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
              mode === "role" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Shield size={16} /> Por rol (plantilla global)
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setMode("user")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
            mode === "user" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          <User size={16} /> Por usuario
        </button>
      </div>
      {!isSuperAdmin ? (
        <p className="text-xs text-slate-500">
          La plantilla global por rol solo la edita Super Admin. Podés ajustar excepciones por usuario en tu empresa.
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {mode === "role" ? (
          <label className="block text-sm">
            <span className="text-slate-400">Rol</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            >
              {roleKeys.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r] || r}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="block text-sm">
            <span className="text-slate-400">Usuario (correo)</span>
            <select
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
            >
              <option value="">— Elegí un usuario —</option>
              {users.map((u) => {
                const em = u.user_email || u.email || u.id;
                return (
                  <option key={em} value={em}>
                    {u.user_name || em} ({em})
                  </option>
                );
              })}
            </select>
          </label>
        )}
        <div className="flex flex-wrap items-end gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={
              saveRoleDefaults.isPending ||
              !dirty ||
              (mode === "user" && !selectedEmail) ||
              loadingUser ||
              loadingConfig
            }
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-40"
          >
            Guardar cambios
          </button>
          <button
            type="button"
            onClick={handlePreview}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-white hover:bg-slate-800"
          >
            <Eye size={14} className="inline mr-1" /> Vista previa (simular panel)
          </button>
          <button
            type="button"
            onClick={() => {
              if (mode === "role") loadRoleMatrix();
              else loadUserMatrix();
            }}
            className="rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"
          >
            Revertir
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        <strong>Super Admin</strong> siempre conserva todos los permisos en la app (no se puede dejar sin
        acceso). Arrastrá ítems entre listas o usá los botones de acción rápida por grupo.
      </p>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid gap-4 lg:grid-cols-2">
          <Droppable droppableId="available">
            {(prov) => (
              <div
                ref={prov.innerRef}
                {...prov.droppableProps}
                className="min-h-[320px] rounded-xl border border-slate-800 bg-slate-900/40 p-3"
              >
                <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-500">
                  Disponibles ({available.length})
                </h3>
                <div className="space-y-1">
                  {available.map((id, idx) => (
                    <Draggable key={id} draggableId={id} index={idx}>
                      {(p) => (
                        <div
                          ref={p.innerRef}
                          {...p.draggableProps}
                          className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm"
                        >
                          <span {...p.dragHandleProps} className="text-slate-500 cursor-grab">
                            <GripVertical size={14} />
                          </span>
                          <span className="text-slate-200">{PERMISSION_LABELS[id] || id}</span>
                          <button
                            type="button"
                            className="ml-auto text-emerald-400 hover:text-emerald-300"
                            title="Activar"
                            onClick={() => moveBulk(true, [id])}
                          >
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                </div>
                {prov.placeholder}
              </div>
            )}
          </Droppable>

          <Droppable droppableId="assigned">
            {(prov) => (
              <div
                ref={prov.innerRef}
                {...prov.droppableProps}
                className="min-h-[320px] rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3"
              >
                <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-emerald-500/90">
                  Activos / asignados ({assignedSorted.length})
                </h3>
                <div className="space-y-1">
                  {assignedSorted.map((id, idx) => (
                    <Draggable key={id} draggableId={id} index={idx}>
                      {(p) => (
                        <div
                          ref={p.innerRef}
                          {...p.draggableProps}
                          className="flex items-center gap-2 rounded-lg border border-emerald-900/30 bg-slate-950 px-2 py-1.5 text-sm"
                        >
                          <span {...p.dragHandleProps} className="text-slate-500 cursor-grab">
                            <GripVertical size={14} />
                          </span>
                          <span className="text-emerald-100">{PERMISSION_LABELS[id] || id}</span>
                          <button
                            type="button"
                            className="ml-auto text-rose-400 hover:text-rose-300"
                            title="Quitar"
                            onClick={() => moveBulk(false, [id])}
                          >
                            <ArrowLeft size={16} />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                </div>
                {prov.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>

      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
        <h4 className="mb-2 text-sm font-semibold text-slate-300">Referencia por categoría</h4>
        <ul className="space-y-3 text-xs text-slate-500">
          {PERMISSION_GROUPS.map((g) => (
            <li key={g.id}>
              <strong className="text-slate-400">{g.label}:</strong>{" "}
              {g.keys.map((k) => PERMISSION_LABELS[k] || k).join(" · ")}
            </li>
          ))}
        </ul>
      </div>

      {selectedRole === ROLES.SUPER_ADMIN && mode === "role" && (
        <p className="text-xs text-amber-200/90">
          El rol Super Admin ignora restricciones en tiempo de ejecución (siempre tiene acceso total). Esta
          vista sirve como documentación; los cambios en la lista no limitan a un super admin real.
        </p>
      )}
    </div>
  );
}
