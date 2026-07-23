import Image from "next/image";
import Link from "next/link";

import type { SpotifyTopTrack } from "@/features/spotify/types/spotify.types";
import { formatDuration } from "@/shared/lib/format";

interface TopTracksCardProps {
  tracks: SpotifyTopTrack[];
}

export function TopTracksCard({ tracks }: TopTracksCardProps) {
  return (
    <section className="rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-medium">Top tracks</h2>
      <ul className="mt-4 space-y-3">
        {tracks.map((track, index) => {
          const artwork = track.album?.images?.[0]?.url;
          const artistNames =
            track.artists?.map((artist) => artist.name).join(", ") ??
            "Unknown artist";
          const spotifyUrl = track.external_urls?.spotify;

          const row = (
            <>
              <span className="w-5 shrink-0 text-xs font-medium text-muted-foreground">
                {index + 1}
              </span>
              <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-muted">
                {artwork ? (
                  <Image
                    src={artwork}
                    alt={track.album?.name ?? track.name}
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{track.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {artistNames}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDuration(track.duration_ms)}
              </span>
            </>
          );

          return (
            <li key={track.id}>
              {spotifyUrl ? (
                <Link
                  href={spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2 transition-colors hover:bg-muted/40"
                >
                  {row}
                </Link>
              ) : (
                <div className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2">
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
