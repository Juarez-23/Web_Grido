// ============================================
// GRIDO - Estado efectivo del delivery
// Modo MANUAL (interruptor) o SCHEDULE (por horario, zona Argentina)
// ============================================

/** Minutos del día actuales en zona horaria Argentina (0..1439). */
function nowMinutesAR(now = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return h * 60 + m;
}

/** "HH:MM" → minutos. null si inválido. */
function parseHM(s: string | undefined): number | null {
  if (!s) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** ¿La hora actual (Argentina) está dentro del rango [from, to]? Soporta cruce de medianoche. */
export function isWithinSchedule(from: string, to: string, now = new Date()): boolean {
  const f = parseHM(from);
  const t = parseHM(to);
  if (f === null || t === null) return true; // sin horario válido → no bloquear
  if (f === t) return true; // mismo valor → 24hs
  const cur = nowMinutesAR(now);
  if (f < t) return cur >= f && cur < t;
  // Rango que cruza medianoche (ej. 18:00 a 02:00)
  return cur >= f || cur < t;
}

/** Estado efectivo del delivery a partir del mapa de settings de una sucursal. */
export function deliveryActiveFromMap(map: Record<string, string>): boolean {
  const mode = map.deliveryMode === "SCHEDULE" ? "SCHEDULE" : "MANUAL";
  if (mode === "SCHEDULE") {
    return isWithinSchedule(map.deliveryFrom || "10:00", map.deliveryTo || "23:00");
  }
  // Manual — fallback a la clave vieja deliveryEnabled si aún no migró
  const manual = map.deliveryManualOn ?? map.deliveryEnabled;
  return manual !== "false";
}
