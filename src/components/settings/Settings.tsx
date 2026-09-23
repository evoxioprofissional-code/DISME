"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Bell,
  Lock,
  MessageCircle,
  Link2,
  Ban,
  LogOut,
  ChevronRight,
  EyeOff,
  Check,
  X,
  Radio,
} from "lucide-react";
import { connectionMeta } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { Icon } from "@/components/icons/Icon";
import { signOut, upsertConnection, removeConnection, setProfileHidden, setPresence } from "@/lib/actions";
import { PresenceDot } from "@/components/ui/PresenceDot";
import type { PresenceState } from "@/types";

type Platform = "steam" | "spotify" | "riot" | "twitch";

function Group({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wide text-muted">
        {icon}
        {title}
      </h2>
      <Card className="divide-y divide-border overflow-hidden">{children}</Card>
    </section>
  );
}

function Row({
  label,
  hint,
  right,
  href,
}: {
  label: string;
  hint?: string;
  right?: React.ReactNode;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-text">{label}</p>
        {hint && <p className="truncate text-xs text-muted">{hint}</p>}
      </div>
      {right}
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block transition-colors hover:bg-surface-2">
        {content}
      </Link>
    );
  }
  return content;
}

function ConnectionRow({
  platform,
  handle,
}: {
  platform: Platform;
  handle?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(handle ?? "");
  const [pending, start] = useTransition();

  function save() {
    const v = value.trim();
    if (!v) return;
    start(async () => {
      await upsertConnection(platform, v);
      setEditing(false);
    });
  }
  function disconnect() {
    start(async () => {
      await removeConnection(platform);
      setValue("");
      setEditing(false);
    });
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-3">
        <Icon name={connectionMeta[platform].icon} className="size-5 text-text-secondary" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text">{connectionMeta[platform].label}</p>
          {handle && !editing && <p className="truncate text-xs text-muted">{handle}</p>}
        </div>
        {handle && !editing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing(true)}
              className="rounded-full bg-surface-3 px-3 py-1 text-xs font-semibold text-text-secondary hover:bg-hover"
            >
              Editar
            </button>
            <button
              onClick={disconnect}
              disabled={pending}
              className="rounded-full px-2 py-1 text-xs font-semibold text-danger hover:bg-danger-tint disabled:opacity-50"
            >
              Remover
            </button>
          </div>
        ) : !editing ? (
          <button
            onClick={() => setEditing(true)}
            className="rounded-full bg-brand px-3 py-1 text-xs font-bold text-on-brand hover:bg-brand-hover"
          >
            Conectar
          </button>
        ) : null}
      </div>

      {editing && (
        <div className="mt-3 flex items-center gap-2">
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder={`Seu usuário no ${connectionMeta[platform].label}`}
            className="h-10 min-w-0 flex-1 rounded-full bg-surface-2 px-4 text-sm text-text placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          />
          <button
            onClick={save}
            disabled={pending || !value.trim()}
            aria-label="Salvar"
            className="flex size-10 items-center justify-center rounded-full bg-brand text-on-brand disabled:opacity-50"
          >
            <Check className="size-5" />
          </button>
          <button
            onClick={() => {
              setEditing(false);
              setValue(handle ?? "");
            }}
            aria-label="Cancelar"
            className="flex size-10 items-center justify-center rounded-full bg-surface-3 text-text-secondary hover:bg-hover"
          >
            <X className="size-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export function Settings({
  email,
  connections,
  initialHidden = false,
  initialPresence = "offline",
}: {
  email: string;
  connections: Partial<Record<Platform, string>>;
  initialHidden?: boolean;
  initialPresence?: PresenceState;
}) {
  const router = useRouter();
  const [hidden, setHidden] = useState(initialHidden);
  const [discover, setDiscover] = useState(true);
  const [presence, setPresenceValue] = useState<PresenceState>(
    initialPresence === "ocupado" ? "ausente" : initialPresence,
  );
  const [presenceError, setPresenceError] = useState("");
  const [presencePending, startPresenceTransition] = useTransition();
  const [onlyMatches, setOnlyMatches] = useState(true);
  const [notifMatches, setNotifMatches] = useState(true);
  const [notifGifts, setNotifGifts] = useState(true);
  const [notifMsgs, setNotifMsgs] = useState(true);

  const chevron = <ChevronRight className="size-4 text-muted" />;

  return (
    <div>
      <Group title="Conta" icon={<UserIcon className="size-3.5" />}>
        <Row label="Editar perfil" hint="Foto, bio, jogos e interesses" href="/profile/edit" right={chevron} />
        <Row label="E-mail" hint={email} />
        <Row label="Idioma" hint="Português (Brasil)" right={chevron} />
      </Group>

      <Group title="Presença" icon={<Radio className="size-3.5" />}>
        <div className="px-4 py-4">
          <p className="text-sm font-semibold text-text">Seu status</p>
          <p className="mt-0.5 text-xs text-muted">Escolha como você aparece para outras pessoas.</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {([
              { value: "online", label: "Online" },
              { value: "ausente", label: "Ausente" },
              { value: "offline", label: "Offline" },
            ] as const).map((option) => {
              const active = presence === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={presencePending}
                  aria-pressed={active}
                  onClick={() => {
                    if (active) return;
                    const previous = presence;
                    setPresenceValue(option.value);
                    setPresenceError("");
                    startPresenceTransition(async () => {
                      const result = await setPresence(option.value);
                      if (!result.ok) {
                        setPresenceValue(previous);
                        setPresenceError(result.error ?? "Não foi possível atualizar seu status.");
                        return;
                      }
                      router.refresh();
                    });
                  }}
                  className={cn(
                    "flex min-w-0 items-center justify-center gap-2 rounded-xl border px-2 py-3 text-xs font-bold transition-colors disabled:opacity-60",
                    active
                      ? "border-brand bg-brand-tint text-text"
                      : "border-border bg-bg text-text-secondary hover:border-border-strong hover:bg-hover",
                  )}
                >
                  <PresenceDot state={option.value} ring={false} />
                  {option.label}
                </button>
              );
            })}
          </div>
          {presenceError && <p role="alert" className="mt-2 text-xs font-semibold text-danger">{presenceError}</p>}
        </div>
      </Group>

      <Group title="Privacidade" icon={<Lock className="size-3.5" />}>
        <Row
          label="Ocultar perfil"
          hint="Ninguém encontra você em Descobrir"
          right={
            <Switch
              checked={hidden}
              onChange={(v) => {
                setHidden(v);
                void setProfileHidden(v);
              }}
              label="Ocultar perfil"
            />
          }
        />
        <Row label="Aparecer em Descobrir" right={<Switch checked={discover} onChange={setDiscover} label="Aparecer em Descobrir" />} />
      </Group>

      <Group title="Mensagens" icon={<MessageCircle className="size-3.5" />}>
        <Row label="Só matches podem me mandar mensagem" right={<Switch checked={onlyMatches} onChange={setOnlyMatches} label="Só matches" />} />
      </Group>

      <Group title="Notificações" icon={<Bell className="size-3.5" />}>
        <Row label="Novos matches" right={<Switch checked={notifMatches} onChange={setNotifMatches} label="Matches" />} />
        <Row label="Presentes recebidos" right={<Switch checked={notifGifts} onChange={setNotifGifts} label="Presentes" />} />
        <Row label="Mensagens" right={<Switch checked={notifMsgs} onChange={setNotifMsgs} label="Mensagens" />} />
      </Group>

      <Group title="Conexões" icon={<Link2 className="size-3.5" />}>
        {(["steam", "spotify", "riot", "twitch"] as const).map((p) => (
          <ConnectionRow key={p} platform={p} handle={connections[p]} />
        ))}
      </Group>

      <Group title="Segurança" icon={<Ban className="size-3.5" />}>
        <Row label="Contas bloqueadas" hint="0 bloqueadas" right={chevron} />
        <Row label="Perfis ocultados" right={<EyeOff className="size-4 text-muted" />} />
      </Group>

      <form action={signOut}>
        <Card className="overflow-hidden">
          <button type="submit" className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-2">
            <LogOut className="size-4 text-danger" />
            <span className="text-sm font-semibold text-danger">Sair da conta</span>
          </button>
        </Card>
      </form>

      <p className="mt-6 text-center text-xs text-muted">DisMe · versão 0.1.0</p>
    </div>
  );
}
