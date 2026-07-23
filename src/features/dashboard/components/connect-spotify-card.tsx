import { buttonVariants } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface ConnectSpotifyCardProps {
  className?: string;
}

export function ConnectSpotifyCard({ className }: ConnectSpotifyCardProps) {
  return (
    <section
      className={cn(
        "rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm sm:p-8",
        className,
      )}
    >
      <h2 className="text-xl font-semibold tracking-tight">Connect Spotify</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Link your Spotify account to see your top tracks, artists, recently
        played songs, and playlists.
      </p>
      <a
        href="/api/spotify/login"
        className={cn(buttonVariants({ size: "sm" }), "mt-5 inline-flex")}
      >
        Connect Spotify
      </a>
    </section>
  );
}
