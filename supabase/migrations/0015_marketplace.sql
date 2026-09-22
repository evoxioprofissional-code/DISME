-- DisMe — Marketplace seguro e vitrine de contas.
-- Contas só podem ser publicadas como exposição, nunca como anúncio comercial.

create type public.marketplace_listing_kind as enum ('market', 'showcase');
create type public.marketplace_category as enum ('item', 'service', 'peripheral', 'collectible', 'account_showcase');
create type public.marketplace_status as enum ('active', 'paused', 'closed', 'removed');

create table public.marketplace_listings (
  id              uuid primary key default gen_random_uuid(),
  seller_id       uuid not null references public.profiles(id) on delete cascade,
  kind            public.marketplace_listing_kind not null,
  category        public.marketplace_category not null,
  title           text not null check (char_length(title) between 4 and 80),
  description     text not null check (char_length(description) between 20 and 1600),
  price_cents     integer,
  currency        text not null default 'BRL' check (currency = 'BRL'),
  platform        text check (platform is null or char_length(platform) <= 40),
  transfer_method text check (transfer_method is null or char_length(transfer_method) <= 120),
  images          text[] not null default '{}',
  tags            text[] not null default '{}',
  status          public.marketplace_status not null default 'active',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (cardinality(images) <= 5),
  check (cardinality(tags) <= 8),
  check (
    (kind = 'showcase' and category = 'account_showcase' and price_cents is null and transfer_method is null)
    or
    (kind = 'market' and category <> 'account_showcase' and price_cents is not null and price_cents >= 0)
  )
);

create index marketplace_listings_feed_idx
  on public.marketplace_listings (kind, status, created_at desc);
create index marketplace_listings_seller_idx
  on public.marketplace_listings (seller_id, created_at desc);

create trigger marketplace_listings_updated_at
  before update on public.marketplace_listings
  for each row execute function public.set_updated_at();

create table public.marketplace_favorites (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, listing_id)
);

create table public.marketplace_reports (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.marketplace_listings(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason      text not null check (reason in ('prohibited_sale','scam','misleading','stolen_content','other')),
  details     text check (details is null or char_length(details) <= 500),
  created_at  timestamptz not null default now(),
  unique (listing_id, reporter_id)
);

alter table public.marketplace_listings enable row level security;
alter table public.marketplace_favorites enable row level security;
alter table public.marketplace_reports enable row level security;

create policy marketplace_listings_read on public.marketplace_listings
  for select using (status = 'active' or auth.uid() = seller_id);
create policy marketplace_listings_insert on public.marketplace_listings
  for insert with check (auth.uid() = seller_id);
create policy marketplace_listings_update on public.marketplace_listings
  for update using (auth.uid() = seller_id) with check (auth.uid() = seller_id);
create policy marketplace_listings_delete on public.marketplace_listings
  for delete using (auth.uid() = seller_id);

create policy marketplace_favorites_read on public.marketplace_favorites
  for select using (auth.uid() = profile_id);
create policy marketplace_favorites_insert on public.marketplace_favorites
  for insert with check (auth.uid() = profile_id);
create policy marketplace_favorites_delete on public.marketplace_favorites
  for delete using (auth.uid() = profile_id);

create policy marketplace_reports_read on public.marketplace_reports
  for select using (auth.uid() = reporter_id);
create policy marketplace_reports_insert on public.marketplace_reports
  for insert with check (auth.uid() = reporter_id);

grant select on public.marketplace_listings to anon, authenticated;
grant insert, update, delete on public.marketplace_listings to authenticated;
grant select, insert, delete on public.marketplace_favorites to authenticated;
grant select, insert on public.marketplace_reports to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'marketplace-media',
  'marketplace-media',
  true,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;
