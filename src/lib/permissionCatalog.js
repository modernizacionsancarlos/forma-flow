/**
 * Catálogo de permisos para la matriz tipo Django (etiquetas y agrupación UI).
 * Los valores reales coinciden con `PERMISSIONS` en permissions.js.
 */
import { PERMISSIONS } from "./permissions";

export const PERMISSION_GROUPS = [
  {
    id: "nav",
    label: "Vistas y navegación",
    description: "Qué secciones del panel pueden ver en el menú lateral.",
    keys: [
      PERMISSIONS.ACCESS_DASHBOARD,
      PERMISSIONS.ACCESS_FORMS,
      PERMISSIONS.ACCESS_EXPORT,
      PERMISSIONS.ACCESS_SETTINGS,
      PERMISSIONS.ACCESS_ADMIN_PANEL,
      PERMISSIONS.ACCESS_OBSERVATORY,
    ],
  },
  {
    id: "forms",
    label: "Formularios",
    keys: [
      PERMISSIONS.CREATE_FORM,
      PERMISSIONS.EDIT_FORM,
      PERMISSIONS.DELETE_FORM,
    ],
  },
  {
    id: "submissions",
    label: "Trámites y respuestas",
    keys: [PERMISSIONS.VIEW_SUBMISSIONS, PERMISSIONS.SIGN_SUBMISSION],
  },
  {
    id: "workflow",
    label: "Workflows",
    keys: [PERMISSIONS.MANAGE_WORKFLOW, PERMISSIONS.TRANSITION_STATE],
  },
  {
    id: "tenant",
    label: "Estructura y organización",
    keys: [
      PERMISSIONS.MANAGE_TENANTS,
      PERMISSIONS.MANAGE_TENANT,
      PERMISSIONS.MANAGE_TENANT_RESOURCES,
      PERMISSIONS.MANAGE_TENANT_USERS,
    ],
  },
  {
    id: "admin_meta",
    label: "Administración y cumplimiento",
    keys: [
      PERMISSIONS.MANAGE_USERS,
      PERMISSIONS.VIEW_AUDIT_LOGS,
      PERMISSIONS.VIEW_GLOBAL_STATS,
      PERMISSIONS.MANAGE_PERMISSION_MATRIX,
    ],
  },
];
