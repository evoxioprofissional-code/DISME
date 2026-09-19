-- Histórico normalizado por campo, escrito apenas pelo backend service-role.

create table public.discord_history_observations (
  id              bigint generated always as identity primary key,
  discord_user_id text not null references public.discord_users(discord_user_id) on delete cascade,
  field           text not null check (field in ('username', 'display_name', 'avatar', 'banner')),
  value           text not null,
  asset_url       text,
  asset_hash      text,
  first_seen_at   timestamptz not null,
  last_seen_at    timestamptz not null,
  observed_at     timestamptz not null,
  source          text not null check (source in ('discord', 'oathnet', 'namedc', 'disme')),
  unique (discord_user_id, field, value, source)
);

create index discord_history_observations_lookup_idx
  on public.discord_history_observations (discord_user_id, field, observed_at desc);

alter table public.discord_history_observations enable row level security;
revoke all on public.discord_history_observations from anon, authenticated;