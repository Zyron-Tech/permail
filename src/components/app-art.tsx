/**
 * Small drawings for the product's empty states, in the same hand as the public
 * site: flat fills, hairlines, pine as the ink, brass as the one warm mark.
 *
 * They carry no background, so they sit on whatever card holds them, and they
 * are sized by the caller. Each says what is missing rather than decorating the
 * absence of it.
 */

const INK = "var(--color-pine)";
const PAPER = "var(--color-card)";
const BRASS = "var(--color-sun)";
const RULE = "var(--color-line)";

/** Nothing written yet: a blank sheet, a pen, and the first letter lifting off. */
export function NoCampaignsArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 280 170" className={`block ${className}`} aria-hidden="true">
      <path d="M18 146h244" stroke={RULE} strokeWidth="1.5" />

      {/* the sheet */}
      <g transform="rotate(-4 96 92)">
        <rect x="46" y="38" width="100" height="108" rx="4" fill={PAPER} stroke={INK} strokeWidth="2" />
        <g stroke={RULE} strokeWidth="2" strokeLinecap="round">
          <path d="M62 62h58M62 78h68M62 94h50M62 110h64M62 126h38" />
        </g>
      </g>

      {/* the pen, nib down on the page */}
      <g transform="rotate(32 140 118)">
        <rect x="132" y="62" width="15" height="56" rx="4" fill={INK} />
        <path d="M132 118h15l-7.5 15z" fill={BRASS} />
      </g>

      {/* the first one out */}
      <g transform="translate(176 26) rotate(-8)">
        <rect width="78" height="52" rx="5" fill={PAPER} stroke={INK} strokeWidth="2" />
        <path d="M0 0l39 29L78 0" fill="none" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      </g>
      <path
        d="M150 96C172 88 190 72 206 56"
        stroke={INK}
        strokeWidth="2"
        strokeDasharray="1.5 8"
        strokeLinecap="round"
        fill="none"
        opacity="0.45"
      />
    </svg>
  );
}

/** Nobody to write to yet: an empty sheet with its columns already drawn. */
export function NoAudiencesArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 280 170" className={`block ${className}`} aria-hidden="true">
      <rect x="30" y="24" width="220" height="122" rx="6" fill={PAPER} stroke={INK} strokeWidth="2" />

      {/* header band */}
      <path d="M30 30a6 6 0 0 1 6-6h208a6 6 0 0 1 6 6v20H30z" fill={INK} opacity="0.07" />
      <path d="M30 50h220" stroke={INK} strokeWidth="2" />
      <g fill={INK} opacity="0.45">
        <rect x="46" y="33" width="38" height="6" rx="3" />
        <rect x="112" y="33" width="44" height="6" rx="3" />
        <rect x="184" y="33" width="30" height="6" rx="3" />
      </g>

      {/* rows, the first one waiting to be filled */}
      <g stroke={RULE} strokeWidth="1.5">
        <path d="M30 74h220M30 98h220M30 122h220" />
      </g>
      <rect x="46" y="58" width="52" height="7" rx="3.5" fill={BRASS} />
      <g fill={INK} opacity="0.16">
        <rect x="112" y="58" width="40" height="7" rx="3.5" />
        <rect x="184" y="58" width="26" height="7" rx="3.5" />
      </g>
      <g fill={INK} opacity="0.08">
        <rect x="46" y="82" width="46" height="7" rx="3.5" />
        <rect x="112" y="82" width="52" height="7" rx="3.5" />
        <rect x="46" y="106" width="38" height="7" rx="3.5" />
        <rect x="112" y="106" width="34" height="7" rx="3.5" />
        <rect x="46" y="130" width="44" height="7" rx="3.5" />
      </g>

      {/* the cursor */}
      <path d="M104 54v16" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The home header mark: one draft becoming several letters, small enough to sit
 * beside a greeting without asking for attention.
 */
export function FanMark({ className = "" }: { className?: string }) {
  const letters = [
    { x: 92, y: 62, lit: false },
    { x: 126, y: 40, lit: false },
    { x: 160, y: 18, lit: true },
  ];

  return (
    <svg viewBox="0 0 210 110" className={`block ${className}`} aria-hidden="true">
      <rect x="6" y="40" width="58" height="46" rx="4" fill={PAPER} stroke={INK} strokeWidth="2" />
      <g stroke={RULE} strokeWidth="2" strokeLinecap="round">
        <path d="M18 54h34M18 64h28M18 74h22" />
      </g>
      <path
        d="M68 62C84 58 96 48 112 38"
        stroke={INK}
        strokeWidth="2"
        strokeDasharray="1.5 7"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
      {letters.map(({ x, y, lit }) => (
        <g key={x} transform={`translate(${x} ${y}) rotate(-8)`}>
          <rect
            width="44"
            height="30"
            rx="3.5"
            fill={lit ? BRASS : PAPER}
            stroke={INK}
            strokeWidth="2"
          />
          <path d="M0 0l22 17L44 0" fill="none" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        </g>
      ))}
    </svg>
  );
}
