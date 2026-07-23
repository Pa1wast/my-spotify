import { NextRequest } from "next/server";

import {
  getCachedTopArtists,
  LIBRARY_NOT_SYNCED_STATUS,
  libraryNotSyncedMessage,
} from "@/features/library/services/library-cache.service";
import { getUserByAuth0Sub } from "@/features/spotify/services/spotify-user.service";
import type { SpotifyTimeRange } from "@/shared/constants/spotify";
import { auth0 } from "@/shared/lib/auth0";
import { spotifyJsonResponse } from "@/shared/lib/spotify-api-route";

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

  const cached = await getCachedTopArtists(user.id, timeRange);

  if (!cached) {
    return spotifyJsonResponse(
      { message: libraryNotSyncedMessage(), code: "LIBRARY_NOT_SYNCED" },
      { status: LIBRARY_NOT_SYNCED_STATUS },
    );
  }

  return spotifyJsonResponse({
    items: mapWithRank(cached.data.slice(0, limit)),
    timeRange,
    syncedAt: cached.syncedAt.toISOString(),
  });
}
