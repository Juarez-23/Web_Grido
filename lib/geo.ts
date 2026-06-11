// ============================================
// GRIDO SAN RAFAEL - Zona de delivery (geo)
// ============================================
// Arquitectura preparada para múltiples tipos de zona.
// Hoy: círculo por radio. Futuro: polígonos personalizados.

export type DeliveryZoneType = "RADIUS" | "POLYGON";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface DeliveryZoneConfig {
  /** Tipo de zona activa */
  type: DeliveryZoneType;
  /** Ubicación del local */
  origin: LatLng;
  /** Radio de cobertura en km (modo RADIUS) */
  radiusKm: number;
  /** Vértices del polígono (modo POLYGON, futura versión) */
  polygon?: LatLng[];
}

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Distancia en km entre dos coordenadas (fórmula de Haversine).
 */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Ray casting: ¿el punto está dentro del polígono?
 * Preparado para la futura versión con zonas personalizadas.
 */
export function isPointInPolygon(point: LatLng, polygon: LatLng[]): boolean {
  if (!polygon || polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;
    const intersect =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export interface ZoneCheckResult {
  /** ¿La ubicación está dentro de la zona de reparto? */
  inside: boolean;
  /** Distancia al local en km (solo relevante en modo RADIUS) */
  distanceKm: number | null;
}

/**
 * Verifica si una ubicación de cliente está dentro de la zona de delivery.
 * Punto único de decisión: cambiar a polígonos en el futuro solo toca esta función.
 */
export function checkDeliveryZone(
  customer: LatLng,
  config: DeliveryZoneConfig
): ZoneCheckResult {
  if (config.type === "POLYGON" && config.polygon && config.polygon.length >= 3) {
    return {
      inside: isPointInPolygon(customer, config.polygon),
      distanceKm: null,
    };
  }

  // Modo por defecto: radio circular
  const distanceKm = haversineKm(config.origin, customer);
  return {
    inside: distanceKm <= config.radiusKm,
    distanceKm,
  };
}

/** Mensaje estándar cuando el cliente está fuera de la zona */
export const OUT_OF_ZONE_MESSAGE =
  "Lo sentimos, actualmente no realizamos entregas en tu ubicación. Podés retirar tu pedido en el local.";
