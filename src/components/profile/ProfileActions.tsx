"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Gift,
  MessageCircle,
  HeartHandshake,
  MoreHorizontal,
  Ban,
  Flag,
  EyeOff,
  Check,
  Pencil,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileActions({
  isSelf,
  username,
  displayName,
  canRelationship,
}: {
  isSelf: boolean;
  username: string;
  displayName: string;
  canRelationship: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [relRequested, setRelRequested] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (isSelf) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/profile/edit"
          className="flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
        >
          <Pencil className="size-4" />
          Editar perfil
        </Link>
        <button
          aria-label="Compartilhar"
          className="flex size-11 items-center justify-center rounded-full bg-surface-3 text-text-secondary transition-colors hover:bg-hover hover:text-text"
        >
          <Share2 className="size-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/gifts?to=${username}`}
        className="flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-on-brand transition-colors hover:bg-brand-hover"
      >
        <Gift className="size-4" />
        Presentear
      </Link>
      <Link
        href="/messages"
        aria-label="Mensagem"
        className="flex size-11 items-center justify-center rounded-full bg-surface-3 text-text transition-colors hover:bg-hover"
      >
        <MessageCircle className="size-5" />
      </Link>
      {canRelationship && (
        <button
          onClick={() => setRelRequested((v) => !v)}
          aria-pressed={relRequested}
          className={cn(
            "flex size-11 items-center justify-center rounded-full transition-colors",
            relRequested
              ? "bg-brand-tint text-brand ring-1 ring-inset ring-brand/40"
              : "bg-surface-3 text-text hover:bg-hover",
          )}
          title={relRequested ? "Pedido enviado" : "Solicitar relacionamento"}
        >
          {relRequested ? <Check className="size-5" /> : <HeartHandshake className="size-5" />}
        </button>
      )}

      <div className="relative" ref={ref}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Mais opções"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="flex size-11 items-center justify-center rounded-full bg-surface-3 text-text-secondary transition-colors hover:bg-hover hover:text-text"
        >
          <MoreHorizontal className="size-5" />
        </button>
        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-2xl border border-border bg-surface-2 py-1 shadow-lg"
          >
            <MenuItem icon={<EyeOff className="size-4" />}>Ocultar perfil</MenuItem>
            <MenuItem icon={<Ban className="size-4" />}>Bloquear {displayName}</MenuItem>
            <MenuItem icon={<Flag className="size-4" />} danger>
              Denunciar
            </MenuItem>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItem({
  children,
  icon,
  danger,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      role="menuitem"
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-hover",
        danger ? "text-danger" : "text-text",
      )}
    >
      {icon}
      {children}
    </button>
  );
}
