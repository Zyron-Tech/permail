/**
 * The small amount of "game" in Permail: a setup path that ends, and honest
 * counters that keep going. No points, no badges — just the next real thing to
 * do, and a truthful record of what you've sent.
 */

export type Step = {
  key: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  done: boolean;
};

export type Signals = {
  canSend: boolean;
  contactCount: number;
  campaignCount: number;
  sentCampaignCount: number;
};

export function buildSteps({
  canSend,
  contactCount,
  campaignCount,
  sentCampaignCount,
}: Signals): Step[] {
  return [
    {
      key: "gmail",
      title: "Link your Gmail",
      body: "Campaigns leave from your own address, so replies come back to you.",
      href: "/app/settings",
      cta: "Open settings",
      done: canSend,
    },
    {
      key: "audience",
      title: "Add your first people",
      body: "Paste a spreadsheet or type a couple of rows. Every column becomes a merge tag.",
      href: "/app/audiences",
      cta: "Build an audience",
      done: contactCount > 0,
    },
    {
      key: "draft",
      title: "Write a draft",
      body: "One message with tags in it. Permail fills them in per person.",
      href: "/app/campaigns",
      cta: "Start writing",
      done: campaignCount > 0,
    },
    {
      key: "send",
      title: "Send it",
      body: "Preview a few recipients, then let it go. You'll see every delivery.",
      href: "/app/campaigns",
      cta: "Go to campaigns",
      done: sentCampaignCount > 0,
    },
  ];
}

export const MILESTONES = [1, 10, 50, 100, 500, 1000, 5000, 10000] as const;

export function milestone(totalSent: number) {
  const next = MILESTONES.find((mark) => mark > totalSent) ?? null;
  const previous = [...MILESTONES].reverse().find((mark) => mark <= totalSent) ?? 0;

  const span = (next ?? totalSent) - previous;
  const progress = next === null ? 100 : Math.round(((totalSent - previous) / (span || 1)) * 100);

  return { previous, next, progress, reached: previous > 0 };
}

/** The milestone a campaign carried you past, if it did — worth a quiet nod. */
export function crossedMilestone(before: number, after: number): number | null {
  return MILESTONES.find((mark) => mark > before && mark <= after) ?? null;
}

export function greeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function plural(count: number, one: string, many = `${one}s`): string {
  return count === 1 ? one : many;
}

export function formatCount(value: number): string {
  return value.toLocaleString();
}
