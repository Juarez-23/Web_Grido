"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

interface Promotion {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  badge: string | null;
  active: boolean;
  order: number;
}

const EMPTY: Omit<Promotion, "id"> = {
  title: "",
  description: "",
  image: "",
  badge: "",
  active: true,
  order: 0,
};

export default function AdminPromotionsPage() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState<Omit<Promotion, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ─── Promo del día (guardada en settings, por sucursal) ────────────────────
  const [pd, setPd] = useState({ active: false, name: "", detail: "", price: 0, image: "" });
  const [pdSaving, setPdSaving] = useState(false);
  const [pdUploading, setPdUploading] = useState(false);
  const pdFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/promotions?all=true")
      .then((r) => r.json())
      .then((d) => { setPromos(d.data || []); setLoading(false); });

    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setPd({
          active: !!d.data.promoDelDiaActive,
          name: d.data.promoDelDiaName || "",
          detail: d.data.promoDelDiaDetail || "",
          price: d.data.promoDelDiaPrice || 0,
          image: d.data.promoDelDiaImage || "",
        });
      });
  }, []);

  const uploadPdImage = async (file: File) => {
    setPdUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error();
      setPd((p) => ({ ...p, image: data.url }));
      toast.success("Imagen subida");
    } catch {
      toast.error("Error al subir la imagen");
    } finally {
      setPdUploading(false);
    }
  };

  const savePd = async () => {
    setPdSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promoDelDiaActive: pd.active,
          promoDelDiaName: pd.name,
          promoDelDiaDetail: pd.detail,
          promoDelDiaPrice: Number(pd.price) || 0,
          promoDelDiaImage: pd.image,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Promo del día guardada");
    } catch {
      toast.error("No se pudo guardar la promo del día");
    } finally {
      setPdSaving(false);
    }
  };

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (p: Promotion) => {
    setEditing(p);
    setForm({ title: p.title, description: p.description || "", image: p.image || "", badge: p.badge || "", active: p.active, order: p.order });
    setShowForm(true);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm((prev) => ({ ...prev, image: data.url }));
      toast.success("Imagen subida");
    } catch {
      toast.error("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title) { toast.error("El título es obligatorio"); return; }
    setSaving(true);
    try {
      const url = editing ? `/api/promotions/${editing.id}` : "/api/promotions";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, order: Number(form.order) }),
      });
      if (!res.ok) throw new Error();
      const { data } = await res.json();
      if (editing) {
        setPromos((prev) => prev.map((p) => (p.id === editing.id ? data : p)));
        toast.success("Promoción actualizada");
      } else {
        setPromos((prev) => [...prev, data]);
        toast.success("Promoción creada");
      }
      setShowForm(false);
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta promoción?")) return;
    await fetch(`/api/promotions/${id}`, { method: "DELETE" });
    setPromos((prev) => prev.filter((p) => p.id !== id));
    toast.success("Eliminada");
  };

  const toggleActive = async (p: Promotion) => {
    await fetch(`/api/promotions/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !p.active }),
    });
    setPromos((prev) => prev.map((x) => (x.id === p.id ? { ...x, active: !x.active } : x)));
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Promociones</h1>
          <p className="text-gray-500 text-sm">{promos.length} promos activas</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <span>+</span> Nueva promo
        </button>
      </div>

      {/* ── Promo del día (destacada) ── */}
      <div className="bg-white rounded-2xl shadow-card p-5 mb-6 border-2 border-amber-100">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <h2 className="font-bold text-gray-900">Promo del día</h2>
          </div>
          <button
            type="button"
            onClick={() => setPd((p) => ({ ...p, active: !p.active }))}
            aria-label="Activar promo del día"
            style={{
              position: "relative", flexShrink: 0, width: 52, height: 30,
              borderRadius: 999, border: "none", cursor: "pointer", padding: 0,
              background: pd.active ? "#22c55e" : "#d1d5db",
              transition: "background 220ms cubic-bezier(0.25,1,0.5,1)",
            }}
          >
            <span style={{
              position: "absolute", top: 3, left: pd.active ? 25 : 3,
              width: 24, height: 24, background: "white", borderRadius: "50%",
              boxShadow: "0 1px 4px rgba(0,0,0,0.22)",
              transition: "left 220ms cubic-bezier(0.25,1,0.5,1)", display: "block",
            }} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">Se muestra destacada en grande en la página principal</p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Título</label>
              <input value={pd.name} onChange={(e) => setPd({ ...pd, name: e.target.value })} className="input-field" placeholder="Promo Mundialista" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Detalle</label>
              <input value={pd.detail} onChange={(e) => setPd({ ...pd, detail: e.target.value })} className="input-field" placeholder="Kilo + ½ Kilo + Empanadas" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Precio (ARS)</label>
              <input type="number" value={pd.price} onChange={(e) => setPd({ ...pd, price: Number(e.target.value) })} className="input-field" placeholder="22100" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-1.5 block">Imagen</label>
            <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gray-50 mb-2 flex items-center justify-center">
              {pd.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pd.image} alt="Promo del día" className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-300 text-3xl">🖼️</span>
              )}
            </div>
            <input ref={pdFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPdImage(f); e.target.value = ""; }} />
            <button type="button" onClick={() => pdFileRef.current?.click()} disabled={pdUploading} className="w-full border-2 border-grido-primary text-grido-primary font-semibold rounded-xl py-2.5 text-sm active:scale-95 transition-transform disabled:opacity-50">
              {pdUploading ? "Subiendo..." : pd.image ? "Cambiar imagen" : "Subir imagen"}
            </button>
          </div>
        </div>

        <button onClick={savePd} disabled={pdSaving} className="w-full btn-primary h-11 mt-4">
          {pdSaving ? "Guardando..." : "Guardar promo del día"}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {promos.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-card">
              <p className="text-lg font-medium mb-1">Sin promociones</p>
              <p className="text-sm">Creá la primera para que aparezca en la página</p>
            </div>
          )}
          {promos.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl shadow-card flex items-center gap-4 px-5 py-4">
              {/* Image */}
              <div className="relative w-20 h-16 rounded-xl overflow-hidden bg-amber-50 flex-shrink-0">
                {p.image
                  ? <Image src={p.image} alt={p.title} fill className="object-contain p-1" sizes="80px" />
                  : <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                    </div>
                }
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900 truncate">{p.title}</p>
                  {p.badge && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">{p.badge}</span>}
                </div>
                {p.description && <p className="text-sm text-gray-500 truncate mt-0.5">{p.description}</p>}
              </div>
              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(p)}
                  style={{
                    position: "relative", flexShrink: 0, width: 44, height: 26,
                    borderRadius: 999, border: "none", cursor: "pointer", padding: 0,
                    background: p.active ? "#22c55e" : "#d1d5db",
                    transition: "background 220ms cubic-bezier(0.25,1,0.5,1)",
                  }}
                >
                  <span style={{
                    position: "absolute", top: 3, left: p.active ? 21 : 3,
                    width: 20, height: 20, background: "white", borderRadius: "50%",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.22)",
                    transition: "left 220ms cubic-bezier(0.25,1,0.5,1)", display: "block",
                  }} />
                </button>
                <button onClick={() => openEdit(p)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 text-sm hover:bg-blue-100">✏️</button>
                <button onClick={() => handleDelete(p.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 text-sm hover:bg-red-100">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowForm(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md z-50 bg-white shadow-modal flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-lg">{editing ? "Editar promoción" : "Nueva promoción"}</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Título *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Combo Tentación" className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Descripción</label>
                <input value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="2 potes + vasito gratis" className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Badge</label>
                  <input value={form.badge || ""} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Nuevo · Oferta" className="input-field" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Orden</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="input-field" />
                </div>
              </div>

              {/* Image upload */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Imagen</label>
                {form.image && (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gray-50 mb-3">
                    <Image src={form.image} alt="Preview" fill className="object-contain p-2" sizes="400px" />
                    <button onClick={() => setForm((p) => ({ ...p, image: "" }))} className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center text-sm">✕</button>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }} />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full h-20 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:border-grido-primary hover:bg-blue-50/50 transition-colors disabled:opacity-50">
                  {uploading
                    ? <><div className="w-5 h-5 border-2 border-grido-primary border-t-transparent rounded-full animate-spin" /><span className="text-sm text-gray-500">Subiendo...</span></>
                    : <><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><span className="text-sm text-gray-500">{form.image ? "Cambiar imagen" : "Subir imagen"}</span></>
                  }
                </button>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-grido-primary" />
                <span className="text-sm font-medium text-gray-700">Activa (visible en la página)</span>
              </label>
            </div>

            <div className="px-6 py-4 border-t border-gray-100">
              <button onClick={handleSave} disabled={saving} className="w-full btn-primary h-12">
                {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear promoción"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
