import type { SpotifyApiMetricsSnapshot } from "@/shared/lib/spotify-api-metrics";
import { apiClient } from "@/shared/services/axios";

export type PlayHistorySyncResult =
  | {
      skipped: true;
      reason: "not_connected";
      syncedAt: string;
      metrics?: SpotifyApiMetricsSnapshot;
    }
  | {
      skipped: false;
      inserted: number;
      syncedAt: string;
      metrics?: SpotifyApiMetricsSnapshot;
    };

export async function triggerPlayHistorySync() {
  const { data } = await apiClient.post<PlayHistorySyncResult>(
    "/spotify/sync",
    undefined,
    { timeout: 60_000 },
  );
  return data;
}

/** @deprecated Use triggerPlayHistorySync */
export const triggerLibrarySync = triggerPlayHistorySync;

/** @deprecated Use PlayHistorySyncResult */
export type LibrarySyncResult = PlayHistorySyncResult;
