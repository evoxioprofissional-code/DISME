-- DisMe — schema inicial
-- Rede social da cultura Discord: perfis, descoberta/match, Flex, presentes,
-- coleções, relacionamentos e casais. Mock-first virou real.

-- =========================================================
-- Extensões
-- =========================================================
create extension if not exists pgcrypto;

-- =========================================================
-- Enums
-- =========================================================
create type rarity as enum ('common','rare','epic','legendary','limited');
create type intent as enum ('namoro','amizade','duo','conversar');
create type relationship_status as enum ('solteiro','namorando','webnamoro','complicado','reservado');
create type gender as enum ('masculino','feminino','nao-binario','outro');
create type presence_state as enum ('online','ausente','ocupado','offline');
create type gift_category as enum ('populares','romanticos','raros','colecionaveis','limitados');
create type connection_platform as enum ('steam','spotify','riot','twitch','discord');
create type feed_type as enum ('relationship','gift','ranking','milestone','profile','collection','match');
create type notification_type as enum ('match','gift','crush','milestone','ranking','relationship','message');
create type like_kind as enum ('like','crush');
create type request_status as enum ('pending','accepted','declined');

-- =========================================================
-- Função utilitária: updated_at
-- =========================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- =========================================================
-- Catálogo: jogos
-- =========================================================
create table public.games (
  id    text primary key,
  name  text not null,
  short text not null
);

-- =========================================================
-- Catálogo: presentes
-- =========================================================
create table public.gifts (
  id          text primary key,
  name        text not null,
  rarity      rarity not null,
  price       integer not null check (price >= 0),
  category    gift_category not null,
  supply      integer check (supply is null or supply > 0),
  minted      integer not null default 0,
  description text not null default '',
  flex_value  integer not null default 0
);

-- =========================================================
-- Perfis (1:1 com auth.users)
-- =========================================================
create table public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  username         text not null unique,
  display_name     text not null,
  age              integer check (age is null or age between 18 and 120),
  pronouns         text,
  location         text,
  bio              text not null default '',
  avatar_url       text,
  banner_url       text,
  presence         presence_state not null default 'offline',
  last_seen        timestamptz default now(),
  gender           gender,
  intent           intent not null default 'conversar',
  relationship     relationship_status not null default 'solteiro',
  partner_id       uuid references public.profiles(id) on delete set null,
  games            text[] not null default '{}',
  interests        text[] not null default '{}',
  -- economia / status
  credits          integer not null default 0,
  flex             integer not null default 0,
  crushes_left     integer not null default 3,
  -- contadores em cache
  gifts_received   integer not null default 0,
  gifts_sent       integer not null default 0,
  matches_count    integer not null default 0,
  followers_count  integer not null default 0,
  collection_count integer not null default 0,
  -- flags
  is_hidden        boolean not null default false,
  onboarded        boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index profiles_username_idx on public.profiles (username);
create index profiles_flex_idx on public.profiles (flex desc);
create index profiles_intent_idx on public.profiles (intent);
create index profiles_games_gin on public.profiles using gin (games);
create index profiles_interests_gin on public.profiles using gin (interests);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- =========================================================
-- Badges / Conexões
-- =========================================================
create table public.badges (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  label      text not null,
  icon       text not null,
  rarity     rarity,
  awarded_at timestamptz not null default now()
);
create index badges_profile_idx on public.badges (profile_id);

create table public.connections (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  platform   connection_platform not null,
  handle     text not null,
  detail     text,
  created_at timestamptz not null default now(),
  unique (profile_id, platform)
);

-- =========================================================
-- Coleção de presentes
-- =========================================================
create table public.owned_gifts (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles(id) on delete cascade,
  gift_id     text not null references public.gifts(id),
  from_id     uuid references public.profiles(id) on delete set null,
  serial      integer,
  message     text,
  received_at timestamptz not null default now()
);
create index owned_gifts_owner_idx on public.owned_gifts (owner_id, received_at desc);

-- =========================================================
-- Likes / Crushes
-- =========================================================
create table public.likes (
  id         uuid primary key default gen_random_uuid(),
  from_id    uuid not null references public.profiles(id) on delete cascade,
  to_id      uuid not null references public.profiles(id) on delete cascade,
  kind       like_kind not null default 'like',
  created_at timestamptz not null default now(),
  unique (from_id, to_id),
  check (from_id <> to_id)
);
create index likes_to_idx on public.likes (to_id);

-- =========================================================
-- Matches (par não-ordenado: user_a < user_b)
-- =========================================================
create table public.matches (
  id         uuid primary key default gen_random_uuid(),
  user_a     uuid not null references public.profiles(id) on delete cascade,
  user_b     uuid not null references public.profiles(id) on delete cascade,
  via_crush  boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_a, user_b),
  check (user_a < user_b)
);

-- =========================================================
-- Follows (para followers_count)
-- =========================================================
create table public.follows (
  follower_id  uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

-- =========================================================
-- Conversas / Mensagens
-- =========================================================
create table public.conversations (
  id         uuid primary key default gen_random_uuid(),
  user_a     uuid not null references public.profiles(id) on delete cascade,
  user_b     uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_a, user_b),
  check (user_a < user_b)
);

create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id) on delete cascade,
  body            text,
  gift_id         text references public.gifts(id),
  read            boolean not null default false,
  created_at      timestamptz not null default now(),
  check (body is not null or gift_id is not null)
);
create index messages_conversation_idx on public.messages (conversation_id, created_at);

-- =========================================================
-- Notificações
-- =========================================================
create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  type       notification_type not null,
  actor_id   uuid references public.profiles(id) on delete set null,
  gift_id    text references public.gifts(id),
  meta       jsonb not null default '{}',
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_profile_idx on public.notifications (profile_id, created_at desc);

-- =========================================================
-- Relacionamentos: pedidos e casais
-- =========================================================
create table public.relationship_requests (
  id         uuid primary key default gen_random_uuid(),
  from_id    uuid not null references public.profiles(id) on delete cascade,
  to_id      uuid not null references public.profiles(id) on delete cascade,
  type       relationship_status not null default 'namorando',
  message    text,
  status     request_status not null default 'pending',
  created_at timestamptz not null default now(),
  check (from_id <> to_id)
);

create table public.couples (
  id              uuid primary key default gen_random_uuid(),
  user_a          uuid not null references public.profiles(id) on delete cascade,
  user_b          uuid not null references public.profiles(id) on delete cascade,
  type            relationship_status not null default 'namorando',
  since           date not null default current_date,
  streak_days     integer not null default 0,
  gifts_exchanged integer not null default 0,
  shared_games    text[] not null default '{}',
  created_at      timestamptz not null default now(),
  unique (user_a, user_b),
  check (user_a < user_b)
);

create table public.couple_events (
  id         uuid primary key default gen_random_uuid(),
  couple_id  uuid not null references public.couples(id) on delete cascade,
  from_id    uuid references public.profiles(id) on delete set null,
  gift_id    text references public.gifts(id),
  label      text not null,
  event_date timestamptz not null default now()
);
create index couple_events_couple_idx on public.couple_events (couple_id, event_date desc);

create table public.couple_achievements (
  id          uuid primary key default gen_random_uuid(),
  couple_id   uuid not null references public.couples(id) on delete cascade,
  label       text not null,
  icon        text not null,
  unlocked_at timestamptz
);

create table public.couple_pets (
  couple_id   uuid primary key references public.couples(id) on delete cascade,
  name        text not null,
  species     text not null,
  level       integer not null default 1,
  happiness   integer not null default 100 check (happiness between 0 and 100),
  accessories text[] not null default '{}'
);

-- =========================================================
-- Batalhas de Flex
-- =========================================================
create table public.flex_battles (
  id         uuid primary key default gen_random_uuid(),
  user_a     uuid not null references public.profiles(id) on delete cascade,
  user_b     uuid not null references public.profiles(id) on delete cascade,
  score_a    integer not null default 0,
  score_b    integer not null default 0,
  started_at timestamptz not null default now(),
  ends_at    timestamptz not null,
  check (user_a <> user_b)
);

-- =========================================================
-- Feed de atividades
-- =========================================================
create table public.feed_activities (
  id         uuid primary key default gen_random_uuid(),
  type       feed_type not null,
  actors     uuid[] not null,
  gift_id    text references public.gifts(id),
  meta       jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index feed_created_idx on public.feed_activities (created_at desc);

-- =========================================================
-- Trigger: novo usuário do Auth -> perfil
-- =========================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  base_username := lower(regexp_replace(
    coalesce(
      new.raw_user_meta_data->>'user_name',
      new.raw_user_meta_data->>'preferred_username',
      split_part(coalesce(new.email,'user'), '@', 1)
    ), '[^a-z0-9_]', '', 'g'));
  if base_username is null or base_username = '' then
    base_username := 'user_' || substr(replace(new.id::text,'-',''), 1, 8);
  end if;
  final_username := base_username;
  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', final_username),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- Trigger: coleção -> atualiza contador e minted
-- =========================================================
create or replace function public.on_owned_gift_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set collection_count = collection_count + 1 where id = new.owner_id;
  update public.gifts set minted = minted + 1 where id = new.gift_id and supply is not null;
  if new.from_id is not null then
    update public.profiles set gifts_received = gifts_received + 1 where id = new.owner_id;
    update public.profiles set gifts_sent = gifts_sent + 1 where id = new.from_id;
  end if;
  return new;
end $$;

create trigger owned_gifts_after_insert
  after insert on public.owned_gifts
  for each row execute function public.on_owned_gift_insert();

-- =========================================================
-- View: ranking de Flex (posição global)
-- =========================================================
create or replace view public.flex_ranking as
  select id, username, display_name, avatar_url, flex,
         rank() over (order by flex desc) as position
  from public.profiles
  where not is_hidden;
