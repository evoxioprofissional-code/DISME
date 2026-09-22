-- DisMe — notificação agrupada por conversa para novas mensagens.

create or replace function public.send_chat_message(chat_id uuid, message_body text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller uuid := auth.uid();
  clean_body text := trim(message_body);
  message_id uuid;
  recipient uuid;
begin
  if caller is null then raise exception 'unauthenticated'; end if;
  if clean_body is null or clean_body = '' or length(clean_body) > 2000 then
    raise exception 'invalid message';
  end if;

  select case when user_a = caller then user_b else user_a end
    into recipient
  from conversations
  where id = chat_id and caller in (user_a, user_b);

  if recipient is null then raise exception 'conversation unavailable'; end if;

  insert into messages (conversation_id, sender_id, body)
    values (chat_id, caller, clean_body)
    returning id into message_id;

  update conversations set updated_at = now() where id = chat_id;

  -- Mantém somente um aviso não lido por conversa/remetente, atualizado com
  -- a mensagem mais recente, evitando poluir a central de notificações.
  update notifications
  set created_at = now(),
      meta = jsonb_build_object(
        'conversation_id', chat_id,
        'preview', left(clean_body, 120)
      )
  where id = (
    select id
    from notifications
    where profile_id = recipient
      and type = 'message'
      and actor_id = caller
      and not read
      and meta ->> 'conversation_id' = chat_id::text
    order by created_at desc
    limit 1
  );

  if not found then
    insert into notifications (profile_id, type, actor_id, meta)
      values (
        recipient,
        'message',
        caller,
        jsonb_build_object(
          'conversation_id', chat_id,
          'preview', left(clean_body, 120)
        )
      );
  end if;

  return message_id;
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

  update notifications
  set read = true
  where profile_id = caller
    and type = 'message'
    and not read
    and meta ->> 'conversation_id' = chat_id::text;
end $$;

grant execute on function public.send_chat_message(uuid, text) to authenticated;
grant execute on function public.mark_conversation_read(uuid) to authenticated;
