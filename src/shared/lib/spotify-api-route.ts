import { NextResponse } from "next/server";

import { spotifyApiMetrics } from "@/shared/lib/spotify-api-metrics";

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
