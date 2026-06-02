"use client";

import { useRef, useEffect } from "react";
import { gsap } from "@/lib/gsap";

interface Promo {
  id: string;
  label: string;
  detail: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

const PROMOS: Promo[] = [
  {
    id: "envio",
    label: "Envío gratis",
    detail: "en pedidos +$8.000",
    highlight: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" fill="currentColor" stroke="none" />
        <circle cx="18.5" cy="18.5" r="2.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: "efectivo",
    label: "10% off",
    detail: "pagando en efectivo",
    highlight: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="5" x2="5" y2="19" />
        <circle cx="6.5" cy="6.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
      </svg>
    ),
  },
  {
    id: "martes",
    label: "2x1 los martes",
    detail: "en vasitos",
    highlight: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12V22H4V12" />
        <path d="M22 7H2v5h20V7z" />
        <path d="M12 22V7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
  },
  {
    id: "transferencia",
    label: "Transferencia",
    detail: "sin costo extra",
    highlight: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
];

export function PromoStrip() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = containerRef.current?.querySelectorAll(".promo-card");
    if (!cards?.length) return;

    gsap.fromTo(
      Array.from(cards),
      { x: 20, autoAlpha: 0 },
      {
        x: 0,
        autoAlpha: 1,
        duration: 0.42,
        stagger: 0.07,
        ease: "power4.out",
        delay: 0.55,
        clearProps: "all",
      }
    );
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1"
      role="list"
      aria-label="Promociones activas"
    >
      {PROMOS.map((promo) => (
        <div
          key={promo.id}
          role="listitem"
          className="promo-card flex-shrink-0 flex items-center gap-2.5 rounded-2xl px-4"
          style={{
            height: 54,
            minWidth: 170,
            background: promo.highlight
              ? "#f7b731"
              : "rgba(255,255,255,0.13)",
            border: promo.highlight
              ? "none"
              : "1px solid rgba(255,255,255,0.18)",
            color: promo.highlight ? "#0d2050" : "white",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          {/* Icon */}
          <span
            className="flex-shrink-0 opacity-90"
            style={{ color: promo.highlight ? "#0d2050" : "white" }}
          >
            {promo.icon}
          </span>

          {/* Text */}
          <div>
            <p
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 800,
                fontSize: 13,
                lineHeight: 1.1,
                color: promo.highlight ? "#0d2050" : "white",
              }}
            >
              {promo.label}
            </p>
            <p
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 500,
                fontSize: 11,
                lineHeight: 1.2,
                marginTop: 1,
                color: promo.highlight ? "rgba(13,32,80,0.7)" : "rgba(255,255,255,0.65)",
              }}
            >
              {promo.detail}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
