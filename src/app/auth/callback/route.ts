import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface DiscordMe {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
  banner?: string | null;
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function cleanUsername(value: string | null) {
  return value?.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 28) || null;
}

function discordAvatar(user: DiscordMe | null, metadata: Record<string, unknown>) {
  if (user?.avatar) {
    const format = user.avatar.startsWith("a_") ? "gif" : "webp";
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${format}?size=512`;
  }
  return text(metadata.avatar_url) ?? text(metadata.picture);
}

function discordBanner(user: DiscordMe | null) {
  if (!user?.banner) return null;
  const format = user.banner.startsWith("a_") ? "gif" : "webp";
  return `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${format}?size=1024`;
}

async function fetchDiscordMe(token?: string | null): Promise<DiscordMe | null> {
  if (!token) return null;
  try {
    const response = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    return (await response.json()) as DiscordMe;
  } catch {
    return null;
  }
}

async function syncDiscordProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: NonNullable<Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"]>,
  providerToken?: string | null,
) {
  const metadata = user.user_metadata as Record<string, unknown>;
  const discord = await fetchDiscordMe(providerToken);
  const displayName =
    text(discord?.global_name) ??
    text(discord?.username) ??
    text(metadata.full_name) ??
    text(metadata.name);
  const desiredUsername = cleanUsername(
    text(discord?.username) ??
    text(metadata.user_name) ??
    text(metadata.preferred_username) ??
    displayName,
  );
  const avatarUrl = discordAvatar(discord, metadata);
  const bannerUrl = discordBanner(discord);

  const { data: profile } = await supabase
    .from("profiles")
    .select("username,display_name,avatar_url,banner_url,onboarded")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return;

  const updates: Record<string, string> = {};
  if (!profile.onboarded && displayName) updates.display_name = displayName;
  if ((!profile.onboarded || !profile.avatar_url) && avatarUrl) updates.avatar_url = avatarUrl;
  if ((!profile.onboarded || !profile.banner_url) && bannerUrl) updates.banner_url = bannerUrl;

  if (!profile.onboarded && desiredUsername && desiredUsername.length >= 3) {
    const { data: owner } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", desiredUsername)
      .neq("id", user.id)
      .maybeSingle();
    updates.username = owner
      ? `${desiredUsername.slice(0, 23)}_${(discord?.id ?? user.id).slice(-4)}`
      : desiredUsername;
  }

  if (Object.keys(updates).length) {
    await supabase.from("profiles").update(updates).eq("id", user.id);
  }

  const discordHandle = text(discord?.username) ?? text(metadata.user_name) ?? text(metadata.name);
  if (discordHandle) {
    await supabase.from("connections").upsert(
      {
        profile_id: user.id,
        platform: "discord",
        handle: discordHandle,
        detail: discord?.id ?? text(metadata.provider_id) ?? text(metadata.sub),
      },
      { onConflict: "profile_id,platform" },
    );
  }
}

// OAuth (Discord) redirect target — exchanges the code for a session and imports
// the identity the user explicitly authorized.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/home";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      if (data.user.app_metadata.provider === "discord") {
        await syncDiscordProfile(supabase, data.user, data.session?.provider_token);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/login`);
}
