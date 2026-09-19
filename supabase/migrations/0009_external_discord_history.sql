-- Histórico público complementar obtido de fontes externas autorizadas.

create table public.external_discord_history (
  id                    bigint generated always as identity primary key,
  discord_user_id       text not null references public.discord_users(discord_user_id) on delete cascade,
  source                text not null check (source = 'namedc'),
  source_entry_key      text not null unique,
  username              text,
  display_name          text,
  discriminator         text,
  avatar_hash           text,
  banner_hash           text,
  accent_color          text,
  public_flags          bigint,
  flags                 bigint,
  avatar_decoration     text,
  banner_color          text,
  observed_at           timestamptz not null default now(),
  raw_data              jsonb not null default '{}'::jsonb,
  check (username is not null or display_name is not null or avatar_hash is not null or banner_hash is not null)
);

create index external_discord_history_user_idx
  on public.external_discord_history (discord_user_id, observed_at desc);

alter table public.external_discord_history enable row level security;
revoke all on public.external_discord_history from anon, authenticated;