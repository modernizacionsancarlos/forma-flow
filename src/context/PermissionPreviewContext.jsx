import React, { useCallback, useContext, useMemo, useState } from "react";
import { PermissionPreviewContext } from "./permissionPreviewRootContext";

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
