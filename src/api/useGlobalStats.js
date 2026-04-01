import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, limit, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";

export const useGlobalStats = () => {
    return useQuery({
        queryKey: ["global-stats"],
        queryFn: async () => {
            // Optimization: Fetch only needed data
            const submSnap = await getDocs(collection(db, "Submissions"));
            const tenantsSnap = await getDocs(collection(db, "tenants"));
            const usersSnap = await getDocs(collection(db, "userProfiles"));

            const now = new Date();
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            // Real data aggregation for the last 7 days
            const last7DaysSubmissions = submSnap.docs.filter(d => {
                const date = d.data().created_date ? 
                             (d.data().created_date.toDate ? d.data().created_date.toDate() : new Date(d.data().created_date)) : 
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
                const rawDate = doc.data().created_date;
                const date = rawDate?.toDate ? rawDate.toDate() : new Date(rawDate);
                const dayName = days[date.getDay()];
                if (chartDataMap[dayName]) {
                    chartDataMap[dayName].count += 1;
                }
            });

            const finalChartData = Object.values(chartDataMap);

            return {
                totalSubmissions: submSnap.size,
                totalTenants: tenantsSnap.size,
                totalUsers: usersSnap.size,
                recentSubmissionsCount: last7DaysSubmissions.length,
                chartData: finalChartData
            };
        },
        refetchInterval: 60000 // Refresh every minute
    });
};

export const useRecentActivity = () => {
    return useQuery({
        queryKey: ["recent-activity"],
        queryFn: async () => {
            const q = query(collection(db, "AuditLogs"), orderBy("timestamp", "desc"), limit(15));
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
