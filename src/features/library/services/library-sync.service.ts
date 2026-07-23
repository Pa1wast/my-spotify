import type { User } from "@/generated/prisma/client";

import { syncPlayHistoryForUser } from "@/features/listening/services/play-sync.service";
import {
  fetchSpotifyPlaylists,
  fetchSpotifySavedTracks,
  fetchSpotifyTopArtists,
  fetchSpotifyTopTracks,
} from "@/features/spotify/services/spotify.service";
import { getValidSpotifyAccessToken } from "@/features/spotify/services/spotify-user.service";
import type { SpotifyTimeRange } from "@/shared/constants/spotify";
import { prisma } from "@/shared/lib/prisma";
import {
  formatRateLimitMessage,
  getSpotifyErrorMessage,
  isSpotifyRateLimitError,
  isSpotifyScopeError,
  SpotifyRateLimitError,
  SPOTIFY_SYNC_REQUEST_OPTIONS,
} from "@/shared/lib/spotify-http";
import { spotifyApiMetrics } from "@/shared/lib/spotify-api-metrics";

import { ALL_TIME_RANGES } from "../constants/cache-keys";
import {
  setCachedPlaylists,
  setCachedSavedTracks,
  setCachedTopArtists,
  setCachedTopTracks,
  type CachedPlaylistRow,
  type CachedSavedTrackRow,
  type CachedTopArtistRow,
  type CachedTopTrackRow,
} from "./library-cache.service";

const REQUEST_GAP_MS = 1_000;
const MAX_PLAYLIST_PAGES = 3;
const MAX_SAVED_TRACK_PAGES = 5;
const SYNC_REQUEST_OPTIONS = SPOTIFY_SYNC_REQUEST_OPTIONS;

/** Dashboard/settings need short_term first; other ranges fill in after. */
const TIME_RANGE_SYNC_ORDER: SpotifyTimeRange[] = [
  "short_term",
  ...ALL_TIME_RANGES.filter((range) => range !== "short_term"),
];

export type LibrarySyncSuccess = {
  skipped: false;
  partial: boolean;
  errors: string[];
  syncedAt: string;
  cachesWritten: number;
  playEventsInserted: number;
  savedTracks: number;
  playlists: number;
};

export type LibrarySyncResult =
  | { skipped: true; reason: "not_connected" }
  | LibrarySyncSuccess;

class SyncRateLimitedError extends Error {
  constructor(message = "Spotify rate limit reached during library sync.") {
    super(message);
    this.name = "SyncRateLimitedError";
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mapTopTrack(
  track: Awaited<ReturnType<typeof fetchSpotifyTopTracks>>[number],
): CachedTopTrackRow {
  return {
    id: track.id,
    name: track.name,
    album: track.album.name,
    albumImage: track.album.images?.[0]?.url ?? null,
    artists: track.artists.map((artist) => artist.name).join(", "),
    durationMs: track.duration_ms,
    spotifyUrl: track.external_urls?.spotify ?? null,
  };
}

function mapTopArtist(
  artist: Awaited<ReturnType<typeof fetchSpotifyTopArtists>>[number],
): CachedTopArtistRow {
  return {
    id: artist.id,
    name: artist.name,
    image: artist.images?.[0]?.url ?? null,
    genres: artist.genres?.[0] ?? null,
    popularity: artist.popularity,
    spotifyUrl: artist.external_urls?.spotify ?? null,
  };
}

async function fetchAllSavedTracks(accessToken: string) {
  const items: CachedSavedTrackRow[] = [];
  const limit = 50;
  let offset = 0;
  let total = 0;
  let pagesFetched = 0;

  do {
    const page = await fetchSpotifySavedTracks(
      accessToken,
      limit,
      offset,
      SYNC_REQUEST_OPTIONS,
    );
    total = page.total;
    pagesFetched += 1;

    for (const item of page.items) {
      const track = item.track;
      if (!track?.id) {
        continue;
      }

      items.push({
        id: track.id,
        name: track.name,
        album: track.album.name,
        albumImage: track.album.images?.[0]?.url ?? null,
        artists: track.artists.map((artist) => artist.name).join(", "),
        durationMs: track.duration_ms,
        addedAt: item.added_at,
        spotifyUrl: track.external_urls?.spotify ?? null,
      });
    }

    offset += limit;
    if (offset < total && pagesFetched < MAX_SAVED_TRACK_PAGES) {
      await sleep(REQUEST_GAP_MS);
    }
  } while (offset < total && pagesFetched < MAX_SAVED_TRACK_PAGES);

  return { total, items };
}

async function fetchAllPlaylists(accessToken: string) {
  const items: CachedPlaylistRow[] = [];
  const limit = 50;
  let offset = 0;
  let total = 0;
  let pagesFetched = 0;

  do {
    const page = await fetchSpotifyPlaylists(
      accessToken,
      limit,
      offset,
      SYNC_REQUEST_OPTIONS,
    );
    total = page.total;
    pagesFetched += 1;

    for (const playlist of page.items) {
      items.push({
        id: playlist.id,
        name: playlist.name,
        image: playlist.images?.[0]?.url ?? null,
        trackCount: playlist.tracks?.total ?? null,
        ownerName: playlist.owner?.display_name ?? null,
        spotifyUrl: playlist.external_urls?.spotify ?? null,
      });
    }

    offset += limit;
    if (offset < total && pagesFetched < MAX_PLAYLIST_PAGES) {
      await sleep(REQUEST_GAP_MS);
    }
  } while (offset < total && pagesFetched < MAX_PLAYLIST_PAGES);

  return { total, items };
}

async function syncTopTracksForRange(
  userId: string,
  accessToken: string,
  timeRange: SpotifyTimeRange,
) {
  const tracks = await fetchSpotifyTopTracks(
    accessToken,
    timeRange,
    50,
    SYNC_REQUEST_OPTIONS,
  );
  await setCachedTopTracks(userId, timeRange, tracks.map(mapTopTrack));
}

async function syncTopArtistsForRange(
  userId: string,
  accessToken: string,
  timeRange: SpotifyTimeRange,
) {
  const artists = await fetchSpotifyTopArtists(
    accessToken,
    timeRange,
    50,
    SYNC_REQUEST_OPTIONS,
  );
  await setCachedTopArtists(userId, timeRange, artists.map(mapTopArtist));
}

async function runSyncStep<T>(
  label: string,
  errors: string[],
  task: () => Promise<T>,
): Promise<T | null> {
  try {
    return await task();
  } catch (error) {
    if (isSpotifyRateLimitError(error)) {
      errors.push(`${label}: ${getSpotifyErrorMessage(error)}`);
      throw new SyncRateLimitedError();
    }

    const message = getSpotifyErrorMessage(error);
    if (isSpotifyScopeError(error)) {
      errors.push(
        `${label}: ${message} Use Reconnect Spotify in Settings to grant permissions.`,
      );
    } else {
      errors.push(`${label}: ${message}`);
    }

    return null;
  }
}

async function finalizeLibrarySync(params: {
  userId: string;
  errors: string[];
  cachesWritten: number;
  playEventsInserted: number;
  savedTracks: number;
  playlists: number;
}): Promise<LibrarySyncSuccess> {
  const {
    userId,
    errors,
    cachesWritten,
    playEventsInserted,
    savedTracks,
    playlists,
  } = params;

  if (cachesWritten === 0) {
    const rateLimitError = errors.find((error) =>
      error.toLowerCase().includes("rate limit"),
    );

    if (rateLimitError) {
      throw new SpotifyRateLimitError(
        spotifyApiMetrics.getRateLimitRemainingMs() ?? 60_000,
        rateLimitError.replace(/^[^:]+:\s*/, ""),
      );
    }

    throw new Error(
      errors[0] ??
        "Library sync failed before saving any data. Wait a few minutes if rate limited, then try again.",
    );
  }

  const syncedAt = new Date();

  await prisma.userSyncState.upsert({
    where: { userId },
    create: {
      userId,
      lastLibrarySyncAt: syncedAt,
      lastSyncedAt: syncedAt,
    },
    update: {
      lastLibrarySyncAt: syncedAt,
      lastSyncedAt: syncedAt,
    },
  });

  return {
    skipped: false,
    partial: errors.length > 0,
    errors,
    syncedAt: syncedAt.toISOString(),
    cachesWritten,
    playEventsInserted,
    savedTracks,
    playlists,
  };
}

export async function syncSpotifyLibraryForUser(
  user: User,
): Promise<LibrarySyncResult> {
  const accessToken = await getValidSpotifyAccessToken(user);

  if (!accessToken) {
    return { skipped: true, reason: "not_connected" };
  }

  if (spotifyApiMetrics.isRateLimited()) {
    const remainingMs = spotifyApiMetrics.getRateLimitRemainingMs() ?? 60_000;
    throw new Error(formatRateLimitMessage(remainingMs));
  }

  const errors: string[] = [];
  let cachesWritten = 0;
  let playlists = 0;
  let savedTracks = 0;
  let playEventsInserted = 0;

  try {
    for (const timeRange of TIME_RANGE_SYNC_ORDER) {
      const tracksSaved = await runSyncStep(
        `Top tracks (${timeRange})`,
        errors,
        async () => {
          await syncTopTracksForRange(user.id, accessToken, timeRange);
          return true;
        },
      );

      if (tracksSaved) {
        cachesWritten += 1;
      }

      await sleep(REQUEST_GAP_MS);

      const artistsSaved = await runSyncStep(
        `Top artists (${timeRange})`,
        errors,
        async () => {
          await syncTopArtistsForRange(user.id, accessToken, timeRange);
          return true;
        },
      );

      if (artistsSaved) {
        cachesWritten += 1;
      }

      await sleep(REQUEST_GAP_MS);
    }

    const savedTracksResult = await runSyncStep("Saved tracks", errors, () =>
      fetchAllSavedTracks(accessToken),
    );

    if (savedTracksResult) {
      await setCachedSavedTracks(user.id, savedTracksResult);
      cachesWritten += 1;
      savedTracks = savedTracksResult.items.length;
      await sleep(REQUEST_GAP_MS);
    }

    const playlistsResult = await runSyncStep("Playlists", errors, () =>
      fetchAllPlaylists(accessToken),
    );

    if (playlistsResult) {
      await setCachedPlaylists(user.id, playlistsResult);
      cachesWritten += 1;
      playlists = playlistsResult.items.length;
      await sleep(REQUEST_GAP_MS);
    }

    const playSync = await runSyncStep("Recent plays", errors, () =>
      syncPlayHistoryForUser(user),
    );

    if (playSync && !playSync.skipped) {
      playEventsInserted = playSync.inserted;
    }
  } catch (error) {
    if (!(error instanceof SyncRateLimitedError)) {
      throw error;
    }
  }

  return finalizeLibrarySync({
    userId: user.id,
    errors,
    cachesWritten,
    playEventsInserted,
    savedTracks,
    playlists,
  });
}
