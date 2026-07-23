import { NextRequest, NextResponse } from "next/server";

import {
  syncPlayHistoryForAllUsers,
  syncPlayHistoryForUser,
} from "@/features/listening/services/play-sync.service";
import {
  hydrateSpotifyRateLimitFromDb,
  persistSpotifyRateLimit,
} from "@/features/spotify/services/spotify-rate-limit.service";
import { getUserByAuth0Sub } from "@/features/spotify/services/spotify-user.service";
import { auth0 } from "@/shared/lib/auth0";
import { spotifyApiMetrics } from "@/shared/lib/spotify-api-metrics";
import {
  formatRateLimitMessage,
  getSpotifyErrorMessage,
  isSpotifyRateLimitError,
  SpotifyRateLimitError,
} from "@/shared/lib/spotify-http";

function verifyCronSecret(request: NextRequest) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return false;
  }

  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const result = await syncPlayHistoryForAllUsers();
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const session = await auth0.getSession(request);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByAuth0Sub(session.user.sub);

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const persistedRemainingMs = await hydrateSpotifyRateLimitFromDb(user.id);
  const memoryRemainingMs = spotifyApiMetrics.getRateLimitRemainingMs();
  const remainingMs =
    persistedRemainingMs !== null || memoryRemainingMs !== null
      ? Math.max(persistedRemainingMs ?? 0, memoryRemainingMs ?? 0)
      : null;

  if (remainingMs !== null && remainingMs > 0) {
    return NextResponse.json(
      {
        message: `${formatRateLimitMessage(remainingMs)} (App is pausing calls until Retry-After ends.)`,
        metrics: spotifyApiMetrics.getSnapshot(),
      },
      { status: 429 },
    );
  }

  try {
    const result = await syncPlayHistoryForUser(user);
    const syncedAt = new Date().toISOString();

    if (result.skipped) {
      return NextResponse.json({
        skipped: true,
        reason: result.reason,
        syncedAt,
        metrics: spotifyApiMetrics.getSnapshot(),
      });
    }

    return NextResponse.json({
      skipped: false,
      inserted: result.inserted,
      syncedAt,
      metrics: spotifyApiMetrics.getSnapshot(),
    });
  } catch (error) {
    if (isSpotifyRateLimitError(error)) {
      const retryAfterMs =
        error instanceof SpotifyRateLimitError
          ? error.retryAfterMs
          : 60_000;
      await persistSpotifyRateLimit(user.id, retryAfterMs);
    }

    const status = isSpotifyRateLimitError(error) ? 429 : 500;

    return NextResponse.json(
      {
        message: getSpotifyErrorMessage(error),
        metrics: spotifyApiMetrics.getSnapshot(),
      },
      { status },
    );
  }
}
