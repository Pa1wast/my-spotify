import { randomBytes } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { SPOTIFY_STATE_COOKIE } from "@/shared/constants/spotify";
import { buildSpotifyAuthorizeUrl } from "@/features/spotify/services/spotify.service";
import { auth0 } from "@/shared/lib/auth0";

export async function GET(request: NextRequest) {
  const session = await auth0.getSession(request);

  if (!session) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("returnTo", "/api/spotify/login");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const state = randomBytes(32).toString("hex");
    const authorizeUrl = buildSpotifyAuthorizeUrl(state);
    const response = NextResponse.redirect(authorizeUrl);

    response.cookies.set(SPOTIFY_STATE_COOKIE, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.redirect(new URL("/dashboard?spotify=error", request.url));
  }
}
