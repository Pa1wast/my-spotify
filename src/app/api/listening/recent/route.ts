import { NextRequest, NextResponse } from "next/server";

import {
  getRecentPlays,
  getUserSyncState,
} from "@/features/listening/services/play-events.service";
import { syncPlayHistoryForUser } from "@/features/listening/services/play-sync.service";
import { isCacheFresh } from "@/features/library/services/library-cache.service";
import {
  hydrateSpotifyRateLimitFromDb,
  persistSpotifyRateLimit,
} from "@/features/spotify/services/spotify-rate-limit.service";
import { getUserByAuth0Sub } from "@/features/spotify/services/spotify-user.service";
import { auth0 } from "@/shared/lib/auth0";
import { prisma } from "@/shared/lib/prisma";
import { spotifyApiMetrics } from "@/shared/lib/spotify-api-metrics";
import {
  formatRateLimitMessage,
  getSpotifyErrorMessage,
  isSpotifyRateLimitError,
  SpotifyRateLimitError,
} from "@/shared/lib/spotify-http";

function parseRefreshParam(searchParams: URLSearchParams) {
  return searchParams.get("refresh") === "1";
}

async function shouldSyncPlayHistory(
  userId: string,
  force: boolean,
) {
  if (force) {
    return true;
  }

  const [playCount, syncState] = await Promise.all([
    prisma.playEvent.count({ where: { userId } }),
    getUserSyncState(userId),
  ]);

  if (playCount === 0) {
    return true;
  }

  if (!syncState?.lastSyncedAt) {
    return true;
  }

  return !isCacheFresh(syncState.lastSyncedAt);
}

export async function GET(request: NextRequest) {
  const session = await auth0.getSession(request);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByAuth0Sub(session.user.sub);

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number.parseInt(searchParams.get("page") ?? "1", 10) || 1;
  const limit = Math.min(
    Number.parseInt(searchParams.get("limit") ?? "20", 10) || 20,
    50,
  );
  const force = parseRefreshParam(searchParams);

  if (await shouldSyncPlayHistory(user.id, force)) {
    await hydrateSpotifyRateLimitFromDb(user.id);

    if (spotifyApiMetrics.isRateLimited()) {
      const remainingMs = spotifyApiMetrics.getRateLimitRemainingMs() ?? 30_000;
      const playCount = await prisma.playEvent.count({ where: { userId: user.id } });

      if (playCount === 0) {
        return NextResponse.json(
          { message: formatRateLimitMessage(remainingMs) },
          { status: 429 },
        );
      }
    } else {
      try {
        await syncPlayHistoryForUser(user);
      } catch (error) {
        if (isSpotifyRateLimitError(error)) {
          const retryAfterMs =
            error instanceof SpotifyRateLimitError ? error.retryAfterMs : 30_000;
          await persistSpotifyRateLimit(user.id, retryAfterMs);

          const playCount = await prisma.playEvent.count({
            where: { userId: user.id },
          });

          if (playCount === 0) {
            return NextResponse.json(
              { message: getSpotifyErrorMessage(error) },
              { status: 429 },
            );
          }
        } else {
          const playCount = await prisma.playEvent.count({
            where: { userId: user.id },
          });

          if (playCount === 0) {
            return NextResponse.json(
              { message: getSpotifyErrorMessage(error) },
              { status: 500 },
            );
          }
        }
      }
    }
  }

  const data = await getRecentPlays(user.id, { page, limit });

  return NextResponse.json({
    items: data.items.map((item) => ({
      id: item.id,
      spotifyTrackId: item.spotifyTrackId,
      trackName: item.trackName,
      albumName: item.albumName,
      artistNames: item.artistNames,
      playedAt: item.playedAt.toISOString(),
      contextType: item.contextType,
      contextUri: item.contextUri,
    })),
    total: data.total,
    page: data.page,
    limit: data.limit,
    totalPages: data.totalPages,
  });
}
