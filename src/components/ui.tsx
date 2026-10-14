import Link from "next/link";
import type { CampaignStatus, RecipientStatus } from "@/lib/types";

export function PageHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? <p className="eyebrow mb-2 text-mist">{eyebrow}</p> : null}
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-[2.35rem]">
          {title}
        </h1>
      </div>
      {action}
    </div>
  );
}

/**
 * One tone per state, shared by campaigns and recipients. Pine means it went,
 * brass means it is going, and wine is reserved for failure — nothing else in
 * the product is red.
 */
const TONE: Record<CampaignStatus | RecipientStatus, string> = {
  draft: "border-line bg-card text-ash",
  pending: "border-line bg-card text-mist",
  sending: "border-sun-soft bg-sun-pale text-pine-deep",
  sent: "border-pine bg-pine text-cream",
  failed: "border-wine/25 bg-wine-pale text-wine",
};

export function StatusPill({ status }: { status: CampaignStatus | RecipientStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider ${TONE[status]}`}
    >
      {status === "sending" ? (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sun-dim opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sun-dim" />
        </span>
      ) : null}
      {status}
    </span>
  );
}

export function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
  art,
  children,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
  /** A drawing of what is missing — see components/app-art.tsx. */
  art?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="card enter flex flex-col items-center px-6 py-12 text-center sm:py-16">
      {art ? <div className="mb-7 w-full max-w-[260px]">{art}</div> : null}
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ash">{body}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="btn btn-primary mt-6">
          {actionLabel}
        </Link>
      ) : null}
      {children}
    </div>
  );
}

export function formatWhen(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
