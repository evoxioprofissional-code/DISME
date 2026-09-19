import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !anonKey || !serviceKey) throw new Error('Supabase env vars are required');

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
const email = `security-smoke-${Date.now()}@example.invalid`;
const password = `Smoke-${crypto.randomUUID()}!`;
let userId;

try {
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (created.error || !created.data.user) throw created.error ?? new Error('user creation failed');
  userId = created.data.user.id;

  const client = createClient(url, anonKey, { auth: { persistSession: false } });
  const signed = await client.auth.signInWithPassword({ email, password });
  if (signed.error) throw signed.error;

  const normalUpdate = await client.from('profiles').update({ bio: 'security-smoke' }).eq('id', userId);
  if (normalUpdate.error) throw new Error(`normal profile update failed: ${normalUpdate.error.message}`);

  const economyUpdate = await client.from('profiles').update({ credits: 999999 }).eq('id', userId);
  if (!economyUpdate.error) throw new Error('credits update was not blocked');

  const directLike = await client.from('likes').insert({ from_id: userId, to_id: userId, kind: 'like' });
  if (!directLike.error) throw new Error('direct like insert was not blocked');

  const directMessage = await client.from('messages').insert({
    conversation_id: crypto.randomUUID(), sender_id: userId, body: 'forged',
  });
  if (!directMessage.error) throw new Error('direct message insert was not blocked');

  console.log('security smoke passed');
} finally {
  if (userId) await admin.auth.admin.deleteUser(userId);
}
