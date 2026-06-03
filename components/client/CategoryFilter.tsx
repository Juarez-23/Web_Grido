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
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const didMount = useRef(false);

  // Entrance animation
  useEffect(() => {
    if (loading || didMount.current) return;
    didMount.current = true;
    const pills = pillRefs.current.filter(Boolean);
    if (!pills.length) return;
    gsap.fromTo(
      pills,
      { y: 16, autoAlpha: 0, scale: 0.9 },
      {
        y: 0,
        autoAlpha: 1,
        scale: 1,
        duration: 0.5,
        stagger: { each: 0.055, ease: "power2.out" },
        ease: "back.out(1.6)",
        clearProps: "all",
      }
    );
  }, [loading]);

  // Active pill pop animation
  useEffect(() => {
    if (!didMount.current) return;
    const idx = options.findIndex((c) => c.slug === selected);
    const el = pillRefs.current[idx];
    if (!el) return;
    gsap.fromTo(
      el,
      { scale: 0.88 },
      { scale: 1, duration: 0.45, ease: "back.out(2.2)" }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const handleSelect = useCallback(
    (slug: string) => {
      if (slug === selected) return;
      onSelect(slug);
    },
    [selected, onSelect]
  );

  const handlePointerEnter = useCallback((i: number) => {
    const el = pillRefs.current[i];
    if (!el || el.getAttribute("aria-selected") === "true") return;
    gsap.to(el, { y: -2, scale: 1.04, duration: 0.22, ease: "power2.out" });
  }, []);

  const handlePointerLeave = useCallback((i: number) => {
    const el = pillRefs.current[i];
    if (!el || el.getAttribute("aria-selected") === "true") return;
    gsap.to(el, { y: 0, scale: 1, duration: 0.28, ease: "power2.out" });
  }, []);

  const handlePointerDown = useCallback((i: number) => {
    const el = pillRefs.current[i];
    if (!el) return;
    gsap.to(el, { scale: 0.93, duration: 0.12, ease: "power2.in" });
  }, []);

  const handlePointerUp = useCallback((i: number) => {
    const el = pillRefs.current[i];
    if (!el) return;
    gsap.to(el, { scale: 1, duration: 0.32, ease: "back.out(2)" });
  }, []);

  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {[72, 110, 80, 95, 110, 85].map((w, i) => (
          <div key={i} className="skeleton flex-shrink-0 rounded-full" style={{ width: w, height: 52 }} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide"
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
            onClick={() => handleSelect(cat.slug)}
            onPointerEnter={() => handlePointerEnter(i)}
            onPointerLeave={() => handlePointerLeave(i)}
            onPointerDown={() => handlePointerDown(i)}
            onPointerUp={() => handlePointerUp(i)}
            className={[
              "category-pill flex-shrink-0 whitespace-nowrap rounded-full select-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grido-primary focus-visible:ring-offset-2",
              active
                ? "bg-[#0d2050] text-white"
                : "bg-gray-50 text-gray-500",
            ].join(" ")}
            style={{
              height: 52,
              paddingLeft: 26,
              paddingRight: 26,
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              fontSize: 14.5,
              fontWeight: active ? 700 : 500,
              letterSpacing: active ? "0.02em" : "0.01em",
              boxShadow: active
                ? "0 8px 24px rgba(13,32,80,0.28), 0 2px 8px rgba(13,32,80,0.14)"
                : "none",
              transition: "background 200ms cubic-bezier(0.25,1,0.5,1), color 200ms, box-shadow 240ms cubic-bezier(0.25,1,0.5,1), font-weight 200ms",
            }}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
