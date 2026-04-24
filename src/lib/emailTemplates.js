/**
 * Plantillas HTML para correos transaccionales (estilo FormaFlow: slate + esmeralda).
 * CSS en línea por compatibilidad con clientes de correo.
 */
import { getMunicipalLogoUrl, getPublicSiteUrl } from "./publicSiteUrl";

function escapeHtml(s) {
  if (s == null || s === "") return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Contenedor común: Municipalidad de San Carlos + FormaFlow + Modernización */
function municipalEmailShell({ preheader, title, innerHtml, ctaLabel, ctaHref }) {
  const logoUrl = getMunicipalLogoUrl();
  const site = getPublicSiteUrl();

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <title>${escapeHtml(title)}</title>
  <!-- preheader (oculto en muchos clientes) -->
  <style>
    .preheader { display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; overflow:hidden; mso-hide:all; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; border-radius: 0 !important; }
      .pad { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#020617;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <span class="preheader">${escapeHtml(preheader)}</span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#020617;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" class="container" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background-color:#0f172a;border:1px solid #1e293b;border-radius:16px;overflow:hidden;">
          <tr>
            <td class="pad" style="padding:28px 28px 20px 28px;text-align:center;border-bottom:1px solid #1e293b;">
              <img src="${escapeHtml(logoUrl)}" alt="Municipalidad de San Carlos" width="120" height="auto" style="max-width:160px;height:auto;display:inline-block;margin-bottom:12px;" />
              <p style="margin:0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;font-weight:700;">
                Municipalidad de San Carlos
              </p>
              <h1 style="margin:10px 0 0 0;font-size:22px;line-height:1.25;color:#f8fafc;font-weight:800;">
                Gestión de formularios <span style="color:#34d399;">FormaFlow</span>
              </h1>
              <p style="margin:8px 0 0 0;font-size:12px;color:#94a3b8;line-height:1.5;">
                Creado e impulsado por el <strong style="color:#cbd5e1;">Área de Modernización</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td class="pad" style="padding:24px 28px 8px 28px;color:#e2e8f0;font-size:15px;line-height:1.6;">
              ${innerHtml}
            </td>
          </tr>
          <tr>
            <td class="pad" style="padding:8px 28px 28px 28px;text-align:center;">
              <a href="${escapeHtml(ctaHref)}" style="display:inline-block;background:linear-gradient(180deg,#10b981,#059669);color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:12px;border:1px solid #047857;">
                ${escapeHtml(ctaLabel)}
              </a>
              <p style="margin:20px 0 0 0;font-size:11px;color:#64748b;">
                Si el botón no funciona, copiá y pegá este enlace en el navegador:<br />
                <a href="${escapeHtml(ctaHref)}" style="color:#34d399;word-break:break-all;">${escapeHtml(ctaHref)}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px;background-color:#020617;border-top:1px solid #1e293b;text-align:center;font-size:10px;color:#475569;line-height:1.5;">
              © Municipalidad de San Carlos · FormaFlow<br />
              <a href="${escapeHtml(site)}" style="color:#64748b;text-decoration:underline;">${escapeHtml(site)}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Correo: invitación pendiente (aceptar en la app tras iniciar sesión).
 */
export function buildInvitationEmailHtml({
  recipientName,
  roleLabel,
  tenantName,
  invitedBy,
  acceptUrl,
}) {
  const inner = `
    <p style="margin:0 0 12px 0;">Hola <strong>${escapeHtml(recipientName || "colega")}</strong>,</p>
    <p style="margin:0 0 12px 0;">
      Tenés una <strong style="color:#34d399;">invitación</strong> para acceder al panel de <strong>FormaFlow</strong>
      ${tenantName ? ` en <strong>${escapeHtml(tenantName)}</strong>` : ""}.
    </p>
    <p style="margin:0 0 12px 0;">
      Rol asignado: <span style="color:#34d399;font-weight:700;">${escapeHtml(roleLabel || "—")}</span>
    </p>
    ${invitedBy ? `<p style="margin:0 0 12px 0;font-size:13px;color:#94a3b8;">Invitación enviada por: ${escapeHtml(invitedBy)}</p>` : ""}
    <p style="margin:0;font-size:13px;color:#94a3b8;">
      Iniciá sesión con <strong>este mismo correo electrónico</strong>. Al ingresar verás un aviso para <strong>Aceptar</strong> la invitación.
    </p>
  `;

  return municipalEmailShell({
    preheader: "Invitación a FormaFlow — Municipalidad de San Carlos",
    title: "Invitación FormaFlow",
    innerHtml: inner,
    ctaLabel: "Ir al inicio de sesión",
    ctaHref: acceptUrl,
  });
}

/**
 * Correo: perfil de usuario creado en el sistema (sin paso de invitación en colección).
 */
export function buildUserCreatedEmailHtml({
  recipientName,
  roleLabel,
  tenantName,
  createdBy,
  loginUrl,
}) {
  const inner = `
    <p style="margin:0 0 12px 0;">Hola <strong>${escapeHtml(recipientName || "colega")}</strong>,</p>
    <p style="margin:0 0 12px 0;">
      Se generó tu <strong style="color:#34d399;">usuario</strong> en <strong>FormaFlow</strong>
      ${tenantName ? ` para <strong>${escapeHtml(tenantName)}</strong>` : ""}.
    </p>
    <p style="margin:0 0 12px 0;">
      Rol: <span style="color:#34d399;font-weight:700;">${escapeHtml(roleLabel || "—")}</span>
    </p>
    ${createdBy ? `<p style="margin:0 0 12px 0;font-size:13px;color:#94a3b8;">Registrado por: ${escapeHtml(createdBy)}</p>` : ""}
    <p style="margin:0;font-size:13px;color:#94a3b8;">
      Si ya tenés contraseña de acceso municipal, ingresá con tu correo. Si no, solicitá credenciales al administrador.
    </p>
  `;

  return municipalEmailShell({
    preheader: "Usuario creado en FormaFlow",
    title: "Usuario FormaFlow",
    innerHtml: inner,
    ctaLabel: "Abrir FormaFlow",
    ctaHref: loginUrl,
  });
}

export function roleLabelFromId(roleId) {
  const map = {
    super_admin: "Super Admin",
    admin_empresa: "Admin Empresa",
    admin: "Administrador",
    responsable_area: "Responsable de área",
    operador: "Operador",
    visualizador: "Visualizador",
    user: "Usuario",
    editor: "Editor",
    auditor: "Auditor",
    lector: "Lector",
  };
  return map[roleId] || roleId || "—";
}
