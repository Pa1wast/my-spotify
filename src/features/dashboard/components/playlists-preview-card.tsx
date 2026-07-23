import Image from "next/image";
import Link from "next/link";

import type { SpotifyPlaylist } from "@/features/spotify/types/spotify.types";

interface PlaylistsPreviewCardProps {
  playlists: SpotifyPlaylist[];
  total: number;
}

export function PlaylistsPreviewCard({
  playlists,
  total,
}: PlaylistsPreviewCardProps) {
  return (
    <section className="rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-medium">Your playlists</h2>
        <span className="text-xs text-muted-foreground">{total} total</span>
      </div>
      <ul className="mt-4 space-y-3">
        {playlists.map((playlist) => {
          const image = playlist.images[0]?.url;

          return (
            <li key={playlist.id}>
              <Link
                href={playlist.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2 transition-colors hover:bg-muted/40"
              >
                <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-muted">
                  {image ? (
                    <Image
                      src={image}
                      alt={playlist.name}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{playlist.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {playlist.tracks.total} tracks
                    {playlist.owner.display_name
                      ? ` · ${playlist.owner.display_name}`
                      : null}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
