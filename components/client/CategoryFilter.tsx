"use client";

import { useRef, useEffect, useCallback } from "react";
import { gsap } from "@/lib/gsap";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
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

  // Stagger entrance — one shot on first render after data loads
  useEffect(() => {
    if (loading || didMount.current) return;
    didMount.current = true;
    const pills = pillRefs.current.filter(Boolean);
    if (!pills.length) return;

    gsap.fromTo(
      pills,
      { y: 16, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.36,
        stagger: 0.045,
        ease: "power4.out",
        clearProps: "all",
      }
    );
  }, [loading]);

  // Press → active pop
  const handleSelect = useCallback(
    (slug: string, idx: number) => {
      if (slug === selected) return;
      const el = pillRefs.current[idx];
      if (el) {
        gsap.fromTo(el, { scale: 0.91 }, { scale: 1, duration: 0.28, ease: "power4.out" });
      }
      onSelect(slug);
    },
    [selected, onSelect]
  );

  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="skeleton flex-shrink-0 rounded-2xl"
            style={{ width: 88, height: 86 }}
          />
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
            onClick={() => handleSelect(cat.slug, i)}
            className="category-pill flex-shrink-0 flex flex-col items-center justify-center gap-2 rounded-2xl select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-grido-primary"
            style={{
              width: 88,
              height: 86,
              background: active ? "#0d2050" : "#f4f6fb",
              border: active ? "none" : "1.5px solid #e8ecf5",
              boxShadow: active
                ? "0 6px 20px rgba(13,32,80,0.32), 0 2px 6px rgba(13,32,80,0.18)"
                : "none",
              transition:
                "background 200ms cubic-bezier(0.25,1,0.5,1), box-shadow 200ms cubic-bezier(0.25,1,0.5,1)",
            }}
            onPointerDown={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(0.94)";
              (e.currentTarget as HTMLElement).style.transition =
                "transform 100ms cubic-bezier(0.25,1,0.5,1)";
            }}
            onPointerUp={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
            onPointerLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
          >
            <CategoryIcon
              slug={cat.slug}
              size={26}
              color={active ? "#ffffff" : "#5a6a8a"}
            />
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
                color: active ? "#ffffff" : "#374151",
                textAlign: "center",
                maxWidth: 76,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {cat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
