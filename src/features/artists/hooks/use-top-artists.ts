"use client";

import { useQuery } from "@tanstack/react-query";

import type { SpotifyTimeRange } from "@/shared/constants/spotify";

import { fetchTopArtists } from "../services/artists.service";

export function useTopArtists(timeRange: SpotifyTimeRange) {
  return useQuery({
    queryKey: ["top-artists", timeRange],
    queryFn: () => fetchTopArtists(timeRange),
  });
}
