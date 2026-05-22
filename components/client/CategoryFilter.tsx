"use client";

import type { Category } from "@/types";

interface Props {
  categories: Category[];
  selected: string;
  onSelect: (slug: string) => void;
  loading?: boolean;
}

export function CategoryFilter({ categories, selected, onSelect, loading }: Props) {
  const all = [{ id: "todos", name: "Todos", slug: "todos", icon: "🍦", order: -1, active: true }];
  const options = [...all, ...categories];

  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-9 w-24 rounded-full flex-shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
      {options.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.slug)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-all duration-150 active:scale-95 whitespace-nowrap ${
            selected === cat.slug
              ? "bg-grido-primary text-white shadow-md"
              : "bg-white text-gray-700 border border-gray-200"
          }`}
        >
          {cat.icon && <span className="text-base">{cat.icon}</span>}
          {cat.name}
        </button>
      ))}
    </div>
  );
}
