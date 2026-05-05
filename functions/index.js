/**
 * Cloud Functions — FormaFlow
 * Aprovisiona cuentas en Firebase Auth (solo personal autorizado vía userProfiles / claims).
 */
import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import { onCall, HttpsError } from "firebase-functions/v2/https";

if (!getApps().length) {
  initializeApp();
}

// Costos Blaze: tope bajo de instancias, memoria mínima y sin minInstances (no cron ni tráfico fantasma).
setGlobalOptions({
  region: "us-east1",
  maxInstances: 3,
  minInstances: 0,
  memory: "256MiB",
  timeoutSeconds: 60,
});

const STAFF_ROLES = new Set(["super_admin", "admin", "admin_empresa"]);

/**
 * Resuelve rol y tenant del llamador desde Firestore (fuente de verdad) con respaldo en custom claims.
 */
async function resolveCallerAccess(callerEmailRaw) {
  const email = String(callerEmailRaw || "").trim().toLowerCase();
  if (!email) return { role: null, tenantId: null };
  const snap = await getFirestore().collection("userProfiles").doc(email).get();
  const data = snap.exists ? snap.data() : {};
  return {
    role: data.role || null,
    tenantId: data.tenantId ?? data.tenant_id ?? null,
  };
}

/**
 * Callable: crea usuario en Firebase Auth si no existe (sin contraseña; el cliente envía reset por correo).
 * Requiere rol staff en userProfiles y que el tenant objetivo coincida (salvo super_admin).
 */
export const provisionStaffAuthUser = onCall(
  {
    maxInstances: 3,
    memory: "256MiB",
    timeoutSeconds: 30,
    invoker: "public",
  },
  async (request) => {
  if (!request.auth?.token?.email) {
    throw new HttpsError("unauthenticated", "Tenés que iniciar sesión para aprovisionar usuarios.");
  }

  const { email, displayName, targetTenantId } = request.data || {};
  const emailLower = String(email || "")
    .trim()
    .toLowerCase();
  if (!emailLower || !emailLower.includes("@")) {
    throw new HttpsError("invalid-argument", "Correo electrónico inválido.");
  }
  const tenantTarget = String(targetTenantId || "").trim();
  if (!tenantTarget) {
    throw new HttpsError("invalid-argument", "Falta la empresa (tenant) objetivo.");
  }

  const callerEmail = request.auth.token.email.toLowerCase();
  const tokenRole = request.auth.token.role || null;
  const tokenTenant =
    request.auth.token.tenant_id ?? request.auth.token.tenantId ?? null;

  const profile = await resolveCallerAccess(callerEmail);
  const callerRole = profile.role || tokenRole;
  const callerTenant = profile.tenantId || tokenTenant;

  if (!callerRole || !STAFF_ROLES.has(callerRole)) {
    throw new HttpsError("permission-denied", "Tu usuario no tiene permiso para crear o invitar cuentas.");
  }

  if (callerRole !== "super_admin") {
    if (!callerTenant || callerTenant !== tenantTarget) {
      throw new HttpsError(
        "permission-denied",
        "Solo podés gestionar usuarios de tu misma empresa."
      );
    }
  }

  const auth = getAuth();
  try {
    await auth.getUserByEmail(emailLower);
    return { created: false, existed: true, email: emailLower };
  } catch (e) {
    if (e?.code !== "auth/user-not-found") {
      console.error("[provisionStaffAuthUser] getUserByEmail", e);
      throw new HttpsError("internal", "Error al consultar Firebase Auth.");
    }
  }

  try {
    await auth.createUser({
      email: emailLower,
      displayName: displayName ? String(displayName).trim() : undefined,
      emailVerified: false,
      disabled: false,
    });
    return { created: true, existed: false, email: emailLower };
  } catch (e) {
    console.error("[provisionStaffAuthUser] createUser", e);
    const msg = e?.message || "No se pudo crear el usuario en Auth.";
    throw new HttpsError("internal", msg);
  }
}
);
