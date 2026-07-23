import { NextRequest } from "next/server";

import { ensureCachedSavedTracks } from "@/features/library/services/library-hydrate.service";
import { getUserByAuth0Sub } from "@/features/spotify/services/spotify-user.service";
import { auth0 } from "@/shared/lib/auth0";
import {
  parseRefreshParam,
  spotifyJsonResponse,
  spotifyRouteErrorResponse,
} from "@/shared/lib/spotify-api-route";

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
  const limit = Math.min(
    Number.parseInt(searchParams.get("limit") ?? "20", 10) || 20,
    50,
  );
  const offset = Number.parseInt(searchParams.get("offset") ?? "0", 10) || 0;
  const force = parseRefreshParam(searchParams);

  try {
    const cached = await ensureCachedSavedTracks(user, { force });
    const items = cached.data.items.slice(offset, offset + limit);

    return spotifyJsonResponse({
      items,
      total: cached.data.total,
      limit,
      offset,
      syncedAt: cached.syncedAt.toISOString(),
    });
  } catch (error) {
    return spotifyRouteErrorResponse(error);
  }
}
