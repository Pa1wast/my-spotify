import { NextRequest } from "next/server";

import {
  getLibrarySyncState,
  hasEssentialLibraryCache,
} from "@/features/library/services/library-cache.service";
import {
  getUserByAuth0Sub,
  isSpotifyConnected,
} from "@/features/spotify/services/spotify-user.service";
import { auth0 } from "@/shared/lib/auth0";
import { spotifyJsonResponse } from "@/shared/lib/spotify-api-route";

export async function GET(request: NextRequest) {
  const session = await auth0.getSession(request);

  if (!session) {
    return spotifyJsonResponse({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByAuth0Sub(session.user.sub);

  if (!user) {
    return spotifyJsonResponse({ message: "User not found" }, { status: 404 });
  }

  const syncState = await getLibrarySyncState(user.id);

  return spotifyJsonResponse({
    connected: isSpotifyConnected(user),
    displayName: user.spotifyDisplayName,
    spotifyProduct: user.spotifyProduct,
    isPremium: user.spotifyProduct === "premium",
    hasLibraryCache: await hasEssentialLibraryCache(user.id),
    lastLibrarySyncAt: syncState?.lastLibrarySyncAt?.toISOString() ?? null,
    lastPlaySyncAt: syncState?.lastSyncedAt?.toISOString() ?? null,
  });
}
