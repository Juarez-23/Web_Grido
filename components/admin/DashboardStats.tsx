"use client";

import { useState, useEffect } from "react";

interface Stats {
  todayCount: number;
  todayRevenue: number;
  monthTotal: number;
  activeCount: number;
}

function money(n: number) {
  return `$${Math.round(n).toLocaleString("es-AR")}`;
}

export function DashboardStats({ initial }: { initial: Stats }) {
  const [stats, setStats] = useState<Stats>(initial);
  const [pulse, setPulse] = useState(false);

  const refresh = async () => {
    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setStats((prev) => {
        // Mostrar pulso si cambió algo
        if (data.todayCount !== prev.todayCount || data.activeCount !== prev.activeCount) {
          setPulse(true);
          setTimeout(() => setPulse(false), 800);
        }
        return data;
      });
    } catch {
      // silencioso
    }
  };

  useEffect(() => {
    const id = setInterval(refresh, 30_000); // cada 30s
    return () => clearInterval(id);
  }, []);

  const items = [
    { label: "Pedidos hoy", value: stats.todayCount },
    { label: "Ventas hoy", value: money(stats.todayRevenue) },
    { label: "Ventas del mes", value: money(stats.monthTotal) },
  ];

  return (
    <div
      className={`grid grid-cols-3 gap-px bg-gray-100 rounded-2xl overflow-hidden mb-8 shadow-card transition-shadow duration-300 ${
        pulse ? "shadow-grido-primary/30 shadow-lg" : ""
      }`}
    >
      {items.map((s) => (
        <div key={s.label} className="bg-white p-5 text-center">
          <p className="text-xl md:text-2xl font-black text-gray-900 leading-none tabular-nums">{s.value}</p>
          <p className="text-gray-400 text-xs mt-2">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
