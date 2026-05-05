import { useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, query, where, updateDoc, doc, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import { useMemo, useState, useEffect } from "react";

const NOTIF_LIMIT = 60;

/**
 * Notificaciones en la campana y contadores por ítem del menú (navKey).
 * Super Admin: lista global (sin filtro tenant) para ver solicitudes con tenant_id "global" y de todos los tenants.
 * Admin de tenant: mismo tenant_id que su perfil / claims.
 */
export const useNotifications = () => {
    const { claims, user } = useAuth();
    const queryClient = useQueryClient();
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            queueMicrotask(() => {
                setNotifications([]);
                setError(null);
            });
            return;
        }

        const role = claims?.role;
        const tenantId = claims?.tenantId ?? claims?.tenant_id ?? null;

        let q;
        if (role === "super_admin") {
            q = query(collection(db, "Notifications"), orderBy("timestamp", "desc"), limit(NOTIF_LIMIT));
        } else if (tenantId) {
            q = query(
                collection(db, "Notifications"),
                where("tenant_id", "==", tenantId),
                orderBy("timestamp", "desc"),
                limit(NOTIF_LIMIT),
            );
        } else {
            queueMicrotask(() => setNotifications([]));
            return;
        }

        const unsub = onSnapshot(
            q,
            (snapshot) => {
                setError(null);
                const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
                setNotifications(docs);
            },
            (err) => {
                console.error("[useNotifications]", err);
                setError(err);
                setNotifications([]);
            },
        );

        return () => unsub();
    }, [claims?.role, claims?.tenantId, claims?.tenant_id, user]);

    const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

    /** Contadores estilo Discord por clave de menú (campo opcional navKey en documentos). */
    const unreadByNavKey = useMemo(() => {
        const map = {};
        for (const n of notifications) {
            if (n.read) continue;
            const key = n.navKey || "bell";
            map[key] = (map[key] || 0) + 1;
        }
        return map;
    }, [notifications]);

    const markAsRead = useMutation({
        mutationFn: async (notificationId) => {
            const docRef = doc(db, "Notifications", notificationId);
            await updateDoc(docRef, { read: true });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const markAllAsRead = useMutation({
        mutationFn: async () => {
            const unread = notifications.filter((n) => !n.read);
            await Promise.all(unread.map((n) => updateDoc(doc(db, "Notifications", n.id), { read: true })));
        },
    });

    return {
        notifications,
        unreadCount,
        unreadByNavKey,
        error,
        markAsRead,
        markAllAsRead,
    };
};
