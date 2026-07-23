import { NextRequest, NextResponse } from "next/server";

import { saveSpotifyConnection } from "@/features/spotify/services/spotify-user.service";
import { SPOTIFY_STATE_COOKIE } from "@/shared/constants/spotify";
import {
  resolveSpotifyConnectErrorReason,
  type SpotifyConnectErrorReason,
} from "@/shared/constants/spotify-connect-errors";
import { auth0 } from "@/shared/lib/auth0";
import { createAppUrl } from "@/shared/lib/app-url";
import { getSpotifyErrorMessage } from "@/shared/lib/spotify-http";

function resolveCallbackFailureReason(
  error: string | null,
  code: string | null,
  state: string | null,
  storedState: string | undefined,
): SpotifyConnectErrorReason {
  if (error === "access_denied") {
    return "denied";
  }

  if (!storedState || !state || state !== storedState) {
    return "state";
  }

  if (!code) {
    return "generic";
  }

  if (error) {
    return "generic";
  }

  return "generic";
}

export async function GET(request: NextRequest) {
  const session = await auth0.getSession(request);

  if (!session) {
    return NextResponse.redirect(createAppUrl("/auth/login"));
  }

  const { searchParams } = new URL(request.url);
  const error = searchParams.get("error");
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = request.cookies.get(SPOTIFY_STATE_COOKIE)?.value;

  const redirectToDashboard = (
    status: "connected" | "error",
    reason?: SpotifyConnectErrorReason,
  ) => {
    const url = createAppUrl(`/dashboard?spotify=${status}`);
    if (reason) {
      url.searchParams.set("spotify_reason", reason);
    }
    const response = NextResponse.redirect(url);
    response.cookies.delete(SPOTIFY_STATE_COOKIE);
    return response;
  };

  if (error || !code || !state || !storedState || state !== storedState) {
    return redirectToDashboard(
      "error",
      resolveCallbackFailureReason(error, code, state, storedState),
    );
  }

  try {
    await saveSpotifyConnection(session.user.sub, {
      email: session.user.email,
      name: session.user.name,
      picture: session.user.picture,
    }, code);

    return redirectToDashboard("connected");
  } catch (error) {
    console.error("Spotify callback failed:", getSpotifyErrorMessage(error));
    return redirectToDashboard(
      "error",
      resolveSpotifyConnectErrorReason(error),
    );
  }
}
