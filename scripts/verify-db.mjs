import pg from 'pg';

const client = new pg.Client({
  host: process.env.PGHOST,
  port: 5432,
  user: process.env.PGUSER,
  password: process.env.DBPASS,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

await client.connect();
await client.query(`
  create table if not exists public.disme_schema_migrations (
    name text primary key,
    applied_at timestamptz not null default now()
  )
`);
for (const name of [
  '0001_init.sql',
  '0002_rls.sql',
  '0003_seed_catalog.sql',
  '0004_secure_operations.sql',
  '0005_privacy_and_conversations.sql',
  '0006_lock_down_direct_writes.sql',
  '0007_performance_queries.sql',
  '0008_discord_lookup.sql',
]) {
  await client.query(
    'insert into public.disme_schema_migrations(name) values($1) on conflict do nothing',
    [name],
  );
}
const { rows } = await client.query(`
  select
    (select count(*) from auth.users)::int auth_users,
    (select count(*) from public.profiles)::int profiles,
    (select count(*) from public.likes)::int likes,
    (select count(*) from public.matches)::int matches,
    (select count(*) from public.owned_gifts)::int owned_gifts,
    (select count(*) from public.games)::int games,
    (select count(*) from public.gifts)::int gifts,
    (select count(*) from public.discord_users)::int discord_users,
    (select count(*) from public.discord_identity_history)::int discord_history,
    (select count(*) from pg_policies where schemaname='public')::int policies
`);
const functions = await client.query(`
  select proname from pg_proc
  where pronamespace='public'::regnamespace
    and proname in ('like_profile','send_gift','start_conversation','request_relationship','accept_relationship_request','send_chat_message','get_nav_counts','get_conversation_summaries')
  order by 1
`);
console.log(JSON.stringify({
  counts: rows[0],
  functions: functions.rows.map((row) => row.proname),
}));
await client.end();
