import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, doc, getDoc, getDocs, Timestamp, query, where, deleteDoc, addDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";

/**
 * Hook para la gestión de invitaciones de usuarios.
 * Permite invitar, listar y revocar invitaciones pendientes.
 */
export const useInvitations = () => {
    const { claims, user: performer } = useAuth();
    const queryClient = useQueryClient();

    const fetchInvitations = async () => {
        if (!claims?.tenantId && claims?.role !== 'super_admin') return [];

        let q;
        // Los Super Admins ven todo. Los Admin Tenant ven solo lo suyo.
        if (claims.role === 'super_admin') {
            q = collection(db, "invitations");
        } else {
            q = query(
                collection(db, "invitations"), 
                where("tenantId", "==", claims.tenantId)
            );
        }
        
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const { data: invitations, isLoading, error } = useQuery({
        queryKey: ["invitations-list", claims?.tenantId],
        queryFn: fetchInvitations,
        enabled: !!claims?.role,
    });

    const inviteUser = useMutation({
        mutationFn: async (inviteData) => {
            const docData = {
                ...inviteData,
                email: inviteData.email.toLowerCase(),
                status: 'pending',
                invitedBy: performer?.email,
                invitedById: performer?.uid,
                createdAt: Timestamp.now(),
                tenantId: inviteData.tenantId || claims.tenantId
            };

            // Auditoría simple de invitación
            const auditRef = collection(db, "AuditLogs");
            await addDoc(auditRef, {
                action: "invite_user",
                invited_email: docData.email,
                target_tenant: docData.tenantId,
                tenant_id: docData.tenantId,
                performer_id: performer?.uid || "system",
                performer_name: performer?.email || "system",
                timestamp: Timestamp.now()
            });

            const ref = await addDoc(collection(db, "invitations"), docData);
            return { id: ref.id, ...docData };
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["invitations-list"]);
        },
    });

    const revokeInvitation = useMutation({
        mutationFn: async (id) => {
            // Obtener info para auditoría antes de borrar (opcional, pero buena práctica)
            await deleteDoc(doc(db, "invitations", id));
            
            await addDoc(collection(db, "AuditLogs"), {
                action: "revoke_invite",
                invite_id: id,
                tenant_id: claims?.tenantId || "global",
                performer_id: performer?.uid || "system",
                performer_name: performer?.email || "system",
                timestamp: Timestamp.now()
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["invitations-list"]);
        },
    });

    const fetchMyInvitation = async () => {
        if (!performer?.email) return null;
        const q = query(
            collection(db, "invitations"), 
            where("email", "==", performer.email.toLowerCase()),
            where("status", "==", "pending")
        );
        const snap = await getDocs(q);
        if (snap.empty) return null;
        return { id: snap.docs[0].id, ...snap.docs[0].data() };
    };

    const { data: myInvitation } = useQuery({
        queryKey: ["my-invitation", performer?.email],
        queryFn: fetchMyInvitation,
        enabled: !!performer?.email,
    });

    const acceptInvitation = useMutation({
        mutationFn: async ({ invitationId, tenantId, role }) => {
            // Perfiles en FormaFlow usan el email en minúsculas como ID del documento
            const emailKey = performer.email.toLowerCase();
            const invSnap = await getDoc(doc(db, "invitations", invitationId));
            const inv = invSnap.exists() ? invSnap.data() : {};

            const updates = {
                email: emailKey,
                tenantId,
                role,
                status: "active",
                user_name: inv.user_name || inv.full_name || performer.displayName || "",
                phone: inv.phone || "",
                area_ids: inv.area_ids || [],
                updatedAt: Timestamp.now(),
            };

            const profileRef = doc(db, "userProfiles", emailKey);
            await setDoc(profileRef, updates, { merge: true });

            // 2. Mark Invitation as accepted
            await updateDoc(doc(db, "invitations", invitationId), { status: 'accepted', acceptedAt: Timestamp.now() });

            // 3. Audit
            await addDoc(collection(db, "AuditLogs"), {
                action: "accept_invite",
                tenantId,
                tenant_id: tenantId,
                role,
                performer_id: performer.uid,
                performer_email: performer.email,
                timestamp: Timestamp.now()
            });

            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["my-invitation"]);
            queryClient.invalidateQueries(["current-profile"]);
            // Invalidate other relevant queries
            window.location.reload(); // Refresh to ensure claims/context reset
        },
    });

    return { 
        invitations, 
        myInvitation,
        isLoading, 
        error, 
        inviteUser, 
        revokeInvitation,
        acceptInvitation
    };
};
