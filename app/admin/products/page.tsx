"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import type { Product, Category } from "@/types";
import { formatPrice } from "@/lib/whatsapp";

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  image: string;
  maxFlavors: string;
  active: boolean;
  featured: boolean;
  categoryId: string;
}

const EMPTY_FORM: ProductFormState = {
  name: "",
  description: "",
  price: "",
  image: "",
  maxFlavors: "4",
  active: true,
  featured: false,
  categoryId: "",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([p, c]) => {
      setProducts(p.data || []);
      setCategories(c.data || []);
      setLoading(false);
    });
  }, []);

  const openCreate = () => {
    setEditingProduct(null);
    setForm({ ...EMPTY_FORM, categoryId: categories[0]?.id || "" });
    setShowForm(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      image: product.image || "",
      maxFlavors: String(product.maxFlavors),
      active: product.active,
      featured: product.featured,
      categoryId: product.categoryId,
    });
    setShowForm(true);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir");
      setForm((prev) => ({ ...prev, image: data.url }));
      toast.success("Imagen subida");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.categoryId) {
      toast.error("Completá nombre, precio y categoría");
      return;
    }
    setSaving(true);

    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products";
      const method = editingProduct ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          maxFlavors: parseInt(form.maxFlavors),
        }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      if (editingProduct) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? data.data : p))
        );
        toast.success("Producto actualizado");
      } else {
        setProducts((prev) => [data.data, ...prev]);
        toast.success("Producto creado");
      }
      setShowForm(false);
    } catch {
      toast.error("Error al guardar producto");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (product: Product) => {
    try {
      await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !product.active }),
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, active: !p.active } : p))
      );
    } catch {
      toast.error("Error");
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Producto eliminado");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Productos</h1>
          <p className="text-gray-500 text-sm">{products.length} productos</p>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary flex items-center gap-2"
        >
          <span>+</span> Nuevo producto
        </button>
      </div>

      {/* Products list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card divide-y divide-gray-50">
          {products.map((product) => (
            <div key={product.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
              {/* Image */}
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-red-50 to-orange-50 flex-shrink-0">
                {product.image ? (
                  <Image src={product.image} alt={product.name} fill className="object-cover" sizes="56px" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-2xl">🍦</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900 truncate">{product.name}</p>
                  {product.featured && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-semibold">⭐ Top</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {product.category?.name} · {product.maxFlavors} sabores · {formatPrice(product.price)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Active toggle */}
                <button
                  onClick={() => toggleActive(product)}
                  title={product.active ? "Activo - clic para desactivar" : "Inactivo - clic para activar"}
                  style={{
                    position: "relative", flexShrink: 0, width: 44, height: 26,
                    borderRadius: 999, border: "none", cursor: "pointer", padding: 0,
                    background: product.active ? "#22c55e" : "#d1d5db",
                    transition: "background 220ms cubic-bezier(0.25,1,0.5,1)",
                  }}
                >
                  <span style={{
                    position: "absolute", top: 3, left: product.active ? 21 : 3,
                    width: 20, height: 20, background: "white", borderRadius: "50%",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.22)",
                    transition: "left 220ms cubic-bezier(0.25,1,0.5,1)", display: "block",
                  }} />
                </button>

                <button
                  onClick={() => openEdit(product)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors text-sm"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              <p className="text-4xl mb-2">🍦</p>
              <p>No hay productos. ¡Creá el primero!</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowForm(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md z-50 bg-white shadow-modal flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-lg">
                {editingProduct ? "Editar producto" : "Nuevo producto"}
              </h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Nombre *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="1/2 Kg" className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Descripción</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción corta..." className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Precio *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="12000" className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Máx. sabores</label>
                  <input type="number" min="0" max="10" value={form.maxFlavors} onChange={(e) => setForm({ ...form, maxFlavors: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Categoría *</label>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input-field">
                  <option value="">Seleccionar...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              {/* Image upload */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Imagen del producto</label>

                {/* Preview */}
                {form.image && (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden bg-gray-50 mb-3">
                    <Image src={form.image} alt="Preview" fill className="object-cover" sizes="400px" />
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, image: "" }))}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center text-sm hover:bg-black/70 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Upload area */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-grido-primary hover:bg-blue-50/50 transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-grido-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-gray-500">Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span className="text-sm text-gray-500">{form.image ? "Cambiar imagen" : "Subir imagen"}</span>
                      <span className="text-xs text-gray-400">JPG, PNG, WebP — máx. 5MB</span>
                    </>
                  )}
                </button>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-grido-primary" />
                  <span className="text-sm font-medium text-gray-700">Activo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 accent-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">⭐ Destacado</span>
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100">
              <button onClick={handleSave} disabled={saving} className="w-full btn-primary h-12">
                {saving ? "Guardando..." : editingProduct ? "Guardar cambios" : "Crear producto"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
