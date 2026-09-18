import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DesktopNav, MobileNav } from "@/components/app-nav";
import { isConfigured } from "@/lib/env";
import { SetupNotice } from "@/components/setup-notice";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!isConfigured()) return <SetupNotice />;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/?signin=1");

  const { data: account, error: accountError } = await supabase
    .from("google_accounts")
    .select("google_email, can_send")
    .eq("user_id", user.id)
    .maybeSingle();

  // PGRST205: the table isn't there, i.e. schema.sql was never run.
  const schemaMissing = accountError?.code === "PGRST205";

  const initial = (user.email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="min-h-dvh pb-20 sm:pb-0">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <Link href="/app" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-wine font-display text-sm font-bold text-sun">
              P
            </span>
            <span className="font-display text-base font-bold tracking-tight text-ink">permail</span>
          </Link>

          <div className="ml-2 hidden sm:block">
            <DesktopNav />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden max-w-[200px] truncate font-mono text-xs text-ash md:inline">
              {account?.google_email ?? user.email}
            </span>
            <Link
              href="/app/settings"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-card text-xs font-semibold text-wine"
              aria-label="Account settings"
            >
              {initial}
            </Link>
          </div>
        </div>
      </header>

      {schemaMissing ? (
        <div className="border-b border-wine/20 bg-wine-soft">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-2.5 text-sm text-wine">
            <span>
              Your database has no tables yet. Run{" "}
              <code className="font-mono">supabase/schema.sql</code> in the Supabase SQL editor,
              then sign out and back in so your Gmail grant is stored.
            </span>
          </div>
        </div>
      ) : !account?.can_send ? (
        <div className="border-b border-wine/20 bg-sun-soft">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-2.5 text-sm text-wine">
            <span>
              {account
                ? "Permail can't send yet — the Gmail permission wasn't granted."
                : "Permail can't send yet — your Gmail account isn't linked. Sign in again to grant it."}
            </span>
            <Link href="/app/settings" className="font-semibold underline underline-offset-2">
              Fix it in settings
            </Link>
          </div>
        </div>
      ) : null}

      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">{children}</main>

      <MobileNav />
    </div>
  );
}
