"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP_NAV_ITEMS } from "@/shared/constants/navigation";
import { AppLogo } from "@/shared/components/app-logo";
import { cn } from "@/shared/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-44 flex-col border-r border-border bg-background lg:flex">
      <div className="border-b border-border px-3 py-4">
        <AppLogo variant="full" size="sidebar" priority />
        <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
          This data comes from{" "}
          <a
            href="https://open.spotify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Spotify
          </a>
          .
        </p>
      </div>

      <nav className="flex flex-1 flex-col px-1.5 py-3">
        {APP_NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "border-l-2 py-2.5 pl-3 pr-2 font-action text-base font-bold tracking-wide transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
