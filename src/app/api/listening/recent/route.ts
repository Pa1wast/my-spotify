import { NextRequest, NextResponse } from "next/server";

import { getRecentPlays } from "@/features/listening/services/play-events.service";
import { getUserByAuth0Sub } from "@/features/spotify/services/spotify-user.service";
import { auth0 } from "@/shared/lib/auth0";

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
  const page = Number.parseInt(searchParams.get("page") ?? "1", 10) || 1;
  const limit = Math.min(
    Number.parseInt(searchParams.get("limit") ?? "20", 10) || 20,
    50,
  );

  const data = await getRecentPlays(user.id, { page, limit });

  return NextResponse.json({
    items: data.items.map((item) => ({
      id: item.id,
      trackName: item.trackName,
      albumName: item.albumName,
      artistNames: item.artistNames,
      playedAt: item.playedAt.toISOString(),
      contextType: item.contextType,
      contextUri: item.contextUri,
    })),
    total: data.total,
    page: data.page,
    limit: data.limit,
    totalPages: data.totalPages,
  });
}
