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

  useEffect(() => {
    if (loading || didMount.current) return;
    didMount.current = true;
    const pills = pillRefs.current.filter(Boolean);
    if (!pills.length) return;
    gsap.fromTo(
      pills,
      { y: 10, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.38, stagger: 0.05, ease: "power4.out", clearProps: "all" }
    );
  }, [loading]);

  const handleSelect = useCallback(
    (slug: string, idx: number) => {
      if (slug === selected) return;
      const el = pillRefs.current[idx];
      if (el) gsap.fromTo(el, { scale: 0.92 }, { scale: 1, duration: 0.3, ease: "power4.out" });
      onSelect(slug);
    },
    [selected, onSelect]
  );

  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {[72, 110, 80, 95, 110, 85].map((w, i) => (
          <div key={i} className="skeleton flex-shrink-0 rounded-full" style={{ width: w, height: 52 }} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide" role="tablist" aria-label="Categorías">
      {options.map((cat, i) => {
        const active = selected === cat.slug;
        return (
          <button
            key={cat.id}
            ref={(el) => { pillRefs.current[i] = el; }}
            role="tab"
            aria-selected={active}
            onClick={() => handleSelect(cat.slug, i)}
            onPointerDown={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(0.95)"; }}
            onPointerUp={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            onPointerLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            className={[
              "category-pill flex-shrink-0 whitespace-nowrap rounded-full select-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grido-primary focus-visible:ring-offset-2",
              active
                ? "bg-[#0d2050] text-white"
                : "bg-white text-gray-500 border border-gray-200",
            ].join(" ")}
            style={{
              height: 52,
              paddingLeft: active ? 28 : 22,
              paddingRight: active ? 28 : 22,
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              fontSize: 14.5,
              fontWeight: active ? 700 : 500,
              letterSpacing: active ? "0.02em" : "0.01em",
              boxShadow: active
                ? "0 6px 20px rgba(13,32,80,0.30)"
                : "0 1px 3px rgba(0,0,0,0.06)",
              transition: "background 160ms cubic-bezier(0.25,1,0.5,1), color 160ms, box-shadow 200ms cubic-bezier(0.25,1,0.5,1), transform 120ms cubic-bezier(0.25,1,0.5,1), padding 160ms cubic-bezier(0.25,1,0.5,1)",
            }}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
