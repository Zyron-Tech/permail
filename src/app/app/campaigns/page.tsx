import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createCampaign } from "@/lib/actions";
import { PageHeader, StatusPill, EmptyState, formatWhen } from "@/components/ui";
import { NoCampaignsArt } from "@/components/app-art";
import { plural } from "@/lib/progress";
import type { Campaign } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: campaigns }, audiences] = await Promise.all([
    supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .returns<Campaign[]>(),
    supabase.from("audiences").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
  ]);

  const all = campaigns ?? [];
  const drafts = all.filter((campaign) => campaign.status === "draft");
  const finished = all.filter((campaign) => campaign.status !== "draft");

  return (
    <>
      <PageHeader
        eyebrow="Campaigns"
        title="Your sends"
        action={
          <form action={createCampaign}>
            <button className="btn btn-primary">New campaign</button>
          </form>
        }
      />

      {all.length === 0 ? (
        <EmptyState
          art={<NoCampaignsArt className="w-full" />}
          title="Nothing sent yet — that’s the fun part"
          body={
            audiences.count
              ? "You already have an audience. Write one draft, drop your columns into it as merge tags, and Permail handles the rest."
              : "You’ll want an audience first — a list of people and whatever details you’d like to mention. Then one draft covers everyone."
          }
        >
          <div className="mt-6 flex w-full flex-col justify-center gap-2 sm:w-auto sm:flex-row">
            <form action={createCampaign}>
              <button className="btn btn-primary w-full sm:w-auto">Write a campaign</button>
            </form>
            {!audiences.count ? (
              <Link href="/app/audiences" className="btn btn-ghost">
                Build an audience first
              </Link>
            ) : null}
          </div>
        </EmptyState>
      ) : (
        <div className="space-y-8">
          {drafts.length > 0 ? (
            <Group title="Drafts" count={drafts.length} campaigns={drafts} />
          ) : null}
          {finished.length > 0 ? (
            <Group title="Sent" count={finished.length} campaigns={finished} />
          ) : null}
        </div>
      )}
    </>
  );
}

function Group({
  title,
  count,
  campaigns,
}: {
  title: string;
  count: number;
  campaigns: Campaign[];
}) {
  return (
    <section>
      <h2 className="mb-3 flex items-baseline gap-2">
        <span className="font-display text-lg font-semibold tracking-tight text-ink">{title}</span>
        <span className="font-mono text-xs text-mist">{count}</span>
      </h2>

      <ul className="space-y-2.5">
        {campaigns.map((campaign, index) => (
          <li key={campaign.id}>
            <Link
              href={`/app/campaigns/${campaign.id}`}
              className="card tap enter flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-5"
              style={{ ["--i" as string]: index }}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-[17px] font-semibold tracking-tight text-ink">
                  {campaign.name}
                </p>
                <p className="mt-0.5 truncate text-sm text-ash">
                  {campaign.subject || "No subject yet"}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <p className="font-mono text-xs text-ash">
                  {campaign.status === "draft"
                    ? `edited ${formatWhen(campaign.updated_at)}`
                    : `${campaign.sent_count}/${campaign.total_count} ${plural(campaign.total_count, "email")}${
                        campaign.failed_count > 0 ? ` · ${campaign.failed_count} failed` : ""
                      }`}
                </p>
                <StatusPill status={campaign.status} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
