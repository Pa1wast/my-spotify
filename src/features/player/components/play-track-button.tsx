"use client";

import { Pause, Play } from "lucide-react";

import { useSpotifyPlayer } from "@/features/player/hooks/use-spotify-player";
import type { PlayerTrack } from "@/features/player/types/player.types";
import { cn } from "@/shared/lib/utils";

interface PlayTrackButtonProps {
  track: PlayerTrack;
  queue?: PlayerTrack[];
  className?: string;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function PlayTrackButton({
  track,
  queue,
  className,
  size = "sm",
  showLabel = false,
}: PlayTrackButtonProps) {
  const player = useSpotifyPlayer();
  const isCurrentTrack = player.currentTrack?.id === track.id;
  const isPlayingCurrent = isCurrentTrack && player.isPlaying;
  const canPlay = player.isSpotifyConnected && player.isPremium;

  const iconClass = size === "md" ? "size-5" : "size-4";
  const buttonClass =
    size === "md" ? "p-2.5" : "p-1.5";

  async function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (!canPlay) {
      return;
    }

    if (isCurrentTrack) {
      await player.togglePlay();
      return;
    }

    await player.playTrack(track, queue);
  }

  if (!canPlay) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={(event) => void handleClick(event)}
      disabled={!player.isReady && !isCurrentTrack}
      className={cn(
        "inline-flex items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50",
        buttonClass,
        className,
      )}
      aria-label={isPlayingCurrent ? `Pause ${track.title}` : `Play ${track.title}`}
    >
      {isPlayingCurrent ? (
        <Pause className={cn(iconClass, "fill-current")} />
      ) : (
        <Play className={cn(iconClass, "fill-current")} />
      )}
      {showLabel ? (
        <span className="ml-2 text-xs">{isPlayingCurrent ? "Pause" : "Play"}</span>
      ) : null}
    </button>
  );
}
