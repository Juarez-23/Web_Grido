"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { Flavor } from "@/types";

export default function AdminFlavorsPage() {
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFlavor, setNewFlavor] = useState("");
  const [adding, setAdding] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/flavors")
      .then((r) => r.json())
      .then((d) => {
        setFlavors(d.data || []);
        setLoading(false);
      });
  }, []);

  const toggleAvailability = async (flavor: Flavor) => {
    setUpdatingId(flavor.id);
    try {
      const res = await fetch(`/api/flavors/${flavor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !flavor.available }),
      });
      if (!res.ok) throw new Error();
      setFlavors((prev) =>
        prev.map((f) =>
          f.id === flavor.id ? { ...f, available: !f.available } : f
        )
      );
      toast.success(
        !flavor.available ? `✅ ${flavor.name} disponible` : `❌ ${flavor.name} agotado`
      );
    } catch {
      toast.error("Error al actualizar");
    } finally {
      setUpdatingId(null);
    }
  };

  const addFlavor = async () => {
    if (!newFlavor.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/flavors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFlavor.trim() }),
      });
      const data = await res.json();
      setFlavors((prev) => [...prev, data.data]);
      setNewFlavor("");
      toast.success("Sabor agregado");
    } catch {
      toast.error("Error al agregar sabor");
    } finally {
      setAdding(false);
    }
  };

  const deleteFlavor = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar el sabor "${name}"?`)) return;
    try {
      await fetch(`/api/flavors/${id}`, { method: "DELETE" });
      setFlavors((prev) => prev.filter((f) => f.id !== id));
      toast.success("Sabor eliminado");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const availableCount = flavors.filter((f) => f.available).length;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Sabores</h1>
        <p className="text-gray-500 text-sm">
          {availableCount} disponibles · {flavors.length - availableCount} agotados
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-card text-center">
          <p className="text-3xl font-black text-green-600">{availableCount}</p>
          <p className="text-sm text-gray-500 mt-1">✅ Disponibles</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-card text-center">
          <p className="text-3xl font-black text-red-500">{flavors.length - availableCount}</p>
          <p className="text-sm text-gray-500 mt-1">❌ Agotados</p>
        </div>
      </div>

      {/* Add new flavor */}
      <div className="bg-white rounded-2xl p-4 shadow-card mb-5">
        <h2 className="font-bold text-gray-800 mb-3">Agregar sabor</h2>
        <div className="flex gap-2">
          <input
            value={newFlavor}
            onChange={(e) => setNewFlavor(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addFlavor()}
            placeholder="Ej: Dulce de leche"
            className="input-field flex-1"
          />
          <button
            onClick={addFlavor}
            disabled={adding || !newFlavor.trim()}
            className="btn-primary px-5"
          >
            {adding ? "..." : "+ Agregar"}
          </button>
        </div>
      </div>

      {/* Flavors grid */}
      <div className="bg-white rounded-2xl shadow-card">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Todos los sabores</h2>
          <p className="text-xs text-gray-400">
            Clic en el toggle para cambiar disponibilidad
          </p>
        </div>

        {loading ? (
          <div className="p-5 grid grid-cols-2 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {flavors.map((flavor) => (
              <div
                key={flavor.id}
                className={`flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors ${
                  !flavor.available ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      flavor.available ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                  <span className={`font-medium ${flavor.available ? "text-gray-900" : "text-gray-400 line-through"}`}>
                    {flavor.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Toggle */}
                  <button
                    onClick={() => toggleAvailability(flavor)}
                    disabled={updatingId === flavor.id}
                    title={flavor.available ? "Disponible — clic para marcar agotado" : "Agotado — clic para marcar disponible"}
                    style={{
                      position: "relative",
                      flexShrink: 0,
                      width: 44,
                      height: 26,
                      borderRadius: 999,
                      border: "none",
                      cursor: updatingId === flavor.id ? "not-allowed" : "pointer",
                      background: flavor.available ? "#22c55e" : "#d1d5db",
                      transition: "background 200ms cubic-bezier(0.25,1,0.5,1)",
                      opacity: updatingId === flavor.id ? 0.6 : 1,
                      outline: "none",
                      padding: 0,
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: 3,
                        left: flavor.available ? 21 : 3,
                        width: 20,
                        height: 20,
                        background: "white",
                        borderRadius: "50%",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        transition: "left 200ms cubic-bezier(0.25,1,0.5,1)",
                        display: "block",
                      }}
                    />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => deleteFlavor(flavor.id, flavor.name)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            {flavors.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                <p className="text-4xl mb-2">🎨</p>
                <p>No hay sabores. ¡Agregá el primero!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
