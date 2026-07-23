declare namespace Spotify {
  interface PlayerOptions {
    name: string;
    getOAuthToken: (callback: (token: string) => void) => void;
    volume?: number;
    enableMediaSession?: boolean;
  }

  interface WebPlaybackArtist {
    name: string;
    uri: string;
  }

  interface WebPlaybackAlbum {
    name: string;
    uri: string;
    images: Array<{ url: string; height: number | null; width: number | null }>;
  }

  interface WebPlaybackTrack {
    id: string;
    uri: string;
    name: string;
    duration_ms: number;
    artists: WebPlaybackArtist[];
    album: WebPlaybackAlbum;
  }

  interface WebPlaybackTrackWindow {
    current_track: WebPlaybackTrack | null;
    previous_tracks: WebPlaybackTrack[];
    next_tracks: WebPlaybackTrack[];
  }

  interface WebPlaybackState {
    context: { uri: string | null; metadata: unknown } | null;
    disallows: Record<string, boolean>;
    paused: boolean;
    position: number;
    duration: number;
    track_window: WebPlaybackTrackWindow;
    shuffle: boolean;
    repeat_mode: number;
  }

  interface Player {
    connect: () => Promise<boolean>;
    disconnect: () => void;
    getCurrentState: () => Promise<WebPlaybackState | null>;
    setName: (name: string) => Promise<void>;
    getVolume: () => Promise<number>;
    setVolume: (volume: number) => Promise<void>;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    togglePlay: () => Promise<void>;
    seek: (positionMs: number) => Promise<void>;
    previousTrack: () => Promise<void>;
    nextTrack: () => Promise<void>;
    activateElement: () => Promise<void>;
    addListener: {
      (event: "ready", callback: (data: { device_id: string }) => void): void;
      (event: "not_ready", callback: (data: { device_id: string }) => void): void;
      (
        event: "player_state_changed",
        callback: (state: WebPlaybackState | null) => void,
      ): void;
      (event: "initialization_error", callback: (data: { message: string }) => void): void;
      (event: "authentication_error", callback: (data: { message: string }) => void): void;
      (event: "account_error", callback: (data: { message: string }) => void): void;
      (event: "playback_error", callback: (data: { message: string }) => void): void;
    };
    removeListener: {
      (event: "ready", callback?: (data: { device_id: string }) => void): void;
      (event: "not_ready", callback?: (data: { device_id: string }) => void): void;
      (
        event: "player_state_changed",
        callback?: (state: WebPlaybackState | null) => void,
      ): void;
      (event: "initialization_error", callback?: (data: { message: string }) => void): void;
      (event: "authentication_error", callback?: (data: { message: string }) => void): void;
      (event: "account_error", callback?: (data: { message: string }) => void): void;
      (event: "playback_error", callback?: (data: { message: string }) => void): void;
    };
  }

  interface PlayerConstructor {
    new (options: PlayerOptions): Player;
  }

  const Player: PlayerConstructor;
}

interface Window {
  Spotify?: typeof Spotify;
  onSpotifyWebPlaybackSDKReady?: () => void;
}
