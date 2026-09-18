/**
 * The hero illustration: one draft on the left, fanning out into a separate
 * letter per recipient on the right.
 *
 * It is the product's actual claim drawn as a diagram rather than decoration,
 * and it is pure markup — an SVG for the connectors, positioned DOM for the
 * cards, and two CSS keyframes. No canvas, no library, no JavaScript, so it
 * renders on the server and costs nothing on the client.
 *
 * Geometry is authored once in the 520 × 420 viewBox below and the cards are
 * placed as percentages of it, so the SVG and the DOM stay registered at every
 * width without measuring anything.
 */

const BOX = { w: 520, h: 420 };

/**
 * Flags drawn rather than set as emoji: the emoji forms are missing on Windows,
 * where they degrade to a pair of letters in a box. Fine detail (Portugal's
 * armillary, Taiwan's sun) is reduced to a mark at 16px, as it is on any flag
 * this size.
 */
const FLAGS = {
  NG: (
    <>
      <rect width="16" height="11" fill="#008751" />
      <rect x="5.33" width="5.34" height="11" fill="#fff" />
    </>
  ),
  DE: (
    <>
      <rect width="16" height="11" fill="#000" />
      <rect y="3.67" width="16" height="3.66" fill="#d00" />
      <rect y="7.33" width="16" height="3.67" fill="#ffce00" />
    </>
  ),
  PT: (
    <>
      <rect width="16" height="11" fill="#f00" />
      <rect width="6.4" height="11" fill="#060" />
      <circle cx="6.4" cy="5.5" r="1.9" fill="#ffe800" stroke="#060" strokeWidth="0.55" />
    </>
  ),
  TW: (
    <>
      <rect width="16" height="11" fill="#fe0000" />
      <rect width="8" height="5.5" fill="#000095" />
      <circle cx="4" cy="2.75" r="1.45" fill="#fff" />
    </>
  ),
  FR: (
    <>
      <rect width="16" height="11" fill="#fff" />
      <rect width="5.33" height="11" fill="#0055a4" />
      <rect x="10.67" width="5.33" height="11" fill="#ef4135" />
    </>
  ),
} as const;

/** Where each connector lands, in viewBox units. */
const RECIPIENTS = [
  { name: "Amara", meta: "Kite Studio · Lagos", flag: "NG", y: 44, delay: "0s", lit: false },
  { name: "Tobias", meta: "Northwind · Berlin", flag: "DE", y: 126, delay: "0.9s", lit: false },
  { name: "Dana", meta: "Fold & Co · Lisbon", flag: "PT", y: 208, delay: "1.8s", lit: true },
  { name: "Wei", meta: "Bright Lab · Taipei", flag: "TW", y: 290, delay: "2.7s", lit: false },
  { name: "Inès", meta: "Atelier Sud · Marseille", flag: "FR", y: 372, delay: "3.6s", lit: false },
] satisfies ReadonlyArray<{
  name: string;
  meta: string;
  flag: keyof typeof FLAGS;
  y: number;
  delay: string;
  lit: boolean;
}>;

function Flag({ code }: { code: keyof typeof FLAGS }) {
  return (
    <svg
      width="16"
      height="11"
      viewBox="0 0 16 11"
      className="shrink-0 rounded-[1.5px] ring-1 ring-cream/25"
      aria-hidden="true"
      focusable="false"
    >
      {FLAGS[code]}
    </svg>
  );
}

const SOURCE = { x: 212, y: 210 }; // where every connector leaves the draft
const LAND = 276; // the x the cards start at
const CARD_H = 46;

const pct = (n: number, of: number) => `${(n / of) * 100}%`;

export function HeroFan({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full max-w-[520px] ${className}`}>
      <div
        className="relative"
        style={{ aspectRatio: `${BOX.w} / ${BOX.h}` }}
        aria-hidden="true"
      >
      <svg
        viewBox={`0 0 ${BOX.w} ${BOX.h}`}
        className="absolute inset-0 h-full w-full"
        fill="none"
      >
        {RECIPIENTS.map(({ y, delay }) => {
          const d = `M${SOURCE.x},${SOURCE.y} C${SOURCE.x + 44},${SOURCE.y} ${LAND - 44},${y} ${LAND},${y}`;
          return (
            <g key={y}>
              <path d={d} stroke="rgb(246 245 241 / 0.16)" strokeWidth={1} />
              <path
                d={d}
                pathLength={100}
                className="travel"
                stroke="var(--color-sun)"
                strokeWidth={2.5}
                strokeLinecap="round"
                style={{ animationDelay: delay }}
              />
            </g>
          );
        })}
      </svg>

      {/* the one draft */}
      <div
        className="drift absolute rounded-[5px] border border-cream/15 bg-pine-deep p-3.5"
        style={{
          left: 0,
          width: pct(200, BOX.w),
          top: pct(SOURCE.y - 64, BOX.h),
        }}
      >
        <p className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-cream/40">
          Your draft
        </p>
        <p className="mt-2.5 font-mono text-[10px] leading-[1.7] text-cream/80">
          Hi <span className="text-sun">{"{{first_name}}"}</span>, I came across{" "}
          <span className="text-sun">{"{{company}}"}</span> in{" "}
          <span className="text-sun">{"{{city}}"}</span> …
        </p>
      </div>

      {/* one letter each */}
      {RECIPIENTS.map(({ name, meta, flag, y, delay, lit }) => (
        <div
          key={name}
          className={`drift absolute flex items-center gap-2 rounded-[5px] border px-2.5 py-2 sm:gap-2.5 sm:px-3 ${
            lit ? "border-sun/55 bg-pine-deep" : "border-cream/15 bg-pine-deep"
          }`}
          style={{
            left: pct(LAND, BOX.w),
            width: pct(BOX.w - LAND - 8, BOX.w),
            top: pct(y - CARD_H / 2, BOX.h),
            animationDelay: delay,
          }}
        >
          <Flag code={flag} />
          <span className="min-w-0">
            <span className="block truncate text-[11px] leading-tight text-cream">{name}</span>
            <span className="block truncate font-mono text-[8.5px] leading-tight text-cream/45">
              {meta}
            </span>
          </span>
        </div>
      ))}
      </div>

      <p className="mt-6 text-center font-mono text-[9px] uppercase tracking-[0.13em] text-cream/35 sm:text-[10px] sm:tracking-[0.22em]">
        One draft · Five countries · Five separate letters
      </p>
    </div>
  );
}
