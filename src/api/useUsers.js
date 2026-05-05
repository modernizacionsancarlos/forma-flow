import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, doc, getDocs, Timestamp, runTransaction, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import {
    callProvisionStaffAuthUser,
    sendFirebasePasswordSetupEmail,
    syncStaffAuthUserState,
    listStaffAuthUsers,
} from "./staffAuthProvisioning";
import NotificationService from "./NotificationService";
import { auditTenantId } from "../lib/auditTenantId";
import { isValidEmail } from "../lib/emailValidation";

/** Campos que admin de empresa puede persistir en otro perfil (alineado con firestore.rules). */
function buildProfileUpdatePayload(raw, claims) {
    const isSuper = claims?.role === "super_admin";
    const out = {};
    if (raw.user_name !== undefined) out.user_name = raw.user_name;
    if (raw.phone !== undefined) out.phone = raw.phone;
    if (raw.status !== undefined) out.status = raw.status;
    if (raw.area_ids !== undefined) out.area_ids = raw.area_ids;
    if (raw.role !== undefined) out.role = raw.role;
    if (isSuper) {
        const tid = raw.tenantId ?? raw.tenant_id;
        if (tid !== undefined && tid !== "") out.tenantId = tid;
    }
    return out;
}

export const useUsers = () => {
    const { user: performer, claims } = useAuth();
    const queryClient = useQueryClient();

    const fetchUsers = async () => {
        let q = collection(db, "userProfiles");
        
        // Si no es super_admin, solo ve usuarios de su tenant
        if (claims?.role !== 'super_admin' && claims?.tenantId) {
            q = query(collection(db, "userProfiles"), where("tenantId", "==", claims.tenantId));
        }

        const profilesSnap = await getDocs(q);
        const profiles = profilesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Complemento para "usuarios reales": invitaciones pendientes aún sin perfil completo.
        let invQ = collection(db, "invitations");
        if (claims?.role !== "super_admin" && claims?.tenantId) {
            invQ = query(collection(db, "invitations"), where("tenantId", "==", claims.tenantId));
        }
        const invitationsSnap = await getDocs(invQ);
        const pendingInvites = invitationsSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .filter((inv) => inv.status === "pending");

        const byEmail = new Map(
            profiles.map((u) => [String(u.email || u.id || "").toLowerCase(), u])
        );

        pendingInvites.forEach((inv) => {
            const email = String(inv.email || "").toLowerCase();
            if (!email) return;
            if (!byEmail.has(email)) {
                byEmail.set(email, {
                    id: email,
                    email,
                    user_name: inv.user_name || "",
                    phone: inv.phone || "",
                    role: inv.role || "operador",
                    tenantId: inv.tenantId || inv.tenant_id || null,
                    area_ids: inv.area_ids || [],
                    status: "pending_invite",
                    createdAt: inv.createdAt || null,
                    invitationId: inv.id,
                    source: "invitation",
                });
            }
        });

        if (claims?.role === "super_admin") {
            try {
                const authUsers = await listStaffAuthUsers();
                authUsers.forEach((au) => {
                    const email = String(au.email || "").toLowerCase();
                    if (!email) return;
                    if (!byEmail.has(email)) {
                        byEmail.set(email, {
                            id: email,
                            email,
                            user_name: au.displayName || "",
                            role: "visualizador",
                            status: au.disabled ? "inactive" : "active",
                            area_ids: [],
                            tenantId: null,
                            source: "auth_only",
                        });
                    }
                });
            } catch (e) {
                console.warn("[useUsers] listStaffAuthUsers:", e?.message || e);
            }
        }

        return [...byEmail.values()];
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
            if (!isValidEmail(userEmail)) {
                throw new Error("Correo electrónico inválido. Revisá el formato (ej: usuario@dominio.com).");
            }
            const tenantDisplayName = userData.tenantDisplayName || tenantId;
            const userRef = doc(db, "userProfiles", userEmail); 
            const tenantRef = doc(db, "tenants", tenantId);

            // 1) Cuenta en Firebase Auth (Admin SDK vía Cloud Function); sin esto no puede iniciar sesión.
            await callProvisionStaffAuthUser({
                email: userEmail,
                displayName: userData.user_name || "",
                targetTenantId: tenantId,
            });

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

                // Campos persistidos (sin datos auxiliares solo para UI / correo).
                transaction.set(userRef, {
                    email: userEmail,
                    user_name: userData.user_name || "",
                    phone: userData.phone || "",
                    status: userData.status || "active",
                    area_ids: userData.area_ids || [],
                    createdAt: Timestamp.now(),
                    role: userData.role || "user",
                    tenantId: tenantId,
                });

                const auditRef = doc(collection(db, "AuditLogs"));
                transaction.set(auditRef, {
                    action: "link_user_profile",
                    user_email: userEmail,
                    target_tenant: tenantId,
                    tenant_id: tenantId,
                    assigned_role: userData.role || "lector",
                    performer_id: performer?.uid || "system",
                    performer_name: performer?.email || "system",
                    timestamp: Timestamp.now(),
                });
            });

            // Correo oficial de Firebase para que defina contraseña (plantilla en Consola > Auth > Plantillas).
            await sendFirebasePasswordSetupEmail(userEmail);

            await NotificationService.sendUserCreatedEmail(
                userEmail,
                {
                    recipientName: userData.user_name || userEmail.split("@")[0],
                    role: userData.role || "operador",
                    tenantName: tenantDisplayName,
                    createdBy: performer?.email || "Administración",
                    tenantId,
                },
                { skipExternalWebhook: true }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["users-list"]);
            queryClient.invalidateQueries(["tenants"]);
        },
    });

    const updateUser = useMutation({
        mutationFn: async ({ id, ...data }) => {
            const userRef = doc(db, "userProfiles", id);
            let tenantForAuth = claims?.tenantId || "";
            await runTransaction(db, async (transaction) => {
                const userSnap = await transaction.get(userRef);
                const current = userSnap.exists()
                    ? userSnap.data()
                    : {
                        email: id,
                        tenantId: data.tenantId || data.tenant_id || claims?.tenantId || "Central_System",
                        role: data.role || "operador",
                        status: "pending_invite",
                        user_name: data.user_name || "",
                        phone: data.phone || "",
                        area_ids: data.area_ids || [],
                    };

                const payload = buildProfileUpdatePayload(data, claims);
                if (Object.keys(payload).length === 0) {
                    throw new Error("No hay cambios válidos para guardar.");
                }
                tenantForAuth = payload.tenantId || current.tenantId || claims?.tenantId || "";

                transaction.set(userRef, {
                    ...current,
                    ...payload,
                    updatedAt: Timestamp.now(),
                    performer_id: performer?.uid
                }, { merge: true });

                const tenantForAudit =
                    auditTenantId(claims, userSnap.data()?.tenantId || "Central_System");

                const auditRef = doc(collection(db, "AuditLogs"));
                transaction.set(auditRef, {
                    action: "update_user_profile",
                    target_user: id,
                    tenant_id: tenantForAudit,
                    changes: payload,
                    performer_id: performer?.uid,
                    timestamp: Timestamp.now()
                });
            });

            if (data.status === "active" || data.status === "inactive" || data.status === "archived") {
                await syncStaffAuthUserState({
                    targetEmail: id,
                    targetTenantId: tenantForAuth,
                    disabled: data.status !== "active",
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["users-list"]);
        },
    });


    const deleteUser = useMutation({
        mutationFn: async (id) => {
            const rootEmail = "modernizacionsancarlos@gmail.com";
            const actorEmail = String(performer?.email || "").toLowerCase();
            if (String(id || "").toLowerCase() === rootEmail && actorEmail !== rootEmail) {
                throw new Error("El usuario principal solo puede eliminarse a sí mismo.");
            }
            const userRef = doc(db, "userProfiles", id);
            let tenantIdForAuth = claims?.tenantId || "";
            
            await runTransaction(db, async (transaction) => {
                const userSnap = await transaction.get(userRef);
                if (!userSnap.exists()) return;

                const tenantId = userSnap.data().tenantId;
                tenantIdForAuth = tenantId || claims?.tenantId || "";
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
                    tenant_id: tenantId && tenantId !== "Central_System" ? tenantId : auditTenantId(claims),
                    performer_id: performer?.uid || "system",
                    performer_name: performer?.email || "system",
                    timestamp: Timestamp.now()
                });
            });

            await syncStaffAuthUserState({
                targetEmail: id,
                targetTenantId: tenantIdForAuth,
                deleteUser: true,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["users-list"]);
            queryClient.invalidateQueries(["tenants"]);
        },
    });

    const archiveUser = useMutation({
        mutationFn: async ({ id }) => updateUser.mutateAsync({ id, status: "archived" }),
        onSuccess: () => {
            queryClient.invalidateQueries(["users-list"]);
        },
    });

    return { users, isLoading, error, createUser, updateUser, deleteUser, archiveUser };
};
