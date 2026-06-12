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
  transferHolder?: string;
  branchName?: string;
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
  const { transferAlias, transferCbu, transferHolder, branchName } = options;

  const deliveryLabel =
    formData.deliveryType === "DELIVERY" ? "Delivery" : "Retiro en sucursal";

  const paymentLabels: Record<string, string> = {
    TRANSFERENCIA: "Transferencia bancaria",
    EFECTIVO: "Efectivo",
    MERCADO_PAGO: "Mercado Pago",
  };

  // Fecha y hora del momento (zona horaria Argentina)
  const now = new Date();
  const fecha = now.toLocaleDateString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const hora = now.toLocaleTimeString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Detalle de productos con precio unitario y subtotal
  const productLines = items
    .map((item) => {
      const lineTotal = item.product.price * item.quantity;
      const unit = formatPrice(item.product.price);
      const flavors =
        item.selectedFlavors.length > 0
          ? `\n   _${item.selectedFlavors.map((f) => f.name).join(", ")}_`
          : "";
      return `• ${item.quantity}x ${item.product.name} — *${formatPrice(lineTotal)}*\n   _${item.quantity} × ${unit}_${flavors}`;
    })
    .join("\n");

  // ── Encabezado ──
  const headerName = (branchName || "Grido San Rafael").toUpperCase();
  let msg = `*${headerName}*\n`;
  msg += `Pedido N° ${orderNumber}\n`;
  msg += `${fecha} · ${hora} hs\n`;
  msg += `\n`;

  // ── Cliente ──
  msg += `*Datos del cliente*\n`;
  msg += `Nombre: ${formData.customerName}\n`;
  msg += `Teléfono: ${formData.customerPhone}\n`;
  msg += `Entrega: ${deliveryLabel}\n`;
  if (formData.deliveryType === "DELIVERY" && formData.address) {
    msg += `Dirección: ${formData.address}\n`;
  }

  // ── Productos ──
  msg += `\n*Pedido*\n`;
  msg += `${productLines}\n`;

  // ── Totales ──
  msg += `\nSubtotal: ${formatPrice(subtotal)}\n`;
  if (formData.deliveryType === "DELIVERY") {
    msg += `Envío: ${formatPrice(deliveryCost)}\n`;
  }
  msg += `*TOTAL: ${formatPrice(total)}*\n`;

  // ── Pago ──
  msg += `\n*Forma de pago:* ${paymentLabels[formData.paymentMethod] || formData.paymentMethod}\n`;

  if (formData.paymentMethod === "TRANSFERENCIA") {
    if (transferAlias) msg += `Alias: *${transferAlias}*\n`;
    if (transferCbu) msg += `CBU: *${transferCbu}*\n`;
    if (transferHolder) msg += `Titular: *${transferHolder}*\n`;
    msg += `⚠️ *Recordá enviar el comprobante por este chat.*\n`;
  }

  // ── Notas ──
  if (formData.notes?.trim()) {
    msg += `\n*Notas:* ${formData.notes}\n`;
  }

  msg += `\n_¡Gracias por tu compra!_`;

  return msg;
}

// Genera la URL de WhatsApp
export function generateWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanPhone = phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
