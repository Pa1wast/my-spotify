"use client";

import Image from "next/image";
import Link from "next/link";

import { PlayTrackButton } from "@/features/player/components/play-track-button";
import { topTrackToPlayerTrack } from "@/features/player/types/player.types";
import type { SpotifyTopTrack } from "@/features/spotify/types/spotify.types";
import { formatDuration } from "@/shared/lib/format";

interface TopTracksCardProps {
  tracks: SpotifyTopTrack[];
}

export function TopTracksCard({ tracks }: TopTracksCardProps) {
  const queue = tracks.map(topTrackToPlayerTrack);

  return (
    <section className="min-w-0 w-full">
      <h2 className="border-b border-border pb-2 font-display text-2xl font-bold tracking-wide">
        Top tracks
      </h2>
      <ul className="min-w-0 divide-y divide-border">
        {tracks.map((track, index) => {
          const artwork = track.album?.images?.[0]?.url;
          const artistNames =
            track.artists?.map((artist) => artist.name).join(", ") ??
            "Unknown artist";
          const spotifyUrl = track.external_urls?.spotify;
          const playerTrack = topTrackToPlayerTrack(track);

          const row = (
            <>
              <span className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground">
                {index + 1}
              </span>
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
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {formatDuration(track.duration_ms)}
              </span>
            </>
          );

          return (
            <li key={track.id} className="min-w-0">
              {spotifyUrl ? (
                <div className="flex min-w-0 items-center gap-3 py-3">
                  {row}
                  <Link
                    href={spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sr-only"
                  >
                    Open in Spotify
                  </Link>
                </div>
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
