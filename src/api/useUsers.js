import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, doc, getDocs, Timestamp, runTransaction, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";

export const useUsers = () => {
    const { user: performer, claims } = useAuth();
    const queryClient = useQueryClient();

    const fetchUsers = async () => {
        let q = collection(db, "userProfiles");
        
        // Si no es super_admin, solo ve usuarios de su tenant
        if (claims?.role !== 'super_admin' && claims?.tenantId) {
            q = query(collection(db, "userProfiles"), where("tenantId", "==", claims.tenantId));
        }

        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const { data: users, isLoading, error } = useQuery({
        queryKey: ["users-list", claims?.tenantId],
        queryFn: fetchUsers,
        enabled: !!claims?.role,
    });

    const createUser = useMutation({
        mutationFn: async (userData) => {
            const tenantId = userData.tenantId || claims?.tenantId || 'Central_System';
            const userEmail = userData.email.toLowerCase();
            const userRef = doc(db, "userProfiles", userEmail); 
            const tenantRef = doc(db, "tenants", tenantId);

            // Firestore exige: en una transacción, todas las lecturas (get) antes de cualquier escritura.
            await runTransaction(db, async (transaction) => {
                // --- 1) Solo lecturas ---
                let tenantSnap = null;
                if (tenantId !== "Central_System") {
                    tenantSnap = await transaction.get(tenantRef);
                }
                const userSnap = await transaction.get(userRef);

                let oldTenantRef = null;
                let oldTenantSnap = null;
                if (userSnap.exists()) {
                    const oldTenantId = userSnap.data().tenantId;
                    if (oldTenantId && oldTenantId !== tenantId && oldTenantId !== "Central_System") {
                        oldTenantRef = doc(db, "tenants", oldTenantId);
                        oldTenantSnap = await transaction.get(oldTenantRef);
                    }
                }

                // --- 2) Validaciones (sin I/O) ---
                if (tenantId !== "Central_System") {
                    if (!tenantSnap.exists()) throw new Error("Tenant no existe");
                    const tenantData = tenantSnap.data();
                    const currentCount = tenantData.userCount || 0;
                    const limit = tenantData.userLimit || 10;
                    if (currentCount >= limit) {
                        throw new Error(`Límite de usuarios alcanzado (${limit}) para este tenant.`);
                    }
                }

                // --- 3) Solo escrituras ---
                if (tenantId !== "Central_System") {
                    const tenantData = tenantSnap.data();
                    const currentCount = tenantData.userCount || 0;
                    transaction.update(tenantRef, {
                        userCount: currentCount + 1,
                        updated_date: Timestamp.now(),
                    });
                }

                if (userSnap.exists() && oldTenantRef && oldTenantSnap?.exists()) {
                    transaction.update(oldTenantRef, {
                        userCount: Math.max(0, (oldTenantSnap.data().userCount || 1) - 1),
                    });
                }

                transaction.set(userRef, {
                    ...userData,
                    email: userEmail,
                    createdAt: Timestamp.now(),
                    role: userData.role || "user",
                    tenantId: tenantId,
                });

                const auditRef = doc(collection(db, "AuditLogs"));
                transaction.set(auditRef, {
                    action: "link_user_profile",
                    user_email: userEmail,
                    target_tenant: tenantId,
                    assigned_role: userData.role || "lector",
                    performer_id: performer?.uid || "system",
                    performer_name: performer?.email || "system",
                    timestamp: Timestamp.now(),
                });
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["users-list"]);
            queryClient.invalidateQueries(["tenants"]);
        },
    });

    const updateUser = useMutation({
        mutationFn: async ({ id, ...data }) => {
            const userRef = doc(db, "userProfiles", id);
            await runTransaction(db, async (transaction) => {
                const userSnap = await transaction.get(userRef);
                if (!userSnap.exists()) throw new Error("Usuario no encontrado");

                transaction.update(userRef, {
                    ...data,
                    updatedAt: Timestamp.now(),
                    performer_id: performer?.uid
                });

                // Auditoría
                const auditRef = doc(collection(db, "AuditLogs"));
                transaction.set(auditRef, {
                    action: "update_user_profile",
                    target_user: id,
                    changes: data,
                    performer_id: performer?.uid,
                    timestamp: Timestamp.now()
                });
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["users-list"]);
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

    return { users, isLoading, error, createUser, updateUser, deleteUser };
};
