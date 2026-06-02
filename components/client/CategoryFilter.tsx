"use client";

import { useRef, useEffect } from "react";
import { gsap } from "@/lib/gsap";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import type { Category } from "@/types";

interface Props {
  categories: Category[];
  selected: string;
  onSelect: (slug: string) => void;
  loading?: boolean;
}

const ALL_CATEGORY: Category = {
  id: "todos",
  name: "Todos",
  slug: "todos",
  icon: "",
  order: -1,
  active: true,
};

export function CategoryFilter({ categories, selected, onSelect, loading }: Props) {
  const options = [ALL_CATEGORY, ...categories];
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const didMountRef = useRef(false);

  // ── Stagger entrance on first load ──────────────────────────────────────────
  useEffect(() => {
    if (loading || didMountRef.current) return;
    didMountRef.current = true;

    const pills = pillRefs.current.filter(Boolean);
    if (!pills.length) return;

    gsap.fromTo(
      pills,
      { y: 10, autoAlpha: 0, scale: 0.94 },
      {
        y: 0,
        autoAlpha: 1,
        scale: 1,
        duration: 0.32,
        stagger: 0.04,
        ease: "power4.out",
        clearProps: "all",
      }
    );
  }, [loading]);

  // ── Pop the newly active pill ───────────────────────────────────────────────
  const handleSelect = (slug: string, index: number) => {
    if (slug === selected) return;
    const pill = pillRefs.current[index];
    if (pill) {
      gsap.fromTo(
        pill,
        { scale: 0.93 },
        { scale: 1, duration: 0.26, ease: "power4.out" }
      );
    }
    onSelect(slug);
  };

  if (loading) {
    return (
      <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-4 px-4" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton flex-shrink-0 rounded-2xl" style={{ width: 88, height: 64 }} />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex gap-2.5 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide"
      role="tablist"
      aria-label="Categorías"
    >
      {options.map((cat, i) => {
        const isActive = selected === cat.slug;
        return (
          <button
            key={cat.id}
            ref={(el) => { pillRefs.current[i] = el; }}
            role="tab"
            aria-selected={isActive}
            onClick={() => handleSelect(cat.slug, i)}
            className="category-pill flex-shrink-0 flex flex-col items-center justify-center gap-1.5 rounded-2xl select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grido-primary"
            style={{
              minWidth: 72,
              height: 64,
              paddingInline: 12,
              background: isActive ? "#0d2050" : "#ffffff",
              border: isActive ? "none" : "1.5px solid #e5e7eb",
              color: isActive ? "#ffffff" : "#374151",
              transition: "background 180ms cubic-bezier(0.25, 1, 0.5, 1), border-color 180ms, color 180ms, box-shadow 200ms cubic-bezier(0.25, 1, 0.5, 1)",
              boxShadow: isActive
                ? "0 4px 14px rgba(13, 32, 80, 0.28)"
                : "0 1px 3px rgba(0,0,0,0.06)",
            }}
            onPointerDown={(e) => {
              if (!isActive) (e.currentTarget as HTMLElement).style.transform = "scale(0.95)";
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
              size={20}
              color={isActive ? "#ffffff" : "#6b7280"}
            />
            <span
              className="text-[11px] font-semibold leading-none whitespace-nowrap"
              style={{ color: isActive ? "#ffffff" : "#374151" }}
            >
              {cat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
