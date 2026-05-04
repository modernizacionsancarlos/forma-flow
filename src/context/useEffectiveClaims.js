import { useContext, useMemo } from "react";
import { useAuth } from "../lib/AuthContext";
import { PermissionPreviewContext } from "./permissionPreviewRootContext";

/**
 * Claims efectivos: si hay vista previa activa, usa permisos simulados (sin tocar Firebase).
 */
export function useEffectiveClaims() {
  const auth = useAuth();
  const ctx = useContext(PermissionPreviewContext);

  const active = ctx?.preview?.active;
  const simulatedPermissions = ctx?.preview?.simulatedPermissions;
  const simulatedRole = ctx?.preview?.simulatedRole;

  return useMemo(() => {
    if (active && Array.isArray(simulatedPermissions)) {
      return {
        ...auth,
        claims: {
          ...auth.claims,
          role: simulatedRole || auth.claims?.role,
          effectivePermissions: simulatedPermissions,
          _previewMode: true,
        },
      };
    }
    return auth;
  }, [auth, active, simulatedPermissions, simulatedRole]);
}
