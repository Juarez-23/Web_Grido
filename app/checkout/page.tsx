"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/whatsapp";
import toast from "react-hot-toast";
import type { CheckoutFormData, AppSettings } from "@/types";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationUrl, setLocationUrl] = useState<string | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const [form, setForm] = useState<CheckoutFormData>({
    customerName: "",
    customerPhone: "",
    address: "",
    deliveryType: "DELIVERY",
    paymentMethod: "TRANSFERENCIA",
    notes: "",
  });

  useEffect(() => {
    if (items.length === 0) { router.replace("/"); return; }
    fetch("/api/settings").then((r) => r.json()).then((d) => setSettings(d.data ?? null));
  }, []);

  const subtotal = getSubtotal();
  const deliveryCost = form.deliveryType === "DELIVERY" ? (settings?.deliveryCost ?? 1500) : 0;
  const total = subtotal + deliveryCost;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // Con Delivery no se permite Efectivo: forzar Transferencia
      if (name === "deliveryType" && value === "DELIVERY" && prev.paymentMethod === "EFECTIVO") {
        next.paymentMethod = "TRANSFERENCIA";
      }
      return next;
    });
  };

  // Geolocalización: tomar ubicación actual del dispositivo
  const handleGetLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Tu navegador no soporta geolocalización");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setLocationUrl(url);
        setGettingLocation(false);
        toast.success("📍 Ubicación obtenida");
      },
      (err) => {
        console.error("Geolocation error:", err);
        setGettingLocation(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Activá los permisos de ubicación para usar esta opción");
        } else {
          toast.error("No se pudo obtener tu ubicación. Intentá de nuevo.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.customerPhone.trim()) {
      toast.error("Completá tu nombre y teléfono"); return;
    }
    if (form.deliveryType === "DELIVERY" && !form.address?.trim()) {
      toast.error("Ingresá la dirección de entrega"); return;
    }
    if (settings && settings.storeOpen === false) {
      toast.error("La tienda está cerrada en este momento"); return;
    }

    setLoading(true);
    try {
      // Combinar dirección escrita + link de ubicación GPS (si lo compartió)
      const fullAddress =
        form.deliveryType === "DELIVERY"
          ? `${form.address}${locationUrl ? ` | Ubicación GPS: ${locationUrl}` : ""}`
          : undefined;

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          address: fullAddress,
          deliveryType: form.deliveryType,
          paymentMethod: form.paymentMethod,
          notes: form.notes,
          subtotal, deliveryCost, total,
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.product.price,
            subtotal: item.product.price * item.quantity,
            flavors: item.selectedFlavors.map((f) => f.id),
          })),
        }),
      });

      if (!orderRes.ok) throw new Error("Error al crear el pedido");
      const orderData = await orderRes.json();
      const order = orderData.data;

      // Generar mensaje de WhatsApp
      const whatsappRes = await fetch("/api/orders/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const whatsappData = await whatsappRes.json();
      clearCart();
      router.push(`/pedido-confirmado?order=${order.id}&wa=${encodeURIComponent(whatsappData.url || "")}&method=${form.paymentMethod}`);
    } catch (err) {
      console.error(err);
      toast.error("Error al procesar el pedido. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  const allPaymentMethods = [
    {
      value: "TRANSFERENCIA",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
      ),
      label: "Transferencia",
      sub: "Transferencia bancaria / alias",
      color: "#6366f1",
      bgColor: "#f5f3ff",
      borderColor: "#6366f1",
    },
    {
      value: "EFECTIVO",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="2"/>
          <circle cx="12" cy="12" r="3"/>
          <path d="M6 12h.01M18 12h.01"/>
        </svg>
      ),
      label: "Efectivo",
      sub: "Pagás al retirar en la sucursal",
      color: "#16a34a",
      bgColor: "#f0fdf4",
      borderColor: "#16a34a",
    },
  ];

  // Con Delivery solo se permite Transferencia; con Retiro, ambos
  const paymentMethods =
    form.deliveryType === "DELIVERY"
      ? allPaymentMethods.filter((m) => m.value !== "EFECTIVO")
      : allPaymentMethods;

  return (
    <div className="min-h-dvh bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 h-14 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 active:scale-90 transition-transform"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="font-bold text-gray-900 text-base">Confirmar pedido</h1>
      </header>

      {settings && !settings.storeOpen && (
        <div className="max-w-lg mx-auto px-4 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 items-start">
            <span className="text-xl">🔴</span>
            <div>
              <p className="font-bold text-red-800 text-sm">Tienda cerrada</p>
              <p className="text-red-600 text-sm mt-0.5">{settings.storeClosedMessage || "Estamos cerrados por el momento."}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 pb-44 pt-4 space-y-4">

        {/* Resumen del carrito */}
        <section className="bg-white rounded-2xl p-4 shadow-card">
          <h2 className="font-bold mb-3 text-sm uppercase tracking-wide text-gray-500">Tu pedido</h2>
          <div className="space-y-2.5">
            {items.map((item) => (
              <div key={item.cartId} className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">
                    <span className="text-gray-400 font-normal">{item.quantity}×</span> {item.product.name}
                  </p>
                  {item.selectedFlavors.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.selectedFlavors.map((f) => f.name).join(", ")}
                    </p>
                  )}
                </div>
                <span className="text-sm font-bold text-gray-800 whitespace-nowrap">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Datos personales */}
        <section className="bg-white rounded-2xl p-4 shadow-card">
          <h2 className="font-bold mb-4 text-sm uppercase tracking-wide text-gray-500">Tus datos</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1.5 block">Nombre completo *</label>
              <input name="customerName" value={form.customerName} onChange={handleChange} placeholder="Juan García" className="input-field" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1.5 block">Teléfono *</label>
              <input name="customerPhone" value={form.customerPhone} onChange={handleChange} placeholder="2604 000000" type="tel" className="input-field" required />
            </div>
          </div>
        </section>

        {/* Tipo de entrega */}
        <section className="bg-white rounded-2xl p-4 shadow-card">
          <h2 className="font-bold mb-4 text-sm uppercase tracking-wide text-gray-500">Tipo de entrega</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "DELIVERY", label: "Delivery", icon: "🛵", sub: `+${formatPrice(settings?.deliveryCost ?? 1500)}` },
              { value: "RETIRO", label: "Retiro", icon: "🏪", sub: "Sin costo" },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`cursor-pointer rounded-xl border-2 p-3.5 transition-all ${
                  form.deliveryType === opt.value ? "border-grido-primary bg-blue-50" : "border-gray-200 bg-white"
                }`}
              >
                <input type="radio" name="deliveryType" value={opt.value} checked={form.deliveryType === opt.value} onChange={handleChange} className="sr-only" />
                <p className="text-xl mb-1">{opt.icon}</p>
                <p className="font-bold text-sm text-gray-800">{opt.label}</p>
                <p className={`text-xs mt-0.5 font-medium ${form.deliveryType === opt.value ? "text-grido-primary" : "text-gray-400"}`}>{opt.sub}</p>
              </label>
            ))}
          </div>
          {form.deliveryType === "DELIVERY" && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1.5 block">Dirección de entrega *</label>
                <input name="address" value={form.address} onChange={handleChange} placeholder="Calle 123, Barrio Centro" className="input-field" />
              </div>

              {/* Ubicación GPS */}
              {locationUrl ? (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
                  <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-green-800">Ubicación compartida</p>
                    <a href={locationUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 underline">
                      Ver en Google Maps
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocationUrl(null)}
                    className="text-gray-400 hover:text-red-500 p-1"
                    aria-label="Quitar ubicación"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={gettingLocation}
                  className="w-full flex items-center justify-center gap-2 border-2 border-grido-primary text-grido-primary font-semibold rounded-xl py-3 text-sm active:scale-95 transition-transform disabled:opacity-60"
                >
                  {gettingLocation ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Obteniendo ubicación...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                      </svg>
                      Usar mi ubicación actual
                    </>
                  )}
                </button>
              )}
              <p className="text-[11px] text-gray-400 text-center">
                Compartí tu ubicación para que el repartidor te encuentre más rápido 🛵
              </p>
            </div>
          )}
        </section>

        {/* Método de pago */}
        <section className="bg-white rounded-2xl p-4 shadow-card">
          <h2 className="font-bold mb-4 text-sm uppercase tracking-wide text-gray-500">Método de pago</h2>
          <div className="space-y-2.5">
            {paymentMethods.map((opt) => {
              const isSelected = form.paymentMethod === opt.value;
              return (
                <label key={opt.value} className="block cursor-pointer">
                  <input type="radio" name="paymentMethod" value={opt.value} checked={isSelected} onChange={handleChange} className="sr-only" />
                  <div
                    className="rounded-xl border-2 p-3.5 transition-all"
                    style={{
                      borderColor: isSelected ? opt.borderColor : "#e5e7eb",
                      backgroundColor: isSelected ? opt.bgColor : "white",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: opt.color }}>
                        {opt.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-800">{opt.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{opt.sub}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${isSelected ? "border-transparent" : "border-gray-300"}`}
                        style={{ backgroundColor: isSelected ? opt.color : "transparent" }}>
                        {isSelected && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Transferencia: alias/CBU */}
                    {isSelected && opt.value === "TRANSFERENCIA" && (
                      <div className="mt-3 pt-3 border-t text-xs font-medium" style={{ borderColor: `${opt.color}30`, color: opt.color }}>
                        {settings?.transferAlias ? (
                          <>
                            🏦 Alias: <strong>{settings.transferAlias}</strong>
                            {settings.transferCbu && <><br />CBU: <strong>{settings.transferCbu}</strong></>}
                            <br />Enviá el comprobante por WhatsApp.
                          </>
                        ) : (
                          "Te pasamos los datos para transferir por WhatsApp."
                        )}
                      </div>
                    )}

                  </div>
                </label>
              );
            })}
          </div>
        </section>

        {/* Notas */}
        <section className="bg-white rounded-2xl p-4 shadow-card">
          <label className="text-sm uppercase tracking-wide text-gray-500 font-bold mb-2 block">
            Notas <span className="font-normal text-gray-400">(opcional)</span>
          </label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Aclaraciones sobre el pedido o la entrega..."
            rows={3}
            className="input-field resize-none"
          />
        </section>
      </form>

      {/* Footer fijo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pt-3 shadow-modal z-30" style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 16px)" }}>
        <div className="max-w-lg mx-auto">
          <div className="space-y-1 mb-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span className="font-medium text-gray-700">{formatPrice(subtotal)}</span>
            </div>
            {form.deliveryType === "DELIVERY" && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>Envío</span>
                <span className="font-medium text-gray-700">{formatPrice(deliveryCost)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-gray-900 pt-1.5 border-t border-gray-100">
              <span>TOTAL</span>
              <span className="text-grido-primary">{formatPrice(total)}</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || (settings !== null && !settings?.storeOpen)}
            className="w-full btn-primary h-14 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Procesando...
              </>
            ) : "Confirmar y enviar por WhatsApp →"}
          </button>
        </div>
      </div>
    </div>
  );
}
