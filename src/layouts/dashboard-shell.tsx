import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
  userName: string;
  userPicture?: string | null;
}

export function DashboardShell({
  children,
  userName,
  userPicture,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <Link href="/dashboard" className="block truncate">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                My Spotify
              </p>
              <p className="truncate text-sm text-muted-foreground">Dashboard</p>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {userPicture ? (
              <Image
                src={userPicture}
                alt={userName}
                width={32}
                height={32}
                className="size-8 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="flex size-8 items-center justify-center rounded-full border border-border bg-muted text-xs font-medium">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="hidden max-w-[10rem] truncate text-sm text-muted-foreground sm:inline">
              {userName}
            </span>
            <a
              href="/auth/logout"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Log out
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>

      <footer className="border-t border-border/80 px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
        Listening data provided by{" "}
        <a
          href="https://www.spotify.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Spotify
        </a>
      </footer>
    </div>
  );
}
