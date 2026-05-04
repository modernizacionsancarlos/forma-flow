import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, query, where, getDocs, addDoc, doc, Timestamp, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import { auditTenantId } from "../lib/auditTenantId";

export const useExports = () => {
    const { claims, user } = useAuth();
    const queryClient = useQueryClient();

    const fetchExports = async () => {
        let q = query(collection(db, "exports"));
        // Filter by tenantId unless super_admin
        if (claims?.role !== 'super_admin' && claims?.tenantId) {
            q = query(collection(db, "exports"), where("tenantId", "==", claims.tenantId));
        }
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const fetchQuery = useQuery({
        queryKey: ["exports", claims?.tenantId],
        queryFn: fetchExports,
        enabled: !!claims?.tenantId || claims?.role === 'super_admin',
    });

    const createExport = useMutation({
        mutationFn: async (newExport) => {
            const docRef = await addDoc(collection(db, "exports"), {
                ...newExport,
                tenantId: claims?.tenantId || newExport.tenantId || "default",
                created_date: Timestamp.now(),
                updated_date: Timestamp.now(),
            });

            // Log Audit
            await addDoc(collection(db, "AuditLogs"), {
                action: "create_export",
                export_name: newExport.name,
                export_id: docRef.id,
                tenant_id: auditTenantId(claims),
                performer_id: user?.uid || "system",
                performer_name: user?.email || "system",
                timestamp: Timestamp.now()
            });

            return { id: docRef.id, ...newExport };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["exports"] });
        },
    });

    const deleteExport = useMutation({
        mutationFn: async (id) => {
            const docRef = doc(db, "exports", id);
            await deleteDoc(docRef);

            // Log Audit
            await addDoc(collection(db, "AuditLogs"), {
                action: "delete_export",
                export_id: id,
                tenant_id: auditTenantId(claims),
                performer_id: user?.uid || "system",
                performer_name: user?.email || "system",
                timestamp: Timestamp.now()
            });

            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["exports"] });
        },
    });

    return {
        exportsList: fetchQuery.data || [],
        isLoading: fetchQuery.isLoading,
        createExport,
        deleteExport,
    };
};
