"use client";

import { useRef, useLayoutEffect, useState, useCallback } from "react";
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
  const didMount = useRef(false);

  // Slider position controlled by React state — no GSAP positioning conflicts
  const [slider, setSlider] = useState({ left: 0, width: 0, ready: false });

  const measureSlider = useCallback((idx: number) => {
    const pill = pillRefs.current[idx];
    if (!pill) return;
    const left = pill.offsetLeft;
    const width = pill.offsetWidth;
    // Debug: log what we're measuring
    console.log("[CategoryFilter] pill idx:", idx, "offsetLeft:", left, "offsetWidth:", width);
    setSlider({ left, width, ready: true });
  }, []);

  // Measure on first real render (after loading)
  useLayoutEffect(() => {
    if (loading || didMount.current) return;
    didMount.current = true;

    const idx = options.findIndex((c) => c.slug === selected);
    measureSlider(idx === -1 ? 0 : idx);

    // Staggered pill entrance
    const pills = pillRefs.current.filter(Boolean);
    gsap.fromTo(
      pills,
      { y: 14, autoAlpha: 0, scale: 0.88 },
      {
        y: 0,
        autoAlpha: 1,
        scale: 1,
        duration: 0.55,
        stagger: { each: 0.05, ease: "power2.out" },
        ease: "expo.out",
        clearProps: "all",
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Re-measure when selection changes
  useLayoutEffect(() => {
    if (!didMount.current) return;
    const idx = options.findIndex((c) => c.slug === selected);
    if (idx === -1) return;
    measureSlider(idx);

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
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
        {[64, 108, 76, 90, 106, 80, 72].map((w, i) => (
          <div key={i} className="skeleton flex-shrink-0" style={{ width: w, height: 44, borderRadius: 999 }} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative -mx-4">
      {/* Scroll edge fades */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-5 z-20"
        style={{ background: "linear-gradient(to right, #fff, transparent)" }} />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-5 z-20"
        style={{ background: "linear-gradient(to left, #fff, transparent)" }} />

      {/* Scrollable track — position:relative so absolute children position against it */}
      <div
        className="relative flex gap-1.5 overflow-x-auto pb-3 px-4 scrollbar-hide"
        role="tablist"
        aria-label="Categorías"
      >
        {/* Glow — CSS-transition animated, exact same left/width as slider */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: slider.left,
            width: slider.width,
            height: 44,
            borderRadius: 999,
            background: "rgba(19,67,133,0.2)",
            filter: "blur(14px)",
            pointerEvents: "none",
            zIndex: 0,
            opacity: slider.ready ? 1 : 0,
            transition: slider.ready
              ? "left 0.6s cubic-bezier(0.16,1,0.3,1), width 0.6s cubic-bezier(0.16,1,0.3,1), opacity 0.3s"
              : "none",
          }}
        />

        {/* Sliding pill — pure CSS transition, React state drives left/width */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: slider.left,
            width: slider.width,
            height: 44,
            borderRadius: 999,
            background: "linear-gradient(135deg, #1a54a8 0%, #0d2d5e 100%)",
            boxShadow:
              "0 4px 20px rgba(19,67,133,0.4), 0 1px 4px rgba(19,67,133,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
            pointerEvents: "none",
            zIndex: 1,
            opacity: slider.ready ? 1 : 0,
            transition: slider.ready
              ? "left 0.55s cubic-bezier(0.16,1,0.3,1), width 0.55s cubic-bezier(0.16,1,0.3,1), opacity 0.3s"
              : "none",
          }}
        />

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
              className="relative flex-shrink-0 whitespace-nowrap select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grido-primary focus-visible:ring-offset-2"
              style={{
                height: 44,
                paddingLeft: 20,
                paddingRight: 20,
                borderRadius: 999,
                zIndex: 2,
                background: active ? "transparent" : "rgba(0,0,0,0.04)",
                border: "none",
                outline: "none",
                cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', 'Nunito', system-ui, sans-serif",
                fontSize: 13.5,
                fontWeight: active ? 700 : 500,
                letterSpacing: active ? "-0.02em" : "0.005em",
                color: active ? "#ffffff" : "#71717a",
                transition: "color 380ms cubic-bezier(0.16,1,0.3,1), background 200ms",
                display: "flex",
                alignItems: "center",
                gap: cat.icon ? 5 : 0,
              }}
            >
              {cat.icon && (
                <span style={{ fontSize: 15, lineHeight: 1, display: "inline-block" }}>
                  {cat.icon}
                </span>
              )}
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
