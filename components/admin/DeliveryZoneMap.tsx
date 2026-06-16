"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker, Circle, Polygon, LayerGroup } from "leaflet";

export interface LatLng {
  lat: number;
  lng: number;
}

interface Props {
  mode: "RADIUS" | "POLYGON";
  lat: number;
  lng: number;
  radiusKm: number;
  /** Mover el marcador del local (modo radio) */
  onChange: (lat: number, lng: number) => void;
  /** Vértices del polígono (modo polígono) */
  polygon: LatLng[];
  onPolygonChange: (points: LatLng[]) => void;
}

/**
 * Mapa Leaflet (OpenStreetMap) — modo radio (círculo) o polígono editable.
 * No requiere API key. Client-only.
 */
export function DeliveryZoneMap({ mode, lat, lng, radiusKm, onChange, polygon, onPolygonChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const LRef = useRef<any>(null);
  const markerRef = useRef<Marker | null>(null);
  const circleRef = useRef<Circle | null>(null);
  const polygonRef = useRef<Polygon | null>(null);
  const vertexLayerRef = useRef<LayerGroup | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);

  // Refs vivas para los handlers (evitan closures viejos)
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const polygonStateRef = useRef<LatLng[]>(polygon);
  polygonStateRef.current = polygon;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onPolygonChangeRef = useRef(onPolygonChange);
  onPolygonChangeRef.current = onPolygonChange;

  // Redibuja el polígono + sus vértices arrastrables
  const drawPolygon = (L: any, map: LeafletMap, points: LatLng[]) => {
    if (polygonRef.current) { polygonRef.current.remove(); polygonRef.current = null; }
    if (vertexLayerRef.current) { vertexLayerRef.current.remove(); vertexLayerRef.current = null; }
    if (modeRef.current !== "POLYGON") return;

    const latlngs = points.map((p) => [p.lat, p.lng]) as [number, number][];
    polygonRef.current = L.polygon(latlngs, {
      color: "#0d40e8", fillColor: "#0d40e8", fillOpacity: 0.12, weight: 2,
    }).addTo(map);

    const layer = L.layerGroup().addTo(map);
    vertexLayerRef.current = layer;

    const dotIcon = L.divIcon({
      className: "",
      html: '<div style="width:14px;height:14px;border-radius:50%;background:#0d40e8;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    points.forEach((p, i) => {
      const vm = L.marker([p.lat, p.lng], { draggable: true, icon: dotIcon }).addTo(layer);
      vm.on("drag", () => {
        const ll = vm.getLatLng();
        const next = polygonStateRef.current.slice();
        next[i] = { lat: ll.lat, lng: ll.lng };
        if (polygonRef.current) polygonRef.current.setLatLngs(next.map((q) => [q.lat, q.lng]) as any);
      });
      vm.on("dragend", () => {
        const ll = vm.getLatLng();
        const next = polygonStateRef.current.slice();
        next[i] = { lat: Number(ll.lat.toFixed(6)), lng: Number(ll.lng.toFixed(6)) };
        onPolygonChangeRef.current(next);
      });
      // Click en un vértice lo elimina
      vm.on("click", (e: any) => {
        if (e?.originalEvent) L.DomEvent.stopPropagation(e.originalEvent);
        const next = polygonStateRef.current.filter((_, idx) => idx !== i);
        onPolygonChangeRef.current(next);
      });
    });
  };

  // Inicialización (una sola vez)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      LRef.current = L;
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, { center: [lat, lng], zoom: 13, scrollWheelZoom: true });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap", maxZoom: 19,
      }).addTo(map);

      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
      });

      const marker = L.marker([lat, lng], { draggable: true, icon }).addTo(map);
      markerRef.current = marker;

      const circle = L.circle([lat, lng], {
        radius: radiusKm * 1000, color: "#0d40e8", fillColor: "#0d40e8", fillOpacity: 0.12, weight: 2,
      }).addTo(map);
      circleRef.current = circle;

      marker.on("dragend", () => {
        const p = marker.getLatLng();
        onChangeRef.current(p.lat, p.lng);
      });

      map.on("click", (e: any) => {
        if (modeRef.current === "RADIUS") {
          onChangeRef.current(e.latlng.lat, e.latlng.lng);
        } else {
          const next = [...polygonStateRef.current, { lat: Number(e.latlng.lat.toFixed(6)), lng: Number(e.latlng.lng.toFixed(6)) }];
          onPolygonChangeRef.current(next);
        }
      });

      // Estado inicial
      circle.setStyle({ opacity: mode === "RADIUS" ? 1 : 0, fillOpacity: mode === "RADIUS" ? 0.12 : 0 });
      marker.setOpacity(mode === "RADIUS" ? 1 : 0);
      drawPolygon(L, map, polygonStateRef.current);

      // Recalcular tamaño varias veces y ante cambios de layout, para que los
      // clics caigan en las coordenadas correctas (bug clásico de Leaflet).
      const invalidate = () => map.invalidateSize();
      setTimeout(invalidate, 100);
      setTimeout(invalidate, 350);
      setTimeout(invalidate, 700);
      if (containerRef.current && "ResizeObserver" in window) {
        roRef.current = new ResizeObserver(() => map.invalidateSize());
        roRef.current.observe(containerRef.current);
      }
    })();

    return () => {
      cancelled = true;
      if (roRef.current) { roRef.current.disconnect(); roRef.current = null; }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        circleRef.current = null;
        polygonRef.current = null;
        vertexLayerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincronizar marcador + círculo
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      // En modo polígono ocultamos y desactivamos el marcador del local
      markerRef.current.setOpacity(mode === "RADIUS" ? 1 : 0);
      const drag = (markerRef.current as any).dragging;
      if (drag) { mode === "RADIUS" ? drag.enable() : drag.disable(); }
    }
    if (circleRef.current) {
      circleRef.current.setLatLng([lat, lng]);
      circleRef.current.setRadius(radiusKm * 1000);
      circleRef.current.setStyle({ opacity: mode === "RADIUS" ? 1 : 0, fillOpacity: mode === "RADIUS" ? 0.12 : 0 });
    }
  }, [lat, lng, radiusKm, mode]);

  // Redibujar polígono cuando cambian los puntos o el modo
  useEffect(() => {
    if (LRef.current && mapRef.current) {
      drawPolygon(LRef.current, mapRef.current, polygon);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [polygon, mode]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: 340, borderRadius: 16, overflow: "hidden", zIndex: 0 }}
    />
  );
}
