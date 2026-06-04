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

export function CategoryFilter({ categories, selected, onSelect, loading }: Props) {
  const options = [ALL, ...categories];
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const bgRefs  = useRef<(HTMLSpanElement | null)[]>([]);
  const didMount = useRef(false);
  const prevIdx  = useRef(-1);

  // ── Entrada staggered ────────────────────────────────────────────────────
  useLayoutEffect(() => {
    if (loading || didMount.current) return;
    didMount.current = true;

    // Inicializa el fondo activo invisible — lo revela GSAP abajo
    const initIdx = options.findIndex((c) => c.slug === selected);
    const initBg = bgRefs.current[initIdx === -1 ? 0 : initIdx];
    if (initBg) gsap.set(initBg, { opacity: 0, scale: 0.6 });

    const pills = pillRefs.current.filter(Boolean);
    gsap.fromTo(
      pills,
      { y: 18, autoAlpha: 0, scale: 0.85 },
      {
        y: 0, autoAlpha: 1, scale: 1,
        duration: 0.6,
        stagger: { each: 0.055, ease: "power2.out" },
        ease: "expo.out",
        clearProps: "all",
        onComplete: () => {
          // Activa el fondo del pill inicial con spring una vez terminada la entrada
          if (initBg) {
            gsap.to(initBg, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.8)" });
          }
          prevIdx.current = initIdx === -1 ? 0 : initIdx;
        },
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // ── Cambio de selección ───────────────────────────────────────────────────
  useLayoutEffect(() => {
    if (!didMount.current) return;

    const nextIdx = options.findIndex((c) => c.slug === selected);
    if (nextIdx === -1) return;

    const nextPill = pillRefs.current[nextIdx];
    const nextBg   = bgRefs.current[nextIdx];
    const prevBg   = bgRefs.current[prevIdx.current];

    // Desactiva el fondo anterior
    if (prevBg && prevIdx.current !== nextIdx) {
      gsap.to(prevBg, { opacity: 0, scale: 0.75, duration: 0.25, ease: "power2.in" });
    }

    // Activa el nuevo fondo con spring
    if (nextBg) {
      gsap.fromTo(nextBg,
        { opacity: 0, scale: 0.65 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }
      );
    }

    // Spring en el pill
    if (nextPill) {
      gsap.fromTo(nextPill,
        { scale: 0.9 },
        { scale: 1, duration: 0.55, ease: "back.out(2.8)" }
      );
      nextPill.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }

    prevIdx.current = nextIdx;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  // ── Hover / Press — solo en pills inactivos ───────────────────────────────
  const handlePointerEnter = useCallback((i: number) => {
    const el = pillRefs.current[i];
    if (!el || el.getAttribute("aria-selected") === "true") return;
    gsap.to(el, { y: -2, scale: 1.04, duration: 0.25, ease: "power2.out" });
  }, []);

  const handlePointerLeave = useCallback((i: number) => {
    const el = pillRefs.current[i];
    if (!el) return;
    gsap.to(el, { y: 0, scale: 1, duration: 0.4, ease: "expo.out" });
  }, []);

  const handlePointerDown = useCallback((i: number) => {
    const el = pillRefs.current[i];
    if (!el) return;
    gsap.to(el, { scale: 0.92, duration: 0.1, ease: "power3.in" });
  }, []);

  const handlePointerUp = useCallback((i: number) => {
    const el = pillRefs.current[i];
    if (!el) return;
    gsap.to(el, { scale: 1, y: 0, duration: 0.5, ease: "back.out(2.4)" });
  }, []);

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
        {[58, 80, 66, 74, 84, 68, 62].map((w, i) => (
          <div key={i} className="skeleton flex-shrink-0"
            style={{ width: w, height: 40, borderRadius: 999 }} />
        ))}
      </div>
    );
  }

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
              onPointerEnter={() => handlePointerEnter(i)}
              onPointerLeave={() => handlePointerLeave(i)}
              onPointerDown={() => handlePointerDown(i)}
              onPointerUp={() => handlePointerUp(i)}
              className={[
                "relative flex-shrink-0 whitespace-nowrap select-none",
                "flex items-center rounded-full cursor-pointer border-0",
                "h-[40px] px-[18px]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grido-primary focus-visible:ring-offset-2",
                active ? "text-white font-bold" : "text-gray-500 font-medium",
              ].join(" ")}
              style={{
                fontFamily: "'Plus Jakarta Sans', 'Nunito', system-ui, sans-serif",
                fontSize: 13,
                letterSpacing: active ? "-0.02em" : "0em",
                background: "transparent",
                transition: "color 300ms cubic-bezier(0.16,1,0.3,1), letter-spacing 300ms",
              }}
            >
              {/* Fondo activo — animado por GSAP */}
              <span
                ref={(el) => { bgRefs.current[i] = el; }}
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 999,
                  background: "linear-gradient(160deg, #1f00d0 0%, #1200a0 100%)",
                  boxShadow: "0 3px 12px rgba(18,0,160,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                  opacity: 0, // GSAP controla opacity
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
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
              {/* Glow */}
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  inset: -8,
                  borderRadius: 999,
                  background: "rgba(18,0,160,0.18)",
                  filter: "blur(12px)",
                  opacity: active ? 1 : 0,
                  transition: "opacity 400ms cubic-bezier(0.16,1,0.3,1)",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />
              {/* Texto — sin emojis */}
              <span style={{ position: "relative", zIndex: 1 }}>
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
