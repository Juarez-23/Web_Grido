"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import type { AppSettings } from "@/types";
import type { LatLng } from "@/components/admin/DeliveryZoneMap";

// Leaflet no puede renderizar en el servidor
const DeliveryZoneMap = dynamic(
  () => import("@/components/admin/DeliveryZoneMap").then((m) => m.DeliveryZoneMap),
  { ssr: false, loading: () => <div className="skeleton rounded-2xl" style={{ height: 340 }} /> }
);

const RADIUS_PRESETS = [3, 5, 8, 10, 15];

// Default: Grido Av. El Libertador 962, San Rafael, Mendoza
const DEFAULT_LAT = -34.617594;
const DEFAULT_LNG = -68.330336;

type ZoneType = "RADIUS" | "POLYGON";

export default function DeliveryZonePage() {
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lng, setLng] = useState(DEFAULT_LNG);
  const [radiusKm, setRadiusKm] = useState(5);
  const [zoneType, setZoneType] = useState<ZoneType>("RADIUS");
  const [polygon, setPolygon] = useState<LatLng[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d: { data?: AppSettings }) => {
        if (d.data) {
          setLat(d.data.storeLat ?? DEFAULT_LAT);
          setLng(d.data.storeLng ?? DEFAULT_LNG);
          setRadiusKm(d.data.deliveryRadiusKm ?? 5);
          setZoneType(d.data.deliveryZoneType === "POLYGON" ? "POLYGON" : "RADIUS");
          try {
            const pts = JSON.parse(d.data.deliveryZonePolygon || "[]");
            if (Array.isArray(pts)) setPolygon(pts);
          } catch { /* ignore */ }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleMapChange = (newLat: number, newLng: number) => {
    setLat(Number(newLat.toFixed(6)));
    setLng(Number(newLng.toFixed(6)));
  };

  const handleSave = async () => {
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      toast.error("Coordenadas inválidas");
      return;
    }
    if (zoneType === "RADIUS" && radiusKm <= 0) {
      toast.error("El radio debe ser mayor a 0");
      return;
    }
    if (zoneType === "POLYGON" && polygon.length < 3) {
      toast.error("El polígono necesita al menos 3 puntos");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeLat: lat,
          storeLng: lng,
          deliveryRadiusKm: radiusKm,
          deliveryZoneType: zoneType,
          deliveryZonePolygon: JSON.stringify(polygon),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Zona de delivery guardada");
    } catch {
      toast.error("No se pudo guardar la zona");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Zona de Delivery</h1>
        <p className="text-gray-500 text-sm">
          Definí hasta dónde llega el delivery. Los clientes fuera de la zona no podrán pedir delivery.
        </p>
      </div>

      <div className="space-y-4">
        {/* Selector de tipo de zona */}
        <div className="bg-white rounded-2xl p-2 shadow-card flex gap-2">
          {([
            { v: "RADIUS", label: "Radio circular", icon: "⭕" },
            { v: "POLYGON", label: "Zona personalizada", icon: "✏️" },
          ] as const).map((opt) => (
            <button
              key={opt.v}
              onClick={() => setZoneType(opt.v)}
              className="flex-1 py-3 rounded-xl text-sm font-bold transition-all"
              style={{
                background: zoneType === opt.v ? "#0d40e8" : "transparent",
                color: zoneType === opt.v ? "white" : "#6b7280",
              }}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>

        {/* Mapa */}
        <div className="bg-white rounded-2xl p-4 shadow-card">
          <h2 className="font-bold text-gray-900 mb-1">
            {zoneType === "RADIUS" ? "Ubicación del local" : "Dibujá la zona de reparto"}
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            {zoneType === "RADIUS"
              ? "Arrastrá el marcador o tocá el mapa para ajustar la posición exacta."
              : "Tocá el mapa para agregar puntos. Arrastrá un punto para moverlo, o tocalo para borrarlo."}
          </p>
          <DeliveryZoneMap
            mode={zoneType}
            lat={lat}
            lng={lng}
            radiusKm={radiusKm}
            onChange={handleMapChange}
            polygon={polygon}
            onPolygonChange={setPolygon}
          />

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Latitud (local)</label>
              <input type="number" step="0.000001" value={lat} onChange={(e) => setLat(parseFloat(e.target.value))} className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Longitud (local)</label>
              <input type="number" step="0.000001" value={lng} onChange={(e) => setLng(parseFloat(e.target.value))} className="input-field" />
            </div>
          </div>
        </div>

        {/* Radio (solo modo RADIUS) */}
        {zoneType === "RADIUS" && (
          <div className="bg-white rounded-2xl p-5 shadow-card">
            <h2 className="font-bold text-gray-900 mb-1">Radio de entrega</h2>
            <p className="text-sm text-gray-500 mb-4">Distancia máxima en línea recta desde el local.</p>

            <div className="flex items-center gap-3 mb-4">
              <input type="number" min={0.5} step={0.5} value={radiusKm} onChange={(e) => setRadiusKm(parseFloat(e.target.value) || 0)} className="input-field w-28" />
              <span className="font-bold text-gray-700">km</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {RADIUS_PRESETS.map((km) => (
                <button key={km} onClick={() => setRadiusKm(km)} className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: radiusKm === km ? "#0d40e8" : "#f3f4f6", color: radiusKm === km ? "white" : "#374151" }}>
                  {km} km
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Polígono (solo modo POLYGON) */}
        {zoneType === "POLYGON" && (
          <div className="bg-white rounded-2xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-bold text-gray-900">Zona personalizada</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {polygon.length} punto{polygon.length !== 1 ? "s" : ""}
                  {polygon.length < 3 && " — necesitás al menos 3"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPolygon((p) => p.slice(0, -1))}
                disabled={polygon.length === 0}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 disabled:opacity-40"
              >
                ↩ Deshacer último
              </button>
              <button
                onClick={() => setPolygon([])}
                disabled={polygon.length === 0}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-red-50 text-red-600 disabled:opacity-40"
              >
                🗑 Limpiar todo
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <button onClick={handleSave} disabled={saving} className="w-full btn-primary h-12 text-base">
          {saving ? "Guardando..." : "Guardar zona de delivery"}
        </button>
      </div>
    </div>
  );
}
