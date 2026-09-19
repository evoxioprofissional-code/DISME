-- Consulta pública de identidades Discord e histórico observado pelo DisMe.

create table public.discord_users (
  discord_user_id       text primary key check (discord_user_id ~ '^\d{17,20}$'),
  username              text not null,
  global_name           text,
  discriminator         text,
  avatar_hash           text,
  banner_hash           text,
  accent_color          integer,
  public_flags          bigint not null default 0,
  is_bot                boolean not null default false,
  is_system             boolean not null default false,
  avatar_decoration     jsonb,
  collectibles          jsonb,
  primary_guild         jsonb,
  discord_created_at    timestamptz not null,
  first_seen_at         timestamptz not null default now(),
  last_seen_at          timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create table public.discord_identity_history (
  id                    bigint generated always as identity primary key,
  discord_user_id       text not null references public.discord_users(discord_user_id) on delete cascade,
  username              text not null,
  global_name           text,
  avatar_hash           text,
  banner_hash           text,
  first_seen            boolean not null default false,
  observed_at           timestamptz not null default now()
);

create index discord_identity_history_user_idx
  on public.discord_identity_history (discord_user_id, observed_at desc);

create table public.discord_lookup_events (
  id                    bigint generated always as identity primary key,
  requester_profile_id  uuid not null references public.profiles(id) on delete cascade,
  target_discord_id     text not null,
  result_status         text not null check (result_status in ('fresh','cached','not_found','rate_limited','error')),
  created_at            timestamptz not null default now()
);

create index discord_lookup_events_requester_idx
  on public.discord_lookup_events (requester_profile_id, created_at desc);

alter table public.discord_users enable row level security;
alter table public.discord_identity_history enable row level security;
alter table public.discord_lookup_events enable row level security;

grant select on public.discord_users, public.discord_identity_history to authenticated;
grant select on public.discord_lookup_events to authenticated;
revoke all on public.discord_users, public.discord_identity_history, public.discord_lookup_events from anon;
revoke insert, update, delete on public.discord_users, public.discord_identity_history, public.discord_lookup_events from authenticated;

create policy discord_users_read_authenticated on public.discord_users
  for select to authenticated using (true);

create policy discord_history_read_authenticated on public.discord_identity_history
  for select to authenticated using (true);

create policy discord_events_read_own on public.discord_lookup_events
  for select to authenticated using (requester_profile_id = auth.uid());
