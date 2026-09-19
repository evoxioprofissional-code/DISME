import {
  Home,
  Compass,
  Zap,
  MessageCircle,
  TrendingUp,
  Gift,
  Trophy,
  HeartHandshake,
  type LucideIcon,
} from "lucide-react";
import { conversations, matches, currentUser } from "@/data";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

const unread = conversations.reduce((n, c) => n + c.unread, 0);
const newMatches = matches.filter((m) => m.isNew).length;

/** Full navigation (desktop sidebar). */
export const primaryNav: NavItem[] = [
  { href: "/home", label: "Início", icon: Home },
  { href: "/discover", label: "Descobrir", icon: Compass },
  { href: "/matches", label: "Matches", icon: Zap, badge: newMatches },
  { href: "/messages", label: "Mensagens", icon: MessageCircle, badge: unread },
  { href: "/flex", label: "Flex", icon: TrendingUp },
  { href: "/gifts", label: "Presentes", icon: Gift },
  { href: "/rankings", label: "Ranking", icon: Trophy },
  { href: "/couples", label: "Casais", icon: HeartHandshake },
];

/** Thumb-reach subset (mobile bottom bar). Profile is appended in the UI. */
export const mobileNav: NavItem[] = [
  { href: "/home", label: "Início", icon: Home },
  { href: "/discover", label: "Descobrir", icon: Compass },
  { href: "/matches", label: "Matches", icon: Zap, badge: newMatches },
  { href: "/messages", label: "Mensagens", icon: MessageCircle, badge: unread },
];

export const profileHref = () => `/profile/${currentUser().username}`;
