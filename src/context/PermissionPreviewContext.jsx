import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useAuth } from "../lib/AuthContext";

const PermissionPreviewContext = createContext(null);

/**
 * Simula permisos de un rol o usuario sin guardar (vista previa del panel).
 */
export function PermissionPreviewProvider({ children }) {
  const [preview, setPreview] = useState({
    active: false,
    label: "",
    simulatedRole: null,
    /** Lista completa de permisos que tendría el usuario simulado */
    simulatedPermissions: [],
  });

  const startPreview = useCallback(({ label, simulatedRole, simulatedPermissions }) => {
    setPreview({
      active: true,
      label: label || "Vista previa",
      simulatedRole: simulatedRole || "preview",
      simulatedPermissions: Array.isArray(simulatedPermissions) ? simulatedPermissions : [],
    });
  }, []);

  const stopPreview = useCallback(() => {
    setPreview({ active: false, label: "", simulatedRole: null, simulatedPermissions: [] });
  }, []);

  const value = useMemo(
    () => ({ preview, startPreview, stopPreview }),
    [preview, startPreview, stopPreview]
  );

  return (
    <PermissionPreviewContext.Provider value={value}>{children}</PermissionPreviewContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePermissionPreview = () => useContext(PermissionPreviewContext);

/**
 * Claims efectivos: si hay vista previa activa, usa permisos simulados (sin tocar Firebase).
 */
export function useEffectiveClaims() {
  const auth = useAuth();
  const ctx = useContext(PermissionPreviewContext);

  return useMemo(() => {
    if (ctx?.preview?.active && Array.isArray(ctx.preview.simulatedPermissions)) {
      return {
        ...auth,
        claims: {
          ...auth.claims,
          role: ctx.preview.simulatedRole || auth.claims?.role,
          effectivePermissions: ctx.preview.simulatedPermissions,
          _previewMode: true,
        },
      };
    }
    return auth;
  }, [auth, ctx?.preview]);
}
