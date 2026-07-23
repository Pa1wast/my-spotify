import type { SpotifyTimeRange } from "@/shared/constants/spotify";
import { apiClient } from "@/shared/services/axios";

export interface TopArtistRow {
  rank: number;
  id: string;
  name: string;
  image: string | null;
  genres: string | null;
  popularity: number;
  spotifyUrl: string | null;
}

export interface TopArtistsResponse {
  items: TopArtistRow[];
  timeRange: SpotifyTimeRange;
}

export async function fetchTopArtists(timeRange: SpotifyTimeRange) {
  const { data } = await apiClient.get<TopArtistsResponse>(
    "/spotify/top-artists",
    { params: { time_range: timeRange, limit: 50 } },
  );
  return data;
}
