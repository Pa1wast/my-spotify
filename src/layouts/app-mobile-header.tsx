import { AppLogo } from "@/shared/components/app-logo";

export function AppMobileHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background px-4 py-3 lg:hidden">
      <AppLogo variant="icon" size="sm" priority />
    </header>
  );
}
