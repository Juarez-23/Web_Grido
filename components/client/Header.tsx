"use client";

import { useRef, useEffect, useState } from "react";
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
      className="fixed top-0 left-0 right-0 z-30 bg-white h-14 flex items-center justify-between px-4"
    >
      {/* Logo Grido */}
      <div className="flex items-center gap-2.5">
        <GridoLogo size={38} />
        <div>
          <p className="font-black text-[#0d2050] text-[1.25rem] leading-none" style={{ letterSpacing: "-0.5px" }}>
            grido
          </p>
          <p className="text-gray-400 text-[10px] leading-none tracking-widest uppercase font-semibold mt-0.5">
            San Rafael
          </p>
        </div>
      </div>

      {/* Carrito */}
      <button
        onClick={toggleCart}
        className="relative w-11 h-11 flex items-center justify-center rounded-2xl bg-blue-50 active:scale-90 transition-transform"
        aria-label={`Carrito con ${count} productos`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#134385" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
    </header>
  );
}
