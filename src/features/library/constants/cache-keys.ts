import type { SpotifyTimeRange } from "@/shared/constants/spotify";

export const LIBRARY_CACHE_KEYS = {
  playlists: "playlists",
  savedTracks: "saved_tracks",
} as const;

export function topTracksCacheKey(timeRange: SpotifyTimeRange) {
  return `top_tracks:${timeRange}`;
}

export function topArtistsCacheKey(timeRange: SpotifyTimeRange) {
  return `top_artists:${timeRange}`;
}

export const ALL_TIME_RANGES: SpotifyTimeRange[] = [
  "short_term",
  "medium_term",
  "long_term",
];
