import Link from "next/link";
import { Activity } from "lucide-react";
import { GiftGlyph } from "@/components/gifts/GiftGlyph";
import { Avatar } from "@/components/ui/Avatar";
import { timeAgo } from "@/lib/utils";
import type { ProfileGiftHistoryItem } from "@/lib/profile-showcase";

export function ProfileActivity({
  items,
  profileName,
  username,
}: {
  items: ProfileGiftHistoryItem[];
  profileName: string;
  username: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-text">
          <Activity className="size-4 text-brand" />
          Atividade recente
        </h2>
        <Link href={`/collection/${username}`} className="text-[11px] font-bold text-brand hover:text-brand-hover">
          Ver tudo
        </Link>
      </div>

      {!items.length ? (
        <div className="flex min-h-36 flex-col items-center justify-center text-center">
          <Activity className="size-6 text-muted" />
          <p className="mt-3 text-sm font-bold text-text">Nenhuma atividade ainda</p>
          <p className="mt-1 max-w-sm text-xs leading-5 text-muted">
            Quando você receber ou enviar presentes, eles aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="mt-3 divide-y divide-border">
          {items.map((item) => (
            <div key={`${item.direction}-${item.id}`} className="flex min-w-0 items-center gap-3 py-3">
              <GiftGlyph giftId={item.gift.id} rarity={item.gift.rarity} className="size-11 shrink-0 bg-bg" />
              {item.actor && <Avatar src={item.actor.avatar} name={item.actor.displayName} size="sm" />}
              <p className="min-w-0 flex-1 text-xs leading-5 text-text-secondary">
                {item.direction === "received" ? (
                  <>
                    {item.actor ? <Link href={`/profile/${item.actor.username}`} className="font-bold text-text hover:underline">@{item.actor.username}</Link> : <span className="font-bold text-text">Alguém</span>}
                    {" enviou "}<span className="font-bold text-text">{item.gift.name}</span>{" para "}<span className="font-bold text-text">@{username}</span>
                  </>
                ) : (
                  <>
                    <span className="font-bold text-text">{profileName}</span>{" enviou "}<span className="font-bold text-text">{item.gift.name}</span>{" para "}
                    {item.actor ? <Link href={`/profile/${item.actor.username}`} className="font-bold text-text hover:underline">@{item.actor.username}</Link> : <span className="font-bold text-text">um usuário</span>}
                  </>
                )}
              </p>
              <span className="shrink-0 text-[10px] text-muted">{timeAgo(item.receivedAt)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
