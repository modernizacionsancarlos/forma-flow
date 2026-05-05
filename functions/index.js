/**
 * Cloud Functions — FormaFlow
 * Aprovisiona cuentas en Firebase Auth (solo personal autorizado vía userProfiles / claims).
 */
import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";

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
  try {
    const snap = await getFirestore().collection("userProfiles").doc(email).get();
    const data = snap.exists ? snap.data() : {};
    return {
      role: data.role || null,
      tenantId: data.tenantId ?? data.tenant_id ?? null,
    };
  } catch (e) {
    // En algunos proyectos el service account de Cloud Run no tiene Firestore IAM.
    // En ese caso seguimos solo con custom claims del token.
    console.warn("[resolveCallerAccess] Firestore lookup skipped:", e?.code || e?.message);
    return { role: null, tenantId: null };
  }
}

async function provisionStaffAuthUserCore({
  callerEmail,
  tokenRole,
  tokenTenant,
  email,
  displayName,
  targetTenantId,
}) {
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

  const profile = await resolveCallerAccess(callerEmail);
  const callerRole =
    profile.role ||
    tokenRole ||
    (callerEmail === "modernizacionsancarlos@gmail.com" ? "super_admin" : null);
  const callerTenant = profile.tenantId || tokenTenant;

  if (!callerRole || !STAFF_ROLES.has(callerRole)) {
    throw new HttpsError("permission-denied", "Tu usuario no tiene permiso para crear o invitar cuentas.");
  }

  if (callerRole !== "super_admin" && (!callerTenant || callerTenant !== tenantTarget)) {
    throw new HttpsError("permission-denied", "Solo podés gestionar usuarios de tu misma empresa.");
  }

  const auth = getAuth();
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
    if (e?.code === "auth/invalid-email") {
      throw new HttpsError("invalid-argument", "Correo electrónico inválido.");
    }
    if (e?.code === "auth/email-already-exists") {
      return { created: false, existed: true, email: emailLower };
    }
    if (e?.code === "auth/insufficient-permission") {
      throw new HttpsError(
        "permission-denied",
        "La cuenta de servicio de Functions no tiene permisos para gestionar usuarios de Auth."
      );
    }
    throw new HttpsError("internal", e?.message || "No se pudo crear el usuario en Auth.");
  }
}

async function resolveCallerRoleTenant({ callerEmail, tokenRole, tokenTenant }) {
  const profile = await resolveCallerAccess(callerEmail);
  return {
    callerRole:
      profile.role ||
      tokenRole ||
      (callerEmail === "modernizacionsancarlos@gmail.com" ? "super_admin" : null),
    callerTenant: profile.tenantId || tokenTenant || null,
  };
}

async function setStaffAuthUserStateCore({
  callerEmail,
  tokenRole,
  tokenTenant,
  targetEmail,
  targetTenantId,
  disabled,
  deleteUser = false,
}) {
  const emailLower = String(targetEmail || "").trim().toLowerCase();
  if (!emailLower || !emailLower.includes("@")) {
    throw new HttpsError("invalid-argument", "Correo objetivo inválido.");
  }

  const { callerRole, callerTenant } = await resolveCallerRoleTenant({
    callerEmail,
    tokenRole,
    tokenTenant,
  });
  if (!callerRole || !STAFF_ROLES.has(callerRole)) {
    throw new HttpsError("permission-denied", "Sin permisos para gestionar usuarios.");
  }

  const tenantTarget = String(targetTenantId || "").trim();
  if (callerRole !== "super_admin" && (!tenantTarget || tenantTarget !== callerTenant)) {
    throw new HttpsError("permission-denied", "Solo podés gestionar usuarios de tu empresa.");
  }

  const rootEmail = "modernizacionsancarlos@gmail.com";
  const auth = getAuth();
  try {
    if (emailLower === rootEmail && callerEmail !== rootEmail) {
      throw new HttpsError("permission-denied", "El usuario raíz solo puede gestionarse a sí mismo.");
    }
    if (deleteUser) {
      const user = await auth.getUserByEmail(emailLower);
      await auth.deleteUser(user.uid);
      return { ok: true, deleted: true, email: emailLower };
    }
    await auth.updateUser(emailLower, { disabled: Boolean(disabled) });
    return { ok: true, deleted: false, disabled: Boolean(disabled), email: emailLower };
  } catch (e) {
    if (e?.code === "auth/user-not-found") {
      return { ok: true, deleted: false, missing: true, email: emailLower };
    }
    if (e?.code === "auth/insufficient-permission") {
      throw new HttpsError(
        "permission-denied",
        "La cuenta de servicio de Functions no tiene permisos para gestionar usuarios de Auth."
      );
    }
    throw new HttpsError("internal", e?.message || "No se pudo sincronizar estado en Firebase Auth.");
  }
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

  return provisionStaffAuthUserCore({
    callerEmail: request.auth.token.email.toLowerCase(),
    tokenRole: request.auth.token.role || null,
    tokenTenant: request.auth.token.tenant_id ?? request.auth.token.tenantId ?? null,
    email: request.data?.email,
    displayName: request.data?.displayName,
    targetTenantId: request.data?.targetTenantId,
  });
}
);

/**
 * Fallback HTTP endpoint con CORS explícito para evitar bloqueos de preflight en entornos locales.
 */
export const provisionStaffAuthUserHttp = onRequest(
  {
    cors: true,
    invoker: "public",
    maxInstances: 3,
    memory: "256MiB",
    timeoutSeconds: 30,
  },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }
    if (req.method !== "POST") {
      res.status(405).json({ error: "method-not-allowed" });
      return;
    }

    try {
      const authHeader = String(req.headers.authorization || "");
      if (!authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "unauthenticated", message: "Falta token de sesión." });
        return;
      }
      const idToken = authHeader.slice("Bearer ".length);
      const decoded = await getAuth().verifyIdToken(idToken);
      const result = await provisionStaffAuthUserCore({
        callerEmail: String(decoded.email || "").toLowerCase(),
        tokenRole: decoded.role || null,
        tokenTenant: decoded.tenant_id ?? decoded.tenantId ?? null,
        email: req.body?.email,
        displayName: req.body?.displayName,
        targetTenantId: req.body?.targetTenantId,
      });
      res.status(200).json(result);
    } catch (e) {
      console.error("[provisionStaffAuthUserHttp]", {
        code: e?.code,
        message: e?.message,
        stack: e?.stack,
      });
      const code = e?.code || "internal";
      const msg = e?.message || "Error interno en provisionStaffAuthUserHttp";
      const map = {
        "invalid-argument": 400,
        unauthenticated: 401,
        "permission-denied": 403,
        internal: 500,
      };
      res.status(map[code] || 500).json({ error: code, message: msg });
    }
  }
);

export const setStaffAuthUserState = onCall(
  {
    maxInstances: 3,
    memory: "256MiB",
    timeoutSeconds: 30,
    invoker: "public",
  },
  async (request) => {
    if (!request.auth?.token?.email) {
      throw new HttpsError("unauthenticated", "Tenés que iniciar sesión.");
    }
    return setStaffAuthUserStateCore({
      callerEmail: request.auth.token.email.toLowerCase(),
      tokenRole: request.auth.token.role || null,
      tokenTenant: request.auth.token.tenant_id ?? request.auth.token.tenantId ?? null,
      targetEmail: request.data?.targetEmail,
      targetTenantId: request.data?.targetTenantId,
      disabled: request.data?.disabled,
      deleteUser: request.data?.deleteUser === true,
    });
  }
);

export const setStaffAuthUserStateHttp = onRequest(
  {
    cors: true,
    invoker: "public",
    maxInstances: 3,
    memory: "256MiB",
    timeoutSeconds: 30,
  },
  async (req, res) => {
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).json({ error: "method-not-allowed" });
    try {
      const authHeader = String(req.headers.authorization || "");
      if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "unauthenticated", message: "Falta token de sesión." });
      }
      const idToken = authHeader.slice("Bearer ".length);
      const decoded = await getAuth().verifyIdToken(idToken);
      const result = await setStaffAuthUserStateCore({
        callerEmail: String(decoded.email || "").toLowerCase(),
        tokenRole: decoded.role || null,
        tokenTenant: decoded.tenant_id ?? decoded.tenantId ?? null,
        targetEmail: req.body?.targetEmail,
        targetTenantId: req.body?.targetTenantId,
        disabled: req.body?.disabled,
        deleteUser: req.body?.deleteUser === true,
      });
      return res.status(200).json(result);
    } catch (e) {
      const code = e?.code || "internal";
      const msg = e?.message || "Error interno en setStaffAuthUserStateHttp";
      const map = {
        "invalid-argument": 400,
        unauthenticated: 401,
        "permission-denied": 403,
        internal: 500,
      };
      return res.status(map[code] || 500).json({ error: code, message: msg });
    }
  }
);

async function listAuthUsersCore({ callerEmail, tokenRole }) {
  const role = tokenRole || (callerEmail === "modernizacionsancarlos@gmail.com" ? "super_admin" : null);
  if (role !== "super_admin") {
    throw new HttpsError("permission-denied", "Solo Super Admin puede listar usuarios de Firebase Auth.");
  }
  const out = [];
  let nextPageToken = undefined;
  do {
    const res = await getAuth().listUsers(1000, nextPageToken);
    res.users.forEach((u) => {
      out.push({
        uid: u.uid,
        email: String(u.email || "").toLowerCase(),
        displayName: u.displayName || "",
        disabled: Boolean(u.disabled),
      });
    });
    nextPageToken = res.pageToken;
  } while (nextPageToken);
  return { users: out };
}

export const listStaffAuthUsers = onCall(
  { invoker: "public", maxInstances: 2, timeoutSeconds: 60 },
  async (request) => {
    if (!request.auth?.token?.email) throw new HttpsError("unauthenticated", "Sin sesión.");
    return listAuthUsersCore({
      callerEmail: request.auth.token.email.toLowerCase(),
      tokenRole: request.auth.token.role || null,
    });
  }
);
