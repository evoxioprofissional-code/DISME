import Link from "next/link";
import {
  HeartHandshake,
  Gift as GiftIcon,
  TrendingUp,
  UserPen,
  Layers,
  Zap,
} from "lucide-react";
import type { FeedActivity } from "@/types";
import { getUser, getGift } from "@/data";
import { timeAgo, serial as fmtSerial } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { GiftGlyph } from "@/components/gifts/GiftGlyph";

function Name({ id }: { id: string }) {
  const u = getUser(id);
  if (!u) return null;
  return (
    <Link
      href={`/profile/${u.username}`}
      className="font-bold text-text hover:text-brand"
    >
      {u.displayName}
    </Link>
  );
}

const typeIcon = {
  relationship: HeartHandshake,
  gift: GiftIcon,
  ranking: TrendingUp,
  milestone: HeartHandshake,
  profile: UserPen,
  collection: Layers,
  match: Zap,
} as const;

export function FeedItem({ activity }: { activity: FeedActivity }) {
  const a = getUser(activity.actors[0]);
  const b = activity.actors[1] ? getUser(activity.actors[1]) : undefined;
  const gift = activity.giftId ? getGift(activity.giftId) : undefined;
  const Icon = typeIcon[activity.type];

  let text: React.ReactNode = null;

  switch (activity.type) {
    case "relationship": {
      const kind = activity.meta?.kind === "webnamoro" ? "um webnamoro" : "um namoro";
      text = (
        <>
          <Name id={activity.actors[0]} /> e <Name id={activity.actors[1]} /> começaram {kind}.
        </>
      );
      break;
    }
    case "gift":
      text = (
        <>
          <Name id={activity.actors[0]} /> recebeu{" "}
          <span className="font-semibold text-text">{gift?.name}</span> de{" "}
          <Name id={activity.actors[1]} />.
        </>
      );
      break;
    case "ranking": {
      const rank = Number(activity.meta?.rank ?? 0);
      const board = String(activity.meta?.board ?? "Flex");
      text =
        rank <= 10 ? (
          <>
            <Name id={activity.actors[0]} /> entrou no Top 10 de {board}.
          </>
        ) : (
          <>
            <Name id={activity.actors[0]} /> subiu {String(activity.meta?.moved ?? "")}{" "}
            posições no {board}.
          </>
        );
      break;
    }
    case "milestone":
      if (activity.meta?.days) {
        text = (
          <>
            <Name id={activity.actors[0]} /> e <Name id={activity.actors[1]} /> completaram{" "}
            {String(activity.meta.days)} dias juntos.
          </>
        );
      } else {
        text = (
          <>
            <Name id={activity.actors[0]} /> chegou a {String(activity.meta?.collection)}{" "}
            presentes na coleção.
          </>
        );
      }
      break;
    case "profile":
      text = (
        <>
          <Name id={activity.actors[0]} /> atualizou o perfil.
        </>
      );
      break;
    case "collection":
      text = (
        <>
          <Name id={activity.actors[0]} /> adicionou{" "}
          <span className="font-semibold text-text">{gift?.name}</span> à coleção
          {activity.meta?.serial && gift?.supply ? (
            <span className="tnum text-text-secondary">
              {" "}
              ({fmtSerial(Number(activity.meta.serial), gift.supply)})
            </span>
          ) : null}
          .
        </>
      );
      break;
    case "match":
      text = (
        <>
          <Name id={activity.actors[0]} /> e <Name id={activity.actors[1]} /> deram match.
        </>
      );
      break;
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2">
      {/* actor avatars */}
      <div className="relative shrink-0">
        {a && <Avatar src={a.avatar} name={a.displayName} size="md" />}
        {b && (
          <span className="absolute -bottom-1 -right-2 rounded-full ring-2 ring-surface">
            <Avatar src={b.avatar} name={b.displayName} size="xs" />
          </span>
        )}
        <span className="absolute -left-1 -top-1 flex size-5 items-center justify-center rounded-full bg-surface-3 ring-2 ring-surface">
          <Icon className="size-3 text-brand" strokeWidth={2.5} />
        </span>
      </div>

      <p className="min-w-0 flex-1 text-[15px] leading-snug text-text-secondary">
        {text}
        <span className="ml-1.5 whitespace-nowrap text-xs text-muted">
          · {timeAgo(activity.createdAt)}
        </span>
      </p>

      {gift && (
        <GiftGlyph giftId={gift.id} rarity={gift.rarity} className="size-11 shrink-0" />
      )}
    </div>
  );
}
