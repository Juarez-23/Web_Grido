"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker, Circle } from "leaflet";

interface Props {
  lat: number;
  lng: number;
  radiusKm: number;
  /** Se dispara al arrastrar el marcador o hacer click en el mapa */
  onChange: (lat: number, lng: number) => void;
}

/**
 * Mapa Leaflet (OpenStreetMap) con marcador del local + círculo de cobertura.
 * No requiere API key. Client-only.
 */
export function DeliveryZoneMap({ lat, lng, radiusKm, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const circleRef = useRef<Circle | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Inicialización (una sola vez)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      // CSS de Leaflet (inyectado una vez)
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: [lat, lng],
        zoom: 13,
        scrollWheelZoom: true,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      // Ícono del local (usa CDN para evitar problemas de assets)
      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const marker = L.marker([lat, lng], { draggable: true, icon }).addTo(map);
      markerRef.current = marker;

      const circle = L.circle([lat, lng], {
        radius: radiusKm * 1000,
        color: "#0d40e8",
        fillColor: "#0d40e8",
        fillOpacity: 0.12,
        weight: 2,
      }).addTo(map);
      circleRef.current = circle;

      marker.on("dragend", () => {
        const p = marker.getLatLng();
        onChangeRef.current(p.lat, p.lng);
      });

      map.on("click", (e: any) => {
        onChangeRef.current(e.latlng.lat, e.latlng.lng);
      });

      // Asegurar render correcto tras montar
      setTimeout(() => map.invalidateSize(), 100);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        circleRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincronizar posición del marcador/círculo cuando cambian props
  useEffect(() => {
    if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
    if (circleRef.current) {
      circleRef.current.setLatLng([lat, lng]);
      circleRef.current.setRadius(radiusKm * 1000);
    }
    if (mapRef.current) mapRef.current.panTo([lat, lng]);
  }, [lat, lng, radiusKm]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: 340, borderRadius: 16, overflow: "hidden", zIndex: 0 }}
    />
  );
}
