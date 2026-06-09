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

interface WhatsAppOptions {
  transferAlias?: string;
  transferCbu?: string;
}

// Genera el mensaje de WhatsApp con el pedido completo
export function generateWhatsAppMessage(
  orderNumber: number,
  formData: CheckoutFormData,
  items: CartItem[],
  subtotal: number,
  deliveryCost: number,
  total: number,
  options: WhatsAppOptions = {}
): string {
  const { transferAlias, transferCbu } = options;

  const deliveryLabel =
    formData.deliveryType === "DELIVERY" ? "Delivery" : "Retiro en sucursal";

  const paymentLabels: Record<string, string> = {
    TRANSFERENCIA: "Transferencia bancaria",
    EFECTIVO: "Efectivo",
    MERCADO_PAGO: "Mercado Pago",
  };

  // Detalle de productos con precio unitario y subtotal
  const productLines = items
    .map((item) => {
      const lineTotal = item.product.price * item.quantity;
      const unit = formatPrice(item.product.price);
      const flavors =
        item.selectedFlavors.length > 0
          ? `\n   _Sabores: ${item.selectedFlavors.map((f) => f.name).join(", ")}_`
          : "";
      return `• *${item.quantity}x* ${item.product.name}\n   ${item.quantity} × ${unit} = *${formatPrice(lineTotal)}*${flavors}`;
    })
    .join("\n");

  const line = "------------------------";

  // ── Encabezado ──
  let msg = `*GRIDO EL LIBERTADOR*\n`;
  msg += `*Pedido N° ${orderNumber}*\n`;
  msg += `${line}\n\n`;

  // ── Cliente ──
  msg += `*Cliente:* ${formData.customerName}\n`;
  msg += `*Tel:* ${formData.customerPhone}\n`;
  msg += `*Entrega:* ${deliveryLabel}\n`;
  if (formData.deliveryType === "DELIVERY" && formData.address) {
    msg += `*Dirección:* ${formData.address}\n`;
  }

  // ── Productos ──
  msg += `\n*DETALLE DEL PEDIDO*\n`;
  msg += `${line}\n`;
  msg += `${productLines}\n`;
  msg += `${line}\n`;

  // ── Totales ──
  msg += `\n*RESUMEN*\n`;
  msg += `Subtotal: ${formatPrice(subtotal)}\n`;
  if (formData.deliveryType === "DELIVERY") {
    msg += `Envío: ${formatPrice(deliveryCost)}\n`;
  }
  msg += `*TOTAL A PAGAR: ${formatPrice(total)}*\n`;

  // ── Pago ──
  msg += `\n*Forma de pago:* ${paymentLabels[formData.paymentMethod] || formData.paymentMethod}\n`;

  if (formData.paymentMethod === "TRANSFERENCIA") {
    if (transferAlias || transferCbu) {
      msg += `\n*Datos para transferir:*\n`;
      if (transferAlias) msg += `Alias: *${transferAlias}*\n`;
      if (transferCbu) msg += `CBU: *${transferCbu}*\n`;
    }
    msg += `_Recordá enviar el comprobante por este chat._\n`;
  }

  // ── Notas ──
  if (formData.notes?.trim()) {
    msg += `\n*Notas:* ${formData.notes}\n`;
  }

  msg += `\n${line}\n`;
  msg += `_¡Gracias por tu compra!_`;

  return msg;
}

// Genera la URL de WhatsApp
export function generateWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanPhone = phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
