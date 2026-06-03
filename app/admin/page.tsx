import { prisma } from "@/lib/prisma";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types";
import Link from "next/link";
import type { OrderStatus } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getDashboardData() {
  const [todayOrders, totalOrders, pendingOrders, products] = await Promise.all([
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      include: {
        items: { include: { product: true, flavors: { include: { flavor: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.count(),
    prisma.order.count({
      where: { status: { in: ["CREADO", "ESPERANDO_PAGO", "PAGADO", "PREPARANDO"] } },
    }),
    prisma.product.count({ where: { active: true } }),
  ]);

  const todayRevenue = todayOrders
    .filter((o) => o.status === "ENTREGADO")
    .reduce((sum, o) => sum + o.total, 0);

  return { todayOrders, todayRevenue, totalOrders, pendingOrders, products };
}

export default async function AdminDashboard() {
  const { todayOrders, todayRevenue, totalOrders, pendingOrders, products } =
    await getDashboardData();

  const stats = [
    { label: "Pedidos hoy", value: todayOrders.length, icon: "📦", color: "bg-blue-50 text-blue-700" },
    { label: "Ventas hoy", value: `$${todayRevenue.toLocaleString("es-AR")}`, icon: "💰", color: "bg-green-50 text-green-700" },
    { label: "Pedidos activos", value: pendingOrders, icon: "⏳", color: "bg-yellow-50 text-yellow-700" },
    { label: "Productos activos", value: products, icon: "🍦", color: "bg-red-50 text-red-700" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
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
