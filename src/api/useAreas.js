import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, Timestamp, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import { auditTenantId } from "../lib/auditTenantId";

export const useAreas = () => {
    const { claims, user } = useAuth();
    const queryClient = useQueryClient();

    const fetchAreas = async () => {
        let q = query(collection(db, "areas"));
        // Filter by tenantId unless super_admin
        if (claims?.role !== 'super_admin' && claims?.tenantId) {
            q = query(collection(db, "areas"), where("tenantId", "==", claims.tenantId));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const fetchQuery = useQuery({
        queryKey: ["areas", claims?.tenantId],
        queryFn: fetchAreas,
        enabled: !!claims?.tenantId || claims?.role === 'super_admin',
    });

    const createArea = useMutation({
        mutationFn: async (newArea) => {
            const docRef = await addDoc(collection(db, "areas"), {
                ...newArea,
                tenantId: claims?.tenantId || newArea.tenantId || "default",
                created_date: Timestamp.now(),
                updated_date: Timestamp.now(),
            });

            // Log Audit
            await addDoc(collection(db, "AuditLogs"), {
                action: "create_area",
                area_name: newArea.name,
                area_id: docRef.id,
                tenant_id: auditTenantId(claims),
                performer_id: user?.uid || "system",
                performer_name: user?.email || "system",
                timestamp: Timestamp.now()
            });

            return { id: docRef.id, ...newArea };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["areas"] });
        },
    });

    const updateArea = useMutation({
        mutationFn: async ({ id, ...data }) => {
            const docRef = doc(db, "areas", id);
            await updateDoc(docRef, {
                ...data,
                updated_date: Timestamp.now(),
            });

            // Log Audit
            await addDoc(collection(db, "AuditLogs"), {
                action: "update_area",
                area_id: id,
                tenant_id: auditTenantId(claims),
                performer_id: user?.uid || "system",
                performer_name: user?.email || "system",
                timestamp: Timestamp.now()
            });

            return { id, ...data };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["areas"] });
        },
    });

    const deleteArea = useMutation({
        mutationFn: async (id) => {
            const docRef = doc(db, "areas", id);
            await deleteDoc(docRef);

            // Log Audit
            await addDoc(collection(db, "AuditLogs"), {
                action: "delete_area",
                area_id: id,
                tenant_id: auditTenantId(claims),
                performer_id: user?.uid || "system",
                performer_name: user?.email || "system",
                timestamp: Timestamp.now()
            });

            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["areas"] });
        },
    });

    return {
        areas: fetchQuery.data || [],
        isLoading: fetchQuery.isLoading,
        createArea,
        updateArea,
        deleteArea,
    };
};
