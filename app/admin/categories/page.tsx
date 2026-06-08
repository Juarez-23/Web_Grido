"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { Category } from "@/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", icon: "", order: "" });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => {
        setCategories(d.data || []);
        setLoading(false);
      });
  }, []);

  const toSlug = (name: string) =>
    name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: toSlug(name) }));
  };

  const addCategory = async () => {
    if (!form.name.trim() || !form.slug.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim(),
          icon: form.icon.trim() || null,
          order: parseInt(form.order) || categories.length,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategories((prev) => [...prev, data.data]);
      setForm({ name: "", slug: "", icon: "", order: "" });
      toast.success("Categoría creada");
    } catch {
      toast.error("Error al crear categoría");
    } finally {
      setAdding(false);
    }
  };

  const toggleActive = async (cat: Category) => {
    setUpdatingId(cat.id);
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !cat.active }),
      });
      if (!res.ok) throw new Error();
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, active: !c.active } : c))
      );
      toast.success(cat.active ? "Categoría desactivada" : "Categoría activada");
    } catch {
      toast.error("Error al actualizar");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la categoría "${name}"? Los productos asociados quedarán sin categoría.`)) return;
    try {
      await fetch(`/api/categories/${id}`, { method: "DELETE" });
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Categoría eliminada");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const activeCount = categories.filter((c) => c.active).length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Categorías</h1>
        <p className="text-gray-500 text-sm">
          {activeCount} activas · {categories.length - activeCount} inactivas
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-card text-center">
          <p className="text-3xl font-black text-green-600">{activeCount}</p>
          <p className="text-sm text-gray-500 mt-1">✅ Activas</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-card text-center">
          <p className="text-3xl font-black text-gray-400">{categories.length - activeCount}</p>
          <p className="text-sm text-gray-500 mt-1">⏸ Inactivas</p>
        </div>
      </div>

      {/* Formulario nueva categoría */}
      <div className="bg-white rounded-2xl p-4 shadow-card mb-5">
        <h2 className="font-bold text-gray-800 mb-3">Nueva categoría</h2>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Nombre *</label>
            <input
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ej: Grido Market"
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Slug (URL) *</label>
            <input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="grido-market"
              className="input-field w-full font-mono text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Ícono (emoji)</label>
            <input
              value={form.icon}
              onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
              placeholder="🛒"
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Orden</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
              placeholder={String(categories.length)}
              className="input-field w-full"
            />
          </div>
        </div>
        <button
          onClick={addCategory}
          disabled={adding || !form.name.trim()}
          className="btn-primary w-full"
        >
          {adding ? "Creando..." : "+ Crear categoría"}
        </button>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl shadow-card">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Todas las categorías</h2>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors ${
                  !cat.active ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {cat.icon && <span className="text-lg">{cat.icon}</span>}
                  <div>
                    <p className={`font-medium ${cat.active ? "text-gray-900" : "text-gray-400"}`}>
                      {cat.name}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">{cat.slug} · {cat._count?.products ?? 0} productos · orden {cat.order}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Toggle activo */}
                  <button
                    onClick={() => toggleActive(cat)}
                    disabled={updatingId === cat.id}
                    style={{
                      position: "relative",
                      flexShrink: 0,
                      width: 44,
                      height: 26,
                      borderRadius: 999,
                      border: "none",
                      cursor: updatingId === cat.id ? "not-allowed" : "pointer",
                      background: cat.active ? "#22c55e" : "#d1d5db",
                      transition: "background 200ms",
                      opacity: updatingId === cat.id ? 0.6 : 1,
                      outline: "none",
                      padding: 0,
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: 3,
                        left: cat.active ? 21 : 3,
                        width: 20,
                        height: 20,
                        background: "white",
                        borderRadius: "50%",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        transition: "left 200ms",
                        display: "block",
                      }}
                    />
                  </button>

                  {/* Eliminar */}
                  <button
                    onClick={() => deleteCategory(cat.id, cat.name)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {categories.length === 0 && (
              <div className="py-12 text-center text-gray-400">
                <p className="text-4xl mb-2">🗂️</p>
                <p>No hay categorías. ¡Creá la primera!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
