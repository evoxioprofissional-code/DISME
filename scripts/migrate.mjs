import pg from 'pg';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, '..', 'supabase', 'migrations');
const files = readdirSync(dir).filter(f => f.endsWith('.sql')).sort();

const client = new pg.Client({
  host: process.env.PGHOST,
  port: 5432,
  user: process.env.PGUSER,
  password: process.env.DBPASS,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

await client.connect();
console.log('connected to', process.env.PGHOST);
await client.query(`
  create table if not exists public.disme_schema_migrations (
    name text primary key,
    applied_at timestamptz not null default now()
  )
`);
for (const f of files) {
  const { rowCount } = await client.query(
    'select 1 from public.disme_schema_migrations where name = $1',
    [f],
  );
  if (rowCount) {
    console.log(`skipping ${f} (already applied)`);
    continue;
  }
  const sql = readFileSync(join(dir, f), 'utf8');
  process.stdout.write(`applying ${f} ... `);
  try {
    await client.query('begin');
    await client.query(sql);
    await client.query(
      'insert into public.disme_schema_migrations (name) values ($1)',
      [f],
    );
    await client.query('commit');
    console.log('OK');
  } catch (e) {
    await client.query('rollback');
    console.log('FAIL');
    console.error('  ->', e.message);
    await client.end();
    process.exit(1);
  }
}
await client.end();
console.log('all migrations applied');
