"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP_NAV_ITEMS } from "@/shared/constants/navigation";
import { cn } from "@/shared/lib/utils";

export function AppBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background pb-[env(safe-area-inset-bottom,0px)] lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {APP_NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-14 items-center justify-center px-1 text-center font-action text-xs font-bold leading-tight tracking-wide",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
