import { useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, query, where, updateDoc, doc, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import { useState, useEffect } from "react";

export const useNotifications = () => {
    const { claims, user } = useAuth();
    const queryClient = useQueryClient();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!claims.tenantId || !user) return;

        const q = query(
            collection(db, "Notifications"),
            where("tenant_id", "==", claims.tenantId),
            orderBy("timestamp", "desc"),
            limit(20)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNotifications(docs);
            setUnreadCount(docs.filter(n => !n.read).length);
        });

        return () => unsubscribe();
    }, [claims.tenantId, user]);

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
            const unread = notifications.filter(n => !n.read);
            const promises = unread.map(n => 
                updateDoc(doc(db, "Notifications", n.id), { read: true })
            );
            await Promise.all(promises);
        }
    });

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead
    };
};
