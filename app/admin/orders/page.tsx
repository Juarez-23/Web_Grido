"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import type { Order, OrderStatus } from "@/types";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, DELIVERY_TYPE_LABELS, PAYMENT_METHOD_LABELS } from "@/types";
import { formatPrice } from "@/lib/whatsapp";

const STATUS_FLOW: OrderStatus[] = [
  "CREADO",
  "ESPERANDO_PAGO",
  "PAGADO",
  "PREPARANDO",
  "LISTO",
  "ENTREGADO",
  "CANCELADO",
];

const STATUS_NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  CREADO: "PREPARANDO",
  ESPERANDO_PAGO: "PAGADO",
  PAGADO: "PREPARANDO",
  PREPARANDO: "LISTO",
  LISTO: "ENTREGADO",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("active");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      // Construir URL correctamente
      const params = new URLSearchParams({ limit: "100" });
      if (filter === "CANCELADO") params.set("status", "CANCELADO");
      if (filter === "ENTREGADO") params.set("status", "ENTREGADO");

      const res = await fetch(`/api/orders?${params.toString()}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);

      const data = await res.json();
      let fetchedOrders: Order[] = data.data || [];

      // Filtrar activos en el cliente
      if (filter === "active") {
        const activeStatuses = ["CREADO", "ESPERANDO_PAGO", "PAGADO", "PREPARANDO", "LISTO"];
        fetchedOrders = fetchedOrders.filter((o) => activeStatuses.includes(o.status));
      }

      setOrders(fetchedOrders);
    } catch (err) {
      toast.error("Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchOrders();
    // Polling cada 30 segundos
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error();

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      toast.success(`Estado actualizado a: ${ORDER_STATUS_LABELS[newStatus]}`);
    } catch {
      toast.error("Error al actualizar estado");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Pedidos</h1>
          <p className="text-gray-500 text-sm">{orders.length} pedido{orders.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading ? "animate-spin" : ""}>
            <path d="M23 4v6h-6M1 20v-6h6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Actualizar
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { key: "active", label: "🔴 Activos" },
          { key: "ENTREGADO", label: "✅ Entregados" },
          { key: "CANCELADO", label: "❌ Cancelados" },
          { key: "", label: "📋 Todos" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
              filter === f.key
                ? "bg-grido-primary text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-card">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-500 font-medium">No hay pedidos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const nextStatus = STATUS_NEXT[order.status];
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-card overflow-hidden"
              >
                {/* Order header */}
                <div className="px-5 py-4 flex items-start justify-between gap-4 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-black text-gray-600">
                      #{order.orderNumber}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{order.customerName}</p>
                      <p className="text-xs text-gray-400">
                        {order.customerPhone} ·{" "}
                        {new Date(order.createdAt).toLocaleTimeString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <p className="font-black text-gray-900">{formatPrice(order.total)}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="px-5 py-3 bg-gray-50/50">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mb-2">
                    <span>📦 {DELIVERY_TYPE_LABELS[order.deliveryType]}</span>
                    <span>💳 {PAYMENT_METHOD_LABELS[order.paymentMethod]}</span>
                    {order.address && <span>📍 {order.address}</span>}
                  </div>

                  {/* Items */}
                  <div className="space-y-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="text-xs text-gray-700">
                        <span className="font-semibold">{item.quantity}× {item.product.name}</span>
                        {item.flavors?.length > 0 && (
                          <span className="text-gray-400">
                            {" "}— {item.flavors.map((f) => f.flavor.name).join(", ")}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <p className="text-xs text-gray-500 mt-2 italic">📝 {order.notes}</p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="px-5 py-3 flex gap-2 flex-wrap">
                  {nextStatus && (
                    <button
                      onClick={() => updateStatus(order.id, nextStatus)}
                      disabled={updatingId === order.id}
                      className="flex-1 bg-grido-primary text-white text-sm font-semibold rounded-xl py-2 px-3 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {updatingId === order.id ? "..." : `→ ${ORDER_STATUS_LABELS[nextStatus]}`}
                    </button>
                  )}

                  {/* Status selector */}
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                    disabled={updatingId === order.id}
                    className="text-sm border border-gray-200 rounded-xl px-2 py-1.5 text-gray-700 bg-white focus:outline-none focus:border-grido-primary"
                  >
                    {STATUS_FLOW.map((s) => (
                      <option key={s} value={s}>
                        {ORDER_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
