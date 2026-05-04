import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { getPublicSiteUrl } from "../lib/publicSiteUrl";

/**
 * Servicio de notificaciones omnicanal (in-app, correo, WhatsApp simulado).
 * Correos HTML: plantillas en `emailTemplates.js`. Envío real: opcional vía `VITE_EMAIL_WEBHOOK_URL`.
 */
class NotificationService {
  static MAX_HTML_LOG = 12000;

  /**
   * Registra un envío en CommunicationLogs (Observatorio).
   */
  static async logCommunication({
    channel,
    to,
    subject,
    content,
    status = "sent",
    tenantId = "global",
    emailHtml = null,
  }) {
    try {
      const payload = {
        channel,
        to,
        subject,
        content: String(content || "").substring(0, 500),
        status,
        timestamp: serverTimestamp(),
        tenant_id: tenantId,
      };
      if (emailHtml) {
        payload.email_html = String(emailHtml).substring(0, this.MAX_HTML_LOG);
      }
      await addDoc(collection(db, "CommunicationLogs"), payload);
    } catch (error) {
      console.error("[NotificationService] Error logging communication:", error);
    }
  }

  /**
   * Si existe VITE_EMAIL_WEBHOOK_URL, intenta POST JSON (n8n, Make, Cloud Function, etc.).
   */
  static async postEmailWebhook({ to, subject, textBody, htmlBody }) {
    const url = import.meta.env.VITE_EMAIL_WEBHOOK_URL?.trim();
    if (!url) return;

    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          subject,
          text: textBody,
          html: htmlBody,
          source: "formaflow",
          siteUrl: getPublicSiteUrl(),
        }),
      });
    } catch (e) {
      console.warn("[NotificationService] Webhook de correo no disponible:", e);
    }
  }

  static async sendInApp(userId, { title, message, type = "info", metadata = {}, tenantId = "global" }) {
    try {
      await addDoc(collection(db, "Notifications"), {
        userId,
        title,
        message,
        type,
        read: false,
        metadata,
        tenant_id: tenantId,
        timestamp: serverTimestamp(),
      });
      console.debug(`[NotificationService] In-App sent to ${userId}: ${title}`);
    } catch (error) {
      console.error("[NotificationService] Error sending In-App:", error);
    }
  }

  /**
   * Envío de correo (HTML + texto) con registro y webhook opcional.
   */
  /**
   * @param {object} opts
   * @param {boolean} [opts.skipExternalWebhook] - Si true, no POST a VITE_EMAIL_WEBHOOK_URL (evita doble correo cuando ya envió Firebase Auth).
   */
  static async sendEmailSimulation(to, { subject, body, htmlBody = null, tenantId = "global", skipExternalWebhook = false }) {
    console.group("%c 📧 FormaFlow — notificación por correo", "color: #10b981; font-weight: bold;");
    console.log(`Para: ${to}`);
    console.log(`Asunto: ${subject}`);
    console.groupEnd();

    await this.logCommunication({
      channel: "email",
      to,
      subject,
      content: body,
      tenantId,
      emailHtml: htmlBody,
    });

    if (!skipExternalWebhook) {
      await this.postEmailWebhook({
        to,
        subject,
        textBody: body,
        htmlBody: htmlBody || body,
      });
    }
  }

  /** Invitación: enlace al login con aviso de invitación pendiente */
  /** @param {{ skipExternalWebhook?: boolean }} [sendOpts] */
  static async sendInvitationEmail(to, meta, sendOpts = {}) {
    const { buildInvitationEmailHtml, roleLabelFromId } = await import("../lib/emailTemplates.js");
    const acceptUrl = `${getPublicSiteUrl()}/login?invitacion=pendiente`;
    const html = buildInvitationEmailHtml({
      recipientName: meta.recipientName,
      roleLabel: roleLabelFromId(meta.role),
      tenantName: meta.tenantName,
      invitedBy: meta.invitedBy,
      acceptUrl,
    });
    const text =
      `Invitación a FormaFlow (Municipalidad de San Carlos).\n` +
      `Rol: ${roleLabelFromId(meta.role)}.\n` +
      `Iniciá sesión con este correo: ${acceptUrl}\n` +
      `Tras ingresar, aceptá la invitación en el aviso del sistema.`;

    await this.sendEmailSimulation(to, {
      subject: "Invitación a FormaFlow — Municipalidad de San Carlos",
      body: text,
      htmlBody: html,
      tenantId: meta.tenantId || "global",
      skipExternalWebhook: Boolean(sendOpts.skipExternalWebhook),
    });
  }

  /** Usuario creado directamente en userProfiles */
  /** @param {{ skipExternalWebhook?: boolean }} [sendOpts] */
  static async sendUserCreatedEmail(to, meta, sendOpts = {}) {
    const { buildUserCreatedEmailHtml, roleLabelFromId } = await import("../lib/emailTemplates.js");
    const loginUrl = `${getPublicSiteUrl()}/login`;
    const html = buildUserCreatedEmailHtml({
      recipientName: meta.recipientName,
      roleLabel: roleLabelFromId(meta.role),
      tenantName: meta.tenantName,
      createdBy: meta.createdBy,
      loginUrl,
    });
    const text =
      `Se creó tu usuario en FormaFlow.\n` +
      `Rol: ${roleLabelFromId(meta.role)}.\n` +
      `Acceso: ${loginUrl}`;

    await this.sendEmailSimulation(to, {
      subject: "Tu usuario en FormaFlow — Municipalidad de San Carlos",
      body: text,
      htmlBody: html,
      tenantId: meta.tenantId || "global",
      skipExternalWebhook: Boolean(sendOpts.skipExternalWebhook),
    });
  }

  static async sendWhatsAppSimulation(phone, message, tenantId = "global") {
    console.group("%c 🟢 SIMULACIÓN DE WHATSAPP (FormaFlow)", "color: #22c55e; font-weight: bold;");
    console.log(`Celular: ${phone}`);
    console.log(`Mensaje: ${message}`);
    console.groupEnd();

    await this.logCommunication({
      channel: "whatsapp",
      to: phone,
      subject: "",
      content: message,
      tenantId,
    });
  }

  static async notifyStatusChange(submission, transitionMeta) {
    const { id, created_by, tenant_id } = submission;
    const { label, notificationText } = transitionMeta;
    const tId = tenant_id || "global";

    if (created_by && created_by !== "Public") {
      await this.sendInApp(created_by, {
        title: "Actualización de Trámite",
        message: `El trámite ${id.substring(0, 8)} ha cambiado a: ${label}`,
        type: "status_change",
        metadata: { submissionId: id },
        tenantId: tId,
      });
    }

    const emailContent = `Hola, tu trámite en FormaFlow ha sido actualizado.\n\nNuevo Estado: ${label}\nObservación: ${notificationText || "Sin observaciones."}`;
    await this.sendEmailSimulation(created_by || "ciudadano@ejemplo.com", {
      subject: `Actualización de trámite #${id.substring(0, 8)}`,
      body: emailContent,
      tenantId: tId,
    });

    const userPhone = submission.data?.phone || submission.data?.telefono || "5491122334455";
    await this.sendWhatsAppSimulation(
      userPhone,
      `FormaFlow: Tu trámite #${id.substring(0, 8)} ahora está ${label.toUpperCase()}.`,
      tId
    );
  }
}

export default NotificationService;
