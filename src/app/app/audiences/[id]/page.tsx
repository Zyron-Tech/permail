import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { renameAudience, deleteAudience } from "@/lib/actions";
import { SheetEditor, type EditorRow } from "@/components/sheet-editor";
import { InlineName } from "@/components/inline-name";
import type { Audience, Contact } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AudiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: audience } = await supabase
    .from("audiences")
    .select("*")
    .eq("id", id)
    .maybeSingle<Audience>();

  if (!audience) notFound();

  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .eq("audience_id", id)
    .order("position", { ascending: true })
    .returns<Contact[]>();

  const rows: EditorRow[] = (contacts ?? []).map((contact) => ({
    key: contact.id,
    email: contact.email,
    data: contact.data ?? {},
  }));

  async function rename(value: string) {
    "use server";
    await renameAudience(id, value);
  }

  return (
    <>
      <div className="mb-6">
        <Link href="/app/audiences" className="eyebrow text-ash transition-colors hover:text-pine">
          ← Audiences
        </Link>

        <div className="mt-3 flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <InlineName initial={audience.name} onSave={rename} placeholder="Untitled audience" />
          </div>

          <form action={deleteAudience}>
            <input type="hidden" name="id" value={audience.id} />
            <button className="btn btn-ghost btn-sm mt-1.5 text-ash">Delete</button>
          </form>
        </div>
      </div>

      <SheetEditor audienceId={audience.id} initialFields={audience.fields ?? []} initialRows={rows} />
    </>
  );
}
