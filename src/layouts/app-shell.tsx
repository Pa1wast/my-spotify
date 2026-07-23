import { AppShellClient } from "@/layouts/app-shell-client";

interface AppShellProps {
  children: React.ReactNode;
  userName: string;
  userPicture?: string | null;
}

export function AppShell({ children, userName, userPicture }: AppShellProps) {
  return (
    <AppShellClient userName={userName} userPicture={userPicture}>
      {children}
    </AppShellClient>
  );
}
