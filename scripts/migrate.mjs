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
for (const f of files) {
  const sql = readFileSync(join(dir, f), 'utf8');
  process.stdout.write(`applying ${f} ... `);
  try {
    await client.query(sql);
    console.log('OK');
  } catch (e) {
    console.log('FAIL');
    console.error('  ->', e.message);
    await client.end();
    process.exit(1);
  }
}
await client.end();
console.log('all migrations applied');
