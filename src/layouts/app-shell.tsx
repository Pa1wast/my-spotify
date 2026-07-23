import { AppBottomNav } from "@/layouts/app-bottom-nav";
import { AppMobileHeader } from "@/layouts/app-mobile-header";
import { AppSidebar } from "@/layouts/app-sidebar";

interface AppShellProps {
  children: React.ReactNode;
  userName: string;
  userPicture?: string | null;
}

export function AppShell({ children, userName, userPicture }: AppShellProps) {
  return (
    <div className="flex min-h-full min-w-0 overflow-x-hidden">
      <AppSidebar userName={userName} userPicture={userPicture} />
      <div className="flex min-h-full min-w-0 flex-1 flex-col lg:pl-44">
        <AppMobileHeader />
        <main className="mx-auto w-full min-w-0 max-w-6xl flex-1 overflow-x-hidden px-4 py-6 pb-24 sm:px-6 sm:py-8 lg:pb-8">
          {children}
        </main>
        <AppBottomNav />
      </div>
    </div>
  );
}
