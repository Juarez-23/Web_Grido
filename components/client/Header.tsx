"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { GridoLogo } from "@/components/ui/GridoLogo";

export function Header() {
  const { getItemCount, toggleCart } = useCartStore();
  const count = getItemCount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const headerRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      ScrollTrigger.create({
        start: "top top-=8",
        onEnter: () =>
          gsap.to(headerRef.current, { boxShadow: "0 2px 16px rgba(0,0,0,0.10)", duration: 0.3, overwrite: true }),
        onLeaveBack: () =>
          gsap.to(headerRef.current, { boxShadow: "none", duration: 0.3, overwrite: true }),
      });
    },
    { scope: headerRef }
  );

  useEffect(() => {
    if (count > 0 && badgeRef.current) {
      gsap.fromTo(badgeRef.current,
        { scale: 1.45 },
        { scale: 1, duration: 0.32, ease: "power4.out" }
      );
    }
  }, [count]);

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-30 bg-white"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {/* Contenido del header — siempre 56px de alto, centrado correctamente */}
      <div className="h-14 flex items-center justify-between px-4">

        {/* Logo Grido */}
        <div className="flex items-center gap-2.5">
          <GridoLogo size={36} />
          <div>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.03em", color: "#0d2050", lineHeight: 1 }}>
              grido
            </p>
            <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 500, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#9ca3af", marginTop: 2, lineHeight: 1 }}>
              San Rafael
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          {/* Contacto */}
          <Link
            href="/contacto"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 active:scale-90 transition-transform"
            aria-label="Contacto"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#134385" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </Link>

          {/* Carrito */}
          <button
            onClick={toggleCart}
            className="relative w-10 h-10 flex items-center justify-center rounded-2xl bg-blue-50 active:scale-90 transition-transform"
            aria-label={`Carrito con ${count} productos`}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#134385" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" fill="#134385" />
              <circle cx="20" cy="21" r="1" fill="#134385" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {mounted && count > 0 && (
              <span ref={badgeRef} className="cart-badge">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
