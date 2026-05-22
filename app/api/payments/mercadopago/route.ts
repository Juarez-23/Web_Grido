import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createMercadoPagoPreference } from "@/lib/mercadopago";

// POST /api/payments/mercadopago — crear preferencia de pago
export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    const mpItems = order.items.map((item) => ({
      title: item.product.name,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    }));

    const preference = await createMercadoPagoPreference(
      order.orderNumber,
      order.id,
      mpItems,
      order.deliveryCost
    );

    // Guardar ID de preferencia en el pago
    await prisma.payment.update({
      where: { orderId: order.id },
      data: {
        mpPreferenceId: preference.id,
        status: "PENDIENTE",
      },
    });

    // Actualizar estado del pedido
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "ESPERANDO_PAGO" },
    });

    return NextResponse.json({
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
      preferenceId: preference.id,
    });
  } catch (error) {
    console.error("Mercado Pago error:", error);
    return NextResponse.json(
      { error: "Error al crear preferencia de pago" },
      { status: 500 }
    );
  }
}
