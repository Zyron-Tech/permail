import { createClient } from "@/lib/supabase/server";
import { SignInButton } from "@/components/sign-in-button";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: account }, { data: profile }] = await Promise.all([
    supabase
      .from("google_accounts")
      .select("google_email, can_send, connected_at")
      .eq("user_id", user!.id)
      .maybeSingle(),
    supabase.from("profiles").select("full_name").eq("id", user!.id).maybeSingle(),
  ]);

  return (
    <>
      <PageHeader eyebrow="Settings" title="Account" />

      <section className="card mb-4 p-5">
        <p className="label">Sending account</p>

        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-pine font-display text-base font-semibold text-cream">
            {(profile?.full_name ?? user!.email ?? "?").charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{profile?.full_name ?? "—"}</p>
            <p className="truncate font-mono text-sm text-ash">
              {account?.google_email ?? user!.email}
            </p>
          </div>

          <span
            className={`ml-auto inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider ${
              account?.can_send ? "border-pine bg-pine text-cream" : "border-sun bg-sun-soft text-pine"
            }`}
          >
            {account?.can_send ? "ready to send" : "not authorised"}
          </span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-ash">
          {account?.can_send
            ? "Permail sends through this Gmail account using the gmail.send permission only. It cannot read, search, or delete anything in your mailbox."
            : "Permail needs the Gmail send permission before it can deliver a campaign. Reconnect below and tick the sending checkbox on Google's consent screen."}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <SignInButton
            className="btn btn-ghost btn-sm"
            label={account?.can_send ? "Reconnect Google" : "Grant sending permission"}
            next="/app/settings"
          />
          <form action="/auth/signout" method="post">
            <button className="btn btn-ghost btn-sm text-ash">Sign out</button>
          </form>
        </div>
      </section>

      <section className="card p-5">
        <p className="label">Good to know</p>
        <ul className="space-y-3 text-sm leading-relaxed text-ash">
          <li>
            <strong className="font-semibold text-ink">Google caps daily volume, not Permail.</strong>{" "}
            A personal Gmail account can send roughly 500 messages a day; Workspace accounts about
            2,000. Sends past the cap come back as failures and can be retried tomorrow.
          </li>
          <li>
            <strong className="font-semibold text-ink">Every email is its own message.</strong> No BCC
            piles, no shared thread — each recipient sees only their own copy in a normal Gmail
            conversation.
          </li>
          <li>
            <strong className="font-semibold text-ink">Replies come to you.</strong> Because mail
            leaves your own account, answers land in your inbox exactly as if you had typed each one.
          </li>
        </ul>
      </section>
    </>
  );
}
