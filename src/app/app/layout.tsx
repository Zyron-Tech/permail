import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DesktopNav, MobileNav } from "@/components/app-nav";
import { CommandPalette, PaletteTrigger, type PaletteItem } from "@/components/command-palette";
import { RouteProgress } from "@/components/route-progress";
import { isConfigured } from "@/lib/env";
import { SetupNotice } from "@/components/setup-notice";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!isConfigured()) return <SetupNotice />;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/?signin=1");

  const [{ data: account, error: accountError }, { data: campaigns }, { data: audiences }] =
    await Promise.all([
      supabase
        .from("google_accounts")
        .select("google_email, can_send")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("campaigns")
        .select("id, name, subject, status")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(10),
      supabase
        .from("audiences")
        .select("id, name")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(10),
    ]);

  // PGRST205: the table isn't there, i.e. schema.sql was never run.
  const schemaMissing = accountError?.code === "PGRST205";

  const paletteItems: PaletteItem[] = [
    ...(campaigns ?? []).map((row) => ({
      id: `campaign-${row.id}`,
      label: row.name as string,
      hint: (row.subject as string) || `${row.status} campaign`,
      href: `/app/campaigns/${row.id}`,
      group: "Campaigns" as const,
    })),
    ...(audiences ?? []).map((row) => ({
      id: `audience-${row.id}`,
      label: row.name as string,
      hint: "Recipient sheet",
      href: `/app/audiences/${row.id}`,
      group: "Audiences" as const,
    })),
  ];

  const initial = (user.email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="min-h-dvh pb-20 sm:pb-0">
      <RouteProgress />

      <header className="sticky top-0 z-20 border-b border-line bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <Link href="/app" className="flex items-baseline gap-[3px]">
            <span className="font-display text-[17px] font-semibold tracking-[-0.045em] text-ink">
              Permail
            </span>
            <span className="h-[4px] w-[4px] rounded-full bg-sun" />
          </Link>

          <div className="ml-3 hidden sm:block">
            <DesktopNav />
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            <PaletteTrigger />
            <span className="hidden max-w-[180px] truncate font-mono text-xs text-mist lg:inline">
              {account?.google_email ?? user.email}
            </span>
            <Link
              href="/app/settings"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-pine text-xs font-semibold text-cream transition-transform hover:scale-105 active:scale-95"
              aria-label="Account settings"
            >
              {initial}
            </Link>
          </div>
        </div>
      </header>

      {schemaMissing ? (
        <Banner tone="error">
          Your database has no tables yet. Run{" "}
          <code className="font-mono">supabase/schema.sql</code> in the Supabase SQL editor, then
          sign out and back in so your Gmail grant is stored.
        </Banner>
      ) : !account?.can_send ? (
        <Banner tone="warn">
          {account
            ? "Permail can’t send yet — the Gmail permission wasn’t granted."
            : "Permail can’t send yet — your Gmail account isn’t linked. Sign in again to grant it."}{" "}
          <Link href="/app/settings" className="font-semibold underline underline-offset-2">
            Fix it in settings
          </Link>
        </Banner>
      ) : null}

      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">{children}</main>

      <MobileNav />
      <CommandPalette items={paletteItems} />
    </div>
  );
}

function Banner({ tone, children }: { tone: "error" | "warn"; children: React.ReactNode }) {
  const tones = {
    error: "border-wine/20 bg-wine-pale text-wine",
    warn: "border-sun-soft bg-sun-pale text-ink",
  } as const;

  return (
    <div className={`border-b ${tones[tone]}`}>
      <div className="mx-auto flex max-w-5xl items-start gap-2.5 px-4 py-2.5 text-[13px] leading-relaxed">
        <span
          className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
            tone === "error" ? "bg-wine" : "bg-sun-dim"
          }`}
        />
        <p>{children}</p>
      </div>
    </div>
  );
}
