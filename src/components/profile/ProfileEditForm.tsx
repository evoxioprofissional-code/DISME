"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft } from "lucide-react";
import type { Intent, User } from "@/types";
import { games as allGames } from "@/data";
import { intentMeta, connectionMeta } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { Icon } from "@/components/icons/Icon";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { BannerUploader } from "@/components/profile/BannerUploader";
import { updateProfile } from "@/lib/actions";

const INTEREST_POOL = [
  "música", "anime", "fotografia", "lo-fi", "k-pop", "desenho", "setups",
  "academia", "séries", "gatos", "cottagecore", "programação", "skate",
  "poesia", "astrologia", "boba", "cosplay", "trilha", "vinil", "café",
];

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

const inputCls =
  "h-12 w-full rounded-2xl bg-surface-2 px-4 text-[15px] text-text placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand";

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
        active ? "bg-brand text-on-brand" : "bg-surface-2 text-text-secondary hover:bg-hover hover:text-text",
      )}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">{label}</span>
      {children}
    </label>
  );
}

export function ProfileEditForm({ user }: { user: User }) {
  const [avatar, setAvatar] = useState(user.avatar);
  const [banner, setBanner] = useState(user.banner);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio);
  const [age, setAge] = useState(String(user.age));
  const [pronouns, setPronouns] = useState(user.pronouns ?? "");
  const [intent, setIntent] = useState<Intent>(user.intent);
  const [gameIds, setGameIds] = useState<string[]>(user.games);
  const [interests, setInterests] = useState<string[]>(user.interests);
  const [hidden, setHidden] = useState(user.isHidden ?? false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const interestOptions = Array.from(new Set([...user.interests, ...INTEREST_POOL]));

  return (
    <div className="pb-4">
      <Link
        href={`/profile/${user.username}`}
        className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-text-secondary hover:text-text"
      >
        <ChevronLeft className="size-4" />
        Voltar ao perfil
      </Link>

      {/* Photo + banner */}
      <div className="mb-6 scroll-mt-20 overflow-hidden rounded-3xl border border-border bg-surface">
        <div id="capa" className="scroll-mt-20"><BannerUploader value={banner} onUploaded={setBanner} /></div>
        <div className="px-5 pb-5">
          <div id="foto" className="-mt-10 mb-1 scroll-mt-20">
            <AvatarUploader value={avatar} name={displayName} onUploaded={setAvatar} />
          </div>
          <p className="mt-2 text-xs text-muted">JPG, PNG, WebP ou GIF de até 4 MB.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <Field label="Nome de exibição">
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Nome de usuário">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">@</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-z0-9_]/gi, "").toLowerCase())}
                className={cn(inputCls, "pl-8")}
              />
            </div>
          </Field>
          <Field label="Bio">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={160}
              className="w-full resize-none rounded-2xl bg-surface-2 px-4 py-3 text-[15px] text-text placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
            <span className="mt-1 block text-right text-xs text-muted">{bio.length}/160</span>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Idade">
              <input type="number" min={18} max={99} value={age} onChange={(e) => setAge(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Pronomes">
              <input value={pronouns} onChange={(e) => setPronouns(e.target.value)} placeholder="ele/dela..." className={inputCls} />
            </Field>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Intenção</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(intentMeta) as Intent[]).map((i) => (
              <Chip key={i} active={intent === i} onClick={() => setIntent(i)}>
                {intentMeta[i].label}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Jogos</p>
          <div className="flex flex-wrap gap-2">
            {allGames.map((g) => (
              <Chip key={g.id} active={gameIds.includes(g.id)} onClick={() => setGameIds(toggle(gameIds, g.id))}>
                {g.name}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Interesses</p>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((i) => (
              <Chip key={i} active={interests.includes(i)} onClick={() => setInterests(toggle(interests, i))}>
                {i}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Conexões</p>
          <Card className="divide-y divide-border overflow-hidden">
            {(["steam", "spotify", "riot", "twitch"] as const).map((p) => {
              const conn = user.connections.find((c) => c.platform === p);
              return (
                <div key={p} className="flex items-center gap-3 px-4 py-3">
                  <Icon name={connectionMeta[p].icon} className="size-5 text-text-secondary" />
                  <span className="flex-1 text-sm font-semibold text-text">{connectionMeta[p].label}</span>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      conn ? "bg-surface-3 text-text-secondary" : "bg-brand text-on-brand",
                    )}
                  >
                    {conn ? "Conectado" : "Conectar"}
                  </span>
                </div>
              );
            })}
          </Card>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-surface-2 px-4 py-3.5">
          <span className="text-sm font-semibold text-text">Ocultar meu perfil</span>
          <Switch checked={hidden} onChange={setHidden} label="Ocultar meu perfil" />
        </div>
      </div>

      <button
        onClick={async () => {
          setError("");
          const result = await updateProfile({
            displayName, username, bio, age: Number(age), pronouns, intent,
            games: gameIds, interests, isHidden: hidden,
          });
          if (!result.ok) return setError(result.error ?? "Não foi possível salvar.");
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }}
        className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-brand text-[15px] font-bold text-on-brand transition-colors hover:bg-brand-hover"
      >
        {saved ? <><Check className="size-5" /> Salvo</> : "Salvar alterações"}
      </button>
      {error && <p className="mt-2 text-center text-sm text-danger">{error}</p>}
    </div>
  );
}
