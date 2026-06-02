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

  // Stagger entrance — one shot after data loads
  useEffect(() => {
    if (loading || didMount.current) return;
    didMount.current = true;
    const pills = pillRefs.current.filter(Boolean);
    if (!pills.length) return;

    gsap.fromTo(
      pills,
      { y: 10, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.38,
        stagger: 0.05,
        ease: "power4.out",
        clearProps: "all",
      }
    );
  }, [loading]);

  const handleSelect = useCallback(
    (slug: string, idx: number) => {
      if (slug === selected) return;
      const el = pillRefs.current[idx];
      if (el) {
        gsap.fromTo(el, { scale: 0.92 }, { scale: 1, duration: 0.3, ease: "power4.out" });
      }
      onSelect(slug);
    },
    [selected, onSelect]
  );

  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {[80, 110, 90, 100, 120, 95].map((w, i) => (
          <div key={i} className="skeleton flex-shrink-0 rounded-2xl" style={{ width: w, height: 44 }} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide"
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
            onClick={() => handleSelect(cat.slug, i)}
            className="category-pill flex-shrink-0 whitespace-nowrap rounded-2xl select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grido-primary focus-visible:ring-offset-2"
            style={{
              height: 44,
              padding: "0 18px",
              fontFamily: "'Poppins', system-ui, sans-serif",
              fontSize: 14,
              fontWeight: active ? 700 : 500,
              letterSpacing: "-0.01em",
              background: active ? "#0d2050" : "#ffffff",
              color: active ? "#ffffff" : "#374151",
              border: active ? "none" : "1.5px solid #e5e7eb",
              boxShadow: active
                ? "0 4px 14px rgba(13,32,80,0.25)"
                : "0 1px 3px rgba(0,0,0,0.05)",
              transition:
                "background 160ms cubic-bezier(0.25,1,0.5,1), color 160ms cubic-bezier(0.25,1,0.5,1), box-shadow 200ms cubic-bezier(0.25,1,0.5,1), font-weight 0ms",
            }}
            onPointerDown={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(0.95)";
              (e.currentTarget as HTMLElement).style.transition = "transform 80ms cubic-bezier(0.25,1,0.5,1)";
            }}
            onPointerUp={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              (e.currentTarget as HTMLElement).style.transition = "transform 200ms cubic-bezier(0.25,1,0.5,1)";
            }}
            onPointerLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
