"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP_NAV_ITEMS } from "@/shared/constants/navigation";
import { AppLogo } from "@/shared/components/app-logo";

interface AppMobileHeaderProps {
  userName: string;
  userPicture?: string | null;
}

function titleForPath(pathname: string) {
  const match = APP_NAV_ITEMS.find(
    (item) =>
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href)),
  );

  return match?.label ?? "My Spotify";
}

export function AppMobileHeader({
  userName,
  userPicture,
}: AppMobileHeaderProps) {
  const pathname = usePathname();
  const title = titleForPath(pathname);
  const initial = userName.charAt(0).toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-20 flex shrink-0 items-center gap-3 border-b border-border bg-background px-4 py-2 lg:hidden">
      <AppLogo variant="icon" size="sm" href="/dashboard" priority />
      <p className="min-w-0 flex-1 truncate font-display text-2xl font-bold tracking-wide">
        {title}
      </p>
      <Link
        href="/settings"
        className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Open settings"
      >
        {userPicture ? (
          <Image
            src={userPicture}
            alt={userName}
            width={28}
            height={28}
            className="size-7 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {initial}
          </span>
        )}
      </Link>
    </header>
  );
}
