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

  const [form, setForm] = useState<CheckoutFormData>({
    customerName: "",
    customerPhone: "",
    address: "",
    deliveryType: "DELIVERY",
    paymentMethod: "EFECTIVO",
    notes: "",
  });

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/");
      return;
    }
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.data ?? null));
  }, []);

  const subtotal = getSubtotal();
  const deliveryCost =
    form.deliveryType === "DELIVERY" ? (settings?.deliveryCost ?? 1500) : 0;
  const total = subtotal + deliveryCost;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.customerName.trim() || !form.customerPhone.trim()) {
      toast.error("Completá tu nombre y teléfono");
      return;
    }
    if (form.deliveryType === "DELIVERY" && !form.address?.trim()) {
      toast.error("Ingresá la dirección de entrega");
      return;
    }

    if (settings && settings.storeOpen === false) {
      toast.error("La tienda está cerrada en este momento");
      return;
    }

    setLoading(true);
    try {
      // 1. Crear pedido en la base de datos
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          address: form.deliveryType === "DELIVERY" ? form.address : undefined,
          deliveryType: form.deliveryType,
          paymentMethod: form.paymentMethod,
          notes: form.notes,
          subtotal,
          deliveryCost,
          total,
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

      // 2. Si es Mercado Pago → redirigir a la app de MP
      if (form.paymentMethod === "MERCADO_PAGO") {
        const mpRes = await fetch("/api/payments/mercadopago", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.id }),
        });
        const mpData = await mpRes.json();
        // mobileInitPoint abre la app de MP en mobile, initPoint como fallback web
        const mpUrl = mpData.mobileInitPoint || mpData.initPoint;
        if (mpUrl) {
          window.location.href = mpUrl;
          return;
        }
      }

      // 3. Generar mensaje de WhatsApp y redirigir
      const whatsappRes = await fetch("/api/orders/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const whatsappData = await whatsappRes.json();

      clearCart();

      // Redirigir a página de confirmación
      router.push(
        `/pedido-confirmado?order=${order.id}&wa=${encodeURIComponent(
          whatsappData.url || ""
        )}`
      );
    } catch (err) {
      console.error(err);
      toast.error("Error al procesar el pedido. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-white">
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
              <p className="text-red-600 text-sm mt-0.5">
                {settings.storeClosedMessage || "Estamos cerrados por el momento."}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 pb-40 pt-4 space-y-4">

        {/* Resumen del carrito */}
        <section className="bg-white rounded-2xl p-4 shadow-card">
          <h2 className="font-bold text-gray-800 mb-3">🛒 Tu pedido</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.cartId} className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {item.quantity}× {item.product.name}
                  </p>
                  {item.selectedFlavors.length > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.selectedFlavors.map((f) => f.name).join(", ")}
                    </p>
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Datos personales */}
        <section className="bg-white rounded-2xl p-4 shadow-card">
          <h2 className="font-bold text-gray-800 mb-4">👤 Tus datos</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1.5 block">
                Nombre completo *
              </label>
              <input
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                placeholder="Juan García"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1.5 block">
                Teléfono *
              </label>
              <input
                name="customerPhone"
                value={form.customerPhone}
                onChange={handleChange}
                placeholder="2604 000000"
                type="tel"
                className="input-field"
                required
              />
            </div>
          </div>
        </section>

        {/* Tipo de entrega */}
        <section className="bg-white rounded-2xl p-4 shadow-card">
          <h2 className="font-bold text-gray-800 mb-4">📦 Tipo de entrega</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "DELIVERY", label: "🛵 Delivery", sub: `+${formatPrice(settings?.deliveryCost ?? 1500)}` },
              { value: "RETIRO", label: "🏪 Retiro", sub: "Gratis" },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`cursor-pointer rounded-xl border-2 p-3 transition-all ${
                  form.deliveryType === opt.value
                    ? "border-grido-primary bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  value={opt.value}
                  checked={form.deliveryType === opt.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <p className="font-semibold text-sm text-gray-800">{opt.label}</p>
                <p
                  className={`text-xs mt-0.5 ${
                    form.deliveryType === opt.value
                      ? "text-grido-primary"
                      : "text-gray-500"
                  }`}
                >
                  {opt.sub}
                </p>
              </label>
            ))}
          </div>

          {form.deliveryType === "DELIVERY" && (
            <div className="mt-3">
              <label className="text-sm font-medium text-gray-600 mb-1.5 block">
                Dirección de entrega *
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Calle 123, Barrio Centro"
                className="input-field"
              />
            </div>
          )}
        </section>

        {/* Método de pago */}
        <section className="bg-white rounded-2xl p-4 shadow-card">
          <h2 className="font-bold text-gray-800 mb-4">💳 Método de pago</h2>
          <div className="space-y-2">
            {[
              {
                value: "MERCADO_PAGO",
                label: "💳 Mercado Pago",
                sub: "Tarjeta, débito o MP",
              },
              {
                value: "TRANSFERENCIA",
                label: "🏦 Transferencia",
                sub: settings?.transferAlias ? `Alias: ${settings.transferAlias}` : "Alias bancario",
              },
              { value: "EFECTIVO", label: "💵 Efectivo", sub: "Al momento de la entrega" },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-3 cursor-pointer rounded-xl border-2 p-3 transition-all ${
                  form.paymentMethod === opt.value
                    ? "border-grido-primary bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={opt.value}
                  checked={form.paymentMethod === opt.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-800">{opt.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{opt.sub}</p>
                </div>
                {form.paymentMethod === opt.value && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="#134385" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </label>
            ))}
          </div>
        </section>

        {/* Notas */}
        <section className="bg-white rounded-2xl p-4 shadow-card">
          <label className="font-bold text-gray-800 mb-2 block">
            📝 Notas adicionales <span className="font-normal text-gray-400 text-sm">(opcional)</span>
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

        {/* Espacio para el footer fijo */}
        <div className="h-4" />
      </form>

      {/* Footer fijo con total y botón */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pt-3 pb-safe shadow-modal z-30">
        <div className="max-w-lg mx-auto">
          {/* Resumen de precios */}
          <div className="space-y-1 mb-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            {form.deliveryType === "DELIVERY" && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Envío</span>
                <span className="font-medium">{formatPrice(deliveryCost)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-gray-900 pt-1 border-t border-gray-100">
              <span>TOTAL</span>
              <span className="text-grido-primary">{formatPrice(total)}</span>
            </div>
          </div>

          <button
            type="submit"
            form="checkout-form"
            onClick={handleSubmit}
            disabled={loading || (settings !== null && !settings?.storeOpen)}
            className="w-full btn-primary h-13 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Procesando...
              </>
            ) : (
              <>
                Confirmar pedido →
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
