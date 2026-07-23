import { NextRequest, NextResponse } from "next/server";

import { syncSpotifyLibraryForAllUsers } from "@/features/library/services/library-sync-all.service";
import { syncSpotifyLibraryForUser } from "@/features/library/services/library-sync.service";
import { getUserByAuth0Sub } from "@/features/spotify/services/spotify-user.service";
import { auth0 } from "@/shared/lib/auth0";
import { spotifyApiMetrics } from "@/shared/lib/spotify-api-metrics";
import {
  formatRateLimitMessage,
  getSpotifyErrorMessage,
  isSpotifyRateLimitError,
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

  const result = await syncSpotifyLibraryForAllUsers();
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

  const remainingMs = spotifyApiMetrics.getRateLimitRemainingMs();

  if (remainingMs !== null) {
    return NextResponse.json(
      {
        message: formatRateLimitMessage(remainingMs),
        metrics: spotifyApiMetrics.getSnapshot(),
      },
      { status: 429 },
    );
  }

  try {
    const result = await syncSpotifyLibraryForUser(user);

    return NextResponse.json({
      ...result,
      metrics: spotifyApiMetrics.getSnapshot(),
    });
  } catch (error) {
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
