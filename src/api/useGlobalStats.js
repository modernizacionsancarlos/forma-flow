import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, limit, orderBy, where } from "firebase/firestore";
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
            const formsSnap = await getDocs(collection(db, "FormSchemas"));
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
            submSnap.docs.forEach(doc => {
                const data = doc.data();
                
                // Status distribution
                const status = data.status || 'pendiente';
                statusMap[status] = (statusMap[status] || 0) + 1;

                // Submissions per form
                const formId = data.schema_id;
                const formName = formsMap[formId] || "Desconocido";
                formMapCount[formName] = (formMapCount[formName] || 0) + 1;
            });

            const finalChartData = Object.values(chartDataMap);

            return {
                totalSubmissions: submSnap.size,
                totalTenants: totalTenants,
                totalUsers: usersSnap.size,
                recentSubmissionsCount: last7DaysSubmissions.length,
                chartData: finalChartData,
                statusDistribution: Object.entries(statusMap).map(([name, value]) => ({ name, value })),
                submissionsPerForm: Object.entries(formMapCount)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5) // Top 5
            };
        },
        refetchInterval: 60000 // Refresh every minute
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
