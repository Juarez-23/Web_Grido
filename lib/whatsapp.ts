import type { CartItem, CheckoutFormData } from "@/types";

// Formatea precio en pesos argentinos
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Genera el mensaje de WhatsApp con el pedido completo
export function generateWhatsAppMessage(
  orderNumber: number,
  formData: CheckoutFormData,
  items: CartItem[],
  subtotal: number,
  deliveryCost: number,
  total: number,
  transferAlias?: string,
  transferCbu?: string
): string {
  const deliveryLabel =
    formData.deliveryType === "DELIVERY" ? "🛵 Delivery" : "🏪 Retiro en sucursal";

  const paymentLabels: Record<string, string> = {
    MERCADO_PAGO: "💳 Mercado Pago",
    TRANSFERENCIA: "🏦 Transferencia bancaria",
    EFECTIVO: "💵 Efectivo",
  };

  // Líneas de productos
  const productLines = items
    .map((item) => {
      const flavors =
        item.selectedFlavors.length > 0
          ? `\n     📌 ${item.selectedFlavors.map((f) => f.name).join(", ")}`
          : "";
      return `▸ *${item.quantity}x ${item.product.name}* — ${formatPrice(item.product.price * item.quantity)}${flavors}`;
    })
    .join("\n");

  // Encabezado
  let msg = `🍦 *GRIDO SAN RAFAEL — Pedido #${orderNumber}*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Datos del cliente
  msg += `👤 *${formData.customerName}*\n`;
  msg += `📞 ${formData.customerPhone}\n`;
  msg += `📦 ${deliveryLabel}\n`;
  if (formData.deliveryType === "DELIVERY" && formData.address) {
    msg += `📍 ${formData.address}\n`;
  }

  // Detalle del pedido
  msg += `\n🛒 *PRODUCTOS*\n`;
  msg += `─────────────────────\n`;
  msg += `${productLines}\n`;
  msg += `─────────────────────\n`;

  // Totales
  if (formData.deliveryType === "DELIVERY" && deliveryCost > 0) {
    msg += `🛵 Envío: ${formatPrice(deliveryCost)}\n`;
  }
  msg += `💰 *TOTAL: ${formatPrice(total)}*\n\n`;

  // Método de pago
  msg += `💳 *Pago:* ${paymentLabels[formData.paymentMethod] || formData.paymentMethod}\n`;

  if (formData.paymentMethod === "TRANSFERENCIA") {
    msg += `\n🏦 *Datos para transferir:*\n`;
    if (transferAlias) msg += `  • Alias: *${transferAlias}*\n`;
    if (transferCbu) msg += `  • CBU: *${transferCbu}*\n`;
    msg += `  ⚠️ Enviá el comprobante por este chat\n`;
  }

  if (formData.paymentMethod === "MERCADO_PAGO") {
    msg += `✅ _El pago fue realizado a través de Mercado Pago_\n`;
  }

  if (formData.paymentMethod === "EFECTIVO") {
    msg += `💵 _Pago al momento de la entrega_\n`;
  }

  // Notas
  if (formData.notes?.trim()) {
    msg += `\n📝 *Notas:* ${formData.notes}\n`;
  }

  msg += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `_Pedido realizado desde web-grido.vercel.app_`;

  return msg;
}

// Genera la URL de WhatsApp
export function generateWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanPhone = phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
