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
    <section className="min-w-0 w-full">
      <div className="flex items-baseline justify-between border-b border-border pb-2">
        <h2 className="text-sm font-medium">Your playlists</h2>
        <span className="text-xs text-muted-foreground">{total} total</span>
      </div>
      <ul className="min-w-0 divide-y divide-border">
        {playlists.map((playlist) => {
          const image = playlist.images?.[0]?.url;
          const spotifyUrl = playlist.external_urls?.spotify;
          const meta = formatPlaylistMeta(playlist);

          const content = (
            <>
              <div className="relative size-9 shrink-0 overflow-hidden rounded-sm bg-muted">
                {image ? (
                  <Image
                    src={image}
                    alt={playlist.name}
                    fill
                    className="object-cover"
                    sizes="36px"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{playlist.name}</p>
                {meta ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {meta}
                  </p>
                ) : null}
              </div>
            </>
          );

          return (
            <li key={playlist.id} className="min-w-0">
              {spotifyUrl ? (
                <Link
                  href={spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 items-center gap-3 py-3 transition-opacity hover:opacity-80"
                >
                  {content}
                </Link>
              ) : (
                <div className="flex min-w-0 items-center gap-3 py-3">
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
