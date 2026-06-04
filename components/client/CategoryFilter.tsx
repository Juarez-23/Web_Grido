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
  const pillRefs   = useRef<(HTMLButtonElement | null)[]>([]);
  const bgRefs     = useRef<(HTMLSpanElement | null)[]>([]);
  const glowRefs   = useRef<(HTMLSpanElement | null)[]>([]);
  const didMount   = useRef(false);

  // ── Entrada staggered ────────────────────────────────────────────────────
  useLayoutEffect(() => {
    if (loading || didMount.current) return;
    didMount.current = true;
    const pills = pillRefs.current.filter(Boolean);
    gsap.fromTo(
      pills,
      { y: 20, autoAlpha: 0, scale: 0.82 },
      {
        y: 0, autoAlpha: 1, scale: 1,
        duration: 0.65,
        stagger: { each: 0.06, ease: "power2.out" },
        ease: "expo.out",
        clearProps: "all",
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // ── Animación al cambiar selección ───────────────────────────────────────
  useLayoutEffect(() => {
    if (!didMount.current) return;
    const idx = options.findIndex((c) => c.slug === selected);
    if (idx === -1) return;

    const bg   = bgRefs.current[idx];
    const glow = glowRefs.current[idx];
    const pill = pillRefs.current[idx];

    // Fondo: scale spring desde centro
    if (bg) {
      gsap.fromTo(bg,
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2.4)" }
      );
    }
    // Glow fade in
    if (glow) {
      gsap.fromTo(glow,
        { opacity: 0, scale: 0.6 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" }
      );
    }
    // Pill pop
    if (pill) {
      gsap.fromTo(pill,
        { scale: 0.9 },
        { scale: 1, duration: 0.55, ease: "back.out(2.8)" }
      );
      pill.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  // ── Hover / Press ─────────────────────────────────────────────────────────
  const onEnter = useCallback((i: number) => {
    const el = pillRefs.current[i];
    if (!el || el.getAttribute("aria-selected") === "true") return;
    gsap.to(el, { y: -2, scale: 1.06, duration: 0.2, ease: "power2.out" });
  }, []);

  const onLeave = useCallback((i: number) => {
    const el = pillRefs.current[i];
    if (!el) return;
    gsap.to(el, { y: 0, scale: 1, duration: 0.35, ease: "expo.out" });
  }, []);

  const onDown = useCallback((i: number) => {
    const el = pillRefs.current[i];
    if (!el) return;
    gsap.to(el, { scale: 0.91, duration: 0.1, ease: "power3.in" });
  }, []);

  const onUp = useCallback((i: number) => {
    const el = pillRefs.current[i];
    if (!el) return;
    gsap.to(el, { scale: 1, y: 0, duration: 0.5, ease: "back.out(2.6)" });
  }, []);

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
        {[52, 76, 62, 70, 80, 64, 58].map((w, i) => (
          <div key={i} className="skeleton flex-shrink-0"
            style={{ width: w, height: 38, borderRadius: 999 }} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative -mx-4">
      {/* Fade edges para indicar scroll */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-6 z-20"
        style={{ background: "linear-gradient(to right, #fff 40%, transparent)" }} />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-6 z-20"
        style={{ background: "linear-gradient(to left, #fff 40%, transparent)" }} />

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
              onClick={() => { if (!active) onSelect(cat.slug); }}
              onPointerEnter={() => onEnter(i)}
              onPointerLeave={() => onLeave(i)}
              onPointerDown={() => onDown(i)}
              onPointerUp={() => onUp(i)}
              className="relative flex-shrink-0 whitespace-nowrap select-none flex items-center rounded-full cursor-pointer border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d2050] focus-visible:ring-offset-2"
              style={{
                height: 38,
                paddingLeft: active ? 20 : 16,
                paddingRight: active ? 20 : 16,
                background: "transparent",
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                color: active ? "#fff" : "#6b7280",
                letterSpacing: active ? "-0.01em" : "0em",
                transition: "color 250ms cubic-bezier(0.16,1,0.3,1), font-weight 250ms, letter-spacing 250ms, padding 250ms cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              {/* Track inactivo — gris base siempre visible */}
              <span aria-hidden style={{
                position: "absolute", inset: 0, borderRadius: 999,
                background: "#f0f1f3",
                pointerEvents: "none", zIndex: 0,
              }} />

              {/* Track activo — gradiente azul marino con spring */}
              <span
                ref={(el) => { bgRefs.current[i] = el; }}
                aria-hidden
                style={{
                  position: "absolute", inset: 0, borderRadius: 999,
                  background: "linear-gradient(135deg, #1a3a9e 0%, #0d2050 60%, #091840 100%)",
                  boxShadow: "0 2px 10px rgba(13,32,80,0.30), inset 0 1px 0 rgba(255,255,255,0.12)",
                  opacity: active ? 1 : 0,
                  pointerEvents: "none", zIndex: 1,
                  transformOrigin: "center",
                }}
              />

              {/* Glow difuso detrás del pill activo */}
              <span
                ref={(el) => { glowRefs.current[i] = el; }}
                aria-hidden
                style={{
                  position: "absolute",
                  inset: -6, borderRadius: 999,
                  background: "rgba(13,32,80,0.18)",
                  filter: "blur(10px)",
                  opacity: active ? 1 : 0,
                  pointerEvents: "none", zIndex: 0,
                }}
              />

              {/* Dot indicador en pills inactivos al hacer hover */}
              {/* Texto */}
              <span style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 5 }}>
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
