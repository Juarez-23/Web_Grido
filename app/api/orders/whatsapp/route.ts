import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateWhatsAppMessage, generateWhatsAppUrl } from "@/lib/whatsapp";
import type { CheckoutFormData, CartItem } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        branch: { select: { name: true } },
        items: {
          include: {
            product: { include: { category: true } },
            flavors: { include: { flavor: true } },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    // Obtener settings de la sucursal del pedido
    const settingRows = await prisma.setting.findMany({
      where: {
        branchId: order.branchId,
        key: { in: ["whatsappNumber", "transferAlias", "transferCbu", "transferHolder"] },
      },
    });
    const settingMap: Record<string, string> = {};
    settingRows.forEach((s) => (settingMap[s.key] = s.value));
    const whatsappNumber = settingMap.whatsappNumber || process.env.WHATSAPP_NUMBER || "5492604000000";
    const transferAlias = settingMap.transferAlias || undefined;
    const transferCbu = settingMap.transferCbu || undefined;
    const transferHolder = settingMap.transferHolder || undefined;

    // Construir datos para el mensaje
    const formData: CheckoutFormData = {
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      address: order.address || undefined,
      deliveryType: order.deliveryType as "DELIVERY" | "RETIRO",
      paymentMethod: order.paymentMethod as any,
      notes: order.notes || undefined,
    };

    const cartItems: CartItem[] = order.items.map((item) => ({
      cartId: item.id,
      product: item.product as any,
      quantity: item.quantity,
      selectedFlavors: item.flavors.map((f) => ({
        id: f.flavor.id,
        name: f.flavor.name,
      })),
    }));

    const message = generateWhatsAppMessage(
      order.orderNumber,
      formData,
      cartItems,
      order.subtotal,
      order.deliveryCost,
      order.total,
      { transferAlias, transferCbu, transferHolder, branchName: order.branch?.name }
    );

    const url = generateWhatsAppUrl(whatsappNumber, message);

    return NextResponse.json({ url, message });
  } catch (error) {
    console.error("WhatsApp route error:", error);
    return NextResponse.json({ error: "Error al generar enlace de WhatsApp" }, { status: 500 });
  }
}
