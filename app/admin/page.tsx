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

async function getDashboardData(branchId: string | null) {
  const bf = branchId ? { branchId } : {};

  const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [todayOrders, activeOrders, monthlyOrders] = await Promise.all([
    prisma.order.findMany({
      where: { ...bf, createdAt: { gte: startOfToday } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { ...bf, status: { in: ACTIVE_STATUSES } },
      orderBy: { createdAt: "asc" },
      take: 12,
    }),
    prisma.order.findMany({
      where: { ...bf, status: "ENTREGADO", createdAt: { gte: monthStart } },
      include: { items: { include: { product: { select: { name: true } } } } },
    }),
  ]);

  // Hoy
  const deliveredToday = todayOrders.filter((o) => o.status === "ENTREGADO");
  const todayRevenue = deliveredToday.reduce((s, o) => s + o.total, 0);
  const todayDelivery = todayOrders.filter((o) => o.deliveryType === "DELIVERY").length;
  const todayRetiro = todayOrders.filter((o) => o.deliveryType === "RETIRO").length;

  // Mes
  const monthTotal = monthlyOrders.reduce((s, o) => s + o.total, 0);
  const monthCount = monthlyOrders.length;
  const avgTicket = monthCount > 0 ? monthTotal / monthCount : 0;

  // Top productos del mes
  const prodMap = new Map<string, number>();
  for (const o of monthlyOrders) {
    for (const it of o.items) {
      const name = it.product?.name || "Producto";
      prodMap.set(name, (prodMap.get(name) || 0) + it.quantity);
    }
  }
  const topProducts = [...prodMap.entries()]
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);
  const topMax = Math.max(1, ...topProducts.map((p) => p.qty));

  const monthLabel = monthStart.toLocaleDateString("es-AR", { month: "long", year: "numeric" });

  return {
    todayCount: todayOrders.length,
    todayRevenue,
    todayDelivery,
    todayRetiro,
    activeOrders,
    monthTotal,
    monthCount,
    avgTicket,
    monthLabel,
    topProducts,
    topMax,
  };
}

function waitedSince(date: Date) {
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 1) return "recién";
  if (mins < 60) return `hace ${mins} min`;
  const h = Math.floor(mins / 60);
  return `hace ${h} h`;
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const branchId = (session?.user as any)?.branchId ?? null;
  const d = await getDashboardData(branchId);

  const kpis = [
    { label: "Pedidos hoy", value: d.todayCount, icon: "📦", color: "bg-blue-50 text-blue-700" },
    { label: "Ventas hoy", value: money(d.todayRevenue), icon: "💰", color: "bg-green-50 text-green-700" },
    { label: "Activos ahora", value: d.activeOrders.length, icon: "⏳", color: "bg-amber-50 text-amber-700", href: "/admin/orders" },
    { label: "Ticket promedio", value: money(d.avgTicket), icon: "📈", color: "bg-purple-50 text-purple-700" },
  ];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1 capitalize">
          {new Date().toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {kpis.map((k) => {
          const inner = (
            <>
              <div className={`inline-flex w-10 h-10 rounded-xl items-center justify-center text-xl mb-3 ${k.color}`}>{k.icon}</div>
              <p className="text-2xl font-black text-gray-900 leading-none">{k.value}</p>
              <p className="text-gray-500 text-sm mt-1.5">{k.label}</p>
            </>
          );
          return k.href ? (
            <Link key={k.label} href={k.href} className="bg-white rounded-2xl p-5 shadow-card hover:shadow-lg transition-shadow">
              {inner}
            </Link>
          ) : (
            <div key={k.label} className="bg-white rounded-2xl p-5 shadow-card">{inner}</div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        {/* Pedidos activos — foco operativo */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-900">Pedidos activos</h2>
              {d.activeOrders.length > 0 && (
                <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{d.activeOrders.length}</span>
              )}
            </div>
            <Link href="/admin/orders" className="text-sm text-grido-primary font-semibold hover:underline">Gestionar →</Link>
          </div>

          {d.activeOrders.length === 0 ? (
            <div className="py-14 text-center text-gray-400">
              <p className="text-4xl mb-2">✅</p>
              <p className="font-medium">No hay pedidos pendientes</p>
              <p className="text-sm text-gray-400 mt-0.5">Todo al día</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {d.activeOrders.map((o) => (
                <Link
                  key={o.id}
                  href="/admin/orders"
                  className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-600 text-sm flex-shrink-0">
                      #{o.orderNumber}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{o.customerName}</p>
                      <p className="text-gray-400 text-xs">
                        {o.deliveryType === "DELIVERY" ? "🛵 Delivery" : "🏪 Retiro"} · {waitedSince(o.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="font-bold text-gray-900 text-sm">{money(o.total)}</p>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ORDER_STATUS_COLORS[o.status as OrderStatus]}`}>
                      {ORDER_STATUS_LABELS[o.status as OrderStatus]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Columna derecha */}
        <div className="space-y-4 md:space-y-6">
          {/* Resumen del mes */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900">Resumen del mes</h2>
              <span className="text-xs text-gray-400 capitalize">{d.monthLabel}</span>
            </div>
            <p className="text-3xl font-black text-gray-900">{money(d.monthTotal)}</p>
            <div className="flex gap-4 mt-3 text-sm">
              <div>
                <p className="font-bold text-gray-800">{d.monthCount}</p>
                <p className="text-gray-400 text-xs">entregados</p>
              </div>
              <div>
                <p className="font-bold text-gray-800">{money(d.avgTicket)}</p>
                <p className="text-gray-400 text-xs">ticket prom.</p>
              </div>
            </div>
          </div>

          {/* Desglose de hoy */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-bold text-gray-900 mb-3">Hoy</h2>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-2">🛵 Delivery</span>
                <span className="font-bold text-gray-900">{d.todayDelivery}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-2">🏪 Retiro</span>
                <span className="font-bold text-gray-900">{d.todayRetiro}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top productos del mes */}
      <div className="bg-white rounded-2xl shadow-card mt-4 md:mt-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Más vendidos del mes</h2>
          <span className="text-xs text-gray-400">por cantidad</span>
        </div>
        {d.topProducts.length === 0 ? (
          <div className="py-10 text-center text-gray-400">
            <p className="text-3xl mb-1">🍦</p>
            <p className="text-sm">Todavía no hay ventas este mes</p>
          </div>
        ) : (
          <div className="px-6 py-4 space-y-3">
            {d.topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="w-6 text-center font-black text-gray-300">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                    <p className="text-sm font-bold text-gray-900 ml-3">{p.qty}</p>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.round((p.qty / d.topMax) * 100)}%`, background: "#0d40e8" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
