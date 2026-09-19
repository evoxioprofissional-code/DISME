import { Sidebar } from "@/components/nav/Sidebar";
import { BottomNav } from "@/components/nav/BottomNav";
import { TopBar } from "@/components/nav/TopBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 pb-[max(5rem,calc(4rem+env(safe-area-inset-bottom)))] lg:pb-0">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
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
