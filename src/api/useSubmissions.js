import { useState, useEffect, useCallback } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";

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

  const clearQueue = () => {
    if (window.confirm("¿Seguro que deseas limpiar la cola? Perderás los datos no sincronizados.")) {
       setOfflineQueue([]);
    }
  };

  const syncQueue = useCallback(async () => {
    if (!navigator.onLine || offlineQueue.length === 0 || isSyncing) return;

    setIsSyncing(true);
    const queueToSync = [...offlineQueue];
    const successes = [];

    // Process one by one to ensure accurate state updates
    for (const item of queueToSync) {
      try {
        // Remove local temporary ID before saving to Firestore
        const { id: _id, ...firebaseData } = item;
        await addDoc(collection(db, "Submissions"), {
          ...firebaseData,
          created_date: Timestamp.fromMillis(item.created_date),
          status: "pending_review",
        });
        successes.push(item);
      } catch (error) {
        console.error("Sync failed for item:", item.id, error);
        // We keep it in the queue for next attempt
      }
    }

    // Atomic update of the queue
    setOfflineQueue((prev) => prev.filter(qItem => !successes.some(sItem => sItem.id === qItem.id)));
    setIsSyncing(false);

    return { 
      total: queueToSync.length, 
      success: successes.length, 
      failed: queueToSync.length - successes.length 
    };
  }, [offlineQueue, isSyncing]);

  // Automatic sync when connection is restored
  useEffect(() => {
    const handleOnline = () => syncQueue();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [syncQueue]);

  return {
    submitForm,
    syncQueue,
    clearQueue,
    isSyncing,
    queueCount: offlineQueue.length,
    offlineQueue
  };
};
