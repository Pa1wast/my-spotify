import { NextRequest, NextResponse } from "next/server";

import { saveSpotifyConnection } from "@/features/spotify/services/spotify-user.service";
import { SPOTIFY_STATE_COOKIE } from "@/shared/constants/spotify";
import { auth0 } from "@/shared/lib/auth0";
import { getSpotifyErrorMessage } from "@/shared/lib/spotify-http";

export async function GET(request: NextRequest) {
  const session = await auth0.getSession(request);

  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const { searchParams } = new URL(request.url);
  const error = searchParams.get("error");
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = request.cookies.get(SPOTIFY_STATE_COOKIE)?.value;

  const redirectToDashboard = (status: "connected" | "error") => {
    const response = NextResponse.redirect(
      new URL(`/dashboard?spotify=${status}`, request.url),
    );
    response.cookies.delete(SPOTIFY_STATE_COOKIE);
    return response;
  };

  if (error || !code || !state || !storedState || state !== storedState) {
    return redirectToDashboard("error");
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
    return redirectToDashboard("error");
  }
}
