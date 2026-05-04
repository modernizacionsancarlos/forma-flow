import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, limit, orderBy, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export const useGlobalStats = (tenantId = null) => {
    return useQuery({
        queryKey: ["global-stats", tenantId],
        queryFn: async () => {
            // Base collections
            let submissionsRef = collection(db, "Submissions");
            let usersProfilesRef = collection(db, "userProfiles");
            
            // Apply filtering if tenantId is provided
            let submQuery = submissionsRef;
            let usersQuery = usersProfilesRef;

            if (tenantId) {
                submQuery = query(submissionsRef, where("tenant_id", "==", tenantId));
                usersQuery = query(usersProfilesRef, where("tenantId", "==", tenantId));
            }

            const submSnap = await getDocs(submQuery);
            const usersSnap = await getDocs(usersQuery);
            
            // Get all forms to map names
            let formsQuery = collection(db, "FormSchemas");
            if (tenantId) {
                formsQuery = query(formsQuery, where("tenant_id", "==", tenantId));
            }
            const formsSnap = await getDocs(formsQuery);

            const formsMap = {};
            formsSnap.docs.forEach(d => {
                formsMap[d.id] = d.data().title || "Untitled Form";
            });

            // Tenants count only makes sense for global view, or 1 for tenant view
            let totalTenants = 0;
            if (!tenantId) {
                const tenantsSnap = await getDocs(collection(db, "tenants"));
                totalTenants = tenantsSnap.size;
            } else {
                totalTenants = 1;
            }

            const now = new Date();
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            // Real data aggregation for the last 7 days
            const last7DaysSubmissions = submSnap.docs.filter(d => {
                const data = d.data();
                const rawDate = data.created_date || data.timestamp;
                const date = rawDate ? 
                             (rawDate.toDate ? rawDate.toDate() : new Date(rawDate)) : 
                             null;
                return date && date >= sevenDaysAgo;
            });

            // Prepare chart data (Last 7 days names)
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const chartDataMap = {};
            
            // Initialize last 7 days with 0
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                const dayName = days[d.getDay()];
                chartDataMap[dayName] = { name: dayName, count: 0 };
            }

            // Populate with real values
            last7DaysSubmissions.forEach(doc => {
                const data = doc.data();
                const rawDate = data.created_date || data.timestamp;
                const date = rawDate?.toDate ? rawDate.toDate() : new Date(rawDate);
                const dayName = days[date.getDay()];
                if (chartDataMap[dayName]) {
                    chartDataMap[dayName].count += 1;
                }
            });

            // Populations per status and per form
            const statusMap = {};
            const formMapCount = {};
            let totalResolutionTime = 0;
            let resolvedCount = 0;
            let overdueCount = 0;

            const nowTime = now.getTime();
            const fortyEightHoursAgo = nowTime - (48 * 60 * 60 * 1000);

            submSnap.docs.forEach(doc => {
                const data = doc.data();
                
                // Status distribution
                const status = data.status || 'pendiente';
                statusMap[status] = (statusMap[status] || 0) + 1;

                // Submissions per form
                const formId = data.schema_id;
                const formName = formsMap[formId] || "Desconocido";
                formMapCount[formName] = (formMapCount[formName] || 0) + 1;

                // Resolution Time Calculation
                const createdDate = data.created_date?.toDate ? data.created_date.toDate() : new Date(data.created_date || data.timestamp);
                const isResolved = ['approved', 'rejected', 'archived', 'Aprobado', 'Rechazado', 'Archivado'].includes(status);
                
                if (isResolved && data.history) {
                    const resolutionEvent = data.history.find(h => ['approved', 'rejected', 'archived'].includes(h.status));
                    if (resolutionEvent) {
                        const resDate = resolutionEvent.timestamp?.toDate ? resolutionEvent.timestamp.toDate() : new Date(resolutionEvent.timestamp);
                        totalResolutionTime += (resDate - createdDate);
                        resolvedCount++;
                    }
                }

                // Overdue Calculation (Pending > 48h)
                if (!isResolved && createdDate.getTime() < fortyEightHoursAgo) {
                    overdueCount++;
                }
            });

            const avgResolutionTime = resolvedCount > 0 ? (totalResolutionTime / resolvedCount / (1000 * 60 * 60)) : 0;
            const resolutionRate = submSnap.size > 0 ? (resolvedCount / submSnap.size) * 100 : 0;

            const finalChartData = Object.values(chartDataMap);

            return {
                totalSubmissions: submSnap.size,
                totalTenants: totalTenants,
                totalUsers: usersSnap.size,
                totalSchemas: formsSnap.size,
                recentSubmissionsCount: last7DaysSubmissions.length,
                chartData: finalChartData,
                avgResolutionTime: avgResolutionTime.toFixed(1),
                resolutionRate: resolutionRate.toFixed(1),
                overdueCount: overdueCount,
                statusDistribution: Object.entries(statusMap).map(([name, value]) => ({ name, value })),
                submissionsPerForm: Object.entries(formMapCount)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5) // Top 5
            };
        },
        staleTime: 2 * 60 * 1000,
        /** Panel admin: consultas pesadas; refresco cada 3 min y pausa en pestaña oculta. */
        refetchInterval: () =>
            typeof document !== "undefined" && document.visibilityState === "hidden" ? false : 180000,
    });
};

export const useRecentActivity = (tenantId = null) => {
    return useQuery({
        queryKey: ["recent-activity", tenantId],
        queryFn: async () => {
            let activityRef = collection(db, "AuditLogs");
            let q;
            
            if (tenantId) {
                q = query(
                    activityRef, 
                    where("tenant_id", "==", tenantId),
                    orderBy("timestamp", "desc"), 
                    limit(15)
                );
            } else {
                q = query(
                    activityRef, 
                    orderBy("timestamp", "desc"), 
                    limit(15)
                );
            }

            const snap = await getDocs(q);
            return snap.docs.map(doc => {
                const data = doc.data();
                const action = data.action?.replace("_", " ").toUpperCase();
                const target = data.tenant_name || data.user_email || data.tenant_id || "Sistema";
                return {
                    id: doc.id,
                    ...data,
                    type: data.action?.includes("error") ? "error" : "sync",
                    title: `${action}: ${target}`,
                    time: data.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '---'
                };
            });
        }
    });
};
export const useCommunicationLogs = (tenantId = null) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let q = query(
            collection(db, "CommunicationLogs"),
            orderBy("timestamp", "desc"),
            limit(15)
        );

        if (tenantId) {
            q = query(q, where("tenant_id", "==", tenantId));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                time: doc.data().timestamp?.toDate() ? 
                    new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(doc.data().timestamp.toDate()) 
                    : "Enviando..."
            }));
            setLogs(docs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [tenantId]);

    return { logs, loading };
};
