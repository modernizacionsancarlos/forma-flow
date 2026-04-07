import { useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import toast from "react-hot-toast";

export const useSubmissionNotifications = () => {
    const { claims } = useAuth();

    useEffect(() => {
        if (!claims?.tenantId && claims?.role !== 'super_admin') return;

        let q;
        if (claims.role === 'super_admin') {
            q = query(
                collection(db, "Submissions"),
                orderBy("created_date", "desc"),
                limit(1)
            );
        } else {
            q = query(
                collection(db, "Submissions"),
                where("tenant_id", "==", claims.tenantId),
                orderBy("created_date", "desc"),
                limit(1)
            );
        }

        // We only want to notify about NEW submissions that happen AFTER mounting.
        let isInitial = true;

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (isInitial) {
                isInitial = false;
                return;
            }

            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    toast(`🔔 Nuevo trámite recibido: ${change.doc.id.substring(0,8).toUpperCase()}`, {
                        duration: 6000,
                        position: "top-right",
                        style: {
                            background: "#0f172a",
                            color: "#fff",
                            border: "1px solid rgba(16,185,129,0.3)",
                            fontSize: "12px",
                            fontWeight: "bold"
                        },
                        icon: '✍️'
                    });
                    
                    // Optional: Play a subtle notification sound
                    try {
                        const audio = new Audio('/notification.mp3');
                        audio.play().catch((err) => {
                            console.debug("Audio play blocked or missing:", err);
                        });
                    } catch {
                        // Ignore sound errors
                    }
                }
            });
        });

        return () => unsubscribe();
    }, [claims]);
};
