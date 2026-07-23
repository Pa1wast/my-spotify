"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { fetchSpotifyConnection } from "@/features/dashboard/services/dashboard.service";
import { loadSpotifySdk } from "@/features/player/lib/load-spotify-sdk";
import {
  fetchPlayerToken,
  startPlayback,
  transferPlayback,
} from "@/features/player/services/playback.service";
import type { PlayerTrack } from "@/features/player/types/player.types";

interface SpotifyPlayerContextValue {
  isReady: boolean;
  isPremium: boolean;
  isSpotifyConnected: boolean;
  error: string | null;
  currentTrack: PlayerTrack | null;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  volume: number;
  queue: PlayerTrack[];
  currentIndex: number;
  isExpanded: boolean;
  setExpanded: (expanded: boolean) => void;
  playTrack: (track: PlayerTrack, queue?: PlayerTrack[]) => Promise<void>;
  playQueueTrack: (index: number) => Promise<void>;
  togglePlay: () => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
}

const SpotifyPlayerContext = createContext<SpotifyPlayerContextValue | null>(
  null,
);

function mapSdkTrack(track: Spotify.WebPlaybackTrack): PlayerTrack {
  return {
    id: track.id,
    title: track.name,
    artist: track.artists.map((artist) => artist.name).join(", "),
    album: track.album.name,
    artwork: track.album.images[0]?.url ?? "/logo/logo-icon-brand.png",
    durationMs: track.duration_ms,
  };
}

export function SpotifyPlayerProvider({ children }: { children: ReactNode }) {
  const playerRef = useRef<Spotify.Player | null>(null);
  const deviceIdRef = useRef<string | null>(null);

  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [volume, setVolumeState] = useState(80);
  const [queue, setQueue] = useState<PlayerTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setExpanded] = useState(false);

  const applyPlayerState = useCallback((state: Spotify.WebPlaybackState | null) => {
    if (!state) {
      setIsPlaying(false);
      return;
    }

    setIsPlaying(!state.paused);
    setPositionMs(state.position);
    setDurationMs(state.duration);

    const track = state.track_window.current_track;

    if (track) {
      setCurrentTrack(mapSdkTrack(track));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const connection = await fetchSpotifyConnection();
        if (cancelled) {
          return;
        }

        setIsSpotifyConnected(connection.connected);

        if (!connection.connected) {
          return;
        }

        setIsPremium(connection.isPremium);

        if (!connection.isPremium) {
          setError("In-app playback requires Spotify Premium.");
          return;
        }

        await loadSpotifySdk();

        if (cancelled || !window.Spotify?.Player) {
          return;
        }

        const player = new window.Spotify.Player({
          name: "My Spotify",
          volume: 0.8,
          getOAuthToken: (callback) => {
            void fetchPlayerToken()
              .then(callback)
              .catch(() => {
                setError("Could not refresh playback token. Reconnect Spotify.");
              });
          },
        });

        player.addListener("ready", ({ device_id }) => {
          deviceIdRef.current = device_id;
          setIsReady(true);
          setError(null);
        });

        player.addListener("not_ready", () => {
          setIsReady(false);
        });

        player.addListener("player_state_changed", applyPlayerState);

        player.addListener("initialization_error", ({ message }) => {
          setError(message);
        });

        player.addListener("authentication_error", () => {
          setError(
            "Playback authentication failed. Reconnect Spotify with updated permissions.",
          );
        });

        player.addListener("account_error", () => {
          setError("In-app playback requires Spotify Premium.");
          setIsPremium(false);
        });

        player.addListener("playback_error", ({ message }) => {
          setError(message);
        });

        playerRef.current = player;
        await player.connect();
      } catch (initError) {
        if (!cancelled) {
          setError(
            initError instanceof Error
              ? initError.message
              : "Failed to initialize Spotify player.",
          );
        }
      }
    }

    void init();

    return () => {
      cancelled = true;
      playerRef.current?.disconnect();
      playerRef.current = null;
    };
  }, [applyPlayerState]);

  const playTrack = useCallback(
    async (track: PlayerTrack, nextQueue?: PlayerTrack[]) => {
      const player = playerRef.current;
      const deviceId = deviceIdRef.current;

      if (!player || !deviceId) {
        setError("Player is not ready yet. Wait a moment and try again.");
        return;
      }

      setError(null);

      try {
        await player.activateElement();
      } catch {
        // Mobile browsers may require a user gesture; caller should invoke from click.
      }

      const queueTracks = nextQueue?.length ? nextQueue : [track];
      const index = queueTracks.findIndex((item) => item.id === track.id);

      setQueue(queueTracks);
      setCurrentIndex(index >= 0 ? index : 0);

      await transferPlayback(deviceId, true);
      await startPlayback({
        deviceId,
        uris: queueTracks.map((item) => `spotify:track:${item.id}`),
        offset: { position: index >= 0 ? index : 0 },
      });
    },
    [],
  );

  const playQueueTrack = useCallback(
    async (index: number) => {
      const track = queue[index];
      if (!track) {
        return;
      }

      await playTrack(track, queue);
    },
    [playTrack, queue],
  );

  const togglePlay = useCallback(async () => {
    const player = playerRef.current;
    if (!player) {
      return;
    }

    try {
      await player.activateElement();
      await player.togglePlay();
    } catch {
      setError("Could not toggle playback.");
    }
  }, []);

  const nextTrack = useCallback(async () => {
    const player = playerRef.current;
    if (!player) {
      return;
    }

    await player.nextTrack();
  }, []);

  const previousTrack = useCallback(async () => {
    const player = playerRef.current;
    if (!player) {
      return;
    }

    await player.previousTrack();
  }, []);

  const seek = useCallback(async (ms: number) => {
    const player = playerRef.current;
    if (!player) {
      return;
    }

    await player.seek(ms);
    setPositionMs(ms);
  }, []);

  const setVolume = useCallback(async (nextVolume: number) => {
    const player = playerRef.current;
    const normalized = Math.max(0, Math.min(100, nextVolume));

    setVolumeState(normalized);

    if (!player) {
      return;
    }

    await player.setVolume(normalized / 100);
  }, []);

  const value = useMemo<SpotifyPlayerContextValue>(
    () => ({
      isReady,
      isPremium,
      isSpotifyConnected,
      error,
      currentTrack,
      isPlaying,
      positionMs,
      durationMs,
      volume,
      queue,
      currentIndex,
      isExpanded,
      setExpanded,
      playTrack,
      playQueueTrack,
      togglePlay,
      nextTrack,
      previousTrack,
      seek,
      setVolume,
    }),
    [
      isReady,
      isPremium,
      isSpotifyConnected,
      error,
      currentTrack,
      isPlaying,
      positionMs,
      durationMs,
      volume,
      queue,
      currentIndex,
      isExpanded,
      playTrack,
      playQueueTrack,
      togglePlay,
      nextTrack,
      previousTrack,
      seek,
      setVolume,
    ],
  );

  return (
    <SpotifyPlayerContext.Provider value={value}>
      {children}
    </SpotifyPlayerContext.Provider>
  );
}

export function useSpotifyPlayerContext() {
  const context = useContext(SpotifyPlayerContext);

  if (!context) {
    throw new Error("useSpotifyPlayer must be used within SpotifyPlayerProvider.");
  }

  return context;
}
