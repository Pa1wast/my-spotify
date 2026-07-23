import Image from "next/image";
import Link from "next/link";

import type { SpotifyTopTrack } from "@/features/spotify/types/spotify.types";
import { formatDuration } from "@/shared/lib/format";

interface TopTracksCardProps {
  tracks: SpotifyTopTrack[];
}

export function TopTracksCard({ tracks }: TopTracksCardProps) {
  return (
    <section className="min-w-0 w-full">
      <h2 className="border-b border-border pb-2 text-sm font-medium">
        Top tracks
      </h2>
      <ul className="min-w-0 divide-y divide-border">
        {tracks.map((track, index) => {
          const artwork = track.album?.images?.[0]?.url;
          const artistNames =
            track.artists?.map((artist) => artist.name).join(", ") ??
            "Unknown artist";
          const spotifyUrl = track.external_urls?.spotify;

          const row = (
            <>
              <span className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground">
                {index + 1}
              </span>
              <div className="relative size-9 shrink-0 overflow-hidden rounded-sm bg-muted">
                {artwork ? (
                  <Image
                    src={artwork}
                    alt={track.album?.name ?? track.name}
                    fill
                    className="object-cover"
                    sizes="36px"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{track.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {artistNames}
                </p>
              </div>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {formatDuration(track.duration_ms)}
              </span>
            </>
          );

          return (
            <li key={track.id} className="min-w-0">
              {spotifyUrl ? (
                <Link
                  href={spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 items-center gap-3 py-3 transition-opacity hover:opacity-80"
                >
                  {row}
                </Link>
              ) : (
                <div className="flex min-w-0 items-center gap-3 py-3">
                  {row}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
