interface IconProps {
  slug: string;
  size?: number;
  color?: string;
}

/**
 * Icon per category slug — clean geometric SVG, no emoji.
 * Stroke-based, consistent 1.8px weight at 22px.
 */
export function CategoryIcon({ slug, size = 22, color = "currentColor" }: IconProps) {
  const shared = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (slug) {
    /* ── Todos: grid 2×2 ── */
    case "todos":
      return (
        <svg {...shared}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );

    /* ── Para cucharear: scoop + cone ── */
    case "para-cucharear":
      return (
        <svg {...shared}>
          <circle cx="12" cy="8.5" r="5" />
          <path d="M9 13l3 8 3-8" />
        </svg>
      );

    /* ── Potes: jar con tapa ── */
    case "potes":
      return (
        <svg {...shared}>
          <rect x="5" y="8" width="14" height="13" rx="2" />
          <rect x="7" y="5" width="10" height="3" rx="1" />
          <line x1="5" y1="13" x2="19" y2="13" />
        </svg>
      );

    /* ── Postres: copa de helado ── */
    case "postres":
      return (
        <svg {...shared}>
          <path d="M6 3h12l-2 9H8L6 3z" />
          <path d="M8 12c0 3 1.5 5 4 6 2.5-1 4-3 4-6" />
          <line x1="9" y1="21" x2="15" y2="21" />
          <line x1="12" y1="18" x2="12" y2="21" />
        </svg>
      );

    /* ── Tortas: pastel con vela ── */
    case "tortas":
      return (
        <svg {...shared}>
          <rect x="3" y="12" width="18" height="9" rx="2" />
          <path d="M3 12c0-4 2.5-7 9-7s9 3 9 7" />
          <line x1="12" y1="5" x2="12" y2="2" />
          <circle cx="12" cy="2" r="0.8" fill={color} stroke="none" />
        </svg>
      );

    /* ── Palitos: paleta rectangular ── */
    case "palitos":
      return (
        <svg {...shared}>
          <rect x="8" y="2" width="8" height="13" rx="4" />
          <line x1="12" y1="15" x2="12" y2="22" />
        </svg>
      );

    /* ── Bombones: caja de bombones ── */
    case "bombones":
      return (
        <svg {...shared}>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <circle cx="9" cy="9" r="2.5" />
          <circle cx="15" cy="9" r="2.5" />
          <circle cx="9" cy="15" r="2.5" />
          <circle cx="15" cy="15" r="2.5" />
        </svg>
      );

    /* ── Frizzio: copo de nieve ── */
    case "frizzio":
      return (
        <svg {...shared}>
          <line x1="12" y1="2" x2="12" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M7 7l10 10M17 7L7 17" />
          <path d="M12 5l-2-2M12 5l2-2M12 19l-2 2M12 19l2 2M5 12l-2-2M5 12l-2 2M19 12l2-2M19 12l2 2" />
        </svg>
      );

    /* ── Especiales: estrella de 5 puntas ── */
    case "especiales":
      return (
        <svg {...shared} fill={color} stroke="none">
          <path d="M12 2l2.7 8.3H23l-7 5 2.7 8.3L12 18.9l-6.7 4.7L8 15.3l-7-5h8.3L12 2z" />
        </svg>
      );

    default:
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}
