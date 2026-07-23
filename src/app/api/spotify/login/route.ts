import { randomBytes } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { SPOTIFY_STATE_COOKIE } from "@/shared/constants/spotify";
import { buildSpotifyAuthorizeUrl } from "@/features/spotify/services/spotify.service";
import { createAppUrl } from "@/shared/lib/app-url";
import { auth0 } from "@/shared/lib/auth0";

export async function GET(request: NextRequest) {
  const session = await auth0.getSession(request);

  if (!session) {
    const forceConsent = request.nextUrl.searchParams.get("consent") === "1";
    const returnTo = forceConsent
      ? "/dashboard?spotify=reconnect&consent=1"
      : "/dashboard?spotify=reconnect";
    const loginUrl = createAppUrl("/auth/login", request.nextUrl.origin);
    loginUrl.searchParams.set("returnTo", returnTo);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const state = randomBytes(32).toString("hex");
    const forceConsent = request.nextUrl.searchParams.get("consent") === "1";
    const authorizeUrl = buildSpotifyAuthorizeUrl(state, { forceConsent });
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
    return NextResponse.redirect(createAppUrl("/dashboard?spotify=error"));
  }
}
