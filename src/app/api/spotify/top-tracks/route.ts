import { NextRequest, NextResponse } from "next/server";

import {
  getSpotifyTopTracksForUser,
  getUserByAuth0Sub,
} from "@/features/spotify/services/spotify-user.service";
import type { SpotifyTimeRange } from "@/shared/constants/spotify";
import { auth0 } from "@/shared/lib/auth0";
import { getSpotifyErrorMessage } from "@/shared/lib/spotify-http";

function parseTimeRange(value: string | null): SpotifyTimeRange {
  if (value === "medium_term" || value === "long_term") {
    return value;
  }
  return "short_term";
}

export async function GET(request: NextRequest) {
  const session = await auth0.getSession(request);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByAuth0Sub(session.user.sub);

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const timeRange = parseTimeRange(searchParams.get("time_range"));
  const limit = Math.min(
    Number.parseInt(searchParams.get("limit") ?? "50", 10) || 50,
    50,
  );

  try {
    const tracks = await getSpotifyTopTracksForUser(user, timeRange);

    if (!tracks) {
      return NextResponse.json(
        { message: "Spotify not connected" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      items: tracks.slice(0, limit).map((track, index) => ({
        rank: index + 1,
        id: track.id,
        name: track.name,
        album: track.album.name,
        albumImage: track.album.images?.[0]?.url ?? null,
        artists: track.artists.map((artist) => artist.name).join(", "),
        durationMs: track.duration_ms,
        spotifyUrl: track.external_urls?.spotify ?? null,
      })),
      timeRange,
    });
  } catch (error) {
    return NextResponse.json(
      { message: getSpotifyErrorMessage(error) },
      { status: 500 },
    );
  }
}
