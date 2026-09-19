-- Campos premium somente quando retornados por uma fonte oficial autorizada.

alter table public.discord_users
  add column premium_type integer,
  add column premium_since timestamptz;