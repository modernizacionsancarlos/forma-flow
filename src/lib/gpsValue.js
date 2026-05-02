/**
 * Normaliza valores del campo GPS: admite objeto, JSON serializado o "lat, lng" legado.
 */
export function parseGpsFormValue(raw) {
  if (raw === undefined || raw === null || raw === "") return null;
  if (typeof raw === "object" && raw !== null && typeof raw.lat === "number" && typeof raw.lng === "number") {
    return raw;
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed === "object" &&
        typeof parsed.lat === "number" &&
        typeof parsed.lng === "number"
      ) {
        return parsed;
      }
    } catch {
      /* string plano tipo "-34.5, -58.3" */
    }
    const m = raw.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
    if (m) {
      return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
    }
  }
  return null;
}

/** Texto corto para listados y validaciones. */
export function formatGpsSubmissionDisplay(raw) {
  const g = parseGpsFormValue(raw);
  if (!g) return "";
  const line =
    g.display ||
    g.label ||
    (g.address
      ? [
          [g.address.road, g.address.house_number].filter(Boolean).join(" "),
          g.address.suburb || g.address.neighbourhood || g.address.city || g.address.town || g.address.village,
          g.address.state,
          g.address.country,
        ]
          .filter(Boolean)
          .join(", ")
      : "") ||
    `${g.lat.toFixed(6)}, ${g.lng.toFixed(6)}`;
  return `${line}\n(${g.lat.toFixed(6)}, ${g.lng.toFixed(6)})`;
}
