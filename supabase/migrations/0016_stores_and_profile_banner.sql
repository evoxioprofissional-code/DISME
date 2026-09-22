-- DisMe — lojas de usuários e capa de perfil.

create table public.marketplace_stores (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null unique references public.profiles(id) on delete cascade,
  slug         text not null unique check (slug ~ '^[a-z0-9_]{3,30}$'),
  name         text not null check (char_length(name) between 3 and 60),
  description  text not null default '' check (char_length(description) <= 500),
  avatar_url   text,
  banner_url   text,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger marketplace_stores_updated_at
  before update on public.marketplace_stores
  for each row execute function public.set_updated_at();

alter table public.marketplace_stores enable row level security;
create policy marketplace_stores_read on public.marketplace_stores
  for select using (is_published or auth.uid() = owner_id);
create policy marketplace_stores_insert on public.marketplace_stores
  for insert with check (auth.uid() = owner_id);
create policy marketplace_stores_update on public.marketplace_stores
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy marketplace_stores_delete on public.marketplace_stores
  for delete using (auth.uid() = owner_id);

grant select on public.marketplace_stores to anon, authenticated;
grant insert, update, delete on public.marketplace_stores to authenticated;

-- Preserva anúncios existentes criando uma loja para cada anunciante atual.
insert into public.marketplace_stores (owner_id, slug, name, description, avatar_url)
select distinct
  p.id,
  p.username,
  left('Loja de ' || p.display_name, 60),
  'Publicações de @' || p.username || ' no DisMe.',
  p.avatar_url
from public.profiles p
join public.marketplace_listings l on l.seller_id = p.id
on conflict (owner_id) do nothing;

alter table public.marketplace_listings
  add column store_id uuid references public.marketplace_stores(id) on delete cascade;

update public.marketplace_listings l
set store_id = s.id
from public.marketplace_stores s
where s.owner_id = l.seller_id;

alter table public.marketplace_listings alter column store_id set not null;
create index marketplace_listings_store_idx
  on public.marketplace_listings (store_id, status, created_at desc);

create or replace function public.validate_listing_store_owner()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  if not exists (
    select 1 from public.marketplace_stores s
    where s.id = new.store_id and s.owner_id = new.seller_id
  ) then
    raise exception 'listing store must belong to seller';
  end if;
  return new;
end $$;

create trigger marketplace_listing_store_owner
  before insert or update of store_id, seller_id on public.marketplace_listings
  for each row execute function public.validate_listing_store_owner();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'store-media',
  'store-media',
  true,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;
