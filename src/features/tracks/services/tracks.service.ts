import { apiClient } from "@/shared/services/axios";

export interface SavedTrackDto {
  id: string;
  name: string;
  album: string;
  albumImage: string | null;
  artists: string;
  durationMs: number;
  addedAt: string;
  spotifyUrl: string | null;
}

export interface SavedTracksResponse {
  items: SavedTrackDto[];
  total: number;
  limit: number;
  offset: number;
}

export async function fetchSavedTracks(page: number, limit = 20) {
  const offset = (page - 1) * limit;
  const { data } = await apiClient.get<SavedTracksResponse>("/spotify/tracks", {
    params: { limit, offset },
  });
  return {
    ...data,
    page,
    totalPages: Math.ceil(data.total / limit) || 1,
  };
}
