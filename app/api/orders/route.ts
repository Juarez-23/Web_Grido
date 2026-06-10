import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateWhatsAppMessage, generateWhatsAppUrl } from "@/lib/whatsapp";
import type { CheckoutFormData, CartItem } from "@/types";

export const dynamic = "force-dynamic";

// GET /api/orders (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {};
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: { include: { category: true } },
            flavors: { include: { flavor: true } },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ data: orders });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: "Error al obtener pedidos" }, { status: 500 });
  }
}

// POST /api/orders (público — lo hace el cliente)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      address,
      deliveryType,
      paymentMethod,
      notes,
      subtotal,
      deliveryCost,
      total,
      items,
    } = body;

    // Validaciones básicas
    if (!customerName || !customerPhone || !deliveryType || !paymentMethod || !items?.length) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    // Una sola lectura de settings para todo lo que necesitamos
    const settingsRows = await prisma.setting.findMany({
      where: {
        key: { in: ["storeOpen", "minOrderAmount", "whatsappNumber", "transferAlias", "transferCbu"] },
      },
    });
    const settings: Record<string, string> = {};
    settingsRows.forEach((s) => (settings[s.key] = s.value));

    // Tienda cerrada
    if (settings.storeOpen === "false") {
      return NextResponse.json({ error: "La tienda está cerrada en este momento." }, { status: 503 });
    }

    // Monto mínimo
    const minOrder = parseFloat(settings.minOrderAmount || "0");
    if (subtotal < minOrder) {
      return NextResponse.json(
        { error: `El pedido mínimo es $${minOrder.toLocaleString("es-AR")}.` },
        { status: 400 }
      );
    }

    // Número de orden secuencial
    const lastOrder = await prisma.order.findFirst({ orderBy: { orderNumber: "desc" } });
    const orderNumber = (lastOrder?.orderNumber ?? 0) + 1;

    // Las promociones no son productos reales: se incluyen en el mensaje pero no se
    // persisten como ítems (su productId "promo-..." no existe en la tabla Product).
    const isPromo = (it: any) => String(it.productId || "").startsWith("promo-");
    const realItems = items.filter((it: any) => !isPromo(it));

    // Crear pedido + pago en una sola operación (pago anidado)
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerPhone,
        address,
        deliveryType,
        paymentMethod,
        notes,
        subtotal: parseFloat(subtotal),
        deliveryCost: parseFloat(deliveryCost || 0),
        total: parseFloat(total),
        status: "CREADO",
        items: {
          create: realItems.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            flavors:
              item.flavors?.length > 0
                ? { create: item.flavors.map((flavorId: string) => ({ flavorId })) }
                : undefined,
          })),
        },
        payment: {
          create: {
            method: paymentMethod,
            status: "PENDIENTE",
            amount: parseFloat(total),
          },
        },
      },
    });

    // Armar el link de WhatsApp con TODOS los ítems del pedido (incluidas promos),
    // usando los datos del payload (nombre y sabores) sin un segundo viaje a la DB.
    const formData: CheckoutFormData = {
      customerName,
      customerPhone,
      address: address || undefined,
      deliveryType,
      paymentMethod,
      notes: notes || undefined,
    };
    const cartItems: CartItem[] = items.map((item: any, i: number) => ({
      cartId: String(i),
      product: { name: item.name || "Producto", price: item.unitPrice } as any,
      quantity: item.quantity,
      selectedFlavors: (item.flavorNames || []).map((name: string, j: number) => ({
        id: String(j),
        name,
      })),
    }));
    const message = generateWhatsAppMessage(
      order.orderNumber,
      formData,
      cartItems,
      order.subtotal,
      order.deliveryCost,
      order.total,
      { transferAlias: settings.transferAlias || undefined, transferCbu: settings.transferCbu || undefined }
    );
    const whatsappNumber = settings.whatsappNumber || process.env.WHATSAPP_NUMBER || "5492604000000";
    const waUrl = generateWhatsAppUrl(whatsappNumber, message);

    return NextResponse.json({ data: order, waUrl }, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: "Error al crear pedido" }, { status: 500 });
  }
}
