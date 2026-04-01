import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, doc, getDocs, Timestamp, runTransaction } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";

export const useUsers = () => {
    const { user: performer } = useAuth();
    const queryClient = useQueryClient();

    const fetchUsers = async () => {
        const snap = await getDocs(collection(db, "userProfiles"));
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const { data: users, isLoading, error } = useQuery({
        queryKey: ["users-list"],
        queryFn: fetchUsers,
    });

    const createUser = useMutation({
        mutationFn: async (userData) => {
            const tenantId = userData.tenantId || 'Central_System';
            const userEmail = userData.email.toLowerCase();
            const userRef = doc(db, "userProfiles", userEmail); 
            const tenantRef = doc(db, "tenants", tenantId);

            await runTransaction(db, async (transaction) => {
                // If not Central_System, check limits
                if (tenantId !== 'Central_System') {
                    const tenantSnap = await transaction.get(tenantRef);
                    if (!tenantSnap.exists()) throw new Error("Tenant no existe");
                    
                    const tenantData = tenantSnap.data();
                    const currentCount = tenantData.userCount || 0;
                    const limit = tenantData.userLimit || 10;

                    if (currentCount >= limit) {
                        throw new Error(`Límite de usuarios alcanzado (${limit}) para este tenant.`);
                    }

                    // Increment counter
                    transaction.update(tenantRef, { 
                        userCount: currentCount + 1,
                        updated_date: Timestamp.now()
                    });
                }

                // Check if user already exists
                const userSnap = await transaction.get(userRef);
                if (userSnap.exists()) {
                    // Update instead of error if person is just changing tenant
                    const oldTenantId = userSnap.data().tenantId;
                    if (oldTenantId && oldTenantId !== tenantId && oldTenantId !== 'Central_System') {
                        // We would need to decrement the old tenant count too
                        const oldTenantRef = doc(db, "tenants", oldTenantId);
                        const oldTenantSnap = await transaction.get(oldTenantRef);
                        if (oldTenantSnap.exists()) {
                            transaction.update(oldTenantRef, { 
                                userCount: Math.max(0, (oldTenantSnap.data().userCount || 1) - 1) 
                            });
                        }
                    }
                }

                // Create/Update User
                transaction.set(userRef, { 
                    ...userData, 
                    email: userEmail,
                    createdAt: Timestamp.now(),
                    role: userData.role || 'user',
                    tenantId: tenantId
                });

                // Audit Log (Add to transaction as an addDoc equivalent)
                const auditRef = doc(collection(db, "AuditLogs"));
                transaction.set(auditRef, {
                    action: "link_user",
                    user_email: userEmail,
                    target_tenant: tenantId,
                    performer_id: performer?.uid || "system",
                    performer_name: performer?.email || "system",
                    timestamp: Timestamp.now()
                });
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["users-list"]);
            queryClient.invalidateQueries(["tenants"]);
        },
    });

    const deleteUser = useMutation({
        mutationFn: async (id) => {
            const userRef = doc(db, "userProfiles", id);
            
            await runTransaction(db, async (transaction) => {
                const userSnap = await transaction.get(userRef);
                if (!userSnap.exists()) return;

                const tenantId = userSnap.data().tenantId;
                if (tenantId && tenantId !== 'Central_System') {
                    const tenantRef = doc(db, "tenants", tenantId);
                    const tenantSnap = await transaction.get(tenantRef);
                    if (tenantSnap.exists()) {
                        transaction.update(tenantRef, { 
                            userCount: Math.max(0, (tenantSnap.data().userCount || 1) - 1) 
                        });
                    }
                }

                // Delete User
                transaction.delete(userRef);

                // Audit Log
                const auditRef = doc(collection(db, "AuditLogs"));
                transaction.set(auditRef, {
                    action: "unlink_user",
                    user_id: id,
                    performer_id: performer?.uid || "system",
                    performer_name: performer?.email || "system",
                    timestamp: Timestamp.now()
                });
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["users-list"]);
            queryClient.invalidateQueries(["tenants"]);
        },
    });

    return { users, isLoading, error, createUser, deleteUser };
};
