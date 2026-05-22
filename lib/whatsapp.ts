import type { CartItem, CheckoutFormData, AppSettings } from "@/types";

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
  total: number
): string {
  const deliveryType =
    formData.deliveryType === "DELIVERY" ? "🛵 Delivery" : "🏪 Retiro en sucursal";

  const paymentLabels: Record<string, string> = {
    MERCADO_PAGO: "💳 Mercado Pago",
    TRANSFERENCIA: "🏦 Transferencia bancaria",
    EFECTIVO: "💵 Efectivo",
  };

  const productLines = items
    .map((item) => {
      const flavorText =
        item.selectedFlavors.length > 0
          ? `\n   Sabores: ${item.selectedFlavors.map((f) => f.name).join(", ")}`
          : "";
      return `• ${item.quantity}x ${item.product.name} — ${formatPrice(
        item.product.price * item.quantity
      )}${flavorText}`;
    })
    .join("\n");

  let message = `🍦 *PEDIDO GRIDO SAN RAFAEL* #${orderNumber}
━━━━━━━━━━━━━━━━━━━━━
👤 *Cliente:* ${formData.customerName}
📞 *Teléfono:* ${formData.customerPhone}
📦 *Entrega:* ${deliveryType}`;

  if (formData.deliveryType === "DELIVERY" && formData.address) {
    message += `\n📍 *Dirección:* ${formData.address}`;
  }

  message += `

🛒 *PRODUCTOS:*
${productLines}
━━━━━━━━━━━━━━━━━━━━━
💰 Subtotal: ${formatPrice(subtotal)}`;

  if (formData.deliveryType === "DELIVERY") {
    message += `\n🛵 Envío: ${formatPrice(deliveryCost)}`;
  }

  message += `\n✅ *TOTAL: ${formatPrice(total)}*
━━━━━━━━━━━━━━━━━━━━━
💳 *Pago:* ${paymentLabels[formData.paymentMethod] || formData.paymentMethod}`;

  if (formData.notes) {
    message += `\n\n📝 *Notas:* ${formData.notes}`;
  }

  return message;
}

// Genera la URL de WhatsApp
export function generateWhatsAppUrl(
  phoneNumber: string,
  message: string
): string {
  const encodedMessage = encodeURIComponent(message);
  // Eliminar caracteres no numéricos del número
  const cleanPhone = phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
