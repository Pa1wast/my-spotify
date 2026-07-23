import { prisma } from "@/shared/lib/prisma";

interface GetRecentPlaysOptions {
  page?: number;
  limit?: number;
}

export async function getRecentPlays(
  userId: string,
  { page = 1, limit = 20 }: GetRecentPlaysOptions = {},
) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.playEvent.findMany({
      where: { userId },
      orderBy: { playedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.playEvent.count({ where: { userId } }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function getPlayCountByTrack(
  userId: string,
  spotifyTrackId: string,
) {
  return prisma.playEvent.count({
    where: { userId, spotifyTrackId },
  });
}

export async function getUserSyncState(userId: string) {
  return prisma.userSyncState.findUnique({
    where: { userId },
  });
}
