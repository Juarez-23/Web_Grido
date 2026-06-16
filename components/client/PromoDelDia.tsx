"use client";

import { useState } from "react";
import type { AppSettings } from "@/types";
import { formatPrice } from "@/lib/whatsapp";
import { PromoModal } from "@/components/client/PromoModal";

interface Props {
  settings: AppSettings | null;
}

export function PromoDelDia({ settings }: Props) {
  const [open, setOpen] = useState(false);

  // No mostrar si está desactivada o sin datos cargados
  if (!settings || !settings.promoDelDiaActive || !settings.promoDelDiaName) {
    return null;
  }

  const PROMO = {
    id: "promo-del-dia",
    name: settings.promoDelDiaName,
    detail: settings.promoDelDiaDetail,
    price: settings.promoDelDiaPrice,
    image: settings.promoDelDiaImage || "/promo-productos.webp",
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

      {/* Card horizontal compacta — abre el detalle */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Ver la promo del día"
        className="promo-dia-card relative w-full overflow-hidden rounded-3xl text-left active:scale-[0.985] transition-transform"
        style={{
          background: "linear-gradient(125deg, #1747cc 0%, #0f349f 50%, #0a2578 100%)",
          boxShadow: "0 16px 44px rgba(10,37,120,0.32), 0 4px 14px rgba(10,37,120,0.22)",
        }}
      >
        <div className="relative min-h-[148px]">
          {/* Imagen de fondo — desde el 30%; se funde con el gradient (máscara que arranca en el 30%) */}
          <div className="absolute inset-y-0 pointer-events-none" style={{ left: "30%", right: 0 }}>
            <img
              src={PROMO.image}
              alt={PROMO.name}
              className="promo-fade-img absolute inset-0 w-full h-full object-cover"
              draggable={false}
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* Izquierda: detalles + precio (encima, 35%) */}
          <div className="relative z-10 flex flex-col justify-center gap-1.5 p-4 sm:p-5" style={{ width: "35%" }}>
            <h3
              className="leading-none"
              style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "clamp(1.25rem, 5.5vw, 1.6rem)", color: "#fff", letterSpacing: "-0.02em" }}
            >
              {PROMO.name}
            </h3>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 600, fontSize: 12.5, color: "rgba(255,255,255,0.72)" }}>
              {PROMO.detail}
            </p>

            <div className="flex items-baseline gap-2 mt-1">
              <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "clamp(1.4rem, 6vw, 1.85rem)", color: "#f7b731", letterSpacing: "-0.02em" }}>
                {formatPrice(PROMO.price)}
              </span>
            </div>

            <span
              className="mt-2 inline-flex items-center gap-1.5 self-start rounded-xl px-3.5 py-2"
              style={{
                background: "linear-gradient(180deg, #ffd25e 0%, #f7b731 100%)",
                color: "#0d2050",
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 800,
                fontSize: 13,
                boxShadow: "0 6px 16px rgba(247,183,49,0.32)",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              Ver promo
            </span>
          </div>
        </div>
      </button>

      {/* Detalle de la promo */}
      {open && (
        <PromoModal
          promo={{
            id: PROMO.id,
            title: PROMO.name,
            description: PROMO.detail || null,
            image: PROMO.image || null,
            badge: null,
          }}
          price={PROMO.price}
          onClose={() => setOpen(false)}
        />
      )}
    </section>
  );
}
