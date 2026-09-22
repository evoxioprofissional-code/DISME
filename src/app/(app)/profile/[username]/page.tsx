import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, ChevronRight, Camera, Store as StoreIcon, Radio } from "lucide-react";
import { getGame } from "@/data";
import { getCollection, getCoupleByUser, getProfileByUsername, getSessionUserId } from "@/lib/queries";
import { intentMeta, relationshipMeta, connectionMeta } from "@/lib/labels";
import { formatNumber, formatCompact, serial as fmtSerial, pluralDays } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Chip } from "@/components/ui/Chip";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { RarityTag } from "@/components/ui/RarityTag";
import { GiftGlyph } from "@/components/gifts/GiftGlyph";
import { Icon } from "@/components/icons/Icon";
import { ProfileActions } from "@/components/profile/ProfileActions";
import { presenceLabel } from "@/components/ui/PresenceDot";
import { getStoreByOwner } from "@/lib/marketplace";
import { listDiscordServersByOwner } from "@/lib/server-directory";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getProfileByUsername(username);
  if (!user) notFound();

  const [currentUserId, coupleData, collection, store, servers] = await Promise.all([
    getSessionUserId(),
    getCoupleByUser(user.id),
    getCollection(user.id, 8),
    getStoreByOwner(user.id),
    listDiscordServersByOwner(user.id),
  ]);
  const isSelf = user.id === currentUserId;
  const couple = coupleData?.couple;
  const partner = coupleData ? (coupleData.a.id === user.id ? coupleData.b : coupleData.a) : undefined;
  const canRelationship = !isSelf && user.relationship === "solteiro";

  const stats = [
    { label: "Presentes", value: user.stats.giftsReceived },
    { label: "Matches", value: user.stats.matches },
    { label: "Seguidores", value: user.stats.followers },
    { label: "Coleção", value: user.stats.collectionCount },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-6 sm:px-6 lg:pb-10">
      {/* Header */}
      <div className="overflow-hidden rounded-b-3xl sm:rounded-3xl sm:border sm:border-border sm:bg-surface">
        <div className="relative h-36 sm:h-52">
          {user.banner && (
            <Image
              src={user.banner}
              alt=""
              fill
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent sm:from-surface" />
          {isSelf && (
            <Link href="/profile/edit#capa" className="absolute right-4 top-4 flex h-9 items-center gap-2 rounded-full bg-[#0a0a0de6] px-3.5 text-xs font-bold text-white">
              <Camera className="size-4" /> {user.banner ? "Trocar capa" : "Adicionar capa"}
            </Link>
          )}
        </div>

        <div className="relative px-4 pb-5 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="-mt-12 flex items-end gap-4 sm:-mt-14">
              <div className="relative shrink-0">
                <Avatar
                  src={user.avatar}
                  name={user.displayName}
                  size="2xl"
                  presence={user.presence}
                  rounded="xl"
                  className="rounded-2xl ring-4 ring-surface"
                />
                {isSelf && (
                  <Link
                    href="/profile/edit#foto"
                    aria-label={user.avatar ? "Trocar foto de perfil" : "Adicionar foto de perfil"}
                    title={user.avatar ? "Trocar foto de perfil" : "Adicionar foto de perfil"}
                    className="absolute -bottom-2 -right-2 flex size-10 items-center justify-center rounded-full bg-brand text-on-brand ring-4 ring-surface transition-colors hover:bg-brand-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                  >
                    <Camera className="size-[18px]" />
                  </Link>
                )}
              </div>
              <div className="pb-1">
                <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                  {user.displayName}
                </h1>
                <p className="text-sm text-muted">@{user.username}</p>
              </div>
            </div>
            <div className="pb-1">
              <ProfileActions
                isSelf={isSelf}
                userId={user.id}
                username={user.username}
                displayName={user.displayName}
                canRelationship={canRelationship}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-text-secondary">
            <span className="tnum font-semibold text-text">{user.age} anos</span>
            {user.pronouns && <span>{user.pronouns}</span>}
            {user.location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-4" />
                {user.location}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <span
                className={
                  user.presence === "online"
                    ? "size-2 rounded-full bg-online"
                    : "size-2 rounded-full bg-muted"
                }
              />
              {user.presence === "online" ? "Online agora" : presenceLabel[user.presence]}
            </span>
          </div>
        </div>
      </div>

      {/* Relationship banner */}
      {partner && couple && (
        <Link
          href={`/couple/${couple.id}`}
          className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 transition-colors hover:border-border-strong hover:bg-surface-2"
        >
          <Icon name="heart-handshake" className="size-5 text-brand" />
          <p className="flex-1 text-sm">
            <span className="font-semibold text-text">{relationshipMeta[user.relationship]}</span>
            <span className="text-text-secondary"> com </span>
            <span className="font-semibold text-text">{partner.displayName}</span>
            <span className="text-muted"> · {pluralDays(couple.streakDays)}</span>
          </p>
          <ChevronRight className="size-4 text-muted" />
        </Link>
      )}

      {/* Body */}
      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-7">
          <Section title="Sobre">
            <p className="text-[15px] leading-relaxed text-text-secondary">{user.bio}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip variant="brand" icon={<Icon name={intentMeta[user.intent].icon} />}>
                {intentMeta[user.intent].label}
              </Chip>
              <Chip>{relationshipMeta[user.relationship]}</Chip>
            </div>
          </Section>

          <Section title="Jogos">
            <div className="flex flex-wrap gap-2">
              {user.games.map((g) => {
                const game = getGame(g);
                return (
                  <span
                    key={g}
                    className="inline-flex items-center gap-2 rounded-full bg-surface-2 py-1.5 pl-3 pr-3.5 text-sm font-medium text-text"
                  >
                    <span className="rounded bg-surface-3 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-text-secondary">
                      {game?.short}
                    </span>
                    {game?.name}
                  </span>
                );
              })}
            </div>
          </Section>

          <Section title="Interesses">
            <div className="flex flex-wrap gap-2">
              {user.interests.map((i) => (
                <Chip key={i}>{i}</Chip>
              ))}
            </div>
          </Section>

          <Section
            title={`Coleção · ${user.stats.collectionCount}`}
            action="Ver tudo"
            href={`/collection/${user.username}`}
          >
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-4 xl:grid-cols-6">
              {collection.map((og) => {
                const gift = og.gift;
                return (
                  <div key={og.id} className="text-center">
                    <GiftGlyph
                      giftId={gift.id}
                      rarity={gift.rarity}
                      className="aspect-square w-full"
                    />
                    <p className="mt-1.5 truncate text-xs font-semibold text-text">{gift.name}</p>
                    {gift.supply && og.serial ? (
                      <p className="tnum text-[10px] text-muted">
                        {fmtSerial(og.serial, gift.supply)}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Section>
        </div>

        {/* Aside */}
        <aside className="space-y-4">
          {(store || isSelf) && (
            <Card className="p-5">
              <div className="flex items-start gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand-tint text-brand"><StoreIcon className="size-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted">Loja</p>
                  <p className="mt-1 truncate text-sm font-extrabold text-text">{store?.name ?? "Crie sua loja"}</p>
                  <p className="mt-1 text-xs leading-5 text-text-secondary">{store ? "Produtos e exposições deste perfil." : "Publique produtos em um espaço próprio."}</p>
                </div>
              </div>
              <Link href={store ? `/store/${store.slug}` : "/store/new"} className="mt-4 flex h-10 w-full items-center justify-center rounded-full border border-border-strong text-sm font-bold text-text transition-colors hover:bg-surface-2">
                {store ? "Visitar loja" : "Criar minha loja"}
              </Link>
            </Card>
          )}
          {(servers.length > 0 || isSelf) && (
            <Card className="p-5">
              <div className="flex items-start gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-surface-2 text-text-secondary"><Radio className="size-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted">Servidores</p>
                  <p className="mt-1 text-sm font-extrabold text-text">{servers.length ? `${servers.length} ${servers.length === 1 ? "servidor anunciado" : "servidores anunciados"}` : "Anuncie seu servidor"}</p>
                  <p className="mt-1 text-xs leading-5 text-text-secondary">Dados verificados pela API oficial do Discord.</p>
                </div>
              </div>
              <Link href={servers[0] ? `/server/${servers[0].id}` : "/servers/new"} className="mt-4 flex h-10 w-full items-center justify-center rounded-full border border-border-strong text-sm font-bold text-text transition-colors hover:bg-surface-2">{servers[0] ? "Ver servidor" : "Anunciar servidor"}</Link>
            </Card>
          )}
          <Card className="p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Flex</p>
            <p className="tnum mt-0.5 text-3xl font-extrabold text-brand">
              {formatNumber(user.stats.flex)}
            </p>
            {user.flexRank && (
              <p className="mt-1 text-xs text-text-secondary">
                #{user.flexRank} no ranking global
              </p>
            )}
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="tnum text-lg font-bold text-text">{formatCompact(s.value)}</p>
                  <p className="text-xs text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </Card>

          {user.badges.length > 0 && (
            <Card className="p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
                Conquistas
              </p>
              <div className="space-y-2.5">
                {user.badges.map((b) => (
                  <div key={b.id} className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-surface-2 text-brand">
                      <Icon name={b.icon} className="size-[18px]" />
                    </span>
                    <span className="flex-1 text-sm font-semibold text-text">{b.label}</span>
                    {b.rarity && <RarityTag rarity={b.rarity} />}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {user.connections.length > 0 && (
            <Card className="p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">Conexões</p>
              <div className="space-y-3">
                {user.connections.map((c) => (
                  <div key={c.platform} className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-surface-2 text-text-secondary">
                      <Icon name={connectionMeta[c.platform].icon} className="size-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-text">
                        {connectionMeta[c.platform].label}
                      </p>
                      <p className="truncate text-xs text-muted">{c.detail ?? c.handle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
