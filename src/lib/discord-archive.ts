import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "discord-history";

/**
 * Copies a Discord image (avatar/banner) into Supabase Storage so it keeps
 * rendering after Discord purges the old asset from its CDN. Returns the
 * permanent public URL, or the original URL as a graceful fallback.
 */
export async function archiveDiscordImage(
  admin: SupabaseClient,
  discordUserId: string,
  kind: "avatar" | "banner",
  hash: string,
  sourceUrl: string,
): Promise<string> {
  const animated = hash.startsWith("a_");
  const ext = animated ? "gif" : "webp";
  const path = `${discordUserId}/${kind}_${hash}.${ext}`;

  const publicUrl = admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

  // Already archived? Skip the re-download.
  const { data: existing } = await admin.storage
    .from(BUCKET)
    .list(discordUserId, { search: `${kind}_${hash}.${ext}` });
  if (existing && existing.length > 0) return publicUrl;

  try {
    const response = await fetch(sourceUrl, { cache: "no-store" });
    if (!response.ok) return sourceUrl;
    const bytes = new Uint8Array(await response.arrayBuffer());
    const { error } = await admin.storage
      .from(BUCKET)
      .upload(path, bytes, {
        contentType: animated ? "image/gif" : "image/webp",
        upsert: true,
        cacheControl: "31536000",
      });
    if (error) return sourceUrl;
    return publicUrl;
  } catch {
    return sourceUrl;
  }
}
