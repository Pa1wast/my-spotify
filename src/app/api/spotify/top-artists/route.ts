import { NextRequest } from "next/server";

import { ensureCachedTopArtists } from "@/features/library/services/library-hydrate.service";
import { getUserByAuth0Sub } from "@/features/spotify/services/spotify-user.service";
import type { SpotifyTimeRange } from "@/shared/constants/spotify";
import { auth0 } from "@/shared/lib/auth0";
import {
  parseRefreshParam,
  spotifyJsonResponse,
  spotifyRouteErrorResponse,
} from "@/shared/lib/spotify-api-route";

function parseTimeRange(value: string | null): SpotifyTimeRange {
  if (value === "medium_term" || value === "long_term") {
    return value;
  }
  return "short_term";
}

function mapWithRank<T extends { id: string }>(items: T[]) {
  return items.map((item, index) => ({ rank: index + 1, ...item }));
}

export async function GET(request: NextRequest) {
  const session = await auth0.getSession(request);

  if (!session) {
    return spotifyJsonResponse({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByAuth0Sub(session.user.sub);

  if (!user) {
    return spotifyJsonResponse({ message: "User not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const timeRange = parseTimeRange(searchParams.get("time_range"));
  const limit = Math.min(
    Number.parseInt(searchParams.get("limit") ?? "50", 10) || 50,
    50,
  );
  const force = parseRefreshParam(searchParams);

  try {
    const cached = await ensureCachedTopArtists(user, timeRange, { force });

    return spotifyJsonResponse({
      items: mapWithRank(cached.data.slice(0, limit)),
      timeRange,
      syncedAt: cached.syncedAt.toISOString(),
    });
  } catch (error) {
    return spotifyRouteErrorResponse(error);
  }
}
