import { cn } from "@/shared/lib/utils";

interface ConnectSpotifyCardProps {
  className?: string;
}

export function ConnectSpotifyCard({ className }: ConnectSpotifyCardProps) {
  return (
    <section className={cn("min-w-0 border-b border-border pb-6", className)}>
      <h2 className="font-display text-2xl font-bold tracking-wide">Connect Spotify</h2>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Link your Spotify account to see your top tracks, artists, recently
        played songs, and playlists.
      </p>
      <a
        href="/api/spotify/login?consent=1"
        className="mt-4 inline-block text-sm underline underline-offset-4 hover:text-muted-foreground"
      >
        Connect Spotify
      </a>
    </section>
  );
}
