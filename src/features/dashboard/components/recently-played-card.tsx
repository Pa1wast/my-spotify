"use client";

import Image from "next/image";

import { PlayTrackButton } from "@/features/player/components/play-track-button";
import type { PlayerTrack } from "@/features/player/types/player.types";
import type { SpotifyRecentlyPlayedItem } from "@/features/spotify/types/spotify.types";
import { formatDuration, formatRelativeTime } from "@/shared/lib/format";

interface RecentlyPlayedCardProps {
  items: SpotifyRecentlyPlayedItem[];
}

function toPlayerTrack(item: SpotifyRecentlyPlayedItem): PlayerTrack {
  const track = item.track;
  const artistNames =
    track.artists?.map((artist) => artist.name).join(", ") ?? "Unknown artist";

  return {
    id: track.id,
    title: track.name,
    artist: artistNames,
    album: track.album?.name ?? "Unknown album",
    artwork: track.album?.images?.[0]?.url ?? "/logo/logo-icon.png",
    durationMs: track.duration_ms || 0,
  };
}

export function RecentlyPlayedCard({ items }: RecentlyPlayedCardProps) {
  const queue = items.map(toPlayerTrack);

  return (
    <section className="min-w-0 w-full">
      <h2 className="border-b border-border pb-2 text-sm font-medium">
        Recently played
      </h2>
      <ul className="min-w-0 divide-y divide-border">
        {items.map((item) => {
          const track = item.track;
          const artwork = track.album?.images?.[0]?.url;
          const artistNames =
            track.artists?.map((artist) => artist.name).join(", ") ??
            "Unknown artist";
          const playerTrack = toPlayerTrack(item);

          return (
            <li key={`${track.id}-${item.played_at}`} className="min-w-0">
              <div className="flex min-w-0 items-center gap-3 py-3">
                <PlayTrackButton track={playerTrack} queue={queue} />
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
                <div className="shrink-0 text-right text-xs text-muted-foreground">
                  <p>{formatRelativeTime(item.played_at)}</p>
                  {track.duration_ms ? (
                    <p>{formatDuration(track.duration_ms)}</p>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
