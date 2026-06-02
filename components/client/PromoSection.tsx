"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";

interface Promotion {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  badge: string | null;
}

export function PromoSection() {
  const [promos, setPromos] = useState<Promotion[]>([]);
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
    gsap.fromTo(
      Array.from(cards),
      { x: 24, autoAlpha: 0 },
      { x: 0, autoAlpha: 1, duration: 0.4, stagger: 0.07, ease: "power4.out", clearProps: "all" }
    );
  }, [promos]);

  if (!promos.length) return null;

  return (
    <section className="max-w-2xl mx-auto px-4 mt-6">
      <h2
        className="mb-3"
        style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 15, color: "#0d2050", letterSpacing: "-0.02em" }}
      >
        Promociones
      </h2>
      <div ref={containerRef} className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {promos.map((promo) => (
          <div
            key={promo.id}
            className="promo-card flex-shrink-0 rounded-2xl overflow-hidden bg-white"
            style={{
              width: 240,
              boxShadow: "0 2px 12px rgba(13,32,80,0.10)",
            }}
          >
            {/* Image */}
            <div className="relative h-32 bg-gradient-to-br from-amber-50 to-orange-50">
              {promo.image ? (
                <Image src={promo.image} alt={promo.title} fill className="object-contain p-3" sizes="240px" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d4a574" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                  </svg>
                </div>
              )}
              {promo.badge && (
                <span
                  className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[11px] leading-none"
                  style={{ background: "#f7b731", color: "#0d2050", fontFamily: "'Nunito', sans-serif", fontWeight: 800 }}
                >
                  {promo.badge}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="px-3 py-2.5">
              <p
                className="leading-tight"
                style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13, color: "#0d2050" }}
              >
                {promo.title}
              </p>
              {promo.description && (
                <p
                  className="mt-0.5 line-clamp-2"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 12, color: "#6b7280" }}
                >
                  {promo.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
