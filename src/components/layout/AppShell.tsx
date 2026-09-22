import { Sidebar } from "@/components/nav/Sidebar";
import { BottomNav } from "@/components/nav/BottomNav";
import { TopBar } from "@/components/nav/TopBar";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { MessageNotificationToast } from "@/components/notifications/MessageNotificationToast";
import type { NavUser, NavBadges } from "@/lib/nav";

export function AppShell({
  children,
  me,
  badges,
}: {
  children: React.ReactNode;
  me: NavUser | null;
  badges: NavBadges;
}) {
  return (
    <AuthProvider isAuthed={!!me}>
      <div className="flex min-h-dvh bg-bg">
        <Sidebar me={me} badges={badges} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar me={me} badges={badges} />
          <main className="flex-1 pb-[max(5rem,calc(4rem+env(safe-area-inset-bottom)))] lg:pb-0">
            {children}
          </main>
        </div>
        <BottomNav me={me} badges={badges} />
        {me && <MessageNotificationToast userId={me.id} />}
      </div>
    </AuthProvider>
  );
}

/** Standard centered content column for most pages. */
export function PageContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-2xl px-4 py-5 sm:px-6 lg:py-8 ${className}`}>
      {children}
    </div>
  );
}
