-- DisMe — operações sensíveis e proteção de colunas econômicas

-- O cliente pode editar apenas campos de perfil. Economia e contadores são
-- mantidos exclusivamente por funções security definer.
revoke update on public.profiles from authenticated;
grant update (
  username, display_name, age, pronouns, location, bio, avatar_url, banner_url,
  presence, last_seen, gender, intent, relationship, games, interests,
  is_hidden, onboarded, updated_at
) on public.profiles to authenticated;

-- Coleção, matches e casais nunca são escritos diretamente pelo navegador.
drop policy if exists owned_gifts_insert on public.owned_gifts;
drop policy if exists conversations_insert on public.conversations;
drop policy if exists rel_requests_update on public.relationship_requests;
drop policy if exists couples_write on public.couples;
revoke insert, update, delete on public.owned_gifts from authenticated;
revoke insert, update, delete on public.matches from authenticated;
revoke insert, update, delete on public.couples from authenticated;
revoke insert, update, delete on public.flex_battles from authenticated;
revoke insert, update, delete on public.feed_activities from authenticated;
revoke insert, update, delete on public.notifications from authenticated;

create or replace function public.like_profile(target uuid, like_type like_kind default 'like')
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
  reciprocal boolean;
  ordered_a uuid;
  ordered_b uuid;
  matched boolean := false;
begin
  if caller is null or target is null or caller = target then
    raise exception 'invalid like';
  end if;
  if not exists (select 1 from profiles where id = target and onboarded and not is_hidden) then
    raise exception 'profile unavailable';
  end if;
  if like_type = 'crush' then
    update profiles set crushes_left = crushes_left - 1
      where id = caller and crushes_left > 0;
    if not found then raise exception 'no crushes left'; end if;
  end if;
  insert into likes (from_id, to_id, kind)
    values (caller, target, like_type)
    on conflict (from_id, to_id) do update set kind = excluded.kind;

  select exists(select 1 from likes where from_id = target and to_id = caller)
    into reciprocal;
  if reciprocal then
    ordered_a := least(caller, target);
    ordered_b := greatest(caller, target);
    insert into matches (user_a, user_b, via_crush)
      values (ordered_a, ordered_b,
        like_type = 'crush' or exists(
          select 1 from likes where from_id = target and to_id = caller and kind = 'crush'
        ))
      on conflict (user_a, user_b) do nothing;
    if found then
      update profiles set matches_count = matches_count + 1 where id in (caller, target);
      insert into notifications (profile_id, type, actor_id)
        values (target, 'match', caller), (caller, 'match', target);
    end if;
    matched := true;
  elsif like_type = 'crush' then
    insert into notifications (profile_id, type, actor_id)
      values (target, 'crush', caller);
  end if;
  return matched;
end $$;

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
  insert into owned_gifts (owner_id, gift_id, from_id, serial, message)
    values (target, selected_gift, caller, gift_serial, nullif(trim(gift_message), ''))
    returning id into created_id;
  insert into notifications (profile_id, type, actor_id, gift_id)
    values (target, 'gift', caller, selected_gift);
  return created_id;
end $$;

create or replace function public.accept_relationship_request(request_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
  req relationship_requests%rowtype;
  ordered_a uuid;
  ordered_b uuid;
  created_id uuid;
begin
  select * into req from relationship_requests
    where id = request_id and to_id = caller and status = 'pending' for update;
  if not found then raise exception 'request unavailable'; end if;
  ordered_a := least(req.from_id, req.to_id);
  ordered_b := greatest(req.from_id, req.to_id);
  insert into couples (user_a, user_b, type)
    values (ordered_a, ordered_b, req.type)
    returning id into created_id;
  update profiles set relationship = req.type,
    partner_id = case when id = req.from_id then req.to_id else req.from_id end
    where id in (req.from_id, req.to_id);
  update relationship_requests set status = 'accepted' where id = request_id;
  return created_id;
end $$;

grant execute on function public.like_profile(uuid, like_kind) to authenticated;
grant execute on function public.send_gift(uuid, text, text) to authenticated;
grant execute on function public.accept_relationship_request(uuid) to authenticated;
