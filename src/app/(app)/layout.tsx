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
  if (!shell.me) redirect("/login");
  if (!shell.onboarded) redirect("/onboarding");

  const me: NavUser = {
    username: shell.me.username,
    displayName: shell.me.displayName,
    avatar: shell.me.avatar,
    presence: shell.me.presence,
    flex: shell.me.stats.flex,
  };
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
