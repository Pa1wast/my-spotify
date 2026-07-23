import { NextRequest } from "next/server";

import { transferSpotifyPlayback } from "@/features/spotify/services/spotify.service";
import {
  getUserByAuth0Sub,
  getValidSpotifyAccessToken,
  isSpotifyConnected,
} from "@/features/spotify/services/spotify-user.service";
import { auth0 } from "@/shared/lib/auth0";
import { spotifyJsonResponse } from "@/shared/lib/spotify-api-route";
import { getSpotifyErrorMessage } from "@/shared/lib/spotify-http";

interface TransferRequestBody {
  deviceId: string;
  play?: boolean;
}

export async function PUT(request: NextRequest) {
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

  let body: TransferRequestBody;

  try {
    body = (await request.json()) as TransferRequestBody;
  } catch {
    return spotifyJsonResponse({ message: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.deviceId) {
    return spotifyJsonResponse(
      { message: "deviceId is required." },
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

  try {
    await transferSpotifyPlayback(accessToken, body.deviceId, body.play ?? false);
    return spotifyJsonResponse({ ok: true });
  } catch (error) {
    return spotifyJsonResponse(
      { message: getSpotifyErrorMessage(error) },
      { status: 502 },
    );
  }
}
