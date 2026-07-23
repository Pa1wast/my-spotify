import { buttonVariants } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface SpotifyReconnectBannerProps {
  message: string;
}

export function SpotifyReconnectBanner({ message }: SpotifyReconnectBannerProps) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
      <p className="text-sm text-destructive">{message}</p>
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
