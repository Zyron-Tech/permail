-- ============================================================================
-- Permail — Supabase schema
-- Run this in the Supabase SQL editor (or `supabase db push`) on a fresh project.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own"   on public.profiles for select using (auth.uid() = id);
create policy "profiles: update own" on public.profiles for update using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user appears.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
    set email      = excluded.email,
        full_name  = coalesce(excluded.full_name, public.profiles.full_name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- google_accounts  — the Gmail identity mail is sent from (safe to expose)
-- ---------------------------------------------------------------------------
create table if not exists public.google_accounts (
  user_id       uuid primary key references auth.users on delete cascade,
  google_email  text not null,
  scopes        text,
  can_send      boolean not null default false,
  connected_at  timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.google_accounts enable row level security;
create policy "google_accounts: read own" on public.google_accounts for select using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- google_tokens — OAuth secrets. RLS on, ZERO policies => service role only.
-- ---------------------------------------------------------------------------
create table if not exists public.google_tokens (
  user_id        uuid primary key references auth.users on delete cascade,
  refresh_token  text,
  access_token   text,
  expires_at     timestamptz,
  updated_at     timestamptz not null default now()
);

alter table public.google_tokens enable row level security;

-- ---------------------------------------------------------------------------
-- audiences — a named recipient sheet with user-defined dynamic columns
-- ---------------------------------------------------------------------------
create table if not exists public.audiences (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  name        text not null default 'Untitled audience',
  fields      text[] not null default array['first_name']::text[],
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists audiences_user_idx on public.audiences (user_id, updated_at desc);

alter table public.audiences enable row level security;
create policy "audiences: all own" on public.audiences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- contacts — one row per recipient; `data` holds every dynamic field
-- ---------------------------------------------------------------------------
create table if not exists public.contacts (
  id           uuid primary key default gen_random_uuid(),
  audience_id  uuid not null references public.audiences on delete cascade,
  user_id      uuid not null references auth.users on delete cascade,
  email        text not null,
  data         jsonb not null default '{}'::jsonb,
  position     integer not null default 0,
  created_at   timestamptz not null default now()
);

create index if not exists contacts_audience_idx on public.contacts (audience_id, position);

alter table public.contacts enable row level security;
create policy "contacts: all own" on public.contacts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- campaigns
-- ---------------------------------------------------------------------------
create table if not exists public.campaigns (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users on delete cascade,
  audience_id   uuid references public.audiences on delete set null,
  name          text not null default 'Untitled campaign',
  subject       text not null default '',
  body          text not null default '',
  from_name     text,
  reply_to      text,
  status        text not null default 'draft'
                check (status in ('draft', 'sending', 'sent', 'failed')),
  total_count   integer not null default 0,
  sent_count    integer not null default 0,
  failed_count  integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  sent_at       timestamptz
);

create index if not exists campaigns_user_idx on public.campaigns (user_id, created_at desc);

alter table public.campaigns enable row level security;
create policy "campaigns: all own" on public.campaigns
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- campaign_recipients — frozen snapshot of who got what, plus delivery state
-- ---------------------------------------------------------------------------
create table if not exists public.campaign_recipients (
  id               uuid primary key default gen_random_uuid(),
  campaign_id      uuid not null references public.campaigns on delete cascade,
  user_id          uuid not null references auth.users on delete cascade,
  email            text not null,
  data             jsonb not null default '{}'::jsonb,
  rendered_subject text,
  status           text not null default 'pending'
                   check (status in ('pending', 'sending', 'sent', 'failed')),
  error            text,
  message_id       text,
  claimed_at       timestamptz,
  sent_at          timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists campaign_recipients_campaign_idx
  on public.campaign_recipients (campaign_id, status);

alter table public.campaign_recipients enable row level security;
create policy "campaign_recipients: all own" on public.campaign_recipients
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
