"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

import { useSpotifyPlayer } from "@/features/player/hooks/use-spotify-player";
import { playerTrackToMusicPlayerTrack } from "@/features/player/types/player.types";
import { MusicPlayer } from "@/shared/components/ui/music-player";

export function ExpandedPlayer() {
  const player = useSpotifyPlayer();

  useEffect(() => {
    if (!player.isExpanded) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        player.setExpanded(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [player.isExpanded, player.setExpanded]);

  if (!player.isExpanded || !player.currentTrack) {
    return null;
  }

  const musicTrack = playerTrackToMusicPlayerTrack(player.currentTrack);
  const queueTracks = player.queue.map(playerTrackToMusicPlayerTrack);
  const currentTimeSeconds = Math.floor(player.positionMs / 1000);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div className="relative w-full max-w-md">
        <button
          type="button"
          onClick={() => player.setExpanded(false)}
          className="absolute -top-10 right-0 rounded-full p-2 text-white/80 hover:text-white"
          aria-label="Close player"
        >
          <X className="size-5" />
        </button>

        <MusicPlayer
          theme="spotify"
          controlled
          currentTrack={musicTrack}
          queue={queueTracks}
          currentIndex={player.currentIndex}
          isPlaying={player.isPlaying}
          currentTime={currentTimeSeconds}
          volume={player.volume}
          isMuted={player.volume === 0}
          showEqualizer
          hideExpandButton
          onTogglePlay={() => void player.togglePlay()}
          onSeek={(seconds) => void player.seek(seconds * 1000)}
          onNext={() => void player.nextTrack()}
          onPrevious={() => void player.previousTrack()}
          onVolumeChange={(nextVolume) => void player.setVolume(nextVolume)}
          onMuteToggle={() =>
            void player.setVolume(player.volume === 0 ? 80 : 0)
          }
          onTrackChange={(_, index) => void player.playQueueTrack(index)}
          className="border border-border/60"
        />
      </div>
    </div>
  );
}
