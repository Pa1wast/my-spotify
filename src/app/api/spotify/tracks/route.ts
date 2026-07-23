import { NextRequest, NextResponse } from "next/server";

import { getSpotifySavedTracksForUser, getUserByAuth0Sub } from "@/features/spotify/services/spotify-user.service";
import { auth0 } from "@/shared/lib/auth0";
import { getSpotifyErrorMessage } from "@/shared/lib/spotify-http";

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
  const limit = Math.min(
    Number.parseInt(searchParams.get("limit") ?? "20", 10) || 20,
    50,
  );
  const offset = Number.parseInt(searchParams.get("offset") ?? "0", 10) || 0;

  try {
    const data = await getSpotifySavedTracksForUser(user, limit, offset);

    if (!data) {
      return NextResponse.json(
        { message: "Spotify not connected" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      items: data.items.map((item) => ({
        id: item.track.id,
        name: item.track.name,
        album: item.track.album.name,
        albumImage: item.track.album.images?.[0]?.url ?? null,
        artists: item.track.artists.map((artist) => artist.name).join(", "),
        durationMs: item.track.duration_ms,
        addedAt: item.added_at,
        spotifyUrl: item.track.external_urls?.spotify ?? null,
      })),
      total: data.total,
      limit: data.limit,
      offset: data.offset,
    });
  } catch (error) {
    return NextResponse.json(
      { message: getSpotifyErrorMessage(error) },
      { status: 500 },
    );
  }
}
