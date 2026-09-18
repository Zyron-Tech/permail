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
        {eyebrow ? <p className="eyebrow mb-2 text-wine">{eyebrow}</p> : null}
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
      </div>
      {action}
    </div>
  );
}

const CAMPAIGN_TONE: Record<CampaignStatus, string> = {
  draft: "border-line bg-paper text-ash",
  sending: "border-sun bg-sun-soft text-wine",
  sent: "border-wine bg-wine text-sun",
  failed: "border-wine bg-wine-soft text-wine",
};

const RECIPIENT_TONE: Record<RecipientStatus, string> = {
  pending: "border-line bg-paper text-ash",
  sending: "border-sun bg-sun-soft text-wine",
  sent: "border-wine bg-wine text-sun",
  failed: "border-wine bg-wine-soft text-wine",
};

export function StatusPill({ status }: { status: CampaignStatus | RecipientStatus }) {
  const tone =
    status in CAMPAIGN_TONE
      ? CAMPAIGN_TONE[status as CampaignStatus]
      : RECIPIENT_TONE[status as RecipientStatus];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider ${tone}`}
    >
      {status}
    </span>
  );
}

export function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-sun font-display text-lg font-bold text-wine">
        +
      </div>
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
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
