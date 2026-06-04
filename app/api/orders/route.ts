import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    // Verificar que la tienda esté abierta
    const storeSetting = await prisma.setting.findUnique({ where: { key: "storeOpen" } });
    if (storeSetting?.value === "false") {
      return NextResponse.json({ error: "La tienda está cerrada" }, { status: 503 });
    }

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

    // Verificar monto mínimo
    const settings = await prisma.setting.findMany({
      where: { key: { in: ["minOrderAmount", "deliveryCost"] } },
    });
    const minOrder = parseFloat(
      settings.find((s) => s.key === "minOrderAmount")?.value || "0"
    );
    if (subtotal < minOrder) {
      return NextResponse.json(
        { error: `El pedido mínimo es ${minOrder}` },
        { status: 400 }
      );
    }

    // Generar número de orden secuencial
    const lastOrder = await prisma.order.findFirst({ orderBy: { orderNumber: "desc" } });
    const orderNumber = (lastOrder?.orderNumber ?? 0) + 1;

    // Crear pedido con items
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
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            flavors:
              item.flavors?.length > 0
                ? {
                    create: item.flavors.map((flavorId: string) => ({
                      flavorId,
                    })),
                  }
                : undefined,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
            flavors: { include: { flavor: true } },
          },
        },
      },
    });

    // Crear registro de pago
    await prisma.payment.create({
      data: {
        orderId: order.id,
        method: paymentMethod,
        status: "PENDIENTE",
        amount: parseFloat(total),
      },
    });

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: "Error al crear pedido" }, { status: 500 });
  }
}
