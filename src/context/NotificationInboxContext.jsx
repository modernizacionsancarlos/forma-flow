import React, { createContext, useContext } from "react";
import { useNotifications } from "@/api/useNotifications";

const NotificationInboxContext = createContext(null);

/** Una sola suscripción Firestore para campana + badges del menú. */
export function NotificationInboxProvider({ children }) {
  const value = useNotifications();
  return <NotificationInboxContext.Provider value={value}>{children}</NotificationInboxContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotificationInbox() {
  const ctx = useContext(NotificationInboxContext);
  if (!ctx) {
    throw new Error("useNotificationInbox debe usarse dentro de NotificationInboxProvider");
  }
  return ctx;
}
