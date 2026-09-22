import {
  Home,
  Compass,
  Zap,
  MessageCircle,
  TrendingUp,
  Gift,
  Trophy,
  HeartHandshake,
  ScanSearch,
  Store,
  type LucideIcon,
} from "lucide-react";
import type { PresenceState } from "@/types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** key used to look up a live badge count in the shell */
  badgeKey?: "matches" | "messages";
}

/** Serializable current-user info for client nav components. */
export interface NavUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  presence: PresenceState;
  flex: number;
}

export interface NavBadges {
  matches: number;
  messages: number;
  notifs: number;
}

export const primaryNav: NavItem[] = [
  { href: "/home", label: "Início", icon: Home },
  { href: "/discover", label: "Descobrir", icon: Compass },
  { href: "/discord", label: "Consulta Discord", icon: ScanSearch },
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/matches", label: "Matches", icon: Zap, badgeKey: "matches" },
  { href: "/messages", label: "Mensagens", icon: MessageCircle, badgeKey: "messages" },
  { href: "/flex", label: "Flex", icon: TrendingUp },
  { href: "/gifts", label: "Presentes", icon: Gift },
  { href: "/rankings", label: "Ranking", icon: Trophy },
  { href: "/couples", label: "Casais", icon: HeartHandshake },
];

export const mobileNav: NavItem[] = [
  { href: "/home", label: "Início", icon: Home },
  { href: "/discover", label: "Descobrir", icon: Compass },
  { href: "/matches", label: "Matches", icon: Zap, badgeKey: "matches" },
  { href: "/messages", label: "Mensagens", icon: MessageCircle, badgeKey: "messages" },
];
