"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP_NAV_ITEMS } from "@/shared/constants/navigation";
import { AppLogo } from "@/shared/components/app-logo";
import { cn } from "@/shared/lib/utils";

interface AppSidebarProps {
  userName: string;
  userPicture?: string | null;
}

export function AppSidebar({ userName, userPicture }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-44 flex-col border-r border-border bg-background lg:flex">
      <div className="border-b border-border px-3 py-3">
        <AppLogo variant="full" size="sm" priority />
        <p className="mt-1.5 text-xs text-muted-foreground">Your library</p>
      </div>

      <nav className="flex flex-1 flex-col px-1.5 py-3">
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
                "flex items-center gap-2.5 border-l-2 py-2 pl-2.5 pr-1.5 text-sm transition-colors",
                isActive
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0 opacity-70" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 py-3">
        <div className="mb-3 flex items-center justify-center gap-2">
          {userPicture ? (
            <Image
              src={userPicture}
              alt={userName}
              width={20}
              height={20}
              className="size-5 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="min-w-0 truncate text-xs text-muted-foreground">
            {userName}
          </span>
        </div>
        <a
          href="/auth/logout"
          className="block w-full text-center text-xs text-muted-foreground hover:text-foreground"
        >
          Log out
        </a>
      </div>
    </aside>
  );
}
