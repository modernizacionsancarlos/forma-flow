import { useState, useEffect, useCallback } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import { toast } from "react-hot-toast";

export const useSubmissions = () => {
  const { user, claims } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState(() => {
    const saved = localStorage.getItem("formflow_sync_queue");
    return saved ? JSON.parse(saved) : [];
  });

  // Effect to persist queue to localStorage
  useEffect(() => {
    localStorage.setItem("formflow_sync_queue", JSON.stringify(offlineQueue));
  }, [offlineQueue]);



  const submitForm = async (formData, schemaId) => {
    const submissionId = crypto.randomUUID();
    const submission = {
      id: submissionId,
      tenant_id: claims.tenantId || "global",
      schema_id: schemaId,
      data: formData,
      created_by: user.uid,
      created_date: Timestamp.now().toMillis(),
      status: "pending_sync",
    };

    if (navigator.onLine) {
      try {
        const docRef = await addDoc(collection(db, "Submissions"), {
          ...submission,
          created_date: Timestamp.now(),
          status: "pending_review",
        });
        return { success: true, synced: true, id: docRef.id };
      } catch (error) {
        console.error("Error direct submit:", error);
        addToQueue(submission);
        return { success: true, synced: false, id: submissionId };
      }
    } else {
      addToQueue(submission);
      return { success: true, synced: false, offline: true };
    }
  };

  const addToQueue = (submission) => {
    setOfflineQueue((prev) => [...prev, submission]);
  };

  const removeFromQueue = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este registro local? Se perderán los datos.")) {
      setOfflineQueue((prev) => prev.filter(item => item.id !== id));
    }
  };

  const clearQueue = () => {
    if (window.confirm("¿Seguro que deseas limpiar la cola? Perderás los datos no sincronizados.")) {
       setOfflineQueue([]);
    }
  };

  const syncQueue = useCallback(async (silent = false) => {
    if (!navigator.onLine || (offlineQueue.length === 0 && !isSyncing)) return;
    if (isSyncing) return;

    setIsSyncing(true);
    const queueToSync = [...offlineQueue];
    const successes = [];

    for (const item of queueToSync) {
      try {
        const { id: _id, ...firebaseData } = item;
        await addDoc(collection(db, "Submissions"), {
          ...firebaseData,
          created_date: Timestamp.fromMillis(item.created_date),
          status: "pending_review",
        });
        successes.push(item);
      } catch (error) {
        console.error("Sync failed for item:", item.id, error);
      }
    }

    if (successes.length > 0) {
      setOfflineQueue((prev) => prev.filter(qItem => !successes.some(sItem => sItem.id === qItem.id)));
      if (!silent) {
        toast.success(`Sincronizados ${successes.length} registros pendientes`, {
          icon: '✅',
          style: { background: '#0f172a', color: '#fff', border: '1px solid rgba(16,185,129,0.2)' }
        });
      }
    }
    
    setIsSyncing(false);
    return { total: queueToSync.length, success: successes.length };
  }, [offlineQueue, isSyncing]);

  // Automatic sync when connection is restored & periodic check
  useEffect(() => {
    const handleOnline = () => syncQueue();
    window.addEventListener("online", handleOnline);
    
    // Periodic sync attempt every 5 minutes if there are items
    const interval = setInterval(() => {
      if (offlineQueue.length > 0) syncQueue(true);
    }, 5 * 60 * 1000);

    return () => {
      window.removeEventListener("online", handleOnline);
      clearInterval(interval);
    };
  }, [syncQueue, offlineQueue.length]);

  return {
    submitForm,
    syncQueue,
    clearQueue,
    removeFromQueue,
    isSyncing,
    queueCount: offlineQueue.length,
    offlineQueue
  };
};
