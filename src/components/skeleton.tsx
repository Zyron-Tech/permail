/**
 * Placeholder shapes for route loading states.
 *
 * They mirror the real layout rather than showing a spinner in the middle of an
 * empty page, so the page does not jump when the content lands. `.shimmer` is
 * in globals.css and stops moving under prefers-reduced-motion.
 */

export function SkelLine({
  w = "100%",
  h = 12,
  radius = 4,
  className = "",
}: {
  w?: string | number;
  h?: number;
  /** A number in px, or "full" for a pill. */
  radius?: number | "full";
  className?: string;
}) {
  return (
    <span
      className={`shimmer block ${className}`}
      style={{ width: w, height: h, borderRadius: radius === "full" ? 999 : radius }}
      aria-hidden="true"
    />
  );
}

export function SkelBlock({ h = 76, className = "" }: { h?: number; className?: string }) {
  return (
    <div className={`shimmer rounded-[10px] ${className}`} style={{ height: h }} aria-hidden="true" />
  );
}

/** The heading every page opens with. */
export function SkelHeader({ wide = false }: { wide?: boolean }) {
  return (
    <div className="mb-7">
      <SkelLine w={96} h={10} className="mb-3" />
      <SkelLine w={wide ? 320 : 240} h={30} />
      <SkelLine w={wide ? 420 : 300} h={13} className="mt-3" />
    </div>
  );
}

/** A stack of card rows, as the campaign and recent lists use. */
export function SkelRows({ count = 4 }: { count?: number }) {
  return (
    <ul className="space-y-2.5">
      {Array.from({ length: count }).map((_, index) => (
        <li key={index} className="card flex items-center gap-4 px-4 py-4">
          <div className="min-w-0 flex-1">
            <SkelLine w={`${52 + ((index * 13) % 28)}%`} h={14} />
            <SkelLine w={`${34 + ((index * 17) % 26)}%`} h={11} className="mt-2.5" />
          </div>
          <SkelLine w={68} h={20} radius="full" />
        </li>
      ))}
    </ul>
  );
}

/**
 * The whole loading state is one live region, so a screen reader hears "loading"
 * once instead of reading out a wall of empty boxes.
 */
export function SkelPage({ children }: { children: React.ReactNode }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading…</span>
      {children}
    </div>
  );
}
