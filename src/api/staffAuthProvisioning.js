/**
 * Aprovisionamiento de cuentas en Firebase Auth vía Cloud Function (Admin SDK)
 * y envío del correo oficial de "restablecer contraseña" para que el usuario defina su clave.
 */
import { httpsCallable } from "firebase/functions";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, functions } from "../lib/firebase";
import { getPublicSiteUrl } from "../lib/publicSiteUrl";

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
  const payload = {
    email: String(email).trim().toLowerCase(),
    displayName: displayName || "",
    targetTenantId: String(targetTenantId || "").trim(),
  };

  try {
    const fn = httpsCallable(functions, "provisionStaffAuthUser");
    const { data } = await fn(payload);
    return data;
  } catch {
    // Fallback HTTP: evita bloqueos de CORS/preflight observados en algunos entornos locales.
    return callProvisionStaffAuthUserHttp(payload);
  }
}

/** Envía el correo de Firebase con enlace para establecer / restablecer contraseña (plantilla del proyecto). */
export async function sendFirebasePasswordSetupEmail(email) {
  const url = `${getPublicSiteUrl()}/login`;
  await sendPasswordResetEmail(auth, String(email).trim().toLowerCase(), url ? { url } : undefined);
}
