import Image from "next/image";
import Link from "next/link";

import type { SpotifyPlaylist } from "@/features/spotify/types/spotify.types";

interface PlaylistsPreviewCardProps {
  playlists: SpotifyPlaylist[];
  total: number;
}

function formatPlaylistMeta(playlist: SpotifyPlaylist) {
  const parts: string[] = [];

  if (typeof playlist.tracks?.total === "number") {
    parts.push(`${playlist.tracks.total} tracks`);
  }

  if (playlist.owner?.display_name) {
    parts.push(playlist.owner.display_name);
  }

  return parts.join(" · ");
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
          const image = playlist.images?.[0]?.url;
          const spotifyUrl = playlist.external_urls?.spotify;
          const meta = formatPlaylistMeta(playlist);

          const content = (
            <>
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
                {meta ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {meta}
                  </p>
                ) : null}
              </div>
            </>
          );

          return (
            <li key={playlist.id}>
              {spotifyUrl ? (
                <Link
                  href={spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2 transition-colors hover:bg-muted/40"
                >
                  {content}
                </Link>
              ) : (
                <div className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2">
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
