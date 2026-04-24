import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, query, getDocs, getDoc, addDoc, updateDoc, doc, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";

export const useTenants = () => {
    const { claims, user } = useAuth();
    const queryClient = useQueryClient();

    const fetchTenants = async () => {
        // Super admin: lista completa. Resto: el tenant vive en el ID del documento (p. ej. Central_System), no en un campo "id".
        if (claims.role === "super_admin") {
            const querySnapshot = await getDocs(query(collection(db, "tenants")));
            return querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        }
        if (claims.tenantId) {
            const tenantRef = doc(db, "tenants", claims.tenantId);
            const snap = await getDoc(tenantRef);
            if (!snap.exists()) return [];
            return [{ id: snap.id, ...snap.data() }];
        }
        return [];
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
