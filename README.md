# Permail

Bulk email that reads like one-to-one. Sign in with Google, bring a list with as many
columns as you like, write one draft with `{{merge_tags}}`, and Permail sends a separate,
personalised message to every row — from the user's own Gmail account.

- **Frontend:** Next.js 15 (App Router) + Tailwind CSS v4
- **Backend:** Supabase (Postgres, Auth, RLS)
- **Delivery:** Gmail API, using each user's own OAuth grant

---

## Setup

### 1. Supabase project

Create a project at [supabase.com](https://supabase.com), then open **SQL Editor** and run
the whole of [`supabase/schema.sql`](supabase/schema.sql). It creates the tables, the
row-level security policies, and the trigger that provisions a profile on sign-up.

Note the two token tables:

| table | who can read it |
| --- | --- |
| `google_accounts` | the signed-in user (address + whether sending is authorised) |
| `google_tokens` | **nobody** — RLS is on with zero policies, so only the service role reaches it |

### 2. Google Cloud OAuth client

1. In [Google Cloud Console](https://console.cloud.google.com) create (or pick) a project.
2. **APIs & Services → Library →** enable **Gmail API**.
3. **OAuth consent screen:** external, add the scope
   `https://www.googleapis.com/auth/gmail.send`, and add yourself as a test user.
4. **Credentials → Create credentials → OAuth client ID → Web application.**
   Authorised redirect URI:

   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```

5. Copy the client ID and secret.

> The `gmail.send` scope is *restricted*. It works immediately for test users; publishing
> the app to everyone requires Google's verification review.

### 3. Wire Google into Supabase Auth

**Authentication → Providers → Google:** enable it, paste the client ID and secret.
**Authentication → URL Configuration:** set the site URL and add
`http://localhost:3000/auth/callback` (plus your production callback) to the redirect
allow-list.

### 4. Environment

```bash
cp .env.example .env.local
```

Fill in:

| variable | where it comes from |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API Keys → **Publishable key** (older projects call this `anon` / `public`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API Keys → **Secret keys** → Reveal (older projects call this `service_role`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | the OAuth client from step 2 |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` in development |

Supabase renamed its keys: *publishable* is the new *anon*, *secret* is the new *service_role*.
Either format works here — the new ones start `sb_publishable_` / `sb_secret_`, the legacy ones
are JWTs starting `eyJ`. The secret key bypasses every RLS policy, so it stays server-side: it is
used only by `createAdminClient()` to reach the `google_tokens` vault.

The Google credentials are needed server-side as well as in Supabase: Permail refreshes the
Gmail access token itself when a campaign is sending.

### 5. Run

```bash
npm install
npm run dev
```

---

## How it fits together

```
src/
  app/
    page.tsx                       landing page
    auth/callback/route.ts         code exchange + stores the Google refresh token
    app/                           the signed-in product
      page.tsx                     home — setup path, lifetime stats, recent sends
      campaigns/page.tsx           drafts and sent campaigns
      campaigns/[id]/page.tsx      composer (draft) or delivery report (sent)
      audiences/[id]/page.tsx      the recipient sheet
      guide/page.tsx               the in-app guide
      settings/page.tsx            connected account, sending limits
    api/campaigns/[id]/send/       batched sender
  components/                      composer, sheet editor, nav, primitives
  lib/
    progress.ts                    setup steps and lifetime milestones
    merge.ts                       {{tag}} parsing, rendering, validation
    format.ts                      plain text -> the HTML half of the message
    google.ts                      token refresh + Gmail MIME send
    csv.ts                         paste/CSV parsing
    actions.ts                     server actions
```

### Merge tags

Any column on an audience becomes a tag. There is no fixed set and no limit.

```
{{first_name}}            the column's value, or empty
{{company|your team}}     falls back when the cell is blank
{{First Name}}            matches first_name — case and spacing are ignored
```

The composer flags tags with no matching column and counts rows that would render an empty
value, before you can send.

### Sending model

`POST /api/campaigns/[id]/send` sends **one batch per call** and returns
`{ sent, failed, remaining }`; the client keeps calling until `remaining` is `0`. That keeps
every request well inside a serverless timeout and makes the send resumable — reopening a
campaign that is still `sending` picks up exactly where it stopped.

Each batch *claims* its rows by flipping them to `sending` under the same filter used to
select them, so two callers can never mail the same address twice. A claim left stranded for
more than five minutes is reclaimed automatically.

Recipients are de-duplicated when the campaign is frozen, and every message is a separate
Gmail send — no BCC, no shared thread.

### Sending limits

Google enforces the volume cap, not Permail: roughly 500 messages/day on a personal Gmail
account and 2,000 on Workspace. Over-cap sends come back as failed recipients with Google's
own error message and can be retried the next day.

---

## Deploying

Works on Vercel as-is. Add the same environment variables, set `NEXT_PUBLIC_SITE_URL` to the
production origin, and add `https://<domain>/auth/callback` to the Supabase redirect
allow-list.
