import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAudience } from "@/lib/actions";
import { PageHeader, EmptyState, formatWhen } from "@/components/ui";
import { NoAudiencesArt } from "@/components/app-art";
import type { Audience } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AudiencesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: audiences } = await supabase
    .from("audiences")
    .select("*")
    .eq("user_id", user!.id)
    .order("updated_at", { ascending: false })
    .returns<Audience[]>();

  const list = audiences ?? [];

  const counts = new Map<string, number>();
  if (list.length) {
    const { data: contacts } = await supabase
      .from("contacts")
      .select("audience_id")
      .eq("user_id", user!.id);
    for (const row of contacts ?? []) {
      counts.set(row.audience_id, (counts.get(row.audience_id) ?? 0) + 1);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Audiences"
        title="Your people"
        action={
          <form action={createAudience}>
            <button className="btn btn-primary">New audience</button>
          </form>
        }
      />

      {list.length === 0 ? (
        <EmptyState
          art={<NoAudiencesArt className="w-full" />}
          title="No audiences yet"
          body="An audience is a sheet: one row per person, one column per detail you want to drop into the message."
        >
          <form action={createAudience} className="mt-6">
            <button className="btn btn-primary">Create one</button>
          </form>
        </EmptyState>
      ) : (
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {list.map((audience, index) => (
            <li key={audience.id}>
              <Link
                href={`/app/audiences/${audience.id}`}
                className="card tap enter flex h-full flex-col p-4"
                style={{ ["--i" as string]: index }}
              >
                <p className="font-display text-[17px] font-semibold tracking-tight text-ink">
                  {audience.name}
                </p>
                <p className="mt-0.5 font-mono text-xs text-ash">
                  {counts.get(audience.id) ?? 0} recipients · updated {formatWhen(audience.updated_at)}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {["email", ...audience.fields].slice(0, 5).map((field) => (
                    <span key={field} className="tag">{`{{${field}}}`}</span>
                  ))}
                  {audience.fields.length > 4 ? (
                    <span className="tag">+{audience.fields.length - 4}</span>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
