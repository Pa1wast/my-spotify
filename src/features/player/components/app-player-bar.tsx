"use client";

import Image from "next/image";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";

import { useSpotifyPlayer } from "@/features/player/hooks/use-spotify-player";
import { cn } from "@/shared/lib/utils";

const PLAYER_BAR_HEIGHT = "4.5rem";

/** Stacks above the mobile bottom nav; on desktop only the player height. */
export function getPlayerBarOffsetClass(hasTrack: boolean) {
  return hasTrack
    ? "pb-[calc(4.5rem+3.5rem+env(safe-area-inset-bottom,0px))] lg:pb-[4.5rem]"
    : "";
}

export function AppPlayerBar() {
  const player = useSpotifyPlayer();
  const hasTrack = Boolean(player.currentTrack);
  const showBar =
    player.isSpotifyConnected &&
    player.isPremium &&
    hasTrack &&
    (player.isReady || player.isPlaying);

  if (!showBar && !player.error) {
    return null;
  }

  const progress =
    player.durationMs > 0
      ? Math.min(100, (player.positionMs / player.durationMs) * 100)
      : 0;

  return (
    <>
      {player.error && player.isSpotifyConnected ? (
        <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] z-40 border-t border-destructive/30 bg-background px-4 py-2 text-xs text-destructive lg:bottom-0 lg:left-44">
          {player.error}
        </div>
      ) : null}

      {showBar ? (
        <div
          className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:bottom-0 lg:left-44"
          style={{ height: PLAYER_BAR_HEIGHT }}
        >
          <div className="absolute inset-x-0 top-0 h-0.5 bg-muted" aria-hidden>
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mx-auto flex h-full max-w-6xl items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              onClick={() => player.setExpanded(true)}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
              <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-muted">
                {player.currentTrack?.artwork ? (
                  <Image
                    src={player.currentTrack.artwork}
                    alt={player.currentTrack.title}
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {player.currentTrack?.title}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {player.currentTrack?.artist}
                </p>
              </div>
            </button>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => void player.previousTrack()}
                className="rounded-full p-2 text-muted-foreground hover:text-foreground"
                aria-label="Previous track"
              >
                <SkipBack className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => void player.togglePlay()}
                className={cn(
                  "rounded-full bg-green-500 p-2.5 text-black hover:bg-green-400",
                )}
                aria-label={player.isPlaying ? "Pause" : "Play"}
              >
                {player.isPlaying ? (
                  <Pause className="size-4 fill-current" />
                ) : (
                  <Play className="size-4 fill-current" />
                )}
              </button>
              <button
                type="button"
                onClick={() => void player.nextTrack()}
                className="rounded-full p-2 text-muted-foreground hover:text-foreground"
                aria-label="Next track"
              >
                <SkipForward className="size-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
