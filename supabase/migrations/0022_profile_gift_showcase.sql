-- DisMe — destaques de presentes e custo histórico para o novo perfil
-- Migration criada localmente. Não aplicada automaticamente.

alter table public.owned_gifts
  add column if not exists credits_spent integer check (credits_spent is null or credits_spent >= 0);

update public.owned_gifts owned
set credits_spent = gifts.price
from public.gifts gifts
where owned.gift_id = gifts.id
  and owned.from_id is not null
  and owned.credits_spent is null;

create index if not exists owned_gifts_sender_idx
  on public.owned_gifts (from_id, received_at desc)
  where from_id is not null;

revoke select on public.owned_gifts from anon, authenticated;
grant select (id, owner_id, gift_id, from_id, serial, received_at, credits_spent)
  on public.owned_gifts to anon, authenticated;

create table public.profile_featured_gifts (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  gift_id text not null references public.gifts(id) on delete cascade,
  position smallint not null check (position between 1 and 3),
  created_at timestamptz not null default now(),
  primary key (profile_id, gift_id),
  unique (profile_id, position)
);

alter table public.profile_featured_gifts enable row level security;
create policy profile_featured_gifts_read on public.profile_featured_gifts
  for select using (true);
grant select on public.profile_featured_gifts to anon, authenticated;
revoke insert, update, delete on public.profile_featured_gifts from anon, authenticated;

create or replace function public.set_profile_featured_gifts(selected_gifts text[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
begin
  if caller is null then raise exception 'unauthenticated'; end if;
  if coalesce(cardinality(selected_gifts), 0) > 3 then raise exception 'maximum three gifts'; end if;
  if exists (
    select 1 from unnest(coalesce(selected_gifts, '{}'::text[])) as selected(gift_id)
    where selected.gift_id is null
  ) then
    raise exception 'invalid gift';
  end if;
  if (select count(*) from unnest(coalesce(selected_gifts, '{}'::text[]))) <>
     (select count(distinct selected.gift_id)
      from unnest(coalesce(selected_gifts, '{}'::text[])) as selected(gift_id)) then
    raise exception 'duplicate gift';
  end if;
  if exists (
    select 1
    from unnest(coalesce(selected_gifts, '{}'::text[])) selected(gift_id)
    where not exists (
      select 1 from public.owned_gifts owned
      where owned.owner_id = caller and owned.gift_id = selected.gift_id
    )
  ) then
    raise exception 'gift is not unlocked';
  end if;

  delete from public.profile_featured_gifts where profile_id = caller;
  insert into public.profile_featured_gifts (profile_id, gift_id, position)
  select caller, gift_id, ordinality::smallint
  from unnest(coalesce(selected_gifts, '{}'::text[])) with ordinality selected(gift_id, ordinality);
end $$;

revoke all on function public.set_profile_featured_gifts(text[]) from public;
grant execute on function public.set_profile_featured_gifts(text[]) to authenticated;

-- Guarda o preço efetivamente pago. Alterações futuras de catálogo não reescrevem o histórico.
create or replace function public.send_gift(target uuid, selected_gift text, gift_message text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
  cost integer;
  flex_gain integer;
  max_supply integer;
  current_minted integer;
  gift_serial integer;
  created_id uuid;
begin
  if caller is null or target is null or caller = target then raise exception 'invalid recipient'; end if;
  select price, flex_value, supply, minted into cost, flex_gain, max_supply, current_minted
    from gifts where id = selected_gift for update;
  if not found then raise exception 'gift not found'; end if;
  if max_supply is not null and current_minted >= max_supply then raise exception 'gift sold out'; end if;

  update profiles set credits = credits - cost, flex = flex + flex_gain
    where id = caller and credits >= cost;
  if not found then raise exception 'insufficient credits'; end if;

  gift_serial := case when max_supply is null then null else current_minted + 1 end;
  insert into owned_gifts (owner_id, gift_id, from_id, serial, message, credits_spent)
    values (target, selected_gift, caller, gift_serial, nullif(trim(gift_message), ''), cost)
    returning id into created_id;
  insert into notifications (profile_id, type, actor_id, gift_id)
    values (target, 'gift', caller, selected_gift);
  return created_id;
end $$;

grant execute on function public.send_gift(uuid, text, text) to authenticated;

-- collection_count representa tipos desbloqueados; totais de recebidos/enviados continuam
-- derivados dos registros individuais de owned_gifts no novo perfil.
create or replace function public.on_owned_gift_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.profiles
    set collection_count = (
      select count(distinct gift_id)::integer from public.owned_gifts where owner_id = new.owner_id
    )
    where id = new.owner_id;
  update public.gifts set minted = minted + 1 where id = new.gift_id and supply is not null;
  if new.from_id is not null then
    update public.profiles set gifts_received = gifts_received + 1 where id = new.owner_id;
    update public.profiles set gifts_sent = gifts_sent + 1 where id = new.from_id;
  end if;
  return new;
end $$;

update public.profiles profile
set gifts_received = (select count(*)::integer from public.owned_gifts where owner_id = profile.id and from_id is not null),
    gifts_sent = (select count(*)::integer from public.owned_gifts where from_id = profile.id),
    collection_count = (select count(distinct gift_id)::integer from public.owned_gifts where owner_id = profile.id);
