import { buttonVariants } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface SpotifyReconnectBannerProps {
  message: string;
  variant?: "error" | "warning";
}

export function SpotifyReconnectBanner({
  message,
  variant = "error",
}: SpotifyReconnectBannerProps) {
  const styles =
    variant === "warning"
      ? "border-primary/30 bg-primary/10 text-primary"
      : "border-destructive/30 bg-destructive/10 text-destructive";

  return (
    <div className={cn("min-w-0 break-words rounded-lg border px-4 py-3", styles)}>
      <p className="text-sm">{message}</p>
      <a
        href="/api/spotify/login"
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "mt-3 inline-flex",
        )}
      >
        Reconnect Spotify
      </a>
    </div>
  );
}
