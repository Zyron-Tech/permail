"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StatusPill } from "@/components/ui";
import { formatCount, plural } from "@/lib/progress";
import type { Campaign, CampaignRecipient } from "@/lib/types";

/**
 * Post-send view. While a campaign is still `sending` it keeps nudging the
 * batch endpoint, so a closed tab or a dropped connection never strands a send.
 */
export function SendReport({
  campaign,
  recipients,
  milestone,
}: {
  campaign: Campaign;
  recipients: CampaignRecipient[];
  /** A lifetime mark this campaign carried the user past, if any. */
  milestone: number | null;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "sent" | "failed">("all");
  const [resuming, setResuming] = useState(false);

  useEffect(() => {
    if (campaign.status !== "sending") return;
    let cancelled = false;

    (async () => {
      setResuming(true);
      try {
        for (;;) {
          const response = await fetch(`/api/campaigns/${campaign.id}/send`, { method: "POST" });
          const payload = await response.json();
          if (cancelled) return;
          if (!response.ok || payload.remaining === 0) break;
        }
      } finally {
        if (!cancelled) {
          setResuming(false);
          router.refresh();
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [campaign.id, campaign.status, router]);

  const shown = recipients.filter((recipient) =>
    filter === "all" ? true : recipient.status === filter,
  );

  const progress = Math.round(
    ((campaign.sent_count + campaign.failed_count) / Math.max(1, campaign.total_count)) * 100,
  );

  const complete = campaign.status === "sent" || campaign.status === "failed";

  return (
    <div>
      {complete && campaign.sent_count > 0 ? (
        <div className="card pop mb-5 border-moss-soft bg-moss-pale p-5">
          <p className="eyebrow mb-2 text-moss">Delivered</p>
          <h2 className="font-display text-2xl font-bold tracking-tight text-moss sm:text-3xl">
            {formatCount(campaign.sent_count)} {plural(campaign.sent_count, "person", "people")} got
            a letter meant for them.
          </h2>
          {milestone ? (
            <p className="mt-2.5 text-sm leading-relaxed text-moss/80">
              That takes you past {formatCount(milestone)} personalised emails all told.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="card mb-5 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill status={campaign.status} />
          <p className="font-mono text-sm text-ash">
            {campaign.sent_count} sent
            {campaign.failed_count > 0 ? ` · ${campaign.failed_count} failed` : ""} of{" "}
            {campaign.total_count}
          </p>
          {resuming ? <p className="ml-auto font-mono text-xs text-wine">resuming…</p> : null}
        </div>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-line">
          <div className="h-full bg-wine transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <p className="mt-3.5 truncate text-sm text-ink">
          <span className="text-ash">Subject:</span> {campaign.subject}
        </p>
      </div>

      <div className="mb-3 flex gap-1.5">
        {(["all", "sent", "failed"] as const).map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-full border px-3 py-1 text-sm font-medium capitalize transition-colors ${
              filter === value ? "border-wine bg-wine text-sun" : "border-line bg-card text-ash"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      <ul className="card divide-y divide-line overflow-hidden">
        {shown.map((recipient) => (
          <li key={recipient.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
            <span className="min-w-0 flex-1 truncate text-sm text-ink">{recipient.email}</span>
            <StatusPill status={recipient.status} />
            {recipient.error ? (
              <p className="w-full font-mono text-xs leading-relaxed text-wine">{recipient.error}</p>
            ) : (
              <p className="w-full truncate font-mono text-xs text-ash sm:w-auto sm:flex-1">
                {recipient.rendered_subject}
              </p>
            )}
          </li>
        ))}

        {shown.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-ash">Nothing here.</li>
        ) : null}
      </ul>
    </div>
  );
}
