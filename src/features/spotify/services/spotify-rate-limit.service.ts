import { prisma } from "@/shared/lib/prisma";
import { spotifyApiMetrics } from "@/shared/lib/spotify-api-metrics";
import { resolveRetryAfterMs } from "@/shared/lib/spotify-http";

/**
 * Persist Spotify Retry-After across serverless instances.
 * @see https://developer.spotify.com/documentation/web-api/concepts/rate-limits
 */
export async function getPersistedRateLimitRemainingMs(userId: string) {
  const state = await prisma.userSyncState.findUnique({
    where: { userId },
    select: { rateLimitedUntil: true },
  });

  if (!state?.rateLimitedUntil) {
    return null;
  }

  const remainingMs = state.rateLimitedUntil.getTime() - Date.now();

  if (remainingMs <= 0) {
    await prisma.userSyncState.update({
      where: { userId },
      data: { rateLimitedUntil: null },
    });
    return null;
  }

  return remainingMs;
}

export async function persistSpotifyRateLimit(
  userId: string,
  retryAfterMs: number,
) {
  const waitMs = resolveRetryAfterMs(retryAfterMs, 0);
  const until = new Date(Date.now() + waitMs);

  const existing = await prisma.userSyncState.findUnique({
    where: { userId },
    select: { rateLimitedUntil: true },
  });

  const nextUntil =
    existing?.rateLimitedUntil && existing.rateLimitedUntil > until
      ? existing.rateLimitedUntil
      : until;

  await prisma.userSyncState.upsert({
    where: { userId },
    create: {
      userId,
      rateLimitedUntil: nextUntil,
    },
    update: {
      rateLimitedUntil: nextUntil,
    },
  });

  spotifyApiMetrics.recordRateLimit(nextUntil.getTime() - Date.now());

  return nextUntil.getTime() - Date.now();
}

/** Hydrate in-memory metrics from DB so serverless instances share cooldown. */
export async function hydrateSpotifyRateLimitFromDb(userId: string) {
  const remainingMs = await getPersistedRateLimitRemainingMs(userId);

  if (remainingMs !== null) {
    spotifyApiMetrics.recordRateLimit(remainingMs);
  }

  return remainingMs;
}
