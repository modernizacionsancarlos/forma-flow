/**
 * Permisos y roles FormaFlow.
 * Los permisos efectivos pueden sobreescribirse desde Firestore (por rol) y por usuario (grant/revoke).
 */

export const PERMISSIONS = {
  // Navegación / vistas (panel interno)
  ACCESS_DASHBOARD: "access_dashboard",
  ACCESS_FORMS: "access_forms",
  ACCESS_EXPORT: "access_export",
  ACCESS_SETTINGS: "access_settings",
  ACCESS_ADMIN_PANEL: "access_admin_panel",
  ACCESS_OBSERVATORY: "access_observatory",

  // Formularios
  CREATE_FORM: "create_form",
  EDIT_FORM: "edit_form",
  DELETE_FORM: "delete_form",

  // Entregas
  VIEW_SUBMISSIONS: "view_submissions",
  SIGN_SUBMISSION: "sign_submission",

  // Workflows
  MANAGE_WORKFLOW: "manage_workflow",
  TRANSITION_STATE: "transition_state",

  // Administrativo
  MANAGE_USERS: "manage_users",
  VIEW_AUDIT_LOGS: "view_audit_logs",
  VIEW_GLOBAL_STATS: "view_global_stats",
  MANAGE_TENANT: "manage_tenant",
  MANAGE_TENANTS: "manage_tenants",
  MANAGE_TENANT_RESOURCES: "manage_tenant_resources",
  MANAGE_TENANT_USERS: "manage_tenant_users",
  /** Matriz de permisos (pantalla Usuarios → Permisos) */
  MANAGE_PERMISSION_MATRIX: "manage_permission_matrix",
};

/** Lista completa para matrices y vista previa */
export const ALL_PERMISSION_IDS = Object.freeze(Object.values(PERMISSIONS));

/** Etiquetas legibles en español (UI y vista previa). */
export const PERMISSION_LABELS = {
  [PERMISSIONS.ACCESS_DASHBOARD]: "Ver Dashboard / Inicio",
  [PERMISSIONS.ACCESS_FORMS]: "Ver sección Formularios",
  [PERMISSIONS.ACCESS_EXPORT]: "Ver Exportaciones",
  [PERMISSIONS.ACCESS_SETTINGS]: "Ver Configuración",
  [PERMISSIONS.ACCESS_ADMIN_PANEL]: "Ver Admin panel (métricas globales)",
  [PERMISSIONS.ACCESS_OBSERVATORY]: "Ver Observatorio",
  [PERMISSIONS.CREATE_FORM]: "Crear formularios",
  [PERMISSIONS.EDIT_FORM]: "Editar formularios",
  [PERMISSIONS.DELETE_FORM]: "Eliminar formularios",
  [PERMISSIONS.VIEW_SUBMISSIONS]: "Ver respuestas / trámites",
  [PERMISSIONS.SIGN_SUBMISSION]: "Firmar trámites",
  [PERMISSIONS.MANAGE_WORKFLOW]: "Gestionar workflows",
  [PERMISSIONS.TRANSITION_STATE]: "Cambiar estados en workflow",
  [PERMISSIONS.MANAGE_USERS]: "Gestionar usuario (heredado)",
  [PERMISSIONS.VIEW_AUDIT_LOGS]: "Ver auditoría",
  [PERMISSIONS.VIEW_GLOBAL_STATS]: "Ver estadísticas globales (monitor)",
  [PERMISSIONS.MANAGE_TENANT]: "Gestionar datos del tenant",
  [PERMISSIONS.MANAGE_TENANTS]: "Gestionar empresas / tenants",
  [PERMISSIONS.MANAGE_TENANT_RESOURCES]: "Gestionar áreas y recursos del tenant",
  [PERMISSIONS.MANAGE_TENANT_USERS]: "Gestionar usuarios del tenant",
  [PERMISSIONS.MANAGE_PERMISSION_MATRIX]: "Gestionar matriz de permisos (roles/usuarios)",
};

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  ADMIN_EMPRESA: "admin_empresa",
  RESPONSABLE_AREA: "responsable_area",
  OPERADOR: "operador",
  VISUALIZADOR: "visualizador",
  EDITOR: "editor",
  AUDITOR: "auditor",
  LECTOR: "lector",
  FIRMANTE: "firmante",
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.ADMIN]: "Admin",
  [ROLES.ADMIN_EMPRESA]: "Admin Empresa",
  [ROLES.RESPONSABLE_AREA]: "Responsable de área",
  [ROLES.OPERADOR]: "Operador",
  [ROLES.VISUALIZADOR]: "Visualizador",
  [ROLES.EDITOR]: "Editor",
  [ROLES.AUDITOR]: "Auditor",
  [ROLES.LECTOR]: "Lector",
  [ROLES.FIRMANTE]: "Firmante",
};

/**
 * Valores por defecto empaquetados en código (si no hay doc en Firestore).
 * Super admin siempre tiene todos los permisos vía `hasPermission`.
 */
const STATIC_ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: [...ALL_PERMISSION_IDS],

  [ROLES.ADMIN]: [
    PERMISSIONS.ACCESS_DASHBOARD,
    PERMISSIONS.ACCESS_FORMS,
    PERMISSIONS.ACCESS_EXPORT,
    PERMISSIONS.ACCESS_SETTINGS,
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
    PERMISSIONS.MANAGE_PERMISSION_MATRIX,
  ],

  [ROLES.ADMIN_EMPRESA]: [
    PERMISSIONS.ACCESS_DASHBOARD,
    PERMISSIONS.ACCESS_FORMS,
    PERMISSIONS.ACCESS_EXPORT,
    PERMISSIONS.ACCESS_SETTINGS,
    PERMISSIONS.CREATE_FORM,
    PERMISSIONS.EDIT_FORM,
    PERMISSIONS.VIEW_SUBMISSIONS,
    PERMISSIONS.SIGN_SUBMISSION,
    PERMISSIONS.MANAGE_WORKFLOW,
    PERMISSIONS.TRANSITION_STATE,
    PERMISSIONS.MANAGE_TENANT_RESOURCES,
    PERMISSIONS.MANAGE_TENANT_USERS,
  ],

  [ROLES.RESPONSABLE_AREA]: [
    PERMISSIONS.ACCESS_DASHBOARD,
    PERMISSIONS.ACCESS_FORMS,
    PERMISSIONS.ACCESS_EXPORT,
    PERMISSIONS.VIEW_SUBMISSIONS,
    PERMISSIONS.TRANSITION_STATE,
    PERMISSIONS.MANAGE_WORKFLOW,
    PERMISSIONS.MANAGE_TENANT_RESOURCES,
  ],

  [ROLES.OPERADOR]: [
    PERMISSIONS.ACCESS_DASHBOARD,
    PERMISSIONS.ACCESS_FORMS,
    PERMISSIONS.VIEW_SUBMISSIONS,
    PERMISSIONS.TRANSITION_STATE,
  ],

  [ROLES.VISUALIZADOR]: [
    PERMISSIONS.ACCESS_DASHBOARD,
    PERMISSIONS.ACCESS_FORMS,
    PERMISSIONS.VIEW_SUBMISSIONS,
  ],

  [ROLES.EDITOR]: [
    PERMISSIONS.ACCESS_DASHBOARD,
    PERMISSIONS.ACCESS_FORMS,
    PERMISSIONS.CREATE_FORM,
    PERMISSIONS.EDIT_FORM,
    PERMISSIONS.VIEW_SUBMISSIONS,
    PERMISSIONS.TRANSITION_STATE,
  ],

  [ROLES.AUDITOR]: [
    PERMISSIONS.ACCESS_DASHBOARD,
    PERMISSIONS.VIEW_SUBMISSIONS,
    PERMISSIONS.TRANSITION_STATE,
    PERMISSIONS.VIEW_AUDIT_LOGS,
  ],

  [ROLES.LECTOR]: [PERMISSIONS.ACCESS_DASHBOARD, PERMISSIONS.VIEW_SUBMISSIONS],

  [ROLES.FIRMANTE]: [
    PERMISSIONS.ACCESS_DASHBOARD,
    PERMISSIONS.VIEW_SUBMISSIONS,
    PERMISSIONS.SIGN_SUBMISSION,
  ],
};

/**
 * Resuelve lista base para un rol: Firestore (si existe) o estática.
 */
export function getBasePermissionsForRole(role, firestoreRoleDefaults) {
  if (!role) return [];
  if (role === ROLES.SUPER_ADMIN) return [...ALL_PERMISSION_IDS];
  const fromFs =
    firestoreRoleDefaults && typeof firestoreRoleDefaults === "object"
      ? firestoreRoleDefaults[role]
      : undefined;
  if (Array.isArray(fromFs) && fromFs.length >= 0) return [...new Set(fromFs)];
  return [...(STATIC_ROLE_PERMISSIONS[role] || [])];
}

/**
 * Calcula permisos efectivos: base por rol + grant − revoke en perfil.
 */
export function computeEffectivePermissions(profile, firestoreRoleDefaults) {
  const role = profile?.role;
  if (!role) return [];
  if (role === ROLES.SUPER_ADMIN) return [...ALL_PERMISSION_IDS];

  const base = getBasePermissionsForRole(role, firestoreRoleDefaults);
  const grant = Array.isArray(profile?.permission_grant) ? profile.permission_grant : [];
  const revoke = new Set(Array.isArray(profile?.permission_revoke) ? profile.permission_revoke : []);

  const set = new Set([...base, ...grant]);
  revoke.forEach((k) => set.delete(k));
  return ALL_PERMISSION_IDS.filter((id) => set.has(id));
}

/**
 * Comprueba un permiso usando `claims.effectivePermissions` (o vista previa).
 * `super_admin` siempre pasa (no podés bloquearte el panel accidentalmente).
 */
export function hasPermission(claims, permission) {
  if (!claims?.role) return false;
  if (claims.role === ROLES.SUPER_ADMIN) return true;
  const list = claims.effectivePermissions;
  return Array.isArray(list) && list.includes(permission);
}

export function hasAnyPermission(claims, permissions) {
  if (!claims?.role) return false;
  if (claims.role === ROLES.SUPER_ADMIN) return true;
  return permissions.some((p) => hasPermission(claims, p));
}

/** Para tests o seed: plantilla estática por rol. */
export function getStaticRoleDefaults() {
  return { ...STATIC_ROLE_PERMISSIONS };
}
