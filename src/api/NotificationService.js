import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

/**
 * Notification Service
 * Handles omni-channel alerts for FormaFlow.
 * Current implementation: In-App (Real), Email/WhatsApp (Simulated)
 */
class NotificationService {
    /**
     * Dispatch an In-App notification to a specific user or role context
     */
    static async sendInApp(userId, { title, message, type = 'info', metadata = {} }) {
        try {
            await addDoc(collection(db, "Notifications"), {
                userId,
                title,
                message,
                type,
                read: false,
                metadata,
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
    static async sendEmailSimulation(to, { subject, body }) {
        console.group("%c 📧 SIMULACIÓN DE EMAIL (FormaFlow)", "color: #10b981; font-weight: bold;");
        console.log(`Para: ${to}`);
        console.log(`Asunto: ${subject}`);
        console.log(`Cuerpo: \n${body}`);
        console.log("%c Infrastructure Ready: Connect SendGrid/Mailgun API here.", "color: #64748b; font-style: italic;");
        console.groupEnd();
    }

    /**
     * Simulate WhatsApp Dispatch
     */
    static async sendWhatsAppSimulation(phone, message) {
        console.group("%c 🟢 SIMULACIÓN DE WHATSAPP (FormaFlow)", "color: #22c55e; font-weight: bold;");
        console.log(`Celular: ${phone}`);
        console.log(`Mensaje: ${message}`);
        console.log("%c Infrastructure Ready: Connect Twilio/WhatsApp Business API here.", "color: #64748b; font-style: italic;");
        console.groupEnd();
    }

    /**
     * Centralized Dispatcher for Workflow Transitions
     */
    static async notifyStatusChange(submission, transitionMeta) {
        const { id, created_by } = submission;
        const { label, notificationText } = transitionMeta;

        // 1. In-App for the author (if available)
        if (created_by && created_by !== 'Public') {
            await this.sendInApp(created_by, {
                title: "Actualización de Trámite",
                message: `El trámite ${id.substring(0,8)} ha cambiado a: ${label}`,
                type: 'status_change',
                metadata: { submissionId: id }
            });
        }

        // 2. Email Simulation
        await this.sendEmailSimulation(created_by || "ciudadano@ejemplo.com", {
            subject: `Actualización de trámite #${id.substring(0,8)}`,
            body: `Hola, tu trámite en FormaFlow ha sido actualizado.\n\nNuevo Estado: ${label}\nObservación: ${notificationText || 'Sin observaciones.'}\n\nPuedes consultar el estado en el portal público.`
        });

        // 3. WhatsApp Simulation (if phone exists in submission data)
        const userPhone = submission.data?.phone || submission.data?.telefono || "5491122334455";
        await this.sendWhatsAppSimulation(userPhone, `FormaFlow: Tu trámite #${id.substring(0,8)} ahora está ${label.toUpperCase()}.`);
    }
}

export default NotificationService;
