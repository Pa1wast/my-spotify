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
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-1 px-1 py-3 text-xs",
                isActive
                  ? "font-medium text-foreground"
                  : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
