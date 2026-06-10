"use client";

import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/whatsapp";
import toast from "react-hot-toast";

// ─── Datos de la Promo del día ──────────────────────────────────────────────
// Para cambiarla, reemplazá la imagen /public/promo.jpeg y estos valores.
const PROMO = {
  id: "promo-del-dia",
  name: "Promo Mundialista",
  price: 22100,
  image: "/promo.jpeg",
};

export function PromoDelDia() {
  const { addItem, openCart } = useCartStore();

  const handleAdd = () => {
    const virtualProduct: Product = {
      id: PROMO.id,
      name: PROMO.name,
      description: undefined,
      price: PROMO.price,
      image: PROMO.image,
      maxFlavors: 0,
      active: true,
      featured: false,
      categoryId: "promo",
      category: { id: "promo", name: "Promoción", slug: "promo", icon: "", order: 0, active: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addItem(virtualProduct, []);
    toast.success("¡Promo del día agregada! 🎉");
    openCart();
  };

  return (
    <section className="mt-7">
      {/* Encabezado de sección */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] leading-none"
          style={{ background: "#f7b731", color: "#0d2050", fontFamily: "'Nunito', sans-serif", fontWeight: 800, letterSpacing: "0.04em" }}
        >
          🔥 PROMO DEL DÍA
        </span>
        <span className="h-px flex-1" style={{ background: "linear-gradient(to right, rgba(247,183,49,0.5), transparent)" }} />
      </div>

      {/* Card protagonista */}
      <div
        className="promo-dia-card relative overflow-hidden rounded-3xl"
        style={{
          background: "radial-gradient(120% 100% at 50% 0%, #11286e 0%, #0a1648 60%, #070f33 100%)",
          boxShadow: "0 18px 50px rgba(8,18,80,0.35), 0 4px 16px rgba(8,18,80,0.25)",
        }}
      >
        {/* Glow dorado decorativo */}
        <div
          className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(247,183,49,0.30) 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-16 w-52 h-52 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)" }}
        />

        <div className="relative p-4 sm:p-5 flex flex-col items-center">
          {/* Flyer — se recorta la franja del precio (queda en el botón) */}
          <button
            onClick={handleAdd}
            aria-label="Agregar la promo del día"
            className="block w-full max-w-[300px] active:scale-[0.98] transition-transform"
          >
            <div
              className="overflow-hidden rounded-2xl"
              style={{ aspectRatio: "1086 / 1231", boxShadow: "0 10px 30px rgba(0,0,0,0.35)" }}
            >
              <img
                src={PROMO.image}
                alt={PROMO.name}
                className="w-full h-full object-cover object-top"
                draggable={false}
                loading="lazy"
                decoding="async"
              />
            </div>
          </button>

          {/* CTA */}
          <button
            onClick={handleAdd}
            className="mt-4 w-full max-w-[320px] flex items-center justify-center gap-2 rounded-2xl py-3.5 active:scale-95 transition-transform"
            style={{
              background: "linear-gradient(180deg, #ffd25e 0%, #f7b731 100%)",
              color: "#0d2050",
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: 15,
              boxShadow: "0 6px 18px rgba(247,183,49,0.35)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Sumar al pedido · {formatPrice(PROMO.price)}
          </button>
        </div>
      </div>
    </section>
  );
}
