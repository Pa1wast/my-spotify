import type { SpotifyTimeRange } from "@/shared/constants/spotify";
import { prisma } from "@/shared/lib/prisma";

import {
  LIBRARY_CACHE_KEYS,
  topArtistsCacheKey,
  topTracksCacheKey,
} from "../constants/cache-keys";

import type { Prisma } from "@/generated/prisma/client";

export interface CachedTopTrackRow {
  id: string;
  name: string;
  album: string;
  albumImage: string | null;
  artists: string;
  durationMs: number;
  spotifyUrl: string | null;
}

export interface CachedTopArtistRow {
  id: string;
  name: string;
  image: string | null;
  genres: string | null;
  popularity: number;
  spotifyUrl: string | null;
}

export interface CachedSavedTrackRow {
  id: string;
  name: string;
  album: string;
  albumImage: string | null;
  artists: string;
  durationMs: number;
  addedAt: string;
  spotifyUrl: string | null;
}

export interface CachedPlaylistRow {
  id: string;
  name: string;
  image: string | null;
  trackCount: number | null;
  ownerName: string | null;
  spotifyUrl: string | null;
}

export interface CachedSavedTracksPayload {
  total: number;
  items: CachedSavedTrackRow[];
}

export interface CachedPlaylistsPayload {
  total: number;
  items: CachedPlaylistRow[];
}

interface CachedEntry<T> {
  data: T;
  syncedAt: Date;
}

async function readCache<T>(userId: string, cacheKey: string) {
  const row = await prisma.spotifyLibraryCache.findUnique({
    where: { userId_cacheKey: { userId, cacheKey } },
  });

  if (!row) {
    return null;
  }

  return {
    data: row.data as T,
    syncedAt: row.syncedAt,
  } satisfies CachedEntry<T>;
}

async function writeCache(userId: string, cacheKey: string, data: unknown) {
  const syncedAt = new Date();
  const json = data as Prisma.InputJsonValue;

  await prisma.spotifyLibraryCache.upsert({
    where: { userId_cacheKey: { userId, cacheKey } },
    create: { userId, cacheKey, data: json, syncedAt },
    update: { data: json, syncedAt },
  });

  return syncedAt;
}

export async function hasAnyLibraryCache(userId: string) {
  const count = await prisma.spotifyLibraryCache.count({
    where: { userId },
  });

  return count > 0;
}

/** True when dashboard essentials (short_term tops) are in the DB. */
export async function hasEssentialLibraryCache(userId: string) {
  const [topTracks, topArtists] = await Promise.all([
    prisma.spotifyLibraryCache.findUnique({
      where: {
        userId_cacheKey: {
          userId,
          cacheKey: topTracksCacheKey("short_term"),
        },
      },
      select: { id: true },
    }),
    prisma.spotifyLibraryCache.findUnique({
      where: {
        userId_cacheKey: {
          userId,
          cacheKey: topArtistsCacheKey("short_term"),
        },
      },
      select: { id: true },
    }),
  ]);

  return Boolean(topTracks && topArtists);
}

export const LIBRARY_NOT_SYNCED_STATUS = 409;

export async function getLibrarySyncState(userId: string) {
  return prisma.userSyncState.findUnique({
    where: { userId },
    select: {
      lastSyncedAt: true,
      lastLibrarySyncAt: true,
    },
  });
}

export async function getCachedTopTracks(userId: string, timeRange: SpotifyTimeRange) {
  return readCache<CachedTopTrackRow[]>(userId, topTracksCacheKey(timeRange));
}

export async function setCachedTopTracks(
  userId: string,
  timeRange: SpotifyTimeRange,
  items: CachedTopTrackRow[],
) {
  return writeCache(userId, topTracksCacheKey(timeRange), items);
}

export async function getCachedTopArtists(userId: string, timeRange: SpotifyTimeRange) {
  return readCache<CachedTopArtistRow[]>(userId, topArtistsCacheKey(timeRange));
}

export async function setCachedTopArtists(
  userId: string,
  timeRange: SpotifyTimeRange,
  items: CachedTopArtistRow[],
) {
  return writeCache(userId, topArtistsCacheKey(timeRange), items);
}

export async function getCachedSavedTracks(userId: string) {
  return readCache<CachedSavedTracksPayload>(
    userId,
    LIBRARY_CACHE_KEYS.savedTracks,
  );
}

export async function setCachedSavedTracks(
  userId: string,
  payload: CachedSavedTracksPayload,
) {
  return writeCache(userId, LIBRARY_CACHE_KEYS.savedTracks, payload);
}

export async function getCachedPlaylists(userId: string) {
  return readCache<CachedPlaylistsPayload>(userId, LIBRARY_CACHE_KEYS.playlists);
}

export async function setCachedPlaylists(
  userId: string,
  payload: CachedPlaylistsPayload,
) {
  return writeCache(userId, LIBRARY_CACHE_KEYS.playlists, payload);
}

export function libraryNotSyncedMessage() {
  return "No saved library yet. Use “Save from Spotify” in Settings to import your data.";
}
