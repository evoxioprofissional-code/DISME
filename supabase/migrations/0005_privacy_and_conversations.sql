-- DisMe — privacidade e criação segura de conversas/pedidos

drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select
  using (not is_hidden or auth.uid() = id);

-- Estado de relacionamento é derivado de pedido aceito, não editável no perfil.
revoke update (relationship) on public.profiles from authenticated;

-- Mensagens privadas de presentes não fazem parte da coleção pública.
revoke select on public.owned_gifts from anon, authenticated;
grant select (id, owner_id, gift_id, from_id, serial, received_at)
  on public.owned_gifts to anon, authenticated;

create or replace function public.start_conversation(target uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
  ordered_a uuid;
  ordered_b uuid;
  conversation_id uuid;
begin
  if caller is null or target is null or caller = target then raise exception 'invalid recipient'; end if;
  ordered_a := least(caller, target);
  ordered_b := greatest(caller, target);
  if not exists (select 1 from matches where user_a = ordered_a and user_b = ordered_b) then
    raise exception 'conversation requires a match';
  end if;
  insert into conversations (user_a, user_b)
    values (ordered_a, ordered_b)
    on conflict (user_a, user_b) do update set updated_at = conversations.updated_at
    returning id into conversation_id;
  return conversation_id;
end $$;

create or replace function public.request_relationship(
  target uuid,
  relationship_type relationship_status,
  request_message text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
  request_id uuid;
begin
  if caller is null or target is null or caller = target then raise exception 'invalid recipient'; end if;
  if relationship_type not in ('namorando', 'webnamoro') then raise exception 'invalid relationship type'; end if;
  if exists (select 1 from couples where caller in (user_a, user_b) or target in (user_a, user_b)) then
    raise exception 'relationship unavailable';
  end if;
  if exists (
    select 1 from relationship_requests
    where status = 'pending' and ((from_id = caller and to_id = target) or (from_id = target and to_id = caller))
  ) then raise exception 'request already pending'; end if;
  insert into relationship_requests (from_id, to_id, type, message)
    values (caller, target, relationship_type, nullif(trim(request_message), ''))
    returning id into request_id;
  insert into notifications (profile_id, type, actor_id)
    values (target, 'relationship', caller);
  return request_id;
end $$;

grant execute on function public.start_conversation(uuid) to authenticated;
grant execute on function public.request_relationship(uuid, relationship_status, text) to authenticated;
