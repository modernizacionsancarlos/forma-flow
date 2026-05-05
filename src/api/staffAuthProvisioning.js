/**
 * Aprovisionamiento de cuentas en Firebase Auth vía Cloud Function (Admin SDK)
 * y envío del correo oficial de "restablecer contraseña" para que el usuario defina su clave.
 */
import { httpsCallable } from "firebase/functions";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, functions } from "../lib/firebase";
import { getPublicSiteUrl } from "../lib/publicSiteUrl";
import { isValidEmail } from "../lib/emailValidation";

async function callProvisionStaffAuthUserHttp(payload) {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const region = import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || "us-east1";
  const user = auth.currentUser;
  if (!user) throw new Error("Sesión inválida: no hay usuario autenticado.");
  const idToken = await user.getIdToken();
  const endpoint = `https://${region}-${projectId}.cloudfunctions.net/provisionStaffAuthUserHttp`;
  const resp = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });
  const body = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(body?.message || body?.error || "No se pudo aprovisionar el usuario.");
  }
  return body;
}

/** Llama a la función callable que crea el usuario en Auth si aún no existe. */
export async function callProvisionStaffAuthUser({ email, displayName, targetTenantId }) {
  const normalizedEmail = String(email).trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    throw new Error("Correo electrónico inválido. Revisá el formato (ej: usuario@dominio.com).");
  }

  const payload = {
    email: normalizedEmail,
    displayName: displayName || "",
    targetTenantId: String(targetTenantId || "").trim(),
  };

  // Primario por HTTP (CORS controlado explícitamente).
  try {
    return await callProvisionStaffAuthUserHttp(payload);
  } catch (e) {
    const msg = String(e?.message || "");
    // Fallback callable SOLO para fallos de red; si el backend respondió error válido, se respeta.
    if (!/failed to fetch|networkerror|load failed/i.test(msg)) {
      throw e;
    }
    const fn = httpsCallable(functions, "provisionStaffAuthUser");
    const { data } = await fn(payload);
    return data;
  }
}

/** Envía el correo de Firebase con enlace para establecer / restablecer contraseña (plantilla del proyecto). */
export async function sendFirebasePasswordSetupEmail(email) {
  const url = `${getPublicSiteUrl()}/login`;
  await sendPasswordResetEmail(auth, String(email).trim().toLowerCase(), url ? { url } : undefined);
}
