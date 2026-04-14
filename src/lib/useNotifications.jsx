import { useState, useCallback } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { messaging, db } from "./firebase";
import { toast } from "react-hot-toast";

export const useNotifications = (user) => {
  const [permission, setPermission] = useState(Notification.permission);
  const [loading, setLoading] = useState(false);

  const requestPermission = useCallback(async () => {
    if (!messaging) return;
    
    setLoading(true);
    try {
      const status = await Notification.requestPermission();
      setPermission(status);
      
      if (status === "granted") {
        // Get FCM Token
        // VAPID key se configura en Firebase Console > Cloud Messaging > Web Push certificates
        // Luego se agrega en el .env como VITE_FIREBASE_VAPID_KEY
        const token = await getToken(messaging, { 
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || ""
        });

        if (token && user) {
          // Save token to user profile in Firestore
          const userRef = doc(db, "userProfiles", user.email.toLowerCase());
          await updateDoc(userRef, {
            fcmTokens: arrayUnion(token),
            notificationsEnabled: true,
            updated_at: new Date()
          });
          toast.success("Notificaciones activadas correctamente");
        }
      }
    } catch (error) {
      console.error("Error al activar notificaciones:", error);
      toast.error("Error al configurar las notificaciones");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Listen for foreground messages
  const listenForMessages = useCallback(() => {
    if (!messaging) return;
    
    return onMessage(messaging, (payload) => {
      console.log("Message received in foreground: ", payload);
      toast(
        () => (
          <div className="flex flex-col space-y-1">
            <span className="font-bold text-sm text-slate-900">{payload.notification.title}</span>
            <span className="text-xs text-slate-600">{payload.notification.body}</span>
          </div>
        ),
        { icon: "🔔", duration: 5000 }
      );
    });
  }, []);

  return {
    permission,
    requestPermission,
    listenForMessages,
    loading
  };
};
