import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types";
import Link from "next/link";
import type { OrderStatus } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const MONTHS_BACK = 1;

async function getDashboardData(branchId: string | null) {
  const branchFilter = branchId ? { branchId } : {};

  // Inicio del rango mensual (primer día del mes, hace MONTHS_BACK-1 meses)
  const monthStart = new Date();
  monthStart.setMonth(monthStart.getMonth() - (MONTHS_BACK - 1));
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [todayOrders, totalOrders, pendingOrders, monthlyOrders] = await Promise.all([
    prisma.order.findMany({
      where: { ...branchFilter, createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      include: { items: { include: { product: true, flavors: { include: { flavor: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count({ where: branchFilter }),
    prisma.order.count({
      where: { ...branchFilter, status: { in: ["CREADO", "ESPERANDO_PAGO", "PAGADO", "PREPARANDO"] } },
    }),
    prisma.order.findMany({
      where: { ...branchFilter, status: "ENTREGADO", createdAt: { gte: monthStart } },
      select: { total: true, createdAt: true },
    }),
  ]);

  const todayRevenue = todayOrders
    .filter((o) => o.status === "ENTREGADO")
    .reduce((sum, o) => sum + o.total, 0);

  // Agrupar ventas por mes (YYYY-M)
  const buckets = new Map<string, { total: number; count: number }>();
  for (const o of monthlyOrders) {
    const d = new Date(o.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const cur = buckets.get(key) || { total: 0, count: 0 };
    cur.total += o.total;
    cur.count += 1;
    buckets.set(key, cur);
  }

  const monthly: { label: string; total: number; count: number }[] = [];
  const cursor = new Date(monthStart);
  for (let i = 0; i < MONTHS_BACK; i++) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}`;
    const b = buckets.get(key) || { total: 0, count: 0 };
    monthly.push({
      label: cursor.toLocaleDateString("es-AR", { month: "long", year: "numeric" }),
      total: b.total,
      count: b.count,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  monthly.reverse(); // más reciente primero

  return { todayOrders, todayRevenue, totalOrders, pendingOrders, monthly };
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const branchId = (session?.user as any)?.branchId ?? null;
  const { todayOrders, todayRevenue, totalOrders, pendingOrders, monthly } =
    await getDashboardData(branchId);

  const stats = [
    { label: "Pedidos hoy", value: todayOrders.length, icon: "📦", color: "bg-blue-50 text-blue-700" },
    { label: "Ventas hoy", value: `$${todayRevenue.toLocaleString("es-AR")}`, icon: "💰", color: "bg-green-50 text-green-700" },
    { label: "Pedidos activos", value: pendingOrders, icon: "⏳", color: "bg-yellow-50 text-yellow-700" },
    { label: "Pedidos totales", value: totalOrders, icon: "🧾", color: "bg-purple-50 text-purple-700" },
  ];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString("es-AR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-card">
            <div className={`inline-flex w-10 h-10 rounded-xl items-center justify-center text-xl mb-3 ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            <p className="text-gray-500 text-sm mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Ventas del mes */}
      <div className="bg-white rounded-2xl shadow-card mb-6 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">Ventas del mes</h2>
          <span className="text-xs text-gray-400 capitalize">{monthly[0]?.label}</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-black text-gray-900">
              ${(monthly[0]?.total ?? 0).toLocaleString("es-AR")}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {monthly[0]?.count ?? 0} pedido{(monthly[0]?.count ?? 0) !== 1 ? "s" : ""} entregado{(monthly[0]?.count ?? 0) !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center text-2xl">
            💰
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl shadow-card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Pedidos de hoy</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-grido-primary font-semibold hover:underline"
          >
            Ver todos →
          </Link>
        </div>

        {todayOrders.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <p className="text-4xl mb-2">🍦</p>
            <p className="font-medium">No hay pedidos todavía hoy</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {todayOrders.map((order) => (
              <div
                key={order.id}
                className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-600 text-sm">
                    #{order.orderNumber}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {order.customerName}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {order.deliveryType === "DELIVERY" ? "🛵 Delivery" : "🏪 Retiro"} ·{" "}
                      {new Date(order.createdAt).toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-gray-900 text-sm">
                    ${order.total.toLocaleString("es-AR")}
                  </p>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      ORDER_STATUS_COLORS[order.status as OrderStatus]
                    }`}
                  >
                    {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
