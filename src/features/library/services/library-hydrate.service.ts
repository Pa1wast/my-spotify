import type { User } from "@/generated/prisma/client";

import {
  fetchSpotifyPlaylists,
  fetchSpotifySavedTracks,
  fetchSpotifyTopArtists,
  fetchSpotifyTopTracks,
} from "@/features/spotify/services/spotify.service";
import { getValidSpotifyAccessToken } from "@/features/spotify/services/spotify-user.service";
import {
  hydrateSpotifyRateLimitFromDb,
  persistSpotifyRateLimit,
} from "@/features/spotify/services/spotify-rate-limit.service";
import type { SpotifyTimeRange } from "@/shared/constants/spotify";
import { spotifyApiMetrics } from "@/shared/lib/spotify-api-metrics";
import {
  isSpotifyRateLimitError,
  SpotifyRateLimitError,
  SPOTIFY_SYNC_REQUEST_OPTIONS,
} from "@/shared/lib/spotify-http";

import {
  getCachedPlaylists,
  getCachedSavedTracks,
  getCachedTopArtists,
  getCachedTopTracks,
  isCacheFresh,
  setCachedPlaylists,
  setCachedSavedTracks,
  setCachedTopArtists,
  setCachedTopTracks,
  type CachedPlaylistsPayload,
  type CachedSavedTracksPayload,
  type CachedTopArtistRow,
  type CachedTopTrackRow,
} from "./library-cache.service";
import {
  mapPlaylistPage,
  mapSavedTrackPage,
  mapTopArtist,
  mapTopTrack,
} from "./library-mappers";

const SPOTIFY_PAGE_LIMIT = 50;
const REQUEST_OPTIONS = SPOTIFY_SYNC_REQUEST_OPTIONS;

export class SpotifyNotConnectedError extends Error {
  constructor(message = "Spotify is not connected.") {
    super(message);
    this.name = "SpotifyNotConnectedError";
  }
}

interface EnsureCachedOptions {
  force?: boolean;
}

interface CachedResult<T> {
  data: T;
  syncedAt: Date;
}

async function assertSpotifyAvailable(userId: string) {
  await hydrateSpotifyRateLimitFromDb(userId);

  if (spotifyApiMetrics.isRateLimited()) {
    const remainingMs = spotifyApiMetrics.getRateLimitRemainingMs() ?? 30_000;
    throw new SpotifyRateLimitError(remainingMs);
  }
}

async function handleSpotifyError(userId: string, error: unknown): Promise<never> {
  if (isSpotifyRateLimitError(error)) {
    const retryAfterMs =
      error instanceof SpotifyRateLimitError ? error.retryAfterMs : 30_000;
    await persistSpotifyRateLimit(userId, retryAfterMs);
  }

  throw error;
}

async function requireAccessToken(user: User) {
  const accessToken = await getValidSpotifyAccessToken(user);

  if (!accessToken) {
    throw new SpotifyNotConnectedError();
  }

  return accessToken;
}

function isUsableCache<T>(
  cached: CachedResult<T> | null,
  force: boolean,
): cached is CachedResult<T> {
  return Boolean(cached && !force && isCacheFresh(cached.syncedAt));
}

export async function ensureCachedTopTracks(
  user: User,
  timeRange: SpotifyTimeRange,
  options: EnsureCachedOptions = {},
) {
  const force = options.force ?? false;
  const cached = await getCachedTopTracks(user.id, timeRange);

  if (isUsableCache(cached, force)) {
    return cached;
  }

  await assertSpotifyAvailable(user.id);

  try {
    const accessToken = await requireAccessToken(user);
    const tracks = await fetchSpotifyTopTracks(
      accessToken,
      timeRange,
      SPOTIFY_PAGE_LIMIT,
      REQUEST_OPTIONS,
    );
    const rows = tracks.map(mapTopTrack);
    const syncedAt = await setCachedTopTracks(user.id, timeRange, rows);

    return { data: rows, syncedAt } satisfies CachedResult<CachedTopTrackRow[]>;
  } catch (error) {
    return handleSpotifyError(user.id, error);
  }
}

export async function ensureCachedTopArtists(
  user: User,
  timeRange: SpotifyTimeRange,
  options: EnsureCachedOptions = {},
) {
  const force = options.force ?? false;
  const cached = await getCachedTopArtists(user.id, timeRange);

  if (isUsableCache(cached, force)) {
    return cached;
  }

  await assertSpotifyAvailable(user.id);

  try {
    const accessToken = await requireAccessToken(user);
    const artists = await fetchSpotifyTopArtists(
      accessToken,
      timeRange,
      SPOTIFY_PAGE_LIMIT,
      REQUEST_OPTIONS,
    );
    const rows = artists.map(mapTopArtist);
    const syncedAt = await setCachedTopArtists(user.id, timeRange, rows);

    return { data: rows, syncedAt } satisfies CachedResult<CachedTopArtistRow[]>;
  } catch (error) {
    return handleSpotifyError(user.id, error);
  }
}

export async function ensureCachedSavedTracks(
  user: User,
  options: EnsureCachedOptions = {},
) {
  const force = options.force ?? false;
  const cached = await getCachedSavedTracks(user.id);

  if (isUsableCache(cached, force)) {
    return cached;
  }

  await assertSpotifyAvailable(user.id);

  try {
    const accessToken = await requireAccessToken(user);
    const page = await fetchSpotifySavedTracks(
      accessToken,
      SPOTIFY_PAGE_LIMIT,
      0,
      REQUEST_OPTIONS,
    );
    const payload = mapSavedTrackPage(page);
    const syncedAt = await setCachedSavedTracks(user.id, payload);

    return {
      data: payload,
      syncedAt,
    } satisfies CachedResult<CachedSavedTracksPayload>;
  } catch (error) {
    return handleSpotifyError(user.id, error);
  }
}

export async function ensureCachedPlaylists(
  user: User,
  options: EnsureCachedOptions = {},
) {
  const force = options.force ?? false;
  const cached = await getCachedPlaylists(user.id);

  if (isUsableCache(cached, force)) {
    return cached;
  }

  await assertSpotifyAvailable(user.id);

  try {
    const accessToken = await requireAccessToken(user);
    const page = await fetchSpotifyPlaylists(
      accessToken,
      SPOTIFY_PAGE_LIMIT,
      0,
      REQUEST_OPTIONS,
    );
    const payload = mapPlaylistPage(page);
    const syncedAt = await setCachedPlaylists(user.id, payload);

    return {
      data: payload,
      syncedAt,
    } satisfies CachedResult<CachedPlaylistsPayload>;
  } catch (error) {
    return handleSpotifyError(user.id, error);
  }
}
