import Image from "next/image";
import Link from "next/link";

import type { SpotifyRecentlyPlayedItem } from "@/features/spotify/types/spotify.types";
import { formatDuration, formatRelativeTime } from "@/shared/lib/format";

interface RecentlyPlayedCardProps {
  items: SpotifyRecentlyPlayedItem[];
}

export function RecentlyPlayedCard({ items }: RecentlyPlayedCardProps) {
  return (
    <section className="min-w-0 w-full overflow-hidden rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-medium">Recently played</h2>
      <ul className="mt-4 min-w-0 space-y-3">
        {items.map((item) => {
          const track = item.track;
          const artwork = track.album?.images?.[0]?.url;
          const artistNames =
            track.artists?.map((artist) => artist.name).join(", ") ??
            "Unknown artist";
          const spotifyUrl = track.external_urls?.spotify;

          const row = (
            <>
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
              <div className="shrink-0 text-right text-xs text-muted-foreground">
                <p>{formatRelativeTime(item.played_at)}</p>
                <p>{formatDuration(track.duration_ms)}</p>
              </div>
            </>
          );

          return (
            <li key={`${track.id}-${item.played_at}`} className="min-w-0">
              {spotifyUrl ? (
                <Link
                  href={spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 items-center gap-2 rounded-lg border border-border/60 px-2 py-2 transition-colors hover:bg-muted/40 sm:gap-3 sm:px-3"
                >
                  {row}
                </Link>
              ) : (
                <div className="flex min-w-0 items-center gap-2 rounded-lg border border-border/60 px-2 py-2 sm:gap-3 sm:px-3">
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
