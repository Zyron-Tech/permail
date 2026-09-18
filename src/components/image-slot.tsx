import Image from "next/image";

/**
 * A reserved space for a real photograph.
 *
 * Precedence is `src` → `art` → brief. A photograph wins if there is one; an
 * illustration stands in meanwhile; and with neither, the slot draws a
 * crop-marked bed carrying its own brief, so it reads as a deliberate
 * placeholder rather than a broken image.
 *
 * Filling one is a one-line change — add `src` (and `alt`); everything else,
 * including the aspect ratio and the responsive `sizes` hint, stays put, and
 * the drawing steps aside on its own.
 *
 *   <ImageSlot id="A" ratio="16/9" ... />
 *   <ImageSlot id="A" ratio="16/9" src="/images/hero.jpg" alt="…" ... />
 *
 * The full shot list lives in public/images/README.md.
 */

/*
 * A cinematic crop is right on a desktop and wrong on a phone — 21:9 at 390px
 * is a 167px letterbox. Each ratio therefore carries a taller mobile crop that
 * relaxes at `sm`. Written as whole class strings so Tailwind can see them.
 */
const RATIOS = {
  "21/9": { aspect: "aspect-[3/2] sm:aspect-[21/9]", export: "2880 × 1234", mobile: "3:2" },
  "16/9": { aspect: "aspect-[4/3] sm:aspect-[16/9]", export: "2400 × 1350", mobile: "4:3" },
  "3/2": { aspect: "aspect-[3/2]", export: "2000 × 1333", mobile: "3:2" },
  "4/5": { aspect: "aspect-[4/5]", export: "1400 × 1750", mobile: "4:5" },
  "1/1": { aspect: "aspect-square", export: "1200 × 1200", mobile: "1:1" },
} as const;

export type Ratio = keyof typeof RATIOS;

export function ImageSlot({
  id,
  ratio = "16/9",
  brief,
  src,
  alt,
  art,
  sizes = "(min-width: 1024px) 1100px, 100vw",
  priority = false,
  caption,
  className = "",
  position = "center",
}: {
  /** Short slot label — matches the shot list in public/images/README.md. */
  id: string;
  ratio?: Ratio;
  /** What belongs here. Shown on the placeholder; never rendered once filled. */
  brief: string;
  src?: string;
  alt?: string;
  /** A drawing to hold the slot until a photograph exists. */
  art?: React.ReactNode;
  sizes?: string;
  priority?: boolean;
  /** Optional line set beneath the frame, editorial-style. */
  caption?: string;
  className?: string;
  /** object-position, for crops that need the subject off-centre. */
  position?: string;
}) {
  const spec = RATIOS[ratio];

  return (
    <figure className={className}>
      <div className={`figure-bed ${spec.aspect}`}>
        {src ? (
          <Image
            src={src}
            alt={alt ?? ""}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover"
            style={{ objectPosition: position }}
          />
        ) : art ? (
          art
        ) : (
          <Placeholder id={id} brief={brief} ratio={ratio} exportSize={spec.export} />
        )}
      </div>

      {caption ? (
        <figcaption className="mt-3.5 max-w-lg text-[13px] leading-relaxed text-stone">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function Placeholder({
  id,
  brief,
  ratio,
  exportSize,
}: {
  id: string;
  brief: string;
  ratio: string;
  exportSize: string;
}) {
  return (
    <div className="absolute inset-0">
      {/* crop marks */}
      <span className="tick left-4 top-4 border-l border-t" />
      <span className="tick right-4 top-4 border-r border-t" />
      <span className="tick bottom-4 left-4 border-b border-l" />
      <span className="tick bottom-4 right-4 border-b border-r" />

      <div className="flex h-full flex-col items-center justify-center px-6 py-8 text-center sm:px-8 sm:py-10">
        <span className="kicker hidden text-stone sm:block">Image {id}</span>
        <p className="max-w-sm text-[12.5px] leading-relaxed text-slate sm:mt-3 sm:text-[13.5px]">
          {brief}
        </p>
        <span className="mt-4 hidden font-mono text-[10px] tracking-wider text-stone/70 sm:block">
          {ratio.replace("/", ":")} · {exportSize}
        </span>
      </div>
    </div>
  );
}

/**
 * A partner or customer wordmark. Kept greyscale and modest — a logo wall that
 * shouts is the fastest way to look like a template.
 */
export function LogoSlot({ id, name }: { id: string; name: string }) {
  return (
    <div
      className="flex h-9 items-center justify-center border border-dashed border-hair px-4"
      title={`Logo ${id} — ${name}`}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone">{name}</span>
    </div>
  );
}
