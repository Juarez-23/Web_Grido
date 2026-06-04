import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Webhook de Mercado Pago
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type !== "payment") {
      return NextResponse.json({ message: "OK" });
    }

    // Obtener datos del pago desde MP
    const paymentId = data?.id;
    if (!paymentId) return NextResponse.json({ message: "No payment ID" });

    // Consultar la API de MP para confirmar el estado
    const mpRes = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      }
    );

    if (!mpRes.ok) throw new Error("Error al consultar pago en MP");

    const mpPayment = await mpRes.json();
    const orderId = mpPayment.external_reference;
    const mpStatus = mpPayment.status; // approved, rejected, pending

    // Mapear estado de MP al estado de la DB
    const paymentStatusMap: Record<string, string> = {
      approved: "APROBADO",
      rejected: "RECHAZADO",
      pending: "PENDIENTE",
      cancelled: "CANCELADO",
    };

    const orderStatusMap: Record<string, string> = {
      approved: "PAGADO",
      rejected: "CANCELADO",
      pending: "ESPERANDO_PAGO",
    };

    const paymentStatus = paymentStatusMap[mpStatus] || "PENDIENTE";
    const orderStatus = orderStatusMap[mpStatus];

    // Actualizar payment
    await prisma.payment.update({
      where: { orderId },
      data: {
        mpPaymentId: String(paymentId),
        status: paymentStatus as any,
      },
    });

    // Actualizar orden si hay cambio de estado
    if (orderStatus) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: orderStatus as any },
      });
    }

    return NextResponse.json({ message: "Webhook procesado" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Error en webhook" }, { status: 500 });
  }
}
