/**
 * Definición de Permisos y Roles de FormaFlow
 */

export const PERMISSIONS = {
  // Formularios
  CREATE_FORM: 'create_form',
  EDIT_FORM: 'edit_form',
  DELETE_FORM: 'delete_form',
  
  // Entregas (Submissions)
  VIEW_SUBMISSIONS: 'view_submissions',
  SIGN_SUBMISSION: 'sign_submission',
  
  // Workflows
  MANAGE_WORKFLOW: 'manage_workflow',
  TRANSITION_STATE: 'transition_state',
  
  // Administrativo
  MANAGE_USERS: 'manage_users',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  VIEW_GLOBAL_STATS: 'view_global_stats',
  MANAGE_TENANT: 'manage_tenant',

  /**
   * Permisos usados en MainLayout (sidebar) y pantallas: deben existir en ROLE_PERMISSIONS
   * o hasPermission() recibe `undefined` y el menú queda vacío aunque el rol sea admin.
   */
  /** Listado y gestión de empresas / tenants (super admin y admin de plataforma) */
  MANAGE_TENANTS: 'manage_tenants',
  /** Áreas, Workflows y recursos del tenant */
  MANAGE_TENANT_RESOURCES: 'manage_tenant_resources',
  /** Usuarios del tenant (pantalla Usuarios) */
  MANAGE_TENANT_USERS: 'manage_tenant_users',
};

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  AUDITOR: 'auditor',
  LECTOR: 'lector',
  FIRMANTE: 'firmante',
};

const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  
  [ROLES.ADMIN]: [
    PERMISSIONS.CREATE_FORM,
    PERMISSIONS.EDIT_FORM,
    PERMISSIONS.DELETE_FORM,
    PERMISSIONS.VIEW_SUBMISSIONS,
    PERMISSIONS.SIGN_SUBMISSION,
    PERMISSIONS.MANAGE_WORKFLOW,
    PERMISSIONS.TRANSITION_STATE,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.MANAGE_TENANT,
    PERMISSIONS.MANAGE_TENANTS,
    PERMISSIONS.MANAGE_TENANT_RESOURCES,
    PERMISSIONS.MANAGE_TENANT_USERS,
  ],
  
  [ROLES.EDITOR]: [
    PERMISSIONS.CREATE_FORM,
    PERMISSIONS.EDIT_FORM,
    PERMISSIONS.VIEW_SUBMISSIONS,
    PERMISSIONS.TRANSITION_STATE
  ],
  
  [ROLES.AUDITOR]: [
    PERMISSIONS.VIEW_SUBMISSIONS,
    PERMISSIONS.TRANSITION_STATE,
    PERMISSIONS.VIEW_AUDIT_LOGS
  ],
  
  [ROLES.LECTOR]: [
    PERMISSIONS.VIEW_SUBMISSIONS
  ],
  
  [ROLES.FIRMANTE]: [
    PERMISSIONS.VIEW_SUBMISSIONS,
    PERMISSIONS.SIGN_SUBMISSION
  ],
};

/**
 * Verifica si un rol tiene un permiso específico
 */
export const hasPermission = (role, permission) => {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
};

/**
 * Verifica si un rol tiene uno de varios permisos
 */
export const hasAnyPermission = (role, permissions) => {
  if (!role) return false;
  return permissions.some(p => hasPermission(role, p));
};
