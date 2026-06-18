"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { AppSettings } from "@/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    deliveryEnabled: true,
    deliveryMode: "MANUAL",
    deliveryManualOn: true,
    deliveryFrom: "10:00",
    deliveryTo: "23:00",
    deliveryCost: 1500,
    minOrderAmount: 5000,
    whatsappNumber: "5492604000000",
    transferAlias: "",
    transferCbu: "",
    transferHolder: "",
    storeOpen: true,
    storeClosedMessage: "Estamos cerrados. ¡Volvemos pronto!",
    storeLat: -34.617594,
    storeLng: -68.330336,
    deliveryRadiusKm: 5,
    deliveryZoneType: "RADIUS",
    deliveryZonePolygon: "",
    promoDelDiaActive: false,
    promoDelDiaName: "",
    promoDelDiaDetail: "",
    promoDelDiaPrice: 0,
    promoDelDiaImage: "",
    address: "",
    hours: "",
    instagramUrl: "",
    facebookUrl: "",
    mapsQuery: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingStore, setTogglingStore] = useState(false);

  // ─── Credenciales del admin ───────────────────────────────
  const [cred, setCred] = useState({ currentPassword: "", newUsername: "", newPassword: "", confirmPassword: "" });
  const [savingCred, setSavingCred] = useState(false);

  const handleCredChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCred((c) => ({ ...c, [name]: value }));
  };

  const handleSaveCred = async () => {
    if (!cred.currentPassword) { toast.error("Ingresá tu contraseña actual"); return; }
    if (!cred.newUsername && !cred.newPassword) { toast.error("Cambiá el usuario o la contraseña"); return; }
    if (cred.newPassword && cred.newPassword !== cred.confirmPassword) {
      toast.error("Las contraseñas nuevas no coinciden"); return;
    }
    setSavingCred(true);
    try {
      const res = await fetch("/api/admin/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: cred.currentPassword,
          newUsername: cred.newUsername || undefined,
          newPassword: cred.newPassword || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Error");
      toast.success("✅ Credenciales actualizadas. Usalas en el próximo ingreso.");
      setCred({ currentPassword: "", newUsername: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.message || "No se pudieron actualizar");
    } finally {
      setSavingCred(false);
    }
  };

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setSettings(d.data);
        setLoading(false);
      });
  }, []);

  // Auto-guarda solo el estado de tienda abierta/cerrada
  const toggleStore = async () => {
    if (togglingStore) return;
    const newValue = !settings.storeOpen;
    setSettings((s) => ({ ...s, storeOpen: newValue }));
    setTogglingStore(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // Solo enviamos storeOpen para evitar problemas con otros campos
        body: JSON.stringify({ storeOpen: newValue }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      toast.success(newValue ? "✅ Tienda abierta" : "🔴 Tienda cerrada");
    } catch (err) {
      console.error("toggleStore error:", err);
      setSettings((s) => ({ ...s, storeOpen: !newValue }));
      toast.error("No se pudo cambiar el estado");
    } finally {
      setTogglingStore(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      toast.success("Configuración guardada");
    } catch (err: any) {
      toast.error(err.message || "Error al guardar configuración");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Configuración</h1>
        <p className="text-gray-500 text-sm">Ajustes generales del negocio</p>
      </div>

      <div className="space-y-4">
        {/* Estado de la tienda — auto-guarda */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <h2 className="font-bold text-gray-900 mb-4">Estado de la tienda</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">
                {settings.storeOpen ? "🟢 Abierta — aceptando pedidos" : "🔴 Cerrada — sin pedidos"}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">Se guarda automáticamente al cambiar</p>
            </div>
            <button
              onClick={toggleStore}
              disabled={togglingStore}
              aria-label="Cambiar estado de la tienda"
              style={{
                position: "relative",
                flexShrink: 0,
                width: 52,
                height: 30,
                borderRadius: 999,
                border: "none",
                cursor: togglingStore ? "not-allowed" : "pointer",
                background: settings.storeOpen ? "#22c55e" : "#d1d5db",
                transition: "background 220ms cubic-bezier(0.25,1,0.5,1)",
                opacity: togglingStore ? 0.6 : 1,
                outline: "none",
                padding: 0,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: settings.storeOpen ? 25 : 3,
                  width: 24,
                  height: 24,
                  background: "white",
                  borderRadius: "50%",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.22)",
                  transition: "left 220ms cubic-bezier(0.25,1,0.5,1)",
                  display: "block",
                }}
              />
            </button>
          </div>

          {!settings.storeOpen && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="text-sm font-medium text-gray-600 mb-1.5 block">
                Mensaje cuando está cerrado
              </label>
              <input
                name="storeClosedMessage"
                value={settings.storeClosedMessage}
                onChange={handleChange}
                className="input-field"
                placeholder="Estamos cerrados. ¡Volvemos pronto!"
              />
            </div>
          )}
        </div>

        {/* Delivery */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <h2 className="font-bold text-gray-900 mb-1">Delivery</h2>
          <p className="text-sm text-gray-500 mb-4">
            Estado actual:{" "}
            <strong className={settings.deliveryEnabled ? "text-green-600" : "text-red-500"}>
              {settings.deliveryEnabled ? "Activo" : "Desactivado"}
            </strong>
          </p>

          {/* Selector de modo */}
          <div className="bg-gray-100 rounded-xl p-1 flex gap-1 mb-4">
            {([
              { v: "MANUAL", label: "Manual" },
              { v: "SCHEDULE", label: "Por horario" },
            ] as const).map((opt) => (
              <button
                key={opt.v}
                type="button"
                onClick={() => setSettings((s) => ({ ...s, deliveryMode: opt.v }))}
                className="flex-1 py-2 rounded-lg text-sm font-bold transition-all"
                style={{
                  background: settings.deliveryMode === opt.v ? "#fff" : "transparent",
                  color: settings.deliveryMode === opt.v ? "#0d40e8" : "#6b7280",
                  boxShadow: settings.deliveryMode === opt.v ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Modo MANUAL */}
          {settings.deliveryMode === "MANUAL" && (
            <div className="flex items-center justify-between py-1 mb-4">
              <p className="text-sm font-medium text-gray-700">
                {settings.deliveryManualOn ? "Delivery encendido" : "Delivery apagado (solo retiro)"}
              </p>
              <button
                type="button"
                onClick={() => setSettings((s) => ({ ...s, deliveryManualOn: !s.deliveryManualOn }))}
                aria-label="Encender/apagar delivery"
                style={{
                  position: "relative", flexShrink: 0, width: 52, height: 30,
                  borderRadius: 999, border: "none", cursor: "pointer", padding: 0,
                  background: settings.deliveryManualOn ? "#22c55e" : "#d1d5db",
                  transition: "background 220ms cubic-bezier(0.25,1,0.5,1)",
                }}
              >
                <span style={{
                  position: "absolute", top: 3, left: settings.deliveryManualOn ? 25 : 3,
                  width: 24, height: 24, background: "white", borderRadius: "50%",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.22)",
                  transition: "left 220ms cubic-bezier(0.25,1,0.5,1)", display: "block",
                }} />
              </button>
            </div>
          )}

          {/* Modo POR HORARIO */}
          {settings.deliveryMode === "SCHEDULE" && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">
                El delivery se activa y desactiva solo entre estos horarios (hora de Argentina).
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Desde</label>
                  <input name="deliveryFrom" type="time" value={settings.deliveryFrom} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">Hasta</label>
                  <input name="deliveryTo" type="time" value={settings.deliveryTo} onChange={handleChange} className="input-field" />
                </div>
              </div>
            </div>
          )}

          {/* Costo y mínimo */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Costo de envío (ARS)</label>
              <input name="deliveryCost" type="number" value={settings.deliveryCost} onChange={handleChange} className="input-field" placeholder="1500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Pedido mínimo (ARS)</label>
              <input name="minOrderAmount" type="number" value={settings.minOrderAmount} onChange={handleChange} className="input-field" placeholder="5000" />
            </div>
          </div>
        </div>

        {/* Contacto / Sucursal */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <h2 className="font-bold text-gray-900 mb-1">Contacto y ubicación</h2>
          <p className="text-sm text-gray-500 mb-4">Se muestra en la página de Contacto y en el inicio</p>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Dirección</label>
              <input name="address" value={settings.address} onChange={handleChange} className="input-field" placeholder="Salto de las Rosas, San Rafael, Mendoza" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Horarios (una línea por rango)</label>
              <textarea name="hours" value={settings.hours} onChange={handleChange} rows={3} className="input-field resize-none" placeholder={"Lunes a jueves: 12:00 a 22:00\nViernes a domingos: 12:00 a 23:00"} />
              <p className="text-xs text-gray-400 mt-1">Formato sugerido: <strong>Días: horario</strong> (ej. "Lunes a jueves: 12:00 a 22:00")</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Búsqueda en Google Maps</label>
              <input name="mapsQuery" value={settings.mapsQuery} onChange={handleChange} className="input-field" placeholder="Grido Salto de las Rosas San Rafael Mendoza" />
              <p className="text-xs text-gray-400 mt-1">El nombre/dirección que se busca en el mapa (sin link, solo texto)</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Instagram (URL)</label>
              <input name="instagramUrl" value={settings.instagramUrl} onChange={handleChange} className="input-field" placeholder="https://www.instagram.com/grido.salto" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Facebook (URL)</label>
              <input name="facebookUrl" value={settings.facebookUrl} onChange={handleChange} className="input-field" placeholder="https://www.facebook.com/..." />
            </div>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <h2 className="font-bold text-gray-900 mb-4">WhatsApp</h2>
          <label className="text-sm font-medium text-gray-600 mb-1 block">Número (con código de país, sin +)</label>
          <input name="whatsappNumber" value={settings.whatsappNumber} onChange={handleChange} className="input-field" placeholder="5492604000000" />
          <p className="text-xs text-gray-400 mt-1">Ejemplo: 5492604123456 (54=Argentina, 260=San Rafael)</p>
        </div>

        {/* Transferencia */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <h2 className="font-bold text-gray-900 mb-4">Transferencia bancaria</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Titular de la cuenta</label>
              <input name="transferHolder" value={settings.transferHolder} onChange={handleChange} className="input-field" placeholder="Juan Pérez" />
              <p className="text-xs text-gray-400 mt-1">El nombre que verá el cliente para saber a quién transferir</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Alias</label>
              <input name="transferAlias" value={settings.transferAlias} onChange={handleChange} className="input-field" placeholder="grido.sanrafael.mp" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">CBU (opcional)</label>
              <input name="transferCbu" value={settings.transferCbu} onChange={handleChange} className="input-field" placeholder="0000000000000000000000" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button onClick={handleSave} disabled={saving} className="w-full btn-primary h-12 text-base">
          {saving ? "Guardando..." : "Guardar configuración"}
        </button>
      </div>

      {/* Credenciales del admin — guardado aparte */}
      <div className="bg-white rounded-2xl p-5 shadow-card mt-4">
        <h2 className="font-bold text-gray-900 mb-1">Usuario y contraseña</h2>
        <p className="text-sm text-gray-500 mb-4">Cambiá el acceso al panel de esta sucursal</p>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Contraseña actual *</label>
            <input name="currentPassword" type="password" value={cred.currentPassword} onChange={handleCredChange} className="input-field" placeholder="••••••••" autoComplete="current-password" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Nuevo usuario <span className="font-normal text-gray-400">(opcional)</span></label>
            <input name="newUsername" value={cred.newUsername} onChange={handleCredChange} className="input-field" placeholder="Dejar vacío para no cambiar" autoComplete="off" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Nueva contraseña</label>
              <input name="newPassword" type="password" value={cred.newPassword} onChange={handleCredChange} className="input-field" placeholder="Mín. 6 caracteres" autoComplete="new-password" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Repetir contraseña</label>
              <input name="confirmPassword" type="password" value={cred.confirmPassword} onChange={handleCredChange} className="input-field" placeholder="Repetir" autoComplete="new-password" />
            </div>
          </div>
        </div>
        <button onClick={handleSaveCred} disabled={savingCred} className="w-full btn-primary h-11 text-sm mt-4">
          {savingCred ? "Guardando..." : "Actualizar credenciales"}
        </button>
      </div>
    </div>
  );
}
