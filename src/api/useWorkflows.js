import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, Timestamp, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";

export const useWorkflows = () => {
    const { claims, user } = useAuth();
    const queryClient = useQueryClient();

    const fetchWorkflows = async () => {
        let q = query(collection(db, "workflows"));
        // Filter by tenantId unless super_admin
        if (claims?.role !== 'super_admin' && claims?.tenantId) {
            q = query(collection(db, "workflows"), where("tenantId", "==", claims.tenantId));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const fetchQuery = useQuery({
        queryKey: ["workflows", claims?.tenantId],
        queryFn: fetchWorkflows,
        enabled: !!claims?.tenantId || claims?.role === 'super_admin',
    });

    const createWorkflow = useMutation({
        mutationFn: async (newWorkflow) => {
            const docRef = await addDoc(collection(db, "workflows"), {
                ...newWorkflow,
                tenantId: claims?.tenantId || newWorkflow.tenantId || "default",
                created_date: Timestamp.now(),
                updated_date: Timestamp.now(),
            });

            // Log Audit
            await addDoc(collection(db, "AuditLogs"), {
                action: "create_workflow",
                workflow_name: newWorkflow.name,
                workflow_id: docRef.id,
                performer_id: user?.uid || "system",
                performer_name: user?.email || "system",
                timestamp: Timestamp.now()
            });

            return { id: docRef.id, ...newWorkflow };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workflows"] });
        },
    });

    const updateWorkflow = useMutation({
        mutationFn: async ({ id, ...data }) => {
            const docRef = doc(db, "workflows", id);
            await updateDoc(docRef, {
                ...data,
                updated_date: Timestamp.now(),
            });

            // Log Audit
            await addDoc(collection(db, "AuditLogs"), {
                action: "update_workflow",
                workflow_id: id,
                performer_id: user?.uid || "system",
                performer_name: user?.email || "system",
                timestamp: Timestamp.now()
            });

            return { id, ...data };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workflows"] });
        },
    });

    const deleteWorkflow = useMutation({
        mutationFn: async (id) => {
            const docRef = doc(db, "workflows", id);
            await deleteDoc(docRef);

            // Log Audit
            await addDoc(collection(db, "AuditLogs"), {
                action: "delete_workflow",
                workflow_id: id,
                performer_id: user?.uid || "system",
                performer_name: user?.email || "system",
                timestamp: Timestamp.now()
            });

            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workflows"] });
        },
    });

    return {
        workflows: fetchQuery.data || [],
        isLoading: fetchQuery.isLoading,
        createWorkflow,
        updateWorkflow,
        deleteWorkflow,
    };
};
