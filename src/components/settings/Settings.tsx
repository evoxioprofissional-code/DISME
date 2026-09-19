"use client";

import { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { connectionMeta } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { Icon } from "@/components/icons/Icon";

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
  danger,
}: {
  label: string;
  hint?: string;
  right?: React.ReactNode;
  href?: string;
  danger?: boolean;
}) {
  const content = (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-semibold", danger ? "text-danger" : "text-text")}>{label}</p>
        {hint && <p className="text-xs text-muted">{hint}</p>}
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

export function Settings() {
  const [hidden, setHidden] = useState(false);
  const [discover, setDiscover] = useState(true);
  const [online, setOnline] = useState(true);
  const [onlyMatches, setOnlyMatches] = useState(true);
  const [notifMatches, setNotifMatches] = useState(true);
  const [notifGifts, setNotifGifts] = useState(true);
  const [notifMsgs, setNotifMsgs] = useState(true);

  const chevron = <ChevronRight className="size-4 text-muted" />;

  return (
    <div>
      <Group title="Conta" icon={<UserIcon className="size-3.5" />}>
        <Row label="Editar perfil" hint="Foto, bio, jogos e interesses" href="/profile/edit" right={chevron} />
        <Row label="E-mail" hint="voce@email.com" right={chevron} />
        <Row label="Idioma" hint="Português (Brasil)" right={chevron} />
      </Group>

      <Group title="Privacidade" icon={<Lock className="size-3.5" />}>
        <Row
          label="Ocultar perfil"
          hint="Ninguém encontra você em Descobrir"
          right={<Switch checked={hidden} onChange={setHidden} label="Ocultar perfil" />}
        />
        <Row
          label="Aparecer em Descobrir"
          right={<Switch checked={discover} onChange={setDiscover} label="Aparecer em Descobrir" />}
        />
        <Row
          label="Mostrar status online"
          right={<Switch checked={online} onChange={setOnline} label="Mostrar status online" />}
        />
      </Group>

      <Group title="Mensagens" icon={<MessageCircle className="size-3.5" />}>
        <Row
          label="Só matches podem me mandar mensagem"
          right={<Switch checked={onlyMatches} onChange={setOnlyMatches} label="Só matches" />}
        />
      </Group>

      <Group title="Notificações" icon={<Bell className="size-3.5" />}>
        <Row label="Novos matches" right={<Switch checked={notifMatches} onChange={setNotifMatches} label="Matches" />} />
        <Row label="Presentes recebidos" right={<Switch checked={notifGifts} onChange={setNotifGifts} label="Presentes" />} />
        <Row label="Mensagens" right={<Switch checked={notifMsgs} onChange={setNotifMsgs} label="Mensagens" />} />
      </Group>

      <Group title="Conexões" icon={<Link2 className="size-3.5" />}>
        {(["steam", "spotify", "riot", "twitch"] as const).map((p) => (
          <Row
            key={p}
            label={connectionMeta[p].label}
            right={
              <span className="flex items-center gap-2">
                <Icon name={connectionMeta[p].icon} className="size-4 text-muted" />
                <span className="rounded-full bg-surface-3 px-3 py-1 text-xs font-semibold text-text">
                  Conectar
                </span>
              </span>
            }
          />
        ))}
      </Group>

      <Group title="Segurança" icon={<Ban className="size-3.5" />}>
        <Row label="Contas bloqueadas" hint="0 bloqueadas" right={chevron} />
        <Row label="Perfis ocultados" right={<EyeOff className="size-4 text-muted" />} />
      </Group>

      <Card className="overflow-hidden">
        <button className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-2">
          <LogOut className="size-4 text-danger" />
          <span className="text-sm font-semibold text-danger">Sair da conta</span>
        </button>
      </Card>

      <p className="mt-6 text-center text-xs text-muted">DisMe · versão 0.1.0</p>
    </div>
  );
}
