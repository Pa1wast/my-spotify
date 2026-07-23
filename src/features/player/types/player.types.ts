export interface PlayerTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  durationMs: number;
}

export function playerTrackToMusicPlayerTrack(track: PlayerTrack) {
  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    album: track.album,
    artwork: track.artwork,
    duration: Math.max(1, Math.floor(track.durationMs / 1000)),
  };
}

export function savedTrackToPlayerTrack(track: {
  id: string;
  name: string;
  artists: string;
  album: string;
  albumImage: string | null;
  durationMs: number;
}): PlayerTrack {
  return {
    id: track.id,
    title: track.name,
    artist: track.artists,
    album: track.album,
    artwork: track.albumImage ?? "/logo/logo-icon.png",
    durationMs: track.durationMs,
  };
}

export function topTrackToPlayerTrack(track: {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: { name: string; images?: Array<{ url: string }> };
  duration_ms: number;
}): PlayerTrack {
  return {
    id: track.id,
    title: track.name,
    artist: track.artists.map((artist) => artist.name).join(", "),
    album: track.album.name,
    artwork: track.album.images?.[0]?.url ?? "/logo/logo-icon.png",
    durationMs: track.duration_ms,
  };
}
