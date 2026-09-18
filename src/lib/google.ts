import { createAdminClient } from "@/lib/supabase/server";

export const GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";

type TokenRow = {
  refresh_token: string | null;
  access_token: string | null;
  expires_at: string | null;
};

/**
 * Returns a usable Gmail access token for a user, refreshing it through
 * Google's token endpoint when the cached one is expired or nearly so.
 */
export async function getAccessToken(userId: string): Promise<string> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("google_tokens")
    .select("refresh_token, access_token, expires_at")
    .eq("user_id", userId)
    .maybeSingle<TokenRow>();

  if (error) throw new Error(`Could not read Google tokens: ${error.message}`);
  if (!data) throw new Error("NO_GOOGLE_ACCOUNT");

  const expiresAt = data.expires_at ? Date.parse(data.expires_at) : 0;
  const stillFresh = data.access_token && expiresAt - Date.now() > 60_000;
  if (stillFresh) return data.access_token!;

  if (!data.refresh_token) throw new Error("NO_REFRESH_TOKEN");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: data.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !payload.access_token) {
    if (payload.error === "invalid_grant") throw new Error("NO_REFRESH_TOKEN");
    throw new Error(payload.error_description || payload.error || "Google token refresh failed");
  }

  const newExpiry = new Date(Date.now() + (payload.expires_in ?? 3600) * 1000).toISOString();

  await admin
    .from("google_tokens")
    .update({
      access_token: payload.access_token,
      expires_at: newExpiry,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  return payload.access_token;
}

export type SendArgs = {
  accessToken: string;
  from: string;
  fromName?: string | null;
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string | null;
};

export type SendResult = { id: string; threadId?: string };

/** Sends one message through the signed-in user's own Gmail account. */
export async function sendMail(args: SendArgs): Promise<SendResult> {
  const raw = buildMime(args);

  const response = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${args.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
    },
  );

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload?.error?.message || `Gmail rejected the message (HTTP ${response.status})`;
    const err = new Error(message) as Error & { status?: number };
    err.status = response.status;
    throw err;
  }

  return { id: payload.id, threadId: payload.threadId };
}

// --- MIME ------------------------------------------------------------------

function buildMime({ from, fromName, to, subject, text, html, replyTo }: SendArgs): string {
  const boundary = `permail_${Math.random().toString(36).slice(2)}`;
  const fromHeader = fromName ? `${encodeWord(fromName)} <${from}>` : from;

  const headers = [
    `From: ${fromHeader}`,
    `To: ${to}`,
    replyTo ? `Reply-To: ${replyTo}` : null,
    `Subject: ${encodeHeader(subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ].filter(Boolean);

  const body = [
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    chunk(Buffer.from(text, "utf8").toString("base64")),
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    chunk(Buffer.from(html, "utf8").toString("base64")),
    `--${boundary}--`,
    "",
  ];

  return Buffer.from([...headers, ...body].join("\r\n"), "utf8").toString("base64url");
}

/** RFC 2047 encode headers that contain non-ASCII characters. */
function encodeHeader(value: string): string {
  const clean = (value ?? "").replace(/[\r\n]+/g, " ").trim();
  // eslint-disable-next-line no-control-regex
  return /^[\x20-\x7E]*$/.test(clean) ? clean : encodeWord(clean);
}

function encodeWord(value: string): string {
  const clean = (value ?? "").replace(/[\r\n]+/g, " ").trim();
  // eslint-disable-next-line no-control-regex
  if (/^[\x20-\x7E]*$/.test(clean) && !/["<>]/.test(clean)) {
    return /[,;:@]/.test(clean) ? `"${clean}"` : clean;
  }
  return `=?UTF-8?B?${Buffer.from(clean, "utf8").toString("base64")}?=`;
}

function chunk(base64: string): string {
  return (base64.match(/.{1,76}/g) ?? []).join("\r\n");
}
