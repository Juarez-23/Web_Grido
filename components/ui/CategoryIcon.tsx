interface IconProps {
  slug: string;
  size?: number;
  color?: string;
}

/**
 * SVG icons per category — clean, geometric, readable at 26px.
 * Stroke-only, 1.8px weight, no decoration.
 */
export function CategoryIcon({ slug, size = 26, color = "currentColor" }: IconProps) {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 1.85,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (slug) {
    // Todos — grid 2×2
    case "todos":
      return (
        <svg {...p}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );

    // Para cucharear — cono de helado
    case "para-cucharear":
      return (
        <svg {...p}>
          <circle cx="12" cy="8" r="5" />
          <path d="M8.5 12.5L12 21l3.5-8.5" />
        </svg>
      );

    // Potes — frasco con tapa
    case "potes":
      return (
        <svg {...p}>
          <path d="M8 5h8l1.5 3H6.5L8 5z" />
          <rect x="5" y="8" width="14" height="12" rx="2" />
          <path d="M5 13h14" />
        </svg>
      );

    // Postres — copa de postre
    case "postres":
      return (
        <svg {...p}>
          <path d="M5 3h14l-3 9H8L5 3z" />
          <path d="M8 12c0 3.5 1.8 5.5 4 6.5 2.2-1 4-3 4-6.5" />
          <line x1="9" y1="21" x2="15" y2="21" />
          <line x1="12" y1="19" x2="12" y2="21" />
        </svg>
      );

    // Tortas — pastel
    case "tortas":
      return (
        <svg {...p}>
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <path d="M3 11c0-4.5 3-8 9-8s9 3.5 9 8" />
          <path d="M12 3V1" />
          <path d="M9 11h6" />
        </svg>
      );

    // Palitos — paleta/popsicle
    case "palitos":
      return (
        <svg {...p}>
          <rect x="8" y="2" width="8" height="12" rx="4" />
          <line x1="12" y1="14" x2="12" y2="22" />
        </svg>
      );

    // Bombones — caja de chocolates
    case "bombones":
      return (
        <svg {...p}>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <circle cx="8.5" cy="8.5" r="2" />
          <circle cx="15.5" cy="8.5" r="2" />
          <circle cx="8.5" cy="15.5" r="2" />
          <circle cx="15.5" cy="15.5" r="2" />
        </svg>
      );

    // Frizzio — copo de nieve simple (3 líneas)
    case "frizzio":
      return (
        <svg {...p}>
          <line x1="12" y1="2" x2="12" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
        </svg>
      );

    // Especiales — estrella de 5 puntas filled
    case "especiales":
      return (
        <svg {...p} stroke="none" fill={color}>
          <path d="M12 2l2.9 8.9H23l-7.5 5.4 2.9 8.9L12 19.8l-6.4 5.4 2.9-8.9L1 9l8.1-.1L12 2z" />
        </svg>
      );

    default:
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}
