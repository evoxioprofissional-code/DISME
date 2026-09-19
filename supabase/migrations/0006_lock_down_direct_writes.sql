-- DisMe — toda escrita social sensível passa por RPC validada

revoke insert, update on public.likes from authenticated;
revoke insert, update, delete on public.relationship_requests from authenticated;
revoke insert, update, delete on public.conversations from authenticated;
revoke insert, update, delete on public.messages from authenticated;

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
begin
  if caller is null then raise exception 'unauthenticated'; end if;
  if clean_body is null or clean_body = '' or length(clean_body) > 2000 then
    raise exception 'invalid message';
  end if;
  if not exists (
    select 1 from conversations
    where id = chat_id and caller in (user_a, user_b)
  ) then raise exception 'conversation unavailable'; end if;

  insert into messages (conversation_id, sender_id, body)
    values (chat_id, caller, clean_body)
    returning id into message_id;
  update conversations set updated_at = now() where id = chat_id;
  return message_id;
end $$;

grant execute on function public.send_chat_message(uuid, text) to authenticated;
