import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadLocalEnv() {
  try {
    const content = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
    }
  } catch {
    // CI/development environments may provide variables directly.
  }
}

loadLocalEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) throw new Error("Configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.");

const url = new URL(supabaseUrl);
const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
const explicitlyDevelopment = process.env.DISME_SUPABASE_ENV === "development";
const explicitlyAllowedHosted = process.env.DISME_ALLOW_HOSTED_DEVELOPMENT_SEED === "I_UNDERSTAND_THIS_IS_NOT_PRODUCTION";
if (!isLocal && !(explicitlyDevelopment && explicitlyAllowedHosted)) {
  throw new Error(
    `Refusing to seed ${url.hostname}. This script only runs against local Supabase by default. ` +
      "For a separately verified hosted development project, set DISME_SUPABASE_ENV=development and DISME_ALLOW_HOSTED_DEVELOPMENT_SEED=I_UNDERSTAND_THIS_IS_NOT_PRODUCTION.",
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const seedUsers = [
  ["Luna", "lunaz", "02723a97f48913ce85b06b36b831d8b8.jpg", "ouvindo deftones", "música", "online"],
  ["Iris", "iris.exe", "07996586a113d39548d2298ffb594ebd.jpg", "colecionando referências", "arte", "online"],
  ["Maia", "maiaafter", "0ef71b9fcc6cc95af033aea6367a1700.jpg", "jogando Valorant", "duo", "ocupado"],
  ["Eli", "eliwaves", "112f1295cd8dc0be65fc460ea5130326.jpg", "disponível para conversar", "conversa", "online"],
  ["Nina", "nina.zip", "3011c7e198541c31e251892111ea45cd.jpg", "explorando a comunidade", "amizade", "ausente"],
  ["Clara", "clara.fm", "447dfb5cd00e884cc1194ef8aca71fdb.jpg", "montando playlist", "música", "online"],
  ["Zoe", "zoeoffline", "7a3baec2170b560d6eb52df286759354.jpg", "voltando em breve", "casual", "ausente"],
  ["Bia", "bia.ctrl", "db31cfe858dd3f0ad578f1da93a1052c.jpg", "procurando duo", "jogos", "online"],
  ["Sasha", "sashacore", "fa28880e13112884d0f5bda7adee526d.jpg", "compartilhando referências", "estilo", "online"],
  ["Tais", "taisplays", "fbbbc0b79ae0f891cc496166186f3e3e.jpg", "em uma partida", "duo", "ocupado"],
].map(([displayName, username, image, bio, interest, presence]) => ({
  displayName,
  username,
  image,
  bio,
  interest,
  presence,
  email: `${username.replace(/[^a-z0-9]/g, "") || "demo"}@demo.disme.local`,
}));

const { data: listed, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listError) throw listError;

for (const seed of seedUsers) {
  const existingAuthUser = listed.users.find((user) => user.email?.toLowerCase() === seed.email.toLowerCase());
  const { data: conflictingProfile, error: conflictError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", seed.username)
    .maybeSingle();
  if (conflictError) throw conflictError;
  if (conflictingProfile && conflictingProfile.id !== existingAuthUser?.id) {
    console.log(`skipped ${seed.displayName} (@${seed.username}): username already belongs to another profile`);
    continue;
  }

  let userId = existingAuthUser?.id;
  if (!userId) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: seed.email,
      password: randomBytes(24).toString("hex"),
      email_confirm: true,
      user_metadata: { full_name: seed.displayName, user_name: seed.username, is_demo: true },
    });
    if (error) throw error;
    userId = data.user.id;
  } else {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { full_name: seed.displayName, user_name: seed.username, is_demo: true },
    });
    if (error) throw error;
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      username: seed.username,
      display_name: seed.displayName,
      age: 21,
      bio: seed.bio,
      avatar_url: `/icones/${seed.image}`,
      presence: seed.presence,
      gender: "outro",
      intent: seed.interest === "duo" ? "duo" : seed.interest === "amizade" ? "amizade" : "conversar",
      relationship: "solteiro",
      games: seed.interest === "jogos" || seed.interest === "duo" ? ["valorant"] : [],
      interests: [seed.interest],
      onboarded: true,
      is_hidden: false,
    },
    { onConflict: "id" },
  );
  if (profileError) throw profileError;

  console.log(`seeded ${seed.displayName} (@${seed.username})`);
}

console.log(`Seed complete: ${seedUsers.length} development profiles are ready.`);
