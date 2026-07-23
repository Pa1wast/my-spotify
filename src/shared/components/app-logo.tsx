import Link from "next/link";

import { cn } from "@/shared/lib/utils";

export type AppLogoVariant = "icon" | "full";

interface AppLogoProps {
  variant?: AppLogoVariant;
  className?: string;
  /** Pass `null` to render without a link wrapper. */
  href?: string | null;
  size?: "sm" | "md" | "lg" | "sidebar";
  priority?: boolean;
}

const ICON_SIZE_CLASSES = {
  sm: "size-[32px]",
  md: "size-[40px]",
  lg: "size-[48px]",
  sidebar: "size-[36px]",
} as const;

const WORDMARK_SIZE_CLASSES = {
  sm: "text-[26px]",
  md: "text-[32px]",
  lg: "text-[40px]",
  sidebar: "text-[26px] leading-none",
} as const;

/** Brand mark uses currentColor so it follows --primary via text-primary. */
function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 text-primary", className)}
      aria-hidden
    >
      <circle cx="80" cy="80" r="76" fill="currentColor" />
      <circle cx="80" cy="80" r="58" fill="white" />
      <path
        d="M48 62c22-10 42-10 64 0"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M52 82c18-8 36-8 56 0"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M56 102c14-6 28-6 44 0"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AppLogo({
  variant = "full",
  className,
  href = "/dashboard",
  size = "md",
}: AppLogoProps) {
  const iconClass = ICON_SIZE_CLASSES[size];

  const content =
    variant === "icon" ? (
      <LogoMark className={cn(iconClass, className)} />
    ) : (
      <span className={cn("inline-flex items-center gap-2.5", className)}>
        <LogoMark className={iconClass} />
        <span
          className={cn(
            "font-display font-bold uppercase tracking-wide text-primary",
            WORDMARK_SIZE_CLASSES[size],
          )}
        >
          MY SPOTIFY
        </span>
      </span>
    );

  if (!href) {
    return (
      <span className="inline-flex shrink-0" aria-label="My Spotify">
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex shrink-0"
      aria-label="My Spotify"
    >
      {content}
    </Link>
  );
}
