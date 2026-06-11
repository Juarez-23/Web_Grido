import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { branchScopeFilter } from "@/lib/branch";

export const dynamic = "force-dynamic";

// GET /api/orders/[id] — solo admin
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const scope = branchScopeFilter(session);
    const order = await prisma.order.findFirst({
      where: { id: params.id, ...scope },
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

    const scope = branchScopeFilter(session);
    const existing = await prisma.order.findFirst({ where: { id: params.id, ...scope } });
    if (!existing) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });

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

// DELETE /api/orders/[id] — eliminar pedido (solo admin)
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const scope = branchScopeFilter(session);
    const existing = await prisma.order.findFirst({ where: { id: params.id, ...scope } });
    if (!existing) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });

    // El pago no se borra en cascada: eliminarlo primero (los ítems sí cascadean)
    await prisma.$transaction([
      prisma.payment.deleteMany({ where: { orderId: params.id } }),
      prisma.order.delete({ where: { id: params.id } }),
    ]);

    return NextResponse.json({ message: "Pedido eliminado" });
  } catch (error) {
    console.error("DELETE /api/orders/[id] error:", error);
    return NextResponse.json({ error: "Error al eliminar pedido" }, { status: 500 });
  }
}
