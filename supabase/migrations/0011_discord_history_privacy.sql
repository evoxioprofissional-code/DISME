-- Preparação para controle futuro do histórico pelo proprietário verificado.

alter table public.discord_users
  add column history_visibility text not null default 'public'
    check (history_visibility in ('public', 'private')),
  add column history_opt_out boolean not null default false,
  add column history_deleted_at timestamptz;