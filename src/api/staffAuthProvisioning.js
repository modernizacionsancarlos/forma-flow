/**
 * Aprovisionamiento de cuentas en Firebase Auth vía Cloud Function (Admin SDK)
 * y envío del correo oficial de "restablecer contraseña" para que el usuario defina su clave.
 */
import { httpsCallable } from "firebase/functions";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, functions } from "../lib/firebase";
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

async function callSetStaffAuthUserStateHttp(payload) {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const region = import.meta.env.VITE_FIREBASE_FUNCTIONS_REGION || "us-east1";
  const user = auth.currentUser;
  if (!user) throw new Error("Sesión inválida: no hay usuario autenticado.");
  const idToken = await user.getIdToken();
  const endpoint = `https://${region}-${projectId}.cloudfunctions.net/setStaffAuthUserStateHttp`;
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
    throw new Error(body?.message || body?.error || "No se pudo sincronizar usuario en Auth.");
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
  const normalizedEmail = String(email).trim().toLowerCase();
  const actionBase =
    typeof window !== "undefined"
      ? window.location.origin
      : import.meta.env.VITE_PUBLIC_APP_URL?.trim() || "";
  const actionUrl = actionBase ? `${actionBase.replace(/\/$/, "")}/login` : undefined;

  try {
    await sendPasswordResetEmail(auth, normalizedEmail, actionUrl ? { url: actionUrl } : undefined);
  } catch (e) {
    const code = e?.code || "";
    if (code === "auth/unauthorized-continue-uri" || code === "auth/invalid-continue-uri") {
      throw new Error(
        "No se pudo enviar el correo: la URL de redirección no está autorizada en Firebase Auth. Verificá Dominios autorizados."
      );
    }
    if (code === "auth/too-many-requests") {
      throw new Error("Demasiados intentos de envío. Esperá unos minutos y volvé a intentar.");
    }
    throw new Error(e?.message || "No se pudo enviar el correo de acceso.");
  }
}

/** Sincroniza estado del usuario con Firebase Auth (activar/desactivar/eliminar). */
export async function syncStaffAuthUserState({
  targetEmail,
  targetTenantId,
  disabled = false,
  deleteUser = false,
}) {
  const payload = {
    targetEmail: String(targetEmail || "").trim().toLowerCase(),
    targetTenantId: String(targetTenantId || "").trim(),
    disabled: Boolean(disabled),
    deleteUser: Boolean(deleteUser),
  };
  try {
    return await callSetStaffAuthUserStateHttp(payload);
  } catch (e) {
    const msg = String(e?.message || "");
    if (!/failed to fetch|networkerror|load failed/i.test(msg)) throw e;
    const fn = httpsCallable(functions, "setStaffAuthUserState");
    const { data } = await fn(payload);
    return data;
  }
}
