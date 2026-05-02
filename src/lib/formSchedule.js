import { format } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Convierte fecha guardada en Firestore (ISO string | Timestamp-like) a Date o null.
 */
export function parseScheduleInstant(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "string") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value?.toDate === "function") {
    const d = value.toDate();
    return d instanceof Date && !Number.isNaN(d.getTime()) ? d : null;
  }
  if (typeof value?.seconds === "number") {
    const d = new Date(value.seconds * 1000);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/** Valor compatible con input[type=datetime-local] (admite ISO string y Timestamp de Firestore). */
export function isoToDatetimeLocal(isoOrNull) {
  const d = parseScheduleInstant(isoOrNull);
  if (!d) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** ISO UTC desde valor de datetime-local vacío-safe. */
export function datetimeLocalToIso(localStr) {
  if (!localStr?.trim()) return null;
  const d = new Date(localStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

/** Una línea breve para el encabezado del constructor (opens_at / closes_at). */
export function formatScheduleBrief(opensAt, closesAt) {
  const o = parseScheduleInstant(opensAt);
  const c = parseScheduleInstant(closesAt);
  const bits = [];
  if (o) {
    bits.push(`Abre: ${format(o, "d MMM yyyy, HH:mm", { locale: es })}`);
  }
  if (c) {
    bits.push(`Cierra: ${format(c, "d MMM yyyy, HH:mm", { locale: es })}`);
  }
  return bits.length ? bits.join(" · ") : "";
}
