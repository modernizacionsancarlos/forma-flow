import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";

export const useTenants = () => {
    const { claims, user } = useAuth();
    const queryClient = useQueryClient();

    const fetchTenants = async () => {
        let q = query(collection(db, "tenants"));
        if (claims.role !== 'super_admin' && claims.tenantId) {
            q = query(collection(db, "tenants"), where("id", "==", claims.tenantId));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const fetchQuery = useQuery({
        queryKey: ["tenants", claims.tenantId],
        queryFn: fetchTenants,
        enabled: !!claims.tenantId || claims.role === 'super_admin',
    });

    const createTenant = useMutation({
        mutationFn: async (newTenant) => {
            const docRef = await addDoc(collection(db, "tenants"), {
                ...newTenant,
                created_date: Timestamp.now(),
                updated_date: Timestamp.now(),
            });

            // Log Audit
            await addDoc(collection(db, "AuditLogs"), {
                action: "create_tenant",
                tenant_name: newTenant.name,
                tenant_id: docRef.id,
                performer_id: user?.uid || "system",
                performer_name: user?.email || "system",
                timestamp: Timestamp.now()
            });

            return { id: docRef.id, ...newTenant };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tenants"] });
        },
    });

    const updateTenant = useMutation({
        mutationFn: async ({ id, ...data }) => {
            const docRef = doc(db, "tenants", id);
            await updateDoc(docRef, {
                ...data,
                updated_date: Timestamp.now(),
            });

            // Log Audit
            await addDoc(collection(db, "AuditLogs"), {
                action: "update_tenant",
                tenant_id: id,
                performer_id: user?.uid || "system",
                performer_name: user?.email || "system",
                timestamp: Timestamp.now()
            });

            return { id, ...data };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tenants"] });
        },
    });

    const deleteTenant = useMutation({
        mutationFn: async (id) => {
            const docRef = doc(db, "tenants", id);
            await updateDoc(docRef, {
                status: 'suspended',
                updated_date: Timestamp.now(),
            });

            // Log Audit
            await addDoc(collection(db, "AuditLogs"), {
                action: "suspend_tenant",
                tenant_id: id,
                performer_id: user?.uid || "system",
                performer_name: user?.email || "system",
                timestamp: Timestamp.now()
            });

            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tenants"] });
        },
    });

    return {
        tenants: fetchQuery.data,
        isLoading: fetchQuery.isLoading,
        createTenant,
        updateTenant,
        deleteTenant,
    };
};
