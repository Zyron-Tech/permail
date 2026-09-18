/**
 * Drawings that are part of the page rather than pictures dropped into it.
 *
 * None of them carries a background or a frame. The desk scene bleeds the full
 * width of the viewport and its floor line *is* the section rule beneath it,
 * with the letters flying off the right edge. The portrait sits on a flat disc
 * and is cropped by its own edge. The studio is a tone-on-tone watermark inside
 * the closing panel, behind the type.
 *
 * Built to the same rules as the rest of the site: flat fills, hairlines, no
 * gradient, pine as the ink, brass as the one warm mark, wine as a detail.
 * Figures are round-capped strokes rather than modelled anatomy — stylised on
 * purpose, so they read as drawn rather than as badly observed.
 */

const INK = "var(--color-pine)";
const PAPER = "var(--color-cream)";
const BRASS = "var(--color-sun)";
const RULE = "var(--color-hair)";

/* ──────────────────────────────────────────────── the fan-out, full bleed */

/**
 * Sits directly on the page: no bed, no frame. The floor at y=398 lands on the
 * viewBox edge so it continues into the section rule below, and the last
 * letters are clipped by the right edge on their way out of the page.
 */
export function DeskScene({ className = "" }: { className?: string }) {
  const letters = [
    { x: 1120, y: 230, lit: false },
    { x: 1230, y: 185, lit: false },
    { x: 1340, y: 140, lit: false },
    { x: 1450, y: 95, lit: true },
    { x: 1560, y: 50, lit: false },
  ];

  return (
    <svg
      viewBox="0 0 1600 412"
      className={`block w-full ${className}`}
      role="img"
      aria-label="Someone writing at a desk as separate letters go out, one at a time"
    >
      {/* the floor, which is also the rule under this section */}
      <path d="M0 398h1600" stroke={RULE} strokeWidth="1.5" />

      {/* a plant, for the corner */}
      <g>
        <path d="M221 356v-54" stroke={INK} strokeWidth="3" />
        <path d="M221 318c-28-10-38-40-32-64 24 8 36 32 32 64z" fill={INK} opacity="0.22" />
        <path d="M221 328c26-14 32-44 24-66-22 10-31 36-24 66z" fill={INK} opacity="0.36" />
        <path d="M194 356h54l-7 42h-40z" fill={INK} opacity="0.55" />
      </g>

      {/* chair */}
      <g stroke={INK} strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.3">
        <path d="M330 196v132M330 328h88M341 330v68M410 330v68" />
      </g>

      {/* the person */}
      <g stroke={INK} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M385 312h93" strokeWidth="26" />
        <path d="M478 320l6 78" strokeWidth="22" />
        <path d="M484 398h34" strokeWidth="11" />
        <path d="M385 310L434 212" strokeWidth="46" />
        <path d="M436 218l46 32" strokeWidth="20" />
        <path d="M482 250l70 22" strokeWidth="17" />
      </g>
      <circle cx="442" cy="152" r="33" fill={INK} />
      <circle cx="452" cy="164" r="31" fill={PAPER} stroke={INK} strokeWidth="2.5" />
      <circle cx="468" cy="161" r="3.4" fill={INK} />

      {/* desk */}
      <rect x="500" y="272" width="390" height="10" rx="3" fill={INK} />
      <path d="M540 282v116M860 282v116" stroke={INK} strokeWidth="7" strokeLinecap="round" />

      {/* what is on it */}
      <g transform="rotate(-3 560 260)">
        <rect x="516" y="246" width="88" height="26" rx="2" fill={PAPER} stroke={INK} strokeWidth="2" />
        <path d="M528 256h52M528 264h34" stroke={INK} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      </g>
      <g fill={PAPER} stroke={INK} strokeWidth="2">
        <rect x="660" y="260" width="80" height="12" rx="2" />
        <rect x="668" y="250" width="80" height="12" rx="2" />
      </g>
      <rect x="794" y="242" width="34" height="30" rx="4" fill={BRASS} />
      <path d="M830 250h7a8 8 0 0 1 0 16h-7" stroke={BRASS} strokeWidth="3.5" fill="none" />

      {/* and out of the page */}
      <path
        d="M898 266C1020 244 1240 168 1600 62"
        stroke={INK}
        strokeWidth="2"
        strokeDasharray="1.5 11"
        strokeLinecap="round"
        fill="none"
        opacity="0.22"
      />
      {letters.map(({ x, y, lit }) => (
        <g key={x} transform={`translate(${x} ${y}) rotate(-8)`}>
          <rect
            width="66"
            height="44"
            rx="4"
            fill={lit ? BRASS : PAPER}
            stroke={INK}
            strokeWidth="2.5"
          />
          <path d="M0 0l33 25L66 0" fill="none" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        </g>
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────────────── the portrait, cropped */

/**
 * No halo and no ground — the disc behind it is a DOM element, so type can sit
 * between the two. The shoulders run to the bottom of the viewBox and are cut
 * by it, which is what stops it reading as a framed picture.
 */
export function Portrait({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 880"
      className={`block ${className}`}
      role="img"
      aria-label="Portrait of the person quoted"
    >
      <rect x="360" y="486" width="80" height="152" fill={PAPER} stroke={INK} strokeWidth="3.5" />
      <path d="M400 620c-150 0-252 92-270 260h540c-18-168-120-260-270-260z" fill={INK} />
      <path d="M350 644l50 78 50-78" fill="none" stroke={PAPER} strokeWidth="7" strokeLinejoin="round" />

      <ellipse cx="400" cy="390" rx="132" ry="158" fill={PAPER} stroke={INK} strokeWidth="3.5" />
      <path d="M530 384a22 22 0 0 1 0 46" fill={PAPER} stroke={INK} strokeWidth="3.5" />
      <circle cx="540" cy="444" r="8" fill={BRASS} />

      <path d="M274 376a128 128 0 0 1 252 0" fill="none" stroke={INK} strokeWidth="58" strokeLinecap="round" />
      <path d="M282 390c-8 54 0 100 8 128" fill="none" stroke={INK} strokeWidth="38" strokeLinecap="round" />

      <g stroke={INK} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M320 356c11-7 25-7 35-2" strokeWidth="4.5" />
        <path d="M400 354c11-5 25-5 35 2" strokeWidth="4.5" />
        <path d="M324 388h30M404 388h30" strokeWidth="6.5" />
        <path d="M372 400v36c0 7 7 11 15 9" strokeWidth="4.5" />
        <path d="M352 476c15 11 37 11 51 0" strokeWidth="5" />
      </g>
    </svg>
  );
}

/* ────────────────────────────────────────────── the studio, as a watermark */

/**
 * The same room, drawn tone-on-tone to sit *behind* the closing panel's type
 * rather than beside it. `light` keeps it for a white ground if it is ever
 * wanted there instead.
 */
const TONE = {
  light: { ink: INK, paper: PAPER, brass: BRASS, rule: RULE },
  dark: {
    ink: "rgb(246 245 241 / 0.1)",
    paper: "rgb(246 245 241 / 0.13)",
    brass: "rgb(247 182 56 / 0.2)",
    rule: "rgb(246 245 241 / 0.07)",
  },
} as const;

export function StudioDusk({
  variant = "dark",
  className = "",
}: {
  variant?: keyof typeof TONE;
  className?: string;
}) {
  const c = TONE[variant];

  return (
    <svg
      viewBox="0 0 1400 600"
      className={`block w-full ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <g stroke={c.rule} strokeWidth="2" fill="none">
        <rect x="950" y="70" width="262" height="300" rx="2" />
        <path d="M1081 70v300M950 214h262" />
        <rect x="312" y="150" width="112" height="140" rx="2" />
        <path d="M620 0v112M478 0v160" />
      </g>
      <path d="M0 500h1400" stroke={c.rule} strokeWidth="1.5" />

      <path d="M588 158l20-46h24l20 46z" fill={c.ink} />
      <circle cx="620" cy="166" r="5" fill={c.brass} />
      <path d="M456 200l16-40h12l16 40z" fill={c.ink} />
      <circle cx="478" cy="208" r="4" fill={c.brass} />

      <g stroke={c.ink} strokeLinecap="round" fill="none">
        <path d="M1044 422v76M1068 422v76" strokeWidth="18" />
        <path d="M1056 308v112" strokeWidth="48" />
        <path d="M1028 318l-5 78M1084 318l5 78" strokeWidth="13" />
      </g>
      <circle cx="1056" cy="270" r="23" fill={c.ink} />

      <rect x="300" y="398" width="600" height="10" rx="3" fill={c.ink} />
      <path d="M350 408v90M850 408v90" stroke={c.ink} strokeWidth="7" strokeLinecap="round" />

      <rect x="420" y="382" width="124" height="16" rx="3" fill={c.ink} />
      <rect x="586" y="370" width="28" height="28" rx="4" fill={c.brass} />
      <path d="M616 377h6a7 7 0 0 1 0 14h-6" stroke={c.brass} strokeWidth="3.5" fill="none" />
      <rect x="650" y="384" width="92" height="14" rx="2" fill={c.paper} />
      <path d="M658 378l68-11" stroke={c.brass} strokeWidth="5" strokeLinecap="round" />

      <path d="M810 398v-26h22v26z" fill={c.ink} />
      <path d="M821 372c0-30 11-48 28-58" stroke={c.ink} strokeWidth="3" fill="none" strokeLinecap="round" />

      <g>
        <path d="M150 498v-78" stroke={c.ink} strokeWidth="3" />
        <path d="M150 436c-34-12-46-48-38-76 28 8 44 38 38 76z" fill={c.ink} />
        <path d="M120 498h60l-8 44h-44z" fill={c.ink} />
      </g>
    </svg>
  );
}

/* ──────────────────────────────────────────────── the hero's backing layer */

/** x, y, width, rotation — the flap and height follow at 2:3. */
type Env = [number, number, number, number];

function Envelopes({ items, stroke }: { items: Env[]; stroke: string }) {
  return (
    <>
      {items.map(([x, y, w, r]) => {
        const h = (w * 2) / 3;
        return (
          <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${r})`}>
            <rect width={w} height={h} rx={w / 22} stroke={stroke} strokeWidth="2" fill="none" />
            <path
              d={`M0 0l${w / 2} ${h * 0.56}L${w} 0`}
              stroke={stroke}
              strokeWidth="2"
              strokeLinejoin="round"
              fill="none"
            />
          </g>
        );
      })}
    </>
  );
}

const LINE = "rgb(246 245 241 / 0.07)";
const EDGE = "rgb(246 245 241 / 0.09)";
const SPARK = "rgb(247 182 56 / 0.3)";

/**
 * Texture behind the hero, not a picture in it: the fan-out gesture drawn at
 * the size of the room, tone-on-tone, bleeding off every edge, with a meridian
 * wireframe running off the bottom-left corner. Deliberately below the
 * threshold where you would stop to look at it.
 *
 * It is drawn twice. A `slice` fit scales the artwork to cover, so one wide
 * composition on a phone blows a 380-unit envelope up to nearly the full screen
 * and it stops reading as an envelope at all. The narrow board therefore has
 * its own, with more envelopes at a third of the size.
 */
export function HeroBackdrop() {
  return (
    <>
      {/* narrow boards */}
      <svg
        viewBox="0 0 420 760"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full sm:hidden"
        aria-hidden="true"
        focusable="false"
      >
        <g stroke={LINE} strokeWidth="1.2" fill="none">
          <path d="M-40 706C60 646 200 526 470 386" />
          <path d="M-40 786C80 726 240 586 470 456" />
        </g>
        <Envelopes
          stroke={EDGE}
          items={[
            [-28, 44, 124, -12],
            [258, 152, 104, 8],
            [44, 338, 92, 14],
            [286, 472, 132, -7],
            [-18, 604, 112, 6],
            [236, 690, 96, -14],
          ]}
        />
        <g fill={SPARK}>
          <circle cx="196" cy="300" r="3" />
          <circle cx="86" cy="548" r="3" />
          <circle cx="330" cy="428" r="3" />
        </g>
      </svg>

      {/* wide boards */}
      <svg
        viewBox="0 0 1600 720"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 hidden h-full w-full sm:block"
        aria-hidden="true"
        focusable="false"
      >
        <g stroke={LINE} strokeWidth="1.5" fill="none">
          <path d="M-120 620C220 560 560 420 1720 70" />
          <path d="M-120 700C260 620 620 470 1720 150" />
          <path d="M-120 782C300 690 700 540 1720 232" />
        </g>

        {/* a meridian wireframe, mostly off the corner */}
        <g stroke={LINE} strokeWidth="1.5" fill="none">
          <circle cx="330" cy="768" r="330" />
          <ellipse cx="330" cy="768" rx="118" ry="330" />
          <ellipse cx="330" cy="768" rx="238" ry="330" />
        </g>

        <Envelopes
          stroke={EDGE}
          items={[
            [-70, 470, 380, -14],
            [126, 22, 196, 9],
            [742, -46, 150, -7],
            [1156, 508, 300, -6],
          ]}
        />
        <g fill={SPARK}>
          <circle cx="318" cy="546" r="4" />
          <circle cx="905" cy="322" r="4" />
          <circle cx="1262" cy="612" r="4" />
        </g>
      </svg>
    </>
  );
}

/* ─────────────────────────────────────────────────────── the airmail seam */

/**
 * The chevron border off the edge of an airmail envelope, laid along the seam
 * where the pine hero meets the white page. Flat parallelograms tiled at their
 * natural size — the SVG has no viewBox, so one user unit is one pixel and the
 * bars never stretch with the viewport.
 */
export function AirmailRule({ className = "" }: { className?: string }) {
  return (
    <svg className={`block h-2 w-full ${className}`} aria-hidden="true" focusable="false">
      <defs>
        <pattern id="pm-airmail" width="42" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 8L8 0h7L7 8z" fill="var(--color-sun)" opacity="0.34" />
          <path d="M21 8L29 0h7L28 8z" fill="var(--color-cream)" opacity="0.2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pm-airmail)" />
    </svg>
  );
}
