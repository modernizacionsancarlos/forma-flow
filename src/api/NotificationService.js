import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

/**
 * Notification Service
 * Handles omni-channel alerts for FormaFlow.
 * Current implementation: In-App (Real), Email/WhatsApp (Simulated with persistent logs)
 */
class NotificationService {
    /**
     * Log communication to Firestore for visibility in Global Observatory
     */
    static async logCommunication({ channel, to, subject, content, status = 'sent', tenantId = 'global' }) {
        try {
            await addDoc(collection(db, "CommunicationLogs"), {
                channel,
                to,
                subject,
                content: content.substring(0, 500), // Protegemos tamaño
                status,
                timestamp: serverTimestamp(),
                tenant_id: tenantId
            });
        } catch (error) {
            console.error("[NotificationService] Error logging communication:", error);
        }
    }

    /**
     * Dispatch an In-App notification to a specific user or role context
     */
    static async sendInApp(userId, { title, message, type = 'info', metadata = {}, tenantId = 'global' }) {
        try {
            await addDoc(collection(db, "Notifications"), {
                userId,
                title,
                message,
                type,
                read: false,
                metadata,
                tenant_id: tenantId,
                timestamp: serverTimestamp()
            });
            console.debug(`[NotificationService] In-App sent to ${userId}: ${title}`);
        } catch (error) {
            console.error("[NotificationService] Error sending In-App:", error);
        }
    }

    /**
     * Simulate Email Dispatch
     */
    static async sendEmailSimulation(to, { subject, body, tenantId = 'global' }) {
        console.group("%c 📧 SIMULACIÓN DE EMAIL (FormaFlow)", "color: #10b981; font-weight: bold;");
        console.log(`Para: ${to}`);
        console.log(`Asunto: ${subject}`);
        console.log("%c Infrastructure Ready: Connect SendGrid/Mailgun API here.", "color: #64748b; font-style: italic;");
        console.groupEnd();

        await this.logCommunication({
            channel: 'email',
            to,
            subject,
            content: body,
            tenantId
        });
    }

    /**
     * Simulate WhatsApp Dispatch
     */
    static async sendWhatsAppSimulation(phone, message, tenantId = 'global') {
        console.group("%c 🟢 SIMULACIÓN DE WHATSAPP (FormaFlow)", "color: #22c55e; font-weight: bold;");
        console.log(`Celular: ${phone}`);
        console.log(`Mensaje: ${message}`);
        console.groupEnd();

        await this.logCommunication({
            channel: 'whatsapp',
            to: phone,
            content: message,
            tenantId
        });
    }

    /**
     * Centralized Dispatcher for Workflow Transitions
     */
    static async notifyStatusChange(submission, transitionMeta) {
        const { id, created_by, tenant_id } = submission;
        const { label, notificationText } = transitionMeta;
        const tId = tenant_id || 'global';

        // 1. In-App for the author
        if (created_by && created_by !== 'Public') {
            await this.sendInApp(created_by, {
                title: "Actualización de Trámite",
                message: `El trámite ${id.substring(0,8)} ha cambiado a: ${label}`,
                type: 'status_change',
                metadata: { submissionId: id },
                tenantId: tId
            });
        }

        // 2. Email Simulation
        const emailContent = `Hola, tu trámite en FormaFlow ha sido actualizado.\n\nNuevo Estado: ${label}\nObservación: ${notificationText || 'Sin observaciones.'}`;
        await this.sendEmailSimulation(created_by || "ciudadano@ejemplo.com", {
            subject: `Actualización de trámite #${id.substring(0,8)}`,
            body: emailContent,
            tenantId: tId
        });

        // 3. WhatsApp Simulation
        const userPhone = submission.data?.phone || submission.data?.telefono || "5491122334455";
        await this.sendWhatsAppSimulation(userPhone, `FormaFlow: Tu trámite #${id.substring(0,8)} ahora está ${label.toUpperCase()}.`, tId);
    }
}

export default NotificationService;
