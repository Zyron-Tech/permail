import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createCampaign } from "@/lib/actions";
import { StatusPill, formatWhen } from "@/components/ui";
import { SetupPath, MilestoneBar, StatTile } from "@/components/home";
import { buildSteps, greeting, formatCount, plural } from "@/lib/progress";
import { extractTokens } from "@/lib/merge";
import type { Campaign } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: account }, { data: campaigns }, contacts, audiences] =
    await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", user!.id).maybeSingle(),
      supabase
        .from("google_accounts")
        .select("can_send")
        .eq("user_id", user!.id)
        .maybeSingle(),
      supabase
        .from("campaigns")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .returns<Campaign[]>(),
      supabase.from("contacts").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
      supabase.from("audiences").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
    ]);

  const all = campaigns ?? [];
  const sent = all.filter((campaign) => campaign.status === "sent");
  const totalSent = all.reduce((sum, campaign) => sum + campaign.sent_count, 0);
  const contactCount = contacts.count ?? 0;

  const steps = buildSteps({
    canSend: Boolean(account?.can_send),
    contactCount,
    campaignCount: all.length,
    sentCampaignCount: sent.length,
  });

  const setupComplete = steps.every((step) => step.done);
  const firstName = (profile?.full_name ?? "").trim().split(" ")[0];

  // How deeply people actually personalise — the one stat unique to this tool.
  const depth = sent.length
    ? Math.round(
        (sent.reduce((sum, c) => sum + extractTokens(c.subject, c.body).length, 0) / sent.length) *
          10,
      ) / 10
    : 0;

  return (
    <>
      <header className="mb-6">
        <p className="eyebrow mb-2 text-wine">{greeting()}</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {firstName ? `Hello, ${firstName}.` : "Hello."}
        </h1>
        <p className="mt-2 max-w-lg leading-relaxed text-ash">
          {setupComplete
            ? "Everything's wired up. Write something worth reading."
            : "Four short steps and your first personalised send is out the door."}
        </p>
      </header>

      {setupComplete ? (
        <section className="mb-6">
          <div className="mb-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <StatTile value={formatCount(totalSent)} label="emails personalised" tone="wine" />
            <StatTile value={formatCount(sent.length)} label={plural(sent.length, "campaign sent", "campaigns sent")} tone="sun" />
            <StatTile value={formatCount(contactCount)} label="people on your lists" />
            <StatTile value={depth ? `${depth}×` : "—"} label="avg merge tags per send" tone="moss" />
          </div>
          <div className="card px-4 py-3.5">
            <MilestoneBar totalSent={totalSent} />
          </div>
        </section>
      ) : (
        <SetupPath steps={steps} />
      )}

      {/* quick actions */}
      <section className="mb-6 grid gap-2.5 sm:grid-cols-2">
        <form action={createCampaign}>
          <button className="card lift flex w-full items-center gap-4 p-4 text-left">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-wine text-sun">
              <PenIcon />
            </span>
            <span className="min-w-0">
              <span className="block font-display text-base font-bold tracking-tight text-ink">
                Write a campaign
              </span>
              <span className="block text-sm text-ash">One draft, everyone's name in it.</span>
            </span>
          </button>
        </form>

        <Link href="/app/audiences" className="card lift flex items-center gap-4 p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sun text-wine">
            <ListIcon />
          </span>
          <span className="min-w-0">
            <span className="block font-display text-base font-bold tracking-tight text-ink">
              Manage audiences
            </span>
            <span className="block text-sm text-ash">
              {audiences.count
                ? `${audiences.count} ${plural(audiences.count ?? 0, "list")} · ${formatCount(contactCount)} ${plural(contactCount, "person", "people")}`
                : "Paste a list to get started."}
            </span>
          </span>
        </Link>
      </section>

      {/* recent */}
      {all.length > 0 ? (
        <section className="mb-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-lg font-bold tracking-tight text-ink">Recent</h2>
            <Link href="/app/campaigns" className="text-sm font-medium text-wine hover:underline">
              See all {all.length}
            </Link>
          </div>

          <ul className="space-y-2">
            {all.slice(0, 3).map((campaign) => (
              <li key={campaign.id}>
                <Link
                  href={`/app/campaigns/${campaign.id}`}
                  className="card flex items-center gap-3 px-4 py-3.5 transition-colors hover:border-wine"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink">{campaign.name}</span>
                    <span className="block truncate text-sm text-ash">
                      {campaign.status === "draft"
                        ? `edited ${formatWhen(campaign.updated_at)}`
                        : `${campaign.sent_count} of ${campaign.total_count} delivered`}
                    </span>
                  </span>
                  <StatusPill status={campaign.status} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* guide nudge */}
      <Link href="/app/guide" className="card lift flex items-center gap-4 p-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-paper text-wine">
          <BookIcon />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-base font-bold tracking-tight text-ink">
            How Permail works
          </span>
          <span className="block text-sm text-ash">
            Merge tags, fallbacks, importing, and what Gmail lets you send.
          </span>
        </span>
        <span className="text-lg text-wine">→</span>
      </Link>
    </>
  );
}

function PenIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M15.5 4.5 19.5 8.5 8 20H4v-4z" strokeLinejoin="round" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01" strokeLinecap="round" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2.5 2.5 0 0 1 2 1 2.5 2.5 0 0 1 2-1h4.5A1.5 1.5 0 0 1 20 5.5v12a1.5 1.5 0 0 1-1.5 1.5H14a2.5 2.5 0 0 0-2 1 2.5 2.5 0 0 0-2-1H5.5A1.5 1.5 0 0 1 4 17.5z" strokeLinejoin="round" />
      <path d="M12 5v14" />
    </svg>
  );
}
