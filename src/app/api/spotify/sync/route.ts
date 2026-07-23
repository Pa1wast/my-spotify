import { NextRequest, NextResponse } from "next/server";

import { getRecentPlays } from "@/features/listening/services/play-events.service";
import {
  syncPlayHistoryForAllUsers,
  syncPlayHistoryForUser,
} from "@/features/listening/services/play-sync.service";
import { getUserByAuth0Sub } from "@/features/spotify/services/spotify-user.service";
import { auth0 } from "@/shared/lib/auth0";

function verifyCronSecret(request: NextRequest) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return false;
  }

  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const result = await syncPlayHistoryForAllUsers();
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const session = await auth0.getSession(request);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByAuth0Sub(session.user.sub);

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const result = await syncPlayHistoryForUser(user);
  return NextResponse.json(result);
}
