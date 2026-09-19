-- DisMe — agregações de navegação e conversas para reduzir round-trips

create or replace function public.get_nav_counts()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'notifications', (select count(*) from notifications where profile_id = auth.uid() and not read),
    'messages', (
      select count(*) from messages m
      join conversations c on c.id = m.conversation_id
      where auth.uid() in (c.user_a, c.user_b) and m.sender_id <> auth.uid() and not m.read
    )
  )
$$;

create or replace function public.get_conversation_summaries()
returns table (
  id uuid,
  other_id uuid,
  updated_at timestamptz,
  last_body text,
  last_gift_id text,
  last_sender_id uuid,
  unread bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    case when c.user_a = auth.uid() then c.user_b else c.user_a end,
    c.updated_at,
    last_message.body,
    last_message.gift_id,
    last_message.sender_id,
    (
      select count(*) from messages unread_message
      where unread_message.conversation_id = c.id
        and unread_message.sender_id <> auth.uid()
        and not unread_message.read
    )
  from conversations c
  left join lateral (
    select m.body, m.gift_id, m.sender_id
    from messages m
    where m.conversation_id = c.id
    order by m.created_at desc
    limit 1
  ) last_message on true
  where auth.uid() in (c.user_a, c.user_b)
  order by c.updated_at desc
$$;

grant execute on function public.get_nav_counts() to authenticated;
grant execute on function public.get_conversation_summaries() to authenticated;

create index if not exists messages_unread_idx
  on public.messages (conversation_id, read, sender_id);
