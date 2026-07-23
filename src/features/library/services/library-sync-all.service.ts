import { syncSpotifyLibraryForUser } from "@/features/library/services/library-sync.service";
import { prisma } from "@/shared/lib/prisma";

export async function syncSpotifyLibraryForAllUsers() {
  const users = await prisma.user.findMany({
    where: {
      spotifyRefreshToken: { not: null },
      spotifyUserId: { not: null },
    },
  });

  const results = await Promise.allSettled(
    users.map((user) => syncSpotifyLibraryForUser(user)),
  );

  const synced = results.filter(
    (result) => result.status === "fulfilled" && !result.value.skipped,
  ).length;

  return { users: users.length, synced };
}
