import { NextResponse, type NextRequest } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { GMAIL_SEND_SCOPE } from "@/lib/google";

export const dynamic = "force-dynamic";

/**
 * Google sends the user back here. We trade the code for a Supabase session and
 * — critically — stash the Google refresh token so Permail can keep sending on
 * the user's behalf long after this access token expires.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app";
  const oauthError = searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(oauthError)}`);
  }
  if (!code) {
    return NextResponse.redirect(`${origin}/?error=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    return NextResponse.redirect(
      `${origin}/?error=${encodeURIComponent(error?.message ?? "sign_in_failed")}`,
    );
  }

  const { session, user } = data;
  await storeGoogleGrant({
    userId: user.id,
    fallbackEmail: user.email ?? "",
    accessToken: session.provider_token ?? null,
    refreshToken: session.provider_refresh_token ?? null,
  });

  return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : "/app"}`);
}

async function storeGoogleGrant({
  userId,
  fallbackEmail,
  accessToken,
  refreshToken,
}: {
  userId: string;
  fallbackEmail: string;
  accessToken: string | null;
  refreshToken: string | null;
}) {
  if (!accessToken && !refreshToken) return;

  const admin = createAdminClient();
  const info = accessToken ? await inspectToken(accessToken) : null;
  const scopes = info?.scope ?? "";
  const canSend = scopes.includes(GMAIL_SEND_SCOPE);
  const expiresAt = new Date(
    Date.now() + (info?.expires_in ? info.expires_in * 1000 : 50 * 60 * 1000),
  ).toISOString();

  const { error: accountError } = await admin.from("google_accounts").upsert(
    {
      user_id: userId,
      google_email: info?.email || fallbackEmail,
      scopes: scopes || null,
      can_send: canSend,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (accountError) {
    console.error("[permail] could not store the Google account:", accountError.message);
  }

  // Google only hands back a refresh token on the first consent, so never
  // overwrite a stored one with null on a later sign-in.
  const tokenRow: Record<string, unknown> = {
    user_id: userId,
    access_token: accessToken,
    expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  };
  if (refreshToken) tokenRow.refresh_token = refreshToken;

  const { error: tokenError } = await admin
    .from("google_tokens")
    .upsert(tokenRow, { onConflict: "user_id" });

  if (tokenError) {
    console.error("[permail] could not store the Gmail refresh token:", tokenError.message);
  }
}

async function inspectToken(accessToken: string) {
  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`,
      { cache: "no-store" },
    );
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      scope?: string;
      email?: string;
      expires_in?: number | string;
    };
    return {
      scope: payload.scope ?? "",
      email: payload.email ?? "",
      expires_in: Number(payload.expires_in ?? 0) || 0,
    };
  } catch {
    return null;
  }
}
