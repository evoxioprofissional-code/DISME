-- DisMe — Row Level Security
-- Público: perfis, catálogos, coleções, feed, casais, rankings.
-- Privado (só envolvidos): likes, matches, conversas, mensagens, notificações, pedidos.

-- Grants base (RLS ainda restringe as linhas)
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;

alter default privileges in schema public grant select on tables to anon, authenticated;
alter default privileges in schema public grant insert, update, delete on tables to authenticated;

-- Habilita RLS
alter table public.games                 enable row level security;
alter table public.gifts                 enable row level security;
alter table public.profiles              enable row level security;
alter table public.badges                enable row level security;
alter table public.connections           enable row level security;
alter table public.owned_gifts           enable row level security;
alter table public.likes                 enable row level security;
alter table public.matches               enable row level security;
alter table public.follows               enable row level security;
alter table public.conversations         enable row level security;
alter table public.messages              enable row level security;
alter table public.notifications         enable row level security;
alter table public.relationship_requests enable row level security;
alter table public.couples               enable row level security;
alter table public.couple_events         enable row level security;
alter table public.couple_achievements   enable row level security;
alter table public.couple_pets           enable row level security;
alter table public.flex_battles          enable row level security;
alter table public.feed_activities       enable row level security;

-- ---- Catálogos: leitura pública ----
create policy games_read  on public.games  for select using (true);
create policy gifts_read  on public.gifts  for select using (true);

-- ---- Perfis ----
create policy profiles_read   on public.profiles for select using (true);
create policy profiles_insert on public.profiles for insert with check (auth.uid() = id);
create policy profiles_update on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- ---- Badges / Conexões ----
create policy badges_read on public.badges for select using (true);
create policy connections_read on public.connections for select using (true);
create policy connections_write on public.connections for all
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- ---- Coleção (pública para ver; envia quem é o remetente) ----
create policy owned_gifts_read on public.owned_gifts for select using (true);
create policy owned_gifts_insert on public.owned_gifts for insert
  with check (auth.uid() = from_id);

-- ---- Likes / Crushes ----
create policy likes_read on public.likes for select
  using (auth.uid() in (from_id, to_id));
create policy likes_insert on public.likes for insert
  with check (auth.uid() = from_id);
create policy likes_delete on public.likes for delete
  using (auth.uid() = from_id);

-- ---- Matches ----
create policy matches_read on public.matches for select
  using (auth.uid() in (user_a, user_b));

-- ---- Follows ----
create policy follows_read on public.follows for select using (true);
create policy follows_insert on public.follows for insert with check (auth.uid() = follower_id);
create policy follows_delete on public.follows for delete using (auth.uid() = follower_id);

-- ---- Conversas / Mensagens ----
create policy conversations_read on public.conversations for select
  using (auth.uid() in (user_a, user_b));
create policy conversations_insert on public.conversations for insert
  with check (auth.uid() in (user_a, user_b));

create policy messages_read on public.messages for select
  using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id and auth.uid() in (c.user_a, c.user_b)
  ));
create policy messages_insert on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and auth.uid() in (c.user_a, c.user_b)
    )
  );

-- ---- Notificações ----
create policy notifications_read on public.notifications for select
  using (auth.uid() = profile_id);
create policy notifications_update on public.notifications for update
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- ---- Pedidos de relacionamento ----
create policy rel_requests_read on public.relationship_requests for select
  using (auth.uid() in (from_id, to_id));
create policy rel_requests_insert on public.relationship_requests for insert
  with check (auth.uid() = from_id);
create policy rel_requests_update on public.relationship_requests for update
  using (auth.uid() in (from_id, to_id)) with check (auth.uid() in (from_id, to_id));

-- ---- Casais (públicos) ----
create policy couples_read on public.couples for select using (true);
create policy couples_write on public.couples for all
  using (auth.uid() in (user_a, user_b)) with check (auth.uid() in (user_a, user_b));

create policy couple_events_read on public.couple_events for select using (true);
create policy couple_events_write on public.couple_events for all
  using (exists (select 1 from public.couples c where c.id = couple_id and auth.uid() in (c.user_a, c.user_b)))
  with check (exists (select 1 from public.couples c where c.id = couple_id and auth.uid() in (c.user_a, c.user_b)));

create policy couple_ach_read on public.couple_achievements for select using (true);
create policy couple_ach_write on public.couple_achievements for all
  using (exists (select 1 from public.couples c where c.id = couple_id and auth.uid() in (c.user_a, c.user_b)))
  with check (exists (select 1 from public.couples c where c.id = couple_id and auth.uid() in (c.user_a, c.user_b)));

create policy couple_pets_read on public.couple_pets for select using (true);
create policy couple_pets_write on public.couple_pets for all
  using (exists (select 1 from public.couples c where c.id = couple_id and auth.uid() in (c.user_a, c.user_b)))
  with check (exists (select 1 from public.couples c where c.id = couple_id and auth.uid() in (c.user_a, c.user_b)));

-- ---- Batalhas / Feed (públicos para leitura) ----
create policy flex_battles_read on public.flex_battles for select using (true);
create policy feed_read on public.feed_activities for select using (true);

-- View do ranking
grant select on public.flex_ranking to anon, authenticated;
