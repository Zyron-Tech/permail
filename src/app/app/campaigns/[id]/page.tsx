import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteCampaign } from "@/lib/actions";
import { Composer, type AudienceOption, type PreviewContact } from "@/components/composer";
import { SendReport } from "@/components/send-report";
import { crossedMilestone } from "@/lib/progress";
import type { Audience, Campaign, CampaignRecipient, Contact } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle<Campaign>();

  if (!campaign) notFound();

  const isDraft = campaign.status === "draft";

  if (!isDraft) {
    const [{ data: recipients }, { data: allCampaigns }] = await Promise.all([
      supabase
        .from("campaign_recipients")
        .select("*")
        .eq("campaign_id", id)
        .order("created_at", { ascending: true })
        .returns<CampaignRecipient[]>(),
      supabase
        .from("campaigns")
        .select("sent_count")
        .eq("user_id", user!.id)
        .returns<Pick<Campaign, "sent_count">[]>(),
    ]);

    const lifetime = (allCampaigns ?? []).reduce((sum, row) => sum + row.sent_count, 0);

    return (
      <>
        <Header name={campaign.name} />
        <SendReport
          campaign={campaign}
          recipients={recipients ?? []}
          milestone={crossedMilestone(lifetime - campaign.sent_count, lifetime)}
        />
      </>
    );
  }

  const [{ data: audiences }, { data: account }] = await Promise.all([
    supabase
      .from("audiences")
      .select("id, name, fields")
      .eq("user_id", user!.id)
      .order("updated_at", { ascending: false })
      .returns<Pick<Audience, "id" | "name" | "fields">[]>(),
    supabase
      .from("google_accounts")
      .select("google_email, can_send")
      .eq("user_id", user!.id)
      .maybeSingle(),
  ]);

  let contacts: PreviewContact[] = [];
  if (campaign.audience_id) {
    const { data } = await supabase
      .from("contacts")
      .select("email, data")
      .eq("audience_id", campaign.audience_id)
      .order("position", { ascending: true })
      .returns<Pick<Contact, "email" | "data">[]>();
    contacts = (data ?? []).map((contact) => ({ email: contact.email, data: contact.data ?? {} }));
  }

  const options: AudienceOption[] = (audiences ?? []).map((audience) => ({
    id: audience.id,
    name: audience.name,
    fields: audience.fields ?? [],
  }));

  return (
    <>
      <Header name={campaign.name} campaignId={campaign.id} />
      <Composer
        campaign={campaign}
        audiences={options}
        contacts={contacts}
        fromEmail={account?.google_email ?? user!.email ?? ""}
        canSend={Boolean(account?.can_send)}
      />
    </>
  );
}

function Header({ name, campaignId }: { name: string; campaignId?: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <Link href="/app" className="eyebrow text-ash transition-colors hover:text-pine">
        ← Campaigns
      </Link>
      <span className="sr-only">{name}</span>
      {campaignId ? (
        <form action={deleteCampaign} className="ml-auto">
          <input type="hidden" name="id" value={campaignId} />
          <button className="btn btn-ghost btn-sm text-ash">Delete</button>
        </form>
      ) : null}
    </div>
  );
}
