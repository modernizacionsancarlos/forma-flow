/**
 * Aprovisionamiento de cuentas en Firebase Auth vía Cloud Function (Admin SDK)
 * y envío del correo oficial de "restablecer contraseña" para que el usuario defina su clave.
 */
import { httpsCallable } from "firebase/functions";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, functions } from "../lib/firebase";
import { getPublicSiteUrl } from "../lib/publicSiteUrl";

/** Llama a la función callable que crea el usuario en Auth si aún no existe. */
export async function callProvisionStaffAuthUser({ email, displayName, targetTenantId }) {
  const fn = httpsCallable(functions, "provisionStaffAuthUser");
  const { data } = await fn({
    email: String(email).trim().toLowerCase(),
    displayName: displayName || "",
    targetTenantId: String(targetTenantId || "").trim(),
  });
  return data;
}

/** Envía el correo de Firebase con enlace para establecer / restablecer contraseña (plantilla del proyecto). */
export async function sendFirebasePasswordSetupEmail(email) {
  const url = `${getPublicSiteUrl()}/login`;
  await sendPasswordResetEmail(auth, String(email).trim().toLowerCase(), url ? { url } : undefined);
}
