import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";

/**
 * Hook para obtener las últimas submissions desde Firestore.
 * Se usa en el Dashboard para la tabla "Respuestas Recientes".
 * Diferente a useSubmissions.js que maneja la cola offline.
 */
export const useDashboardSubmissions = (tenantId = null) => {
    const { data, isLoading } = useQuery({
        queryKey: ["dashboard-submissions", tenantId],
        queryFn: async () => {
            let q;
            if (tenantId) {
                q = query(
                    collection(db, "Submissions"),
                    where("tenant_id", "==", tenantId),
                    orderBy("created_date", "desc"),
                    limit(50)
                );
            } else {
                q = query(
                    collection(db, "Submissions"),
                    orderBy("created_date", "desc"),
                    limit(50)
                );
            }
            const snap = await getDocs(q);
            return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        refetchInterval: 60000, // Refresh every minute
    });

    return {
        submissions: data || [],
        isLoading,
    };
};
