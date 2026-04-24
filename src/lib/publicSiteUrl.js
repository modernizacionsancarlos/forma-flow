/**
 * URL pública absoluta del sitio (para enlaces en correos y metadatos).
 * Prioriza VITE_PUBLIC_APP_URL (ej. https://formaflow-sancarlos.web.app/FormaFlow) y cae al origen actual.
 */
export function getPublicSiteUrl() {
  const fromEnv = import.meta.env.VITE_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
    return `${window.location.origin}${base || ""}`.replace(/\/$/, "");
  }

  return "";
}

/** URL absoluta del logo municipal usado en el sidebar (misma ruta por defecto que MainLayout). */
export function getMunicipalLogoUrl() {
  const path =
    import.meta.env.VITE_MUNICIPAL_LOGO_PATH?.trim() || "/local-assets/municipal-logo.png";
  const base = getPublicSiteUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
