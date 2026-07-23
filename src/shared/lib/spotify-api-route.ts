import { NextResponse } from "next/server";

import { SpotifyNotConnectedError } from "@/features/library/services/library-hydrate.service";
import { spotifyApiMetrics } from "@/shared/lib/spotify-api-metrics";
import {
  getSpotifyErrorMessage,
  isSpotifyRateLimitError,
  isSpotifyScopeError,
} from "@/shared/lib/spotify-http";

export function spotifyJsonResponse<T extends Record<string, unknown>>(
  body: T,
  init?: ResponseInit,
) {
  return NextResponse.json(
    {
      ...body,
      metrics: spotifyApiMetrics.getSnapshot(),
    },
    init,
  );
}

export function spotifyRouteErrorResponse(error: unknown) {
  if (error instanceof SpotifyNotConnectedError) {
    return spotifyJsonResponse(
      { message: error.message, code: "NOT_CONNECTED" },
      { status: 403 },
    );
  }

  if (isSpotifyRateLimitError(error)) {
    return spotifyJsonResponse(
      { message: getSpotifyErrorMessage(error) },
      { status: 429 },
    );
  }

  if (isSpotifyScopeError(error)) {
    return spotifyJsonResponse(
      {
        message: `${getSpotifyErrorMessage(error)} Use Reconnect Spotify in Settings to grant permissions.`,
      },
      { status: 403 },
    );
  }

  return spotifyJsonResponse(
    { message: getSpotifyErrorMessage(error) },
    { status: 500 },
  );
}

export function parseRefreshParam(searchParams: URLSearchParams) {
  return searchParams.get("refresh") === "1";
}
