interface SpotifyReconnectBannerProps {
  message: string;
  variant?: "error" | "warning";
}

export function SpotifyReconnectBanner({
  message,
  variant = "error",
}: SpotifyReconnectBannerProps) {
  return (
    <div className="min-w-0 border-b border-border pb-4 text-sm">
      <p className={variant === "error" ? "text-destructive" : "text-foreground"}>
        {message}
      </p>
      <a
        href="/api/spotify/login?consent=1"
        className="mt-2 inline-block underline underline-offset-4 hover:text-muted-foreground"
      >
        Reconnect Spotify
      </a>
    </div>
  );
}
