import { auth0 } from "@/shared/lib/auth0";
import { buttonVariants } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export async function AuthSection() {
  const session = await auth0.getSession();

  if (!session) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <a
          href="/auth/login?screen_hint=signup"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Sign up
        </a>
        <a href="/auth/login" className={cn(buttonVariants({ size: "sm" }))}>
          Log in
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-center">
      <span className="text-sm text-muted-foreground">
        Logged in as {session.user.email ?? session.user.name}
      </span>
      <a
        href="/auth/logout"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        Log out
      </a>
    </div>
  );
}
