import { redirect } from "next/navigation";

import { DashboardShell } from "@/layouts/dashboard-shell";
import { auth0 } from "@/shared/lib/auth0";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth0.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const userName =
    session.user.name ?? session.user.email ?? session.user.nickname ?? "User";

  return (
    <DashboardShell userName={userName} userPicture={session.user.picture}>
      {children}
    </DashboardShell>
  );
}
