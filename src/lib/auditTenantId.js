/**
 * Campo `tenant_id` en documentos de AuditLogs (requerido por firestore.rules para create).
 * Usa el tenant del perfil activo o un valor seguro por defecto.
 */
export function auditTenantId(claims, fallback = "Central_System") {
  const t = claims?.tenantId ?? claims?.tenant_id;
  return t != null && t !== "" ? t : fallback;
}
