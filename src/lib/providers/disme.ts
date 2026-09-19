import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { HistoryObservation } from "./types";

export async function saveDisMeObservations(
  admin: ReturnType<typeof createAdminClient>,
  discordUserId: string,
  observations: HistoryObservation[],
) {
  if (observations.length === 0) return;
  const unique = new Map(
    observations.map((observation) => [`${observation.field}|${observation.value}|${observation.source}`, observation]),
  );
  const { data: existing } = await admin
    .from("discord_history_observations")
    .select("id,field,value,source,first_seen_at")
    .eq("discord_user_id", discordUserId);
  const existingByKey = new Map(
    ((existing ?? []) as Array<{ id: number; field: string; value: string; source: string; first_seen_at: string }>).map((row) => [
      `${row.field}|${row.value}|${row.source}`,
      row,
    ]),
  );

  await Promise.all(
    [...unique.values()].map(async (observation) => {
      const key = `${observation.field}|${observation.value}|${observation.source}`;
      const previous = existingByKey.get(key);
      const payload = {
        discord_user_id: discordUserId,
        field: observation.field,
        value: observation.value,
        asset_url: observation.assetUrl,
        asset_hash: observation.assetHash,
        first_seen_at: previous?.first_seen_at ?? observation.observedAt,
        last_seen_at: observation.observedAt,
        observed_at: observation.observedAt,
        source: observation.source,
      };
      if (previous) return admin.from("discord_history_observations").update(payload).eq("id", previous.id);
      return admin.from("discord_history_observations").insert(payload);
    }),
  );
}
