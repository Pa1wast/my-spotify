import type { LibrarySyncSuccess } from "@/features/library/services/library-sync.service";
import type { SpotifyApiMetricsSnapshot } from "@/shared/lib/spotify-api-metrics";
import { apiClient } from "@/shared/services/axios";

export type LibrarySyncResult =
  | { skipped: true; reason: "not_connected" }
  | (LibrarySyncSuccess & { metrics?: SpotifyApiMetricsSnapshot });

export async function triggerLibrarySync() {
  const { data } = await apiClient.post<LibrarySyncResult>(
    "/spotify/sync",
    undefined,
    { timeout: 300_000 },
  );
  return data;
}
