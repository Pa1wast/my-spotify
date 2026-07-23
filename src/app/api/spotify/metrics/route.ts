import { NextRequest, NextResponse } from "next/server";

import { hydrateSpotifyRateLimitFromDb } from "@/features/spotify/services/spotify-rate-limit.service";
import { getUserByAuth0Sub } from "@/features/spotify/services/spotify-user.service";
import { auth0 } from "@/shared/lib/auth0";
import { spotifyApiMetrics } from "@/shared/lib/spotify-api-metrics";

export async function GET(request: NextRequest) {
  const session = await auth0.getSession(request);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByAuth0Sub(session.user.sub);

  if (user) {
    await hydrateSpotifyRateLimitFromDb(user.id);
  }

  return NextResponse.json(spotifyApiMetrics.getSnapshot());
}
