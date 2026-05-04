import { useQuery } from "@tanstack/react-query";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";

export const useAuditLogs = () => {
  const { claims } = useAuth();

  const fetchAuditLogs = async () => {
    let q = query(
      collection(db, "AuditLogs"),
      orderBy("timestamp", "desc"),
      limit(100)
    );

    // Apply basic filtering if not super_admin (security)
    if (claims?.role !== 'super_admin' && claims?.tenantId) {
        q = query(
            collection(db, "AuditLogs"),
            where("tenant_id", "==", claims.tenantId),
            orderBy("timestamp", "desc"),
            limit(100)
        );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };

  return useQuery({
    queryKey: ["auditLogs", claims?.tenantId, claims?.role],
    queryFn: fetchAuditLogs,
    enabled: !!claims,
    staleTime: 90 * 1000,
    /** Sin sondeo agresivo: 2 min, y pausa si la pestaña está oculta (ahorra lecturas). */
    refetchInterval: () =>
      typeof document !== "undefined" && document.visibilityState === "hidden" ? false : 120000,
  });
};
