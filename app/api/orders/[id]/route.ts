import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/orders/[id] — solo admin
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: { include: { category: true } },
            flavors: { include: { flavor: true } },
          },
        },
        payment: true,
      },
    });

    if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    return NextResponse.json({ data: order });
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener pedido" }, { status: 500 });
  }
}

// PATCH /api/orders/[id] — cambiar estado (admin/empleado)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "EMPLEADO"].includes(session.user?.role ?? "")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { status } = await req.json();

    const validStatuses = [
      "CREADO",
      "ESPERANDO_PAGO",
      "PAGADO",
      "PREPARANDO",
      "LISTO",
      "ENTREGADO",
      "CANCELADO",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
            flavors: { include: { flavor: true } },
          },
        },
        payment: true,
      },
    });

    return NextResponse.json({ data: order });
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar pedido" }, { status: 500 });
  }
}
