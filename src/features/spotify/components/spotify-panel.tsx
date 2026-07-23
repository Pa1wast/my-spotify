import { auth0 } from "@/shared/lib/auth0";
import { buttonVariants } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import {
  getSpotifyTopTracksForUser,
  getUserByAuth0Sub,
  isSpotifyConnected,
} from "@/features/spotify/services/spotify-user.service";

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export async function SpotifyPanel() {
  const session = await auth0.getSession();

  if (!session) {
    return (
      <section className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-medium">Spotify</h2>
        <p className="text-sm text-muted-foreground">
          Log in with Auth0 first, then connect your Spotify account.
        </p>
      </section>
    );
  }

  const user = await getUserByAuth0Sub(session.user.sub);
  const connected = isSpotifyConnected(user);

  if (!connected || !user) {
    return (
      <section className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-medium">Spotify</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Connect Spotify to pull in your profile and top tracks.
        </p>
        <a
          href="/api/spotify/login"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          Connect Spotify
        </a>
      </section>
    );
  }

  const topTracks = await getSpotifyTopTracksForUser(user);

  return (
    <section className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Spotify connected</h2>
          <p className="text-sm text-muted-foreground">
            {user.spotifyDisplayName ?? user.spotifyUserId}
            {user.spotifyProduct ? ` · ${user.spotifyProduct}` : null}
          </p>
        </div>
        <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
          Linked
        </span>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium">Your top tracks (last 4 weeks)</h3>
        {topTracks && topTracks.length > 0 ? (
          <ul className="space-y-2">
            {topTracks.map((track) => (
              <li
                key={track.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{track.name}</p>
                  <p className="truncate text-muted-foreground">
                    {track.artists.map((artist) => artist.name).join(", ")}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDuration(track.duration_ms)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No top tracks returned yet. Try listening on Spotify and reconnect
            later.
          </p>
        )}
      </div>
    </section>
  );
}
