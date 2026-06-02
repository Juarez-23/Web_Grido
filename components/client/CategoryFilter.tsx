"use client";

import type { Category } from "@/types";

interface Props {
  categories: Category[];
  selected: string;
  onSelect: (slug: string) => void;
  loading?: boolean;
}

export function CategoryFilter({ categories, selected, onSelect, loading }: Props) {
  const all: Category = { id: "todos", name: "Todos", slug: "todos", icon: "🍦", order: -1, active: true };
  const options = [all, ...categories];

  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-9 w-24 rounded-full flex-shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide"
      role="tablist"
      aria-label="Categorías de productos"
    >
      {options.map((cat) => {
        const isActive = selected === cat.slug;
        return (
          <button
            key={cat.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(cat.slug)}
            className={`category-pill flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold whitespace-nowrap select-none ${
              isActive
                ? "bg-grido-primary text-white"
                : "bg-white text-gray-700 border border-gray-200"
            }`}
            style={{
              transition: "transform 120ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 200ms cubic-bezier(0.25, 1, 0.5, 1)",
              boxShadow: isActive ? "0 2px 10px rgba(13,32,80,0.22)" : "none",
            }}
            onPointerDown={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(0.96)";
            }}
            onPointerUp={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
            onPointerLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
          >
            {cat.icon && <span className="text-base leading-none" aria-hidden="true">{cat.icon}</span>}
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
