import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Camera, Coins, Flame, Gift, MapPin, Send } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/icons/Icon";
import { ProfileActions } from "@/components/profile/ProfileActions";
import { ProfileActivity } from "@/components/profile/ProfileActivity";
import { ProfileGiftShowcase } from "@/components/profile/ProfileGiftShowcase";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { presenceLabel } from "@/components/ui/PresenceDot";
import { getCoupleByUser, getProfileByUsername, getSessionUserId } from "@/lib/queries";
import { getProfileShowcase } from "@/lib/profile-showcase";
import { intentMeta, relationshipMeta } from "@/lib/labels";
import { formatNumber, pluralDays } from "@/lib/utils";
import { getStoreByOwner } from "@/lib/marketplace";
import { listDiscordServersByOwner } from "@/lib/server-directory";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await getProfileByUsername(username);
  if (!user) notFound();

  const [currentUserId, coupleData, showcase, store, servers] = await Promise.all([
    getSessionUserId(),
    getCoupleByUser(user.id),
    getProfileShowcase(user.id),
    getStoreByOwner(user.id),
    listDiscordServersByOwner(user.id),
  ]);
  const isSelf = currentUserId === user.id;
  const couple = coupleData?.couple;
  const partner = coupleData ? (coupleData.a.id === user.id ? coupleData.b : coupleData.a) : undefined;
  const canRelationship = !isSelf && user.relationship === "solteiro";
  const stats = [
    { label: "Presentes recebidos", value: showcase.stats.giftsReceived, icon: <Gift className="size-4" /> },
    { label: "Presentes enviados", value: showcase.stats.giftsSent, icon: <Send className="size-4" /> },
    { label: "Créditos enviados", value: showcase.stats.creditsSent, icon: <Coins className="size-4" /> },
    { label: "Matches", value: user.stats.matches, icon: <Flame className="size-4" /> },
  ];

  return (
    <div className="mx-auto w-full max-w-[1120px] px-3 pb-8 sm:px-5 lg:px-6 lg:pb-12">
      <header className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="relative h-[170px] bg-[#15151a] sm:h-[210px]">
          {user.banner && (
            <Image src={user.banner} alt={`Capa de ${user.displayName}`} fill sizes="(min-width: 1200px) 1120px, 100vw" className="object-cover" priority />
          )}
          <div className="absolute inset-0 bg-black/15" />
          {isSelf && (
            <Link href="/profile/edit#capa" className="absolute right-3 top-3 flex h-8 items-center gap-1.5 rounded-full border border-white/15 bg-black/75 px-3 text-[10px] font-bold text-white transition-colors hover:bg-black sm:right-4 sm:top-4">
              <Camera className="size-3.5" />{user.banner ? "Editar capa" : "Adicionar capa"}
            </Link>
          )}
        </div>

        <div className="relative px-4 pb-5 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="-mt-[58px] flex min-w-0 items-end gap-3 sm:-mt-[62px] sm:gap-4">
              <div className="relative shrink-0">
                <Avatar src={user.avatar} name={user.displayName} size="3xl" presence={user.presence} rounded="xl" priority className="rounded-2xl ring-4 ring-surface" />
                {isSelf && (
                  <Link href="/profile/edit#foto" aria-label={user.avatar ? "Trocar foto de perfil" : "Adicionar foto de perfil"} className="absolute -bottom-1 -right-1 z-10 flex size-8 items-center justify-center rounded-full bg-brand text-white ring-4 ring-surface transition-colors hover:bg-brand-hover">
                    <Camera className="size-3.5" />
                  </Link>
                )}
              </div>
              <div className="min-w-0 pb-1.5">
                <h1 className="truncate text-xl font-black tracking-[-0.025em] text-text sm:text-2xl">{user.displayName}</h1>
                <p className="truncate text-xs font-medium text-muted">@{user.username}</p>
                <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-text-secondary">
                  {user.age > 0 && <span>{user.age} anos</span>}
                  {user.age > 0 && <span className="text-muted">•</span>}
                  <span className="flex items-center gap-1">
                    <span className={user.presence === "online" ? "size-1.5 rounded-full bg-online" : "size-1.5 rounded-full bg-muted"} />
                    {user.presence === "online" ? "Online" : presenceLabel[user.presence]}
                  </span>
                  {user.location && <><span className="text-muted">•</span><span className="flex items-center gap-1"><MapPin className="size-3" />{user.location}</span></>}
                </p>
              </div>
            </div>
            <div className="self-end sm:pb-1.5">
              <ProfileActions isSelf={isSelf} userId={user.id} username={user.username} displayName={user.displayName} canRelationship={canRelationship} />
            </div>
          </div>

          {user.bio && <p className="mt-4 max-w-2xl whitespace-pre-line text-xs leading-5 text-text-secondary sm:text-sm">{user.bio}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Chip variant="brand" icon={<Icon name={intentMeta[user.intent].icon} />}>{intentMeta[user.intent].label}</Chip>
            <Chip variant="outline">{relationshipMeta[user.relationship]}</Chip>
            {partner && couple && (
              <Link href={`/couple/${couple.id}`} className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-text-secondary transition-colors hover:border-border-strong hover:text-text">
                com {partner.displayName} · {pluralDays(couple.streakDays)}
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="mt-3 grid grid-cols-2 overflow-hidden rounded-2xl border border-border bg-surface sm:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={stat.label} className={`flex min-h-20 items-center gap-3 px-4 py-3 ${index % 2 ? "border-l border-border" : ""} ${index >= 2 ? "border-t border-border sm:border-t-0" : ""} ${index === 2 ? "sm:border-l" : ""}`}>
            <span className="text-brand">{stat.icon}</span>
            <div className="min-w-0">
              <p className="tnum text-lg font-black tracking-tight text-text">{formatNumber(stat.value)}</p>
              <p className="text-[9px] font-bold uppercase leading-3 tracking-[0.07em] text-muted sm:text-[10px]">{stat.label}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,2.2fr)_minmax(270px,1fr)]">
        <main className="min-w-0 space-y-3">
          <ProfileGiftShowcase collection={showcase.collection} featured={showcase.featured} received={showcase.received} sent={showcase.sent} isSelf={isSelf} />
          <ProfileActivity items={showcase.activity} profileName={user.displayName} username={user.username} />
        </main>
        <ProfileSidebar user={user} store={store} servers={servers} followers={showcase.stats.followers} following={showcase.stats.following} isSelf={isSelf} />
      </div>
    </div>
  );
}
