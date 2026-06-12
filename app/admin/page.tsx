import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types";
import Link from "next/link";
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
      orderBy: { createdAt: "asc" },
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

function waited(date: Date) {
  const m = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (m < 1) return "recién";
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h`;
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const branchId = (session?.user as any)?.branchId ?? null;
  const d = await getData(branchId);

  const stats = [
    { label: "Pedidos hoy", value: d.todayCount },
    { label: "Ventas hoy", value: money(d.todayRevenue) },
    { label: "Ventas del mes", value: money(d.monthTotal) },
  ];

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      {/* Saludo */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">{d.branchName}</h1>
        <p className="text-gray-400 text-sm mt-1 capitalize">
          {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* 3 números clave */}
      <div className="grid grid-cols-3 gap-px bg-gray-100 rounded-2xl overflow-hidden mb-8 shadow-card">
        {stats.map((s) => (
          <div key={s.label} className="bg-white p-5 text-center">
            <p className="text-xl md:text-2xl font-black text-gray-900 leading-none">{s.value}</p>
            <p className="text-gray-400 text-xs mt-2">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pedidos pendientes */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-900">
          Pendientes
          {d.activeCount > 0 && <span className="text-gray-400 font-medium"> · {d.activeCount}</span>}
        </h2>
        <Link href="/admin/orders" className="text-sm text-grido-primary font-semibold">Ver todos →</Link>
      </div>

      {d.activeOrders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card py-16 text-center text-gray-400">
          <p className="text-4xl mb-2">✅</p>
          <p className="font-medium text-gray-500">No hay pedidos pendientes</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card divide-y divide-gray-50 overflow-hidden">
          {d.activeOrders.map((o) => (
            <Link key={o.id} href="/admin/orders" className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors">
              <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-500 text-sm flex-shrink-0">
                #{o.orderNumber}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{o.customerName}</p>
                <p className="text-gray-400 text-xs">
                  {o.deliveryType === "DELIVERY" ? "Delivery" : "Retiro"} · hace {waited(o.createdAt)}
                </p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${ORDER_STATUS_COLORS[o.status as OrderStatus]}`}>
                {ORDER_STATUS_LABELS[o.status as OrderStatus]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
