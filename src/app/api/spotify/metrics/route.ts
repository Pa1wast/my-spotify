import { NextResponse } from "next/server";

import { spotifyApiMetrics } from "@/shared/lib/spotify-api-metrics";

export async function GET() {
  return NextResponse.json(spotifyApiMetrics.getSnapshot());
}
