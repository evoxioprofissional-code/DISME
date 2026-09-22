import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getShellData } from "@/lib/queries";
import type { NavUser } from "@/lib/nav";

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const shell = await getShellData();

  // Visitante navega livremente; só quem entrou e ainda não fez onboarding é levado a ele.
  if (shell.me && !shell.onboarded) redirect("/onboarding");

  const me: NavUser | null = shell.me
    ? {
        id: shell.me.id,
        username: shell.me.username,
        displayName: shell.me.displayName,
        avatar: shell.me.avatar,
        presence: shell.me.presence,
        flex: shell.me.stats.flex,
      }
    : null;

  const badges = {
    matches: shell.newMatches,
    messages: shell.unreadMessages,
    notifs: shell.unreadNotifs,
  };

  return (
    <AppShell me={me} badges={badges}>
      {children}
    </AppShell>
  );
}
