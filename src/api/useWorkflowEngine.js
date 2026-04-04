import { useState } from "react";
import { doc, updateDoc, addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import { toast } from "react-hot-toast";

export const STATUS_CONFIG = {
  pending_review: {
    label: "Pendiente",
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    icon: "clock",
    actions: ["approve", "reject", "request_info"]
  },
  approved: {
    label: "Aprobado",
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    icon: "check-circle",
    actions: ["archive"]
  },
  rejected: {
    label: "Rechazado",
    color: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    icon: "x-circle",
    actions: ["reopen"]
  },
  archived: {
    label: "Archivado",
    color: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    icon: "archive",
    actions: ["reopen"]
  },
  request_info: {
    label: "Info Pedida",
    color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    icon: "help-circle",
    actions: ["approve", "reject"]
  }
};

export const WORKFLOW_ACTIONS = {
  approve: { label: "Aprobar", color: "emerald", status: "approved" },
  reject: { label: "Rechazar", color: "red", status: "rejected" },
  request_info: { label: "Pedir Info", color: "cyan", status: "request_info" },
  archive: { label: "Archivar", color: "slate", status: "archived" },
  reopen: { label: "Reabrir", color: "blue", status: "pending_review" }
};

export const useWorkflowEngine = () => {
  const { user, claims } = useAuth();
  const [loading, setLoading] = useState(false);

  const executeTransition = async (submission, actionKey) => {
    const action = WORKFLOW_ACTIONS[actionKey];
    if (!action) return;

    setLoading(true);
    const toastId = toast.loading(`Ejecutando ${action.label}...`);

    try {
      const docRef = doc(db, "Submissions", submission.id);
      const newStatus = action.status;
      const oldStatus = submission.status;

      // 1. Update Submission
      await updateDoc(docRef, {
        status: newStatus,
        updated_at: Timestamp.now(),
        updated_by: user.uid,
        last_action: actionKey
      });

      // 2. Create Audit Log
      await addDoc(collection(db, "AuditLogs"), {
        submission_id: submission.id,
        action: "workflow_transition",
        action_key: actionKey,
        old_status: oldStatus,
        new_status: newStatus,
        performer_id: user.uid,
        performer_name: user.email || user.uid,
        timestamp: Timestamp.now(),
        tenant_id: claims.tenantId || "global",
        metadata: {
          action_label: action.label
        }
      });

      toast.success(`${action.label} completado correctamente`, { id: toastId });
      return { success: true, newStatus };
    } catch (error) {
      console.error("Workflow execution error:", error);
      toast.error(`Error al ejecutar workflow: ${error.message}`, { id: toastId });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    executeTransition,
    loading,
    STATUS_CONFIG,
    WORKFLOW_ACTIONS
  };
};
