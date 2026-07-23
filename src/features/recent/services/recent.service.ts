import { apiClient } from "@/shared/services/axios";

export { triggerPlaySync } from "@/features/listening/services/sync.service";

export interface RecentPlayRow {
  id: string;
  trackName: string;
  albumName: string | null;
  artistNames: string;
  playedAt: string;
  contextType: string | null;
  contextUri: string | null;
}

export interface RecentPlaysResponse {
  items: RecentPlayRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function fetchRecentPlays(page: number, limit = 20) {
  const { data } = await apiClient.get<RecentPlaysResponse>("/listening/recent", {
    params: { page, limit },
  });
  return data;
}
