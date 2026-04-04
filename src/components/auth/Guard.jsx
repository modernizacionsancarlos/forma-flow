import React from 'react';
import { useAuth } from '../../lib/AuthContext';
import { hasPermission, hasAnyPermission } from '../../lib/permissions';

/**
 * Componente Guard para protección de UI basada en roles o permisos.
 * 
 * @param {string} permission - Permiso específico requerido.
 * @param {string[]} permissions - Lista de permisos donde al menos uno sea requerido.
 * @param {string[]} roles - Lista de roles permitidos explícitamente.
 * @param {React.ReactNode} children - Contenido a mostrar si se cumple.
 * @param {React.ReactNode} fallback - Opcional. Qué mostrar si no tiene acceso.
 * @param {boolean} disabled - Si es true, renderiza los hijos pero les pasa un prop 'disabled' (solo si son componentes que lo acepten).
 */
const Guard = ({ 
  permission, 
  permissions = [], 
  roles = [], 
  children, 
  fallback = null,
  disabled = false 
}) => {
  const { claims } = useAuth();
  const userRole = claims?.role;

  let hasAccess = false;

  // 1. Verificar por Roles explícitos
  if (roles.length > 0) {
    hasAccess = roles.includes(userRole);
  } 
  // 2. Verificar por Permiso único
  else if (permission) {
    hasAccess = hasPermission(userRole, permission);
  }
  // 3. Verificar por Múltiples Permisos (OR)
  else if (permissions.length > 0) {
    hasAccess = hasAnyPermission(userRole, permissions);
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  // Si disabled es true, clonamos los hijos inyectando disabled: true
  if (disabled && React.isValidElement(children)) {
    return React.cloneElement(children, { disabled: true, title: "No tienes permisos para esta acción" });
  }

  return fallback;
};

export default Guard;
