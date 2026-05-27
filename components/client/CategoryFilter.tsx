"use client";

import type { Category } from "@/types";

// ─── Paleta de colores por índice ───────────────────────────────────────────
const PALETTE = [
  { from: "#0ea5e9", to: "#0284c7", shadow: "rgba(14,165,233,0.45)" },   // sky
  { from: "#6366f1", to: "#4f46e5", shadow: "rgba(99,102,241,0.45)" },   // indigo
  { from: "#a855f7", to: "#7c3aed", shadow: "rgba(168,85,247,0.45)" },   // purple
  { from: "#ec4899", to: "#db2777", shadow: "rgba(236,72,153,0.45)" },   // pink
  { from: "#f59e0b", to: "#d97706", shadow: "rgba(245,158,11,0.45)" },   // amber
  { from: "#10b981", to: "#059669", shadow: "rgba(16,185,129,0.45)" },   // emerald
];

const TODOS_PALETTE = {
  from: "#2115b0",
  to: "#1a0d8c",
  shadow: "rgba(26,13,140,0.5)",
};

// ─── Íconos SVG por slug ────────────────────────────────────────────────────
function CategoryIcon({ slug }: { slug: string }) {
  const s = {
    stroke: "white" as const,
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none" as const,
  };

  switch (slug) {
    case "todos":
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" {...s}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );

    case "para-cucharear":
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" {...s}>
          {/* Scoop */}
          <path d="M12 2C9 2 6 4.5 6 8a6 6 0 0 0 4.5 5.82V21h3v-7.18A6 6 0 0 0 18 8c0-3.5-3-6-6-6z" />
          <path d="M9.5 8a2.5 2.5 0 0 1 2.5-2.5" />
        </svg>
      );

    case "potes":
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" {...s}>
          <rect x="5" y="8" width="14" height="13" rx="2" />
          <path d="M3 8h18" strokeWidth={2} />
          <path d="M8 8V6a4 4 0 0 1 8 0v2" />
          <path d="M9 13h6" />
        </svg>
      );

    case "postres":
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" {...s}>
          {/* Cupcake */}
          <path d="M4 14h16l-2 7H6l-2-7z" />
          <path d="M6 14c0-3 1.5-7 6-7s6 4 6 7" />
          <path d="M12 7V4" />
          <path d="M9 5c0 0 1-2 3-2s3 2 3 2" />
        </svg>
      );

    case "tortas":
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" {...s}>
          <rect x="3" y="13" width="18" height="8" rx="2" />
          <path d="M3 17h18" />
          <path d="M7 13V11a5 5 0 0 1 10 0v2" />
          <path d="M12 7V5" />
          <circle cx="12" cy="4" r="1.2" fill="white" stroke="none" />
        </svg>
      );

    case "palitos":
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" {...s}>
          <rect x="8" y="2" width="8" height="12" rx="4" />
          <path d="M12 14v8" strokeWidth={2.2} />
          <path d="M9 7h6" strokeWidth={1.4} stroke="rgba(255,255,255,0.5)" />
        </svg>
      );

    default:
      return (
        <svg width="32" height="32" viewBox="0 0 24 24" {...s}>
          <path d="M12 2C9 2 6 5 6 9a6 6 0 0 0 12 0c0-4-3-7-6-7z" />
          <path d="M12 15v7" strokeWidth={2.2} />
        </svg>
      );
  }
}

// ─── Componente ─────────────────────────────────────────────────────────────
interface Props {
  categories: Category[];
  selected: string;
  onSelect: (slug: string) => void;
  loading?: boolean;
}

export function CategoryFilter({ categories, selected, onSelect, loading }: Props) {
  const all = [
    { id: "todos", name: "Todos", slug: "todos", icon: "", order: -1, active: true },
  ];
  const options = [...all, ...categories];

  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2.5">
            <div className="skeleton w-[82px] h-[82px] rounded-2xl" />
            <div className="skeleton h-3 w-14 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
      {options.map((cat, index) => {
        const isSelected = selected === cat.slug;
        const palette =
          cat.slug === "todos"
            ? TODOS_PALETTE
            : PALETTE[(index - 1) % PALETTE.length];

        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.slug)}
            className="category-pill flex-shrink-0 flex flex-col items-center gap-2.5 outline-none active:scale-95"
            style={{ transition: "transform 0.12s ease" }}
          >
            {/* Card de color con ícono */}
            <div
              className="w-[82px] h-[82px] rounded-2xl flex items-center justify-center"
              style={{
                background: `linear-gradient(145deg, ${palette.from} 0%, ${palette.to} 100%)`,
                opacity: isSelected ? 1 : 0.42,
                transform: isSelected ? "scale(1.07)" : "scale(1)",
                boxShadow: isSelected
                  ? `0 6px 22px ${palette.shadow}`
                  : "none",
                transition: "opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              <CategoryIcon slug={cat.slug} />
            </div>

            {/* Nombre */}
            <span
              className="text-[11px] font-semibold text-center leading-tight"
              style={{
                maxWidth: 82,
                color: isSelected ? "#1a0d8c" : "#9ca3af",
                transition: "color 0.2s ease",
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
