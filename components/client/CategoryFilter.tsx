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

  // ── Stagger entrance on first load ─────────────────────────────────────────
  useEffect(() => {
    if (loading || didMount.current) return;
    didMount.current = true;

    const pills = pillRefs.current.filter(Boolean);
    if (!pills.length) return;

    gsap.fromTo(
      pills,
      { y: 14, autoAlpha: 0, scale: 0.92 },
      {
        y: 0,
        autoAlpha: 1,
        scale: 1,
        duration: 0.4,
        stagger: 0.05,
        ease: "power4.out",
        clearProps: "all",
      }
    );
  }, [loading]);

  // ── Active pill pop ─────────────────────────────────────────────────────────
  const handleSelect = useCallback(
    (slug: string, idx: number) => {
      if (slug === selected) return;

      // Outgoing pill — subtle shrink
      const currentIdx = options.findIndex((o) => o.slug === selected);
      const outgoing = pillRefs.current[currentIdx];
      if (outgoing) {
        gsap.fromTo(outgoing, { scale: 1 }, { scale: 0.96, duration: 0.12, ease: "power2.in", yoyo: true, repeat: 1 });
      }

      // Incoming pill — satisfying pop
      const incoming = pillRefs.current[idx];
      if (incoming) {
        gsap.fromTo(incoming, { scale: 0.88 }, { scale: 1, duration: 0.32, ease: "power4.out" });
      }

      onSelect(slug);
    },
    [selected, onSelect, options]
  );

  if (loading) {
    return (
      <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-4 px-4" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="skeleton flex-shrink-0 rounded-full"
            style={{ width: i === 0 ? 72 : 100 + i * 8, height: 42 }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex gap-2.5 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide"
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
            className="category-pill flex-shrink-0 rounded-full select-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-grido-primary"
            style={{
              height: 44,
              padding: "0 22px",
              fontFamily: "'Poppins', system-ui, sans-serif",
              fontSize: 13.5,
              fontWeight: 600,
              letterSpacing: "0.01em",
              background: active ? "#0d2050" : "#eef1f8",
              color: active ? "#ffffff" : "#4b5563",
              boxShadow: active
                ? "0 4px 16px rgba(13,32,80,0.30)"
                : "none",
              transition:
                "background 180ms cubic-bezier(0.25,1,0.5,1), color 180ms cubic-bezier(0.25,1,0.5,1), box-shadow 200ms cubic-bezier(0.25,1,0.5,1)",
            }}
            onPointerDown={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(0.94)";
              (e.currentTarget as HTMLElement).style.transition = "transform 100ms cubic-bezier(0.25,1,0.5,1)";
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
