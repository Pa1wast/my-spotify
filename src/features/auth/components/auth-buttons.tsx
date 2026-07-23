"use client";

import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";

import { Button, buttonVariants } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export function AuthButtons() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        Loading...
      </Button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {user.name ?? user.email}
        </span>
        <Link
          href="/auth/logout"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Log out
        </Link>
      </div>
    );
  }

  return (
    <Link href="/auth/login" className={cn(buttonVariants({ size: "sm" }))}>
      Log in
    </Link>
  );
}
