import { apiClient } from "@/shared/services/axios";

export interface PlaySyncResult {
  inserted: number;
  skipped: boolean;
  reason?: "not_connected";
}

export async function triggerPlaySync() {
  const { data } = await apiClient.post<PlaySyncResult>("/spotify/sync");
  return data;
}
