-- DisMe — presentes em destaque no perfil
-- Migration criada localmente. Não aplicada automaticamente.

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
