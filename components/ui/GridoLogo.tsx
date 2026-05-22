interface Props {
  size?: number;
  className?: string;
}

/**
 * Grido logo — navy blue square with white "g" and red accent,
 * faithfully reproduced from the brand identity.
 */
export function GridoLogo({ size = 36, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ borderRadius: size * 0.16, flexShrink: 0 }}
    >
      {/* Background */}
      <rect width="100" height="100" rx="16" fill="#0d2050" />

      {/* White "g" — rounded, bold, Grido style */}
      <text
        x="50"
        y="68"
        textAnchor="middle"
        fontFamily="'Arial Rounded MT Bold', 'Nunito', 'Inter', sans-serif"
        fontWeight="900"
        fontSize="72"
        fill="white"
        letterSpacing="-2"
      >
        g
      </text>

      {/* Red teardrop accent at bottom-right of the "g" tail */}
      <ellipse
        cx="57"
        cy="82"
        rx="9"
        ry="7"
        fill="#E3001B"
        transform="rotate(-30 57 82)"
      />
    </svg>
  );
}
