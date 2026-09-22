-- DisMe — toda conexão correspondida já nasce pronta para conversar.

-- Corrige matches criados antes desta migration.
insert into public.conversations (user_a, user_b, created_at, updated_at)
select user_a, user_b, created_at, created_at
from public.matches
on conflict (user_a, user_b) do nothing;

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
      values (
        ordered_a,
        ordered_b,
        like_type = 'crush' or exists(
          select 1 from likes where from_id = target and to_id = caller and kind = 'crush'
        )
      )
      on conflict (user_a, user_b) do nothing;

    if found then
      update profiles set matches_count = matches_count + 1 where id in (caller, target);
      insert into notifications (profile_id, type, actor_id)
        values (target, 'match', caller), (caller, 'match', target);
    end if;

    insert into conversations (user_a, user_b)
      values (ordered_a, ordered_b)
      on conflict (user_a, user_b) do nothing;

    matched := true;
  elsif like_type = 'crush' then
    insert into notifications (profile_id, type, actor_id)
      values (target, 'crush', caller);
  end if;

  return matched;
end $$;

create or replace function public.mark_conversation_read(chat_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
begin
  if caller is null or not exists (
    select 1 from conversations
    where id = chat_id and caller in (user_a, user_b)
  ) then
    raise exception 'conversation unavailable';
  end if;

  update messages
  set read = true
  where conversation_id = chat_id
    and sender_id <> caller
    and not read;
end $$;

grant execute on function public.like_profile(uuid, like_kind) to authenticated;
grant execute on function public.mark_conversation_read(uuid) to authenticated;

-- Habilita INSERTs da tabela no Realtime sem duplicar a configuração.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'messages'
    ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
