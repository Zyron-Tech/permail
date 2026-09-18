import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAccessToken, sendMail } from "@/lib/google";
import { render } from "@/lib/merge";
import { textToHtml } from "@/lib/format";
import type { Campaign, CampaignRecipient, Contact } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Messages per request. The client calls again until `remaining` hits zero. */
const BATCH_SIZE = 8;
/** Gmail bills a send at 100 quota units; this keeps us under the per-second cap. */
const SPACING_MS = 300;
/** A claim older than this is assumed abandoned (crashed run, closed tab). */
const CLAIM_TIMEOUT_MS = 5 * 60 * 1000;

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle<Campaign>();

  if (!campaign) return NextResponse.json({ error: "Campaign not found." }, { status: 404 });

  if (campaign.status === "sent") {
    return NextResponse.json({
      status: campaign.status,
      total: campaign.total_count,
      sent: campaign.sent_count,
      failed: campaign.failed_count,
      remaining: 0,
    });
  }

  // --- first call: freeze the audience into recipient rows -------------------
  if (campaign.status === "draft") {
    const prepared = await prepare(supabase, campaign, user.id);
    if ("error" in prepared) {
      return NextResponse.json({ error: prepared.error }, { status: 400 });
    }
  }

  const { data: account } = await supabase
    .from("google_accounts")
    .select("google_email")
    .eq("user_id", user.id)
    .maybeSingle();

  const fromEmail = account?.google_email ?? user.email;
  if (!fromEmail) {
    return NextResponse.json({ error: "No Gmail account is linked." }, { status: 400 });
  }

  let accessToken: string;
  try {
    accessToken = await getAccessToken(user.id);
  } catch (cause) {
    const code = cause instanceof Error ? cause.message : "";
    const message =
      code === "NO_REFRESH_TOKEN" || code === "NO_GOOGLE_ACCOUNT"
        ? "Google access expired. Reconnect your account in Settings."
        : `Could not reach Google: ${code}`;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // --- claim a batch ---------------------------------------------------------
  const staleBefore = new Date(Date.now() - CLAIM_TIMEOUT_MS).toISOString();
  const claimable = `status.eq.pending,and(status.eq.sending,claimed_at.lt."${staleBefore}")`;

  const { data: candidates } = await supabase
    .from("campaign_recipients")
    .select("id")
    .eq("campaign_id", id)
    .or(claimable)
    .limit(BATCH_SIZE)
    .returns<{ id: string }[]>();

  const candidateIds = (candidates ?? []).map((row) => row.id);

  let batch: CampaignRecipient[] = [];
  if (candidateIds.length) {
    // Re-applying the claimable filter to the UPDATE is what makes this safe:
    // a second caller racing us finds these rows already marked `sending` and
    // gets back nothing, so no address is ever mailed twice.
    const { data: claimed } = await supabase
      .from("campaign_recipients")
      .update({ status: "sending", claimed_at: new Date().toISOString() })
      .in("id", candidateIds)
      .or(claimable)
      .select("*")
      .returns<CampaignRecipient[]>();
    batch = claimed ?? [];
  }

  // --- send ------------------------------------------------------------------
  for (const [index, recipient] of batch.entries()) {
    const row = { ...recipient.data, email: recipient.email };
    const subject = render(campaign.subject, row);
    const text = render(campaign.body, row);

    try {
      const result = await sendMail({
        accessToken,
        from: fromEmail,
        fromName: campaign.from_name,
        to: recipient.email,
        subject,
        text,
        html: textToHtml(text),
        replyTo: campaign.reply_to,
      });

      await supabase
        .from("campaign_recipients")
        .update({
          status: "sent",
          rendered_subject: subject,
          message_id: result.id,
          error: null,
          sent_at: new Date().toISOString(),
        })
        .eq("id", recipient.id);
    } catch (cause) {
      await supabase
        .from("campaign_recipients")
        .update({
          status: "failed",
          rendered_subject: subject,
          error: cause instanceof Error ? cause.message.slice(0, 400) : "Unknown error",
        })
        .eq("id", recipient.id);
    }

    if (index < batch.length - 1) await wait(SPACING_MS);
  }

  // --- recount ---------------------------------------------------------------
  const [{ count: total }, { count: sent }, { count: failed }, { count: remaining }] =
    await Promise.all([
      countBy(supabase, id),
      countBy(supabase, id, "sent"),
      countBy(supabase, id, "failed"),
      countRemaining(supabase, id),
    ]);

  const finished = (remaining ?? 0) === 0;
  const status = finished ? ((sent ?? 0) > 0 ? "sent" : "failed") : "sending";

  await supabase
    .from("campaigns")
    .update({
      status,
      total_count: total ?? 0,
      sent_count: sent ?? 0,
      failed_count: failed ?? 0,
      sent_at: finished ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  return NextResponse.json({
    status,
    total: total ?? 0,
    sent: sent ?? 0,
    failed: failed ?? 0,
    remaining: remaining ?? 0,
  });
}

// ---------------------------------------------------------------------------

type Client = Awaited<ReturnType<typeof createClient>>;

async function prepare(supabase: Client, campaign: Campaign, userId: string) {
  if (!campaign.audience_id) return { error: "This campaign has no audience." };
  if (!campaign.subject.trim()) return { error: "Add a subject before sending." };
  if (!campaign.body.trim()) return { error: "Write a message before sending." };

  const { data: contacts } = await supabase
    .from("contacts")
    .select("email, data")
    .eq("audience_id", campaign.audience_id)
    .order("position", { ascending: true })
    .returns<Pick<Contact, "email" | "data">[]>();

  // De-duplicate: nobody should get the same campaign twice.
  const seen = new Set<string>();
  const rows = (contacts ?? [])
    .filter((contact) => {
      const email = contact.email.trim().toLowerCase();
      if (!email || seen.has(email)) return false;
      seen.add(email);
      return true;
    })
    .map((contact) => ({
      campaign_id: campaign.id,
      user_id: userId,
      email: contact.email.trim(),
      data: contact.data ?? {},
      status: "pending" as const,
    }));

  if (!rows.length) return { error: "That audience has no valid recipients." };

  await supabase.from("campaign_recipients").delete().eq("campaign_id", campaign.id);

  const { error } = await supabase.from("campaign_recipients").insert(rows);
  if (error) return { error: error.message };

  await supabase
    .from("campaigns")
    .update({
      status: "sending",
      total_count: rows.length,
      sent_count: 0,
      failed_count: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", campaign.id);

  return { total: rows.length };
}

function countBy(supabase: Client, campaignId: string, status?: string) {
  const query = supabase
    .from("campaign_recipients")
    .select("id", { count: "exact", head: true })
    .eq("campaign_id", campaignId);

  return status ? query.eq("status", status) : query;
}

function countRemaining(supabase: Client, campaignId: string) {
  return supabase
    .from("campaign_recipients")
    .select("id", { count: "exact", head: true })
    .eq("campaign_id", campaignId)
    .in("status", ["pending", "sending"]);
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
