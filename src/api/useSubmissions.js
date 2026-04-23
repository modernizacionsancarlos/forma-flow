import { useState, useEffect, useCallback } from "react";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db, storage as firebaseStorage } from "../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../lib/AuthContext";
import { toast } from "react-hot-toast";
import { cleanObject } from "../lib/utils";
import { getOfflineFiles, removeOfflineFile } from "../lib/offlineFiles";


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
    const now = Date.now();
    // Preferir el tenant del esquema (público o interno) para alinear reglas y borrados; si no hay, el del token.
    // Título denormalizado para el portal de seguimiento (lectura pública de Submissions sin leer FormSchemas).
    let tenantId = claims?.tenantId || null;
    let formTitle = null;
    if (schemaId) {
      try {
        const formSnap = await getDoc(doc(db, "FormSchemas", schemaId));
        if (formSnap.exists()) {
          const schema = formSnap.data();
          formTitle = schema.name || schema.title || null;
          const fromSchema = schema?.tenant_id || schema?.tenantId || null;
          if (fromSchema) tenantId = fromSchema;
        }
      } catch (error) {
        console.warn("No se pudo resolver tenant desde FormSchemas:", error);
      }
    }

    const submission = {
      id: submissionId,
      tenant_id: tenantId || "global",
      schema_id: schemaId,
      form_title: formTitle,
      data: formData,
      created_by: user?.uid || "public_citizen",
      created_date: now,
      submitted_at: now,
      status: "pending_review",
      history: [{
        type: "submitted",
        status: "pending_review",
        timestamp: now,
        by_user_email: user?.email || "public_citizen",
        note: "Trámite entregado al sistema"
      }]
    };

    if (navigator.onLine) {
      try {
        const payload = cleanObject({
          ...submission,
          created_date: Timestamp.now(),
          submitted_at: Timestamp.now(),
          history: submission.history.map(h => ({ ...h, timestamp: Timestamp.fromMillis(h.timestamp) }))
        });
        await setDoc(doc(db, "Submissions", submissionId), payload);
        return { success: true, synced: true, id: submissionId };

      } catch (error) {
        console.error("Error direct submit:", error);
        return { success: false, synced: false, error };
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

    // Primero intentamos sincronizar archivos pendientes si existen
    const offlineFiles = await getOfflineFiles();

    for (const item of queueToSync) {
      try {
        const { id: _id, ...firebaseData } = item;
        const processedData = { ...firebaseData.data };

        // Buscar campos con prefijo offline:// en los datos del formulario
        for (const [key, value] of Object.entries(processedData)) {
          if (typeof value === "string" && value.startsWith("offline://")) {
            const fileId = value.replace("offline://", "");
            const fileRecord = offlineFiles.find(f => f.id === fileId);

            if (fileRecord) {
              try {
                const storageRef = ref(firebaseStorage, `submissions/${fileRecord.fieldId}/${Date.now()}_${fileRecord.fileName}`);
                await uploadBytes(storageRef, fileRecord.fileBlob);
                const url = await getDownloadURL(storageRef);
                processedData[key] = url;
                await removeOfflineFile(fileId);
              } catch (uploadError) {
                console.error("Error uploading offline file:", fileId, uploadError);
                throw new Error("Failed to upload offline file");
              }
            }
          }
        }


        const payload = cleanObject({
          ...firebaseData,
          data: processedData,
          created_date: Timestamp.fromMillis(item.created_date),
          submitted_at: item.submitted_at
            ? Timestamp.fromMillis(item.submitted_at)
            : Timestamp.fromMillis(item.created_date),
          status: "pending_review",
          history: (item.history || []).map(h => ({ 
            ...h, 
            timestamp: typeof h.timestamp === 'number' ? Timestamp.fromMillis(h.timestamp) : h.timestamp 
          }))
        });

        await setDoc(doc(db, "Submissions", item.id), payload);

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
