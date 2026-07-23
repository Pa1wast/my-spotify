import type { User } from "@/generated/prisma/client";

import { fetchSpotifyRecentlyPlayedWithCursor } from "@/features/spotify/services/spotify.service";
import { getValidSpotifyAccessToken } from "@/features/spotify/services/spotify-user.service";
import { prisma } from "@/shared/lib/prisma";

function formatArtistNames(artists: Array<{ name: string }>) {
  return artists.map((artist) => artist.name).join(", ");
}

export async function syncPlayHistoryForUser(user: User) {
  const accessToken = await getValidSpotifyAccessToken(user);

  if (!accessToken) {
    return { inserted: 0, skipped: true, reason: "not_connected" as const };
  }

  const syncState = await prisma.userSyncState.findUnique({
    where: { userId: user.id },
  });

  const response = await fetchSpotifyRecentlyPlayedWithCursor(
    accessToken,
    50,
    syncState?.lastCursor ?? undefined,
  );

  let inserted = 0;

  for (const item of response.items) {
    const track = item.track;
    const playedAt = new Date(item.played_at);

    try {
      await prisma.playEvent.create({
        data: {
          userId: user.id,
          spotifyTrackId: track.id,
          trackName: track.name,
          albumId: track.album?.id ?? null,
          albumName: track.album?.name ?? null,
          artistNames: formatArtistNames(track.artists ?? []),
          playedAt,
          contextType: item.context?.type ?? null,
          contextUri: item.context?.uri ?? null,
        },
      });
      inserted += 1;
    } catch {
      // duplicate play event — skip
    }
  }

  const nextCursor = response.cursors?.after ?? syncState?.lastCursor ?? null;

  await prisma.userSyncState.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      lastSyncedAt: new Date(),
      lastCursor: nextCursor,
    },
    update: {
      lastSyncedAt: new Date(),
      lastCursor: nextCursor,
    },
  });

  return { inserted, skipped: false as const };
}

export async function syncPlayHistoryForAllUsers() {
  const users = await prisma.user.findMany({
    where: {
      spotifyRefreshToken: { not: null },
      spotifyUserId: { not: null },
    },
  });

  const results = await Promise.allSettled(
    users.map((user) => syncPlayHistoryForUser(user)),
  );

  const synced = results.filter(
    (result) => result.status === "fulfilled" && !result.value.skipped,
  ).length;

  const totalInserted = results.reduce((sum, result) => {
    if (result.status === "fulfilled" && !result.value.skipped) {
      return sum + result.value.inserted;
    }
    return sum;
  }, 0);

  return { users: users.length, synced, totalInserted };
}
