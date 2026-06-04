"use client";

import { useRef, useLayoutEffect, useCallback } from "react";
import { gsap } from "@/lib/gsap";
import type { Category } from "@/types";

interface Props {
  categories: Category[];
  selected: string;
  onSelect: (slug: string) => void;
  loading?: boolean;
}

const ALL: Category = {
  id: "todos",
  name: "Todos",
  slug: "todos",
  icon: "",
  order: -1,
  active: true,
};

// El fondo activo vive DENTRO de cada pill como una capa absoluta.
// Cuando la categoría se activa → opacity 1. Cuando se desactiva → opacity 0.
// CSS transition sobre opacity: correcto 100% del tiempo, sin mediciones externas.

export function CategoryFilter({ categories, selected, onSelect, loading }: Props) {
  const options = [ALL, ...categories];
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const bgRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const didMount = useRef(false);

  // Entrada staggered de las pills
  useLayoutEffect(() => {
    if (loading || didMount.current) return;
    didMount.current = true;

    const pills = pillRefs.current.filter(Boolean);
    gsap.fromTo(
      pills,
      { y: 14, autoAlpha: 0, scale: 0.88 },
      {
        y: 0, autoAlpha: 1, scale: 1,
        duration: 0.55,
        stagger: { each: 0.05, ease: "power2.out" },
        ease: "expo.out",
        clearProps: "all",
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Spring en el pill recién activo
  useLayoutEffect(() => {
    if (!didMount.current) return;
    const idx = options.findIndex((c) => c.slug === selected);
    if (idx === -1) return;
    const el = pillRefs.current[idx];
    if (el) {
      gsap.fromTo(el, { scale: 0.88 }, { scale: 1, duration: 0.5, ease: "back.out(2.6)" });
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  // Magnetic hover
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>, i: number) => {
    const el = pillRefs.current[i];
    if (!el || el.getAttribute("aria-selected") === "true") return;
    const rect = el.getBoundingClientRect();
    gsap.to(el, {
      x: (e.clientX - (rect.left + rect.width / 2)) * 0.2,
      y: (e.clientY - (rect.top + rect.height / 2)) * 0.14,
      duration: 0.28,
      ease: "power2.out",
    });
  }, []);

  const handlePointerLeave = useCallback((i: number) => {
    const el = pillRefs.current[i];
    if (!el) return;
    gsap.to(el, { x: 0, y: 0, duration: 0.65, ease: "elastic.out(1, 0.35)" });
  }, []);

  const handlePointerDown = useCallback((i: number) => {
    const el = pillRefs.current[i];
    if (!el) return;
    gsap.to(el, { scale: 0.91, duration: 0.1, ease: "power3.in" });
  }, []);

  const handlePointerUp = useCallback((i: number) => {
    const el = pillRefs.current[i];
    if (!el) return;
    gsap.to(el, { scale: 1, x: 0, y: 0, duration: 0.5, ease: "back.out(2.2)" });
  }, []);

  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {[80, 145, 96, 112, 128, 102, 90].map((w, i) => (
          <div key={i} className="skeleton flex-shrink-0"
            style={{ width: w, height: 60, borderRadius: 999 }} />
        ))}
      </div>
    );
  }

  const EASE = "cubic-bezier(0.16,1,0.3,1)";

  return (
    <div className="relative -mx-4">
      {/* Fade edges */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-5 z-20"
        style={{ background: "linear-gradient(to right, #fff, transparent)" }} />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-5 z-20"
        style={{ background: "linear-gradient(to left, #fff, transparent)" }} />

      <div
        className="flex gap-2 overflow-x-auto pb-3 px-4 scrollbar-hide"
        role="tablist"
        aria-label="Categorías"
      >
        {options.map((cat, i) => {
          const active = selected === cat.slug;
          return (
            <button
              key={cat.id}
              ref={(el) => { pillRefs.current[i] = el; }}
              role="tab"
              aria-selected={active}
              onClick={() => { if (cat.slug !== selected) onSelect(cat.slug); }}
              onPointerMove={(e) => handlePointerMove(e, i)}
              onPointerLeave={() => handlePointerLeave(i)}
              onPointerDown={() => handlePointerDown(i)}
              onPointerUp={() => handlePointerUp(i)}
              className={[
                "relative flex-shrink-0 whitespace-nowrap select-none",
                "flex items-center rounded-full cursor-pointer border-0",
                "h-[46px] px-[22px]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grido-primary focus-visible:ring-offset-2",
                active ? "text-white font-extrabold" : "text-gray-500 font-medium",
              ].join(" ")}
              style={{
                fontFamily: "'Plus Jakarta Sans', 'Nunito', system-ui, sans-serif",
                fontSize: 14,
                letterSpacing: active ? "-0.025em" : "0em",
                background: "transparent",
                gap: cat.icon ? 7 : 0,
                transition: `color 350ms ${EASE}`,
              }}
            >
              {/* Fondo activo */}
              <span
                ref={(el) => { bgRefs.current[i] = el; }}
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 999,
                  background: "linear-gradient(135deg, #1e5bb8 0%, #0d2d5e 100%)",
                  boxShadow: "0 8px 28px rgba(19,67,133,0.5), 0 2px 8px rgba(19,67,133,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                  opacity: active ? 1 : 0,
                  transition: `opacity 250ms ${EASE}`,
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
              {/* Fondo inactivo */}
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 999,
                  background: "#f3f4f6",
                  opacity: active ? 0 : 1,
                  transition: `opacity 250ms ${EASE}`,
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
              {/* Glow */}
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  inset: -10,
                  borderRadius: 999,
                  background: "rgba(19,67,133,0.25)",
                  filter: "blur(16px)",
                  opacity: active ? 1 : 0,
                  transition: `opacity 400ms ${EASE}`,
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
              {/* Contenido */}
              <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: cat.icon ? 7 : 0 }}>
                {cat.icon && (
                  <span style={{ fontSize: 17, lineHeight: 1, display: "inline-block" }}>
                    {cat.icon}
                  </span>
                )}
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
