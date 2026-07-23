import { NextRequest } from "next/server";

import {
  getUserByAuth0Sub,
  getValidSpotifyAccessToken,
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

  if (!isSpotifyConnected(user)) {
    return spotifyJsonResponse(
      { message: "Spotify is not connected." },
      { status: 400 },
    );
  }

  const accessToken = await getValidSpotifyAccessToken(user);

  if (!accessToken) {
    return spotifyJsonResponse(
      { message: "Could not refresh Spotify token. Reconnect Spotify." },
      { status: 401 },
    );
  }

  return spotifyJsonResponse({ accessToken });
}
