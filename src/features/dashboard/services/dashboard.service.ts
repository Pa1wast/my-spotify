import type {
  SpotifyArtist,
  SpotifyPlaylist,
  SpotifyRecentlyPlayedItem,
  SpotifyTopTrack,
} from "@/features/spotify/types/spotify.types";
import type { RecentPlayRow } from "@/features/recent/services/recent.service";
import type { SpotifyTimeRange } from "@/shared/constants/spotify";
import type { SpotifyApiMetricsSnapshot } from "@/shared/lib/spotify-api-metrics";
import { apiClient } from "@/shared/services/axios";

const OVERVIEW_LIMIT = 5;

interface ApiMetricsPayload {
  metrics: SpotifyApiMetricsSnapshot;
}

interface TopTrackDto {
  rank: number;
  id: string;
  name: string;
  album: string;
  albumImage: string | null;
  artists: string;
  durationMs: number;
  spotifyUrl: string | null;
}

interface TopArtistDto {
  rank: number;
  id: string;
  name: string;
  image: string | null;
  genres: string | null;
  popularity: number;
  spotifyUrl: string | null;
}

interface PlaylistDto {
  id: string;
  name: string;
  image: string | null;
  trackCount: number | null;
  ownerName: string | null;
  spotifyUrl: string | null;
}

export interface SpotifyConnectionResponse {
  connected: boolean;
  displayName: string | null;
  spotifyProduct: string | null;
  isPremium: boolean;
  hasLibraryCache: boolean;
  lastLibrarySyncAt: string | null;
  lastPlaySyncAt: string | null;
  metrics: SpotifyApiMetricsSnapshot;
}

function toTopTrack(dto: TopTrackDto): SpotifyTopTrack {
  return {
    id: dto.id,
    name: dto.name,
    duration_ms: dto.durationMs,
    album: {
      name: dto.album,
      images: dto.albumImage ? [{ url: dto.albumImage, height: null, width: null }] : [],
    },
    artists: dto.artists.split(", ").map((name) => ({ name })),
    external_urls: { spotify: dto.spotifyUrl ?? "" },
  };
}

function toTopArtist(dto: TopArtistDto): SpotifyArtist {
  return {
    id: dto.id,
    name: dto.name,
    popularity: dto.popularity,
    genres: dto.genres ? [dto.genres] : [],
    images: dto.image ? [{ url: dto.image, height: null, width: null }] : [],
    external_urls: { spotify: dto.spotifyUrl ?? "" },
  };
}

function toPlaylist(dto: PlaylistDto): SpotifyPlaylist {
  return {
    id: dto.id,
    name: dto.name,
    images: dto.image ? [{ url: dto.image, height: null, width: null }] : [],
    tracks: dto.trackCount != null ? { total: dto.trackCount } : undefined,
    owner: dto.ownerName ? { display_name: dto.ownerName } : undefined,
    external_urls: dto.spotifyUrl ? { spotify: dto.spotifyUrl } : undefined,
  };
}

export async function fetchSpotifyConnection() {
  const { data } = await apiClient.get<SpotifyConnectionResponse>(
    "/spotify/connection",
  );
  return data;
}

export async function fetchSpotifyApiMetrics() {
  const { data } = await apiClient.get<SpotifyApiMetricsSnapshot>(
    "/spotify/metrics",
  );
  return data;
}

export async function fetchOverviewTopTracks(timeRange: SpotifyTimeRange) {
  const { data } = await apiClient.get<
    { items: TopTrackDto[]; timeRange: SpotifyTimeRange } & ApiMetricsPayload
  >("/spotify/top-tracks", {
    params: { time_range: timeRange, limit: OVERVIEW_LIMIT },
  });

  return {
    items: data.items.map(toTopTrack),
    metrics: data.metrics,
  };
}

export async function fetchOverviewTopArtists(timeRange: SpotifyTimeRange) {
  const { data } = await apiClient.get<
    { items: TopArtistDto[]; timeRange: SpotifyTimeRange } & ApiMetricsPayload
  >("/spotify/top-artists", {
    params: { time_range: timeRange, limit: OVERVIEW_LIMIT },
  });

  return {
    items: data.items.map(toTopArtist),
    metrics: data.metrics,
  };
}

function toRecentlyPlayedFromDb(row: RecentPlayRow): SpotifyRecentlyPlayedItem {
  return {
    played_at: row.playedAt,
    track: {
      id: row.spotifyTrackId,
      name: row.trackName,
      duration_ms: 0,
      album: { name: row.albumName ?? "Unknown album" },
      artists: row.artistNames.split(", ").map((name) => ({ name })),
      external_urls: { spotify: `https://open.spotify.com/track/${row.spotifyTrackId}` },
    },
  };
}

export async function fetchOverviewRecentlyPlayed() {
  const { data } = await apiClient.get<{
    items: RecentPlayRow[];
  }>("/listening/recent", {
    params: { page: 1, limit: OVERVIEW_LIMIT },
  });

  return {
    items: data.items.map(toRecentlyPlayedFromDb),
  };
}

export async function fetchOverviewPlaylists() {
  const { data } = await apiClient.get<
    { items: PlaylistDto[]; total: number } & ApiMetricsPayload
  >("/spotify/playlists", {
    params: { limit: 6 },
  });

  return {
    items: data.items.map(toPlaylist),
    total: data.total,
    metrics: data.metrics,
  };
}

export type { SpotifyApiMetricsSnapshot };
