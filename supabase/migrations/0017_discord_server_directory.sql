-- DisMe — diretório de servidores Discord anunciados por seus donos.

create table public.discord_server_listings (
  id                    uuid primary key default gen_random_uuid(),
  owner_profile_id      uuid not null references public.profiles(id) on delete cascade,
  discord_guild_id      text not null unique check (discord_guild_id ~ '^\d{17,20}$'),
  discord_owner_id      text not null check (discord_owner_id ~ '^\d{17,20}$'),
  name                  text not null check (char_length(name) between 1 and 100),
  discord_description   text,
  promo_text            text not null default '' check (char_length(promo_text) <= 700),
  icon_url              text,
  banner_url            text,
  splash_url            text,
  invite_url            text check (invite_url is null or char_length(invite_url) <= 200),
  member_count          integer not null default 0 check (member_count >= 0),
  online_count          integer not null default 0 check (online_count >= 0),
  boost_count           integer not null default 0 check (boost_count >= 0),
  boost_tier            integer not null default 0 check (boost_tier between 0 and 3),
  verification_level    integer not null default 0 check (verification_level between 0 and 4),
  preferred_locale      text,
  channel_count         integer not null default 0 check (channel_count >= 0),
  role_count            integer not null default 0 check (role_count >= 0),
  emoji_count           integer not null default 0 check (emoji_count >= 0),
  features              text[] not null default '{}',
  tags                  text[] not null default '{}',
  is_published          boolean not null default true,
  synced_at             timestamptz not null default now(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  check (cardinality(tags) <= 8),
  check (cardinality(features) <= 80)
);

create index discord_server_listings_feed_idx
  on public.discord_server_listings (is_published, member_count desc, updated_at desc);
create index discord_server_listings_owner_idx
  on public.discord_server_listings (owner_profile_id, updated_at desc);

create trigger discord_server_listings_updated_at
  before update on public.discord_server_listings
  for each row execute function public.set_updated_at();

alter table public.discord_server_listings enable row level security;
create policy discord_server_listings_read on public.discord_server_listings
  for select using (is_published or auth.uid() = owner_profile_id);
create policy discord_server_listings_insert on public.discord_server_listings
  for insert with check (auth.uid() = owner_profile_id);
create policy discord_server_listings_update on public.discord_server_listings
  for update using (auth.uid() = owner_profile_id) with check (auth.uid() = owner_profile_id);
create policy discord_server_listings_delete on public.discord_server_listings
  for delete using (auth.uid() = owner_profile_id);

grant select on public.discord_server_listings to anon, authenticated;
grant insert, update, delete on public.discord_server_listings to authenticated;
