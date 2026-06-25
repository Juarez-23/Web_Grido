import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { DashboardPending } from "@/components/admin/DashboardPending";
import { DashboardStats } from "@/components/admin/DashboardStats";
import type { OrderStatus } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ACTIVE_STATUSES: OrderStatus[] = ["CREADO", "ESPERANDO_PAGO", "PAGADO", "PREPARANDO", "LISTO"];

function money(n: number) {
  return `$${Math.round(n).toLocaleString("es-AR")}`;
}

async function getData(branchId: string | null) {
  const bf = branchId ? { branchId } : {};
  const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [branch, todayOrders, activeOrders, monthAgg] = await Promise.all([
    branchId ? prisma.branch.findUnique({ where: { id: branchId }, select: { name: true } }) : null,
    prisma.order.findMany({ where: { ...bf, createdAt: { gte: startOfToday } }, select: { total: true, status: true } }),
    prisma.order.findMany({
      where: { ...bf, status: { in: ACTIVE_STATUSES } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.order.aggregate({
      where: { ...bf, status: "ENTREGADO", createdAt: { gte: monthStart } },
      _sum: { total: true },
      _count: true,
    }),
  ]);

  const todayRevenue = todayOrders.filter((o) => o.status === "ENTREGADO").reduce((s, o) => s + o.total, 0);
  const monthTotal = monthAgg._sum.total ?? 0;
  const monthCount = monthAgg._count ?? 0;

  return {
    branchName: branch?.name ?? "Grido",
    todayCount: todayOrders.length,
    todayRevenue,
    activeCount: activeOrders.length,
    activeOrders,
    monthTotal,
  };
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const branchId = (session?.user as any)?.branchId ?? null;
  const d = await getData(branchId);

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      {/* Saludo */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">{d.branchName}</h1>
        <p className="text-gray-400 text-sm mt-1 capitalize">
          {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* 3 números clave — se actualizan en tiempo real cada 30s */}
      <DashboardStats
        initial={{
          todayCount: d.todayCount,
          todayRevenue: d.todayRevenue,
          monthTotal: d.monthTotal,
          activeCount: d.activeCount,
        }}
      />

      {/* Pedidos pendientes */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-900">
          Pendientes
          {d.activeCount > 0 && <span className="text-gray-400 font-medium"> · {d.activeCount}</span>}
        </h2>
        <Link href="/admin/orders" className="text-sm text-grido-primary font-semibold">Ver todos →</Link>
      </div>

      <DashboardPending
        orders={d.activeOrders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          deliveryType: o.deliveryType,
          status: o.status,
          createdAt: o.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
