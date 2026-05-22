"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { AppSettings } from "@/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    deliveryCost: 1500,
    minOrderAmount: 5000,
    whatsappNumber: "5492604000000",
    transferAlias: "",
    transferCbu: "",
    storeOpen: true,
    storeClosedMessage: "Estamos cerrados. ¡Volvemos pronto!",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setSettings(d.data);
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      toast.success("Configuración guardada");
    } catch {
      toast.error("Error al guardar configuración");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Configuración</h1>
        <p className="text-gray-500 text-sm">Ajustes generales del negocio</p>
      </div>

      <div className="space-y-4">
        {/* Estado de la tienda */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <h2 className="font-bold text-gray-900 mb-4">🏪 Estado de la tienda</h2>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-800">Tienda abierta</p>
              <p className="text-sm text-gray-500">Los clientes pueden hacer pedidos</p>
            </div>
            <button
              onClick={() => setSettings((s) => ({ ...s, storeOpen: !s.storeOpen }))}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                settings.storeOpen ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  settings.storeOpen ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </label>
          {!settings.storeOpen && (
            <div className="mt-3">
              <label className="text-sm font-medium text-gray-600 mb-1 block">
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
          <h2 className="font-bold text-gray-900 mb-4">🛵 Delivery</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Costo de envío (ARS)
              </label>
              <input
                name="deliveryCost"
                type="number"
                value={settings.deliveryCost}
                onChange={handleChange}
                className="input-field"
                placeholder="1500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Pedido mínimo (ARS)
              </label>
              <input
                name="minOrderAmount"
                type="number"
                value={settings.minOrderAmount}
                onChange={handleChange}
                className="input-field"
                placeholder="5000"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <h2 className="font-bold text-gray-900 mb-4">📱 WhatsApp</h2>
          <label className="text-sm font-medium text-gray-600 mb-1 block">
            Número de WhatsApp (con código de país, sin +)
          </label>
          <input
            name="whatsappNumber"
            value={settings.whatsappNumber}
            onChange={handleChange}
            className="input-field"
            placeholder="5492604000000"
          />
          <p className="text-xs text-gray-400 mt-1">
            Ejemplo: 5492604123456 (54 = Argentina, 260 = San Rafael, luego el número)
          </p>
        </div>

        {/* Transferencia */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <h2 className="font-bold text-gray-900 mb-4">🏦 Transferencia bancaria</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Alias</label>
              <input
                name="transferAlias"
                value={settings.transferAlias}
                onChange={handleChange}
                className="input-field"
                placeholder="grido.sanrafael.mp"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">CBU (opcional)</label>
              <input
                name="transferCbu"
                value={settings.transferCbu}
                onChange={handleChange}
                className="input-field"
                placeholder="0000000000000000000000"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full btn-primary h-12 text-base"
        >
          {saving ? "Guardando..." : "💾 Guardar configuración"}
        </button>
      </div>
    </div>
  );
}
