"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types";
import type { OrderStatus } from "@/types";

export interface PendingOrder {
  id: string;
  orderNumber: number;
  customerName: string;
  deliveryType: string;
  status: string;
  createdAt: string; // ISO
}

function waited(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "recién";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const days = Math.floor(h / 24);
  return `hace ${days} ${days === 1 ? "día" : "días"}`;
}

export function DashboardPending({ orders }: { orders: PendingOrder[] }) {
  const [list, setList] = useState<PendingOrder[]>(orders);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const remove = async (o: PendingOrder) => {
    if (!confirm(`¿Eliminar el pedido #${o.orderNumber}? Esta acción no se puede deshacer.`)) return;
    setDeletingId(o.id);
    try {
      const res = await fetch(`/api/orders/${o.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setList((prev) => prev.filter((x) => x.id !== o.id));
      toast.success(`Pedido #${o.orderNumber} eliminado`);
    } catch {
      toast.error("Error al eliminar el pedido");
    } finally {
      setDeletingId(null);
    }
  };

  if (list.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-card py-16 text-center text-gray-400">
        <p className="text-4xl mb-2">✅</p>
        <p className="font-medium text-gray-500">No hay pedidos pendientes</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card divide-y divide-gray-50 overflow-hidden">
      {list.map((o) => (
        <div key={o.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors">
          <Link href="/admin/orders" className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-500 text-sm flex-shrink-0">
              #{o.orderNumber}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{o.customerName}</p>
              <p className="text-gray-400 text-xs">
                {o.deliveryType === "DELIVERY" ? "Delivery" : "Retiro"} · {waited(o.createdAt)}
              </p>
            </div>
          </Link>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${ORDER_STATUS_COLORS[o.status as OrderStatus]}`}>
            {ORDER_STATUS_LABELS[o.status as OrderStatus]}
          </span>
          <button
            onClick={() => remove(o)}
            disabled={deletingId === o.id}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 active:scale-95 transition-all disabled:opacity-50 flex-shrink-0"
            aria-label="Eliminar pedido"
            title="Eliminar pedido"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
