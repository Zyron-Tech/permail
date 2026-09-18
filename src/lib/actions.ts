"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { toFieldKey } from "@/lib/merge";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/?signin=1");
  return { supabase, user };
}

// --- audiences -------------------------------------------------------------

export async function createAudience(formData: FormData) {
  const { supabase, user } = await requireUser();
  const name = String(formData.get("name") ?? "").trim() || "Untitled audience";

  const { data, error } = await supabase
    .from("audiences")
    .insert({ user_id: user.id, name, fields: ["first_name"] })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/app/audiences");
  redirect(`/app/audiences/${data.id}`);
}

export async function renameAudience(id: string, name: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("audiences")
    .update({ name: name.trim() || "Untitled audience", updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/app/audiences");
}

export async function deleteAudience(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id"));
  const { error } = await supabase.from("audiences").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/app/audiences");
  redirect("/app/audiences");
}

export type SheetRow = { email: string; data: Record<string, string> };

/** Replaces an audience's whole sheet: its columns and every row. */
export async function saveAudienceSheet(
  audienceId: string,
  fields: string[],
  rows: SheetRow[],
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  const { supabase, user } = await requireUser();

  const cleanFields = dedupe(fields.map(toFieldKey).filter(Boolean));

  const { error: audienceError } = await supabase
    .from("audiences")
    .update({ fields: cleanFields, updated_at: new Date().toISOString() })
    .eq("id", audienceId)
    .eq("user_id", user.id);

  if (audienceError) return { ok: false, error: audienceError.message };

  const { error: clearError } = await supabase
    .from("contacts")
    .delete()
    .eq("audience_id", audienceId)
    .eq("user_id", user.id);

  if (clearError) return { ok: false, error: clearError.message };

  const payload = rows
    .filter((row) => row.email.trim())
    .map((row, position) => ({
      audience_id: audienceId,
      user_id: user.id,
      email: row.email.trim(),
      data: pick(row.data, cleanFields),
      position,
    }));

  if (payload.length) {
    const { error: insertError } = await supabase.from("contacts").insert(payload);
    if (insertError) return { ok: false, error: insertError.message };
  }

  revalidatePath(`/app/audiences/${audienceId}`);
  revalidatePath("/app/audiences");
  return { ok: true, count: payload.length };
}

// --- campaigns -------------------------------------------------------------

export async function createCampaign(formData: FormData) {
  const { supabase, user } = await requireUser();
  const audienceId = String(formData.get("audience_id") ?? "") || null;
  const name = String(formData.get("name") ?? "").trim() || "Untitled campaign";

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      user_id: user.id,
      audience_id: audienceId,
      name,
      from_name: profile?.full_name ?? null,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/app");
  revalidatePath("/app/campaigns");
  redirect(`/app/campaigns/${data.id}`);
}

export type CampaignPatch = {
  name?: string;
  subject?: string;
  body?: string;
  from_name?: string | null;
  reply_to?: string | null;
  audience_id?: string | null;
};

export async function saveCampaign(
  id: string,
  patch: CampaignPatch,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("campaigns")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("status", "draft");

  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

export async function deleteCampaign(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id"));
  const { error } = await supabase.from("campaigns").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/app");
  revalidatePath("/app/campaigns");
  redirect("/app/campaigns");
}

// --- helpers ---------------------------------------------------------------

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}

function pick(data: Record<string, string>, fields: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const field of fields) {
    const value = data[field];
    if (value !== undefined && value !== "") result[field] = String(value);
  }
  return result;
}
