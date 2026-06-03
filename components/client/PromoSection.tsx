"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { PromoModal } from "@/components/client/PromoModal";

interface Promotion {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  badge: string | null;
  price: number;
}

// Gradientes de fallback cuando no hay imagen
const FALLBACK_GRADIENTS = [
  "linear-gradient(135deg, #0d2050 0%, #1a3a7a 100%)",
  "linear-gradient(135deg, #1a3a7a 0%, #0d2050 60%, #0a1a40 100%)",
  "linear-gradient(135deg, #0a1a40 0%, #0d2050 100%)",
];

export function PromoSection() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [selected, setSelected] = useState<Promotion | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/promotions")
      .then((r) => r.json())
      .then((d) => setPromos(d.data || []));
  }, []);

  useEffect(() => {
    if (!promos.length || !containerRef.current) return;
    const cards = containerRef.current.querySelectorAll(".promo-card");
    if (!cards.length) return;

    // Set visible first, then animate from offset
    gsap.set(Array.from(cards), { opacity: 0, x: 24 });
    gsap.to(Array.from(cards), {
      opacity: 1,
      x: 0,
      duration: 0.42,
      stagger: 0.07,
      ease: "power4.out",
      delay: 0.1,
    });
  }, [promos]);

  if (!promos.length) return null;

  return (
    <section className="mt-6">
      <h2
        className="mb-3"
        style={{
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 700,
          fontSize: 15,
          color: "#0d2050",
          letterSpacing: "-0.02em",
        }}
      >
        Promociones
      </h2>

      <div
        ref={containerRef}
        className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x scrollbar-hide"
      >
        {promos.map((promo, i) => (
          <button
            key={promo.id}
            onClick={() => setSelected(promo)}
            className="promo-card flex-shrink-0 snap-start relative rounded-2xl overflow-hidden text-left"
            onPointerDown={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(0.97)"; }}
            onPointerUp={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            onPointerLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            aria-label={`Ver promoción: ${promo.title}`}
            style={{
              width: 280,
              height: 148,
              background: promo.image
                ? "#0d2050"
                : FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length],
              boxShadow: "0 4px 20px rgba(13,32,80,0.22)",
              transition: "transform 140ms cubic-bezier(0.25,1,0.5,1)",
            }}
          >
            {/* Background image */}
            {promo.image && (
              <Image
                src={promo.image}
                alt={promo.title}
                fill
                className="object-cover"
                sizes="280px"
              />
            )}

            {/* Gradient overlay — siempre presente para legibilidad */}
            <div
              className="absolute inset-0"
              style={{
                background: promo.image
                  ? "linear-gradient(160deg, rgba(13,32,80,0.18) 0%, rgba(13,32,80,0.75) 55%, rgba(13,32,80,0.95) 100%)"
                  : "none",
              }}
            />

            {/* Decorative circle — solo sin imagen */}
            {!promo.image && (
              <div
                className="absolute -right-8 -top-8 w-36 h-36 rounded-full"
                style={{ background: "rgba(247,183,49,0.15)" }}
              />
            )}

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-between p-4">
              {/* Badge */}
              {promo.badge && (
                <span
                  className="self-start px-2.5 py-1 rounded-full text-[11px] leading-none"
                  style={{
                    background: "#f7b731",
                    color: "#0d2050",
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 800,
                  }}
                >
                  {promo.badge}
                </span>
              )}

              {/* Text */}
              <div className={promo.badge ? "" : "mt-auto"}>
                <p
                  className="leading-tight"
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 800,
                    fontSize: 17,
                    color: "#ffffff",
                    textShadow: promo.image ? "0 1px 6px rgba(0,0,0,0.4)" : "none",
                  }}
                >
                  {promo.title}
                </p>
                {promo.description && (
                  <p
                    className="mt-0.5 line-clamp-2"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 400,
                      fontSize: 12,
                      color: "rgba(255,255,255,0.75)",
                      textShadow: promo.image ? "0 1px 4px rgba(0,0,0,0.4)" : "none",
                    }}
                  >
                    {promo.description}
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <PromoModal promo={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  );
}
