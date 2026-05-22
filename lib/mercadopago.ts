import MercadoPagoConfig, { Preference } from "mercadopago";

// Inicializar cliente de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

export const preferenceClient = new Preference(client);

// Crear preferencia de pago
export async function createMercadoPagoPreference(
  orderNumber: number,
  orderId: string,
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number;
  }>,
  deliveryCost: number,
  customerEmail?: string
) {
  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const preference = await preferenceClient.create({
    body: {
      external_reference: orderId,
      items: [
        ...items,
        ...(deliveryCost > 0
          ? [
              {
                title: "Costo de envío",
                quantity: 1,
                unit_price: deliveryCost,
              },
            ]
          : []),
      ],
      payer: customerEmail ? { email: customerEmail } : undefined,
      back_urls: {
        success: `${appUrl}/pedido-confirmado?order=${orderId}&status=success`,
        failure: `${appUrl}/pedido-confirmado?order=${orderId}&status=failure`,
        pending: `${appUrl}/pedido-confirmado?order=${orderId}&status=pending`,
      },
      auto_return: "approved",
      notification_url: `${process.env.MP_WEBHOOK_URL || `${appUrl}/api/payments/webhook`}`,
      statement_descriptor: `GRIDO SAN RAFAEL #${orderNumber}`,
    },
  });

  return preference;
}
