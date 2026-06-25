import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAdminBranchId } from "@/lib/branch";

export const dynamic = "force-dynamic";

const ACTIVE_STATUSES = ["CREADO", "ESPERANDO_PAGO", "PAGADO", "PREPARANDO", "LISTO"];

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const branchId = await getAdminBranchId(req, session);
    const bf = branchId ? { branchId } : {};

    const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [todayOrders, activeCount, monthAgg] = await Promise.all([
      prisma.order.findMany({
        where: { ...bf, createdAt: { gte: startOfToday } },
        select: { total: true, status: true },
      }),
      prisma.order.count({
        where: { ...bf, status: { in: ACTIVE_STATUSES } },
      }),
      prisma.order.aggregate({
        where: { ...bf, status: "ENTREGADO", createdAt: { gte: monthStart } },
        _sum: { total: true },
        _count: true,
      }),
    ]);

    const todayRevenue = todayOrders
      .filter((o) => o.status === "ENTREGADO")
      .reduce((s, o) => s + o.total, 0);

    return NextResponse.json(
      {
        todayCount: todayOrders.length,
        todayRevenue,
        activeCount,
        monthTotal: monthAgg._sum.total ?? 0,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
