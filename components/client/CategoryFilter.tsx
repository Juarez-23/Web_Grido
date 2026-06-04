"use client";

import { useRef, useEffect, useCallback } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const sliderRef = useRef<HTMLSpanElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);
  const didMount = useRef(false);

  // Position the floating slider under the active pill
  // Uses offsetLeft/offsetWidth to ignore any GSAP transforms on pills
  const positionSlider = useCallback((idx: number, animate: boolean) => {
    const pill = pillRefs.current[idx];
    const slider = sliderRef.current;
    const glow = glowRef.current;
    if (!pill || !slider) return;

    const x = pill.offsetLeft;
    const w = pill.offsetWidth;

    if (animate) {
      gsap.to(slider, { x, width: w, duration: 0.55, ease: "expo.out" });
      if (glow) gsap.to(glow, { x, width: w, duration: 0.65, ease: "expo.out" });
    } else {
      gsap.set(slider, { x, width: w });
      if (glow) gsap.set(glow, { x, width: w });
    }
  }, []);

  // Initial mount: position slider + staggered entrance
  useEffect(() => {
    if (loading || didMount.current) return;
    didMount.current = true;

    const idx = options.findIndex((c) => c.slug === selected);
    positionSlider(idx === -1 ? 0 : idx, false);

    // Reveal slider
    gsap.fromTo(
      [sliderRef.current, glowRef.current],
      { autoAlpha: 0, scaleX: 0.6, transformOrigin: "left center" },
      { autoAlpha: 1, scaleX: 1, duration: 0.5, delay: 0.1, ease: "back.out(1.5)" }
    );

    // Staggered pill entrance
    const pills = pillRefs.current.filter(Boolean);
    gsap.fromTo(
      pills,
      { y: 16, autoAlpha: 0, scale: 0.88, filter: "blur(3px)" },
      {
        y: 0,
        autoAlpha: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: 0.6,
        stagger: { each: 0.055, ease: "power3.out" },
        ease: "expo.out",
        clearProps: "all",
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Slide to new active pill
  useEffect(() => {
    if (!didMount.current) return;
    const idx = options.findIndex((c) => c.slug === selected);
    if (idx === -1) return;

    positionSlider(idx, true);

    // Spring pop on the newly active pill text
    const el = pillRefs.current[idx];
    if (el) {
      gsap.fromTo(el, { scale: 0.88 }, { scale: 1, duration: 0.55, ease: "back.out(2.8)" });
    }

    // Scroll active pill into view if needed
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  // Magnetic hover — signature Emil Kowalski micro-interaction
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>, i: number) => {
    const el = pillRefs.current[i];
    if (!el || el.getAttribute("aria-selected") === "true") return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    gsap.to(el, {
      x: (e.clientX - cx) * 0.22,
      y: (e.clientY - cy) * 0.16,
      duration: 0.3,
      ease: "power2.out",
    });
  }, []);

  const handlePointerLeave = useCallback((i: number) => {
    const el = pillRefs.current[i];
    if (!el) return;
    gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.35)" });
  }, []);

  const handlePointerDown = useCallback((i: number) => {
    const el = pillRefs.current[i];
    if (!el) return;
    gsap.to(el, { scale: 0.91, duration: 0.1, ease: "power3.in" });
  }, []);

  const handlePointerUp = useCallback((i: number) => {
    const el = pillRefs.current[i];
    if (!el) return;
    gsap.to(el, { scale: 1, x: 0, y: 0, duration: 0.55, ease: "back.out(2.4)" });
  }, []);

  if (loading) {
    return (
      <div className="relative flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
        {[68, 108, 78, 92, 106, 82, 72].map((w, i) => (
          <div
            key={i}
            className="skeleton flex-shrink-0"
            style={{ width: w, height: 44, borderRadius: 999 }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative -mx-4">
      {/* Soft edge fades for the scroll overflow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-6"
        style={{ background: "linear-gradient(to right, #fff 30%, transparent)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-6"
        style={{ background: "linear-gradient(to left, #fff 30%, transparent)" }}
      />

      <div
        ref={containerRef}
        className="relative flex gap-1.5 overflow-x-auto pb-3 px-4 scrollbar-hide"
        role="tablist"
        aria-label="Categorías"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* Diffused glow layer — renders before the pill so it bleeds outward */}
        <span
          ref={glowRef}
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            height: 44,
            transform: "translateY(-50%)",
            borderRadius: 999,
            background: "rgba(19,67,133,0.22)",
            filter: "blur(12px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Crisp sliding pill */}
        <span
          ref={sliderRef}
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: 44,
            borderRadius: 999,
            background: "linear-gradient(135deg, #1a54a8 0%, #0d2d5e 100%)",
            boxShadow:
              "0 4px 18px rgba(19,67,133,0.38), 0 1px 4px rgba(19,67,133,0.22), inset 0 1px 0 rgba(255,255,255,0.12)",
            pointerEvents: "none",
            zIndex: 1,
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
                background: "transparent",
                border: "none",
                outline: "none",
                cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', 'Nunito', system-ui, sans-serif",
                fontSize: 13.5,
                fontWeight: active ? 700 : 500,
                letterSpacing: active ? "-0.02em" : "0.005em",
                color: active ? "#ffffff" : "#71717a",
                transition:
                  "color 420ms cubic-bezier(0.16,1,0.3,1), font-weight 180ms",
                display: "flex",
                alignItems: "center",
                gap: cat.icon ? 6 : 0,
              }}
            >
              {cat.icon && (
                <span
                  style={{
                    fontSize: 15,
                    lineHeight: 1,
                    transition: "transform 300ms cubic-bezier(0.16,1,0.3,1)",
                    transform: active ? "scale(1.1)" : "scale(1)",
                  }}
                >
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
