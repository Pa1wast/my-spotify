"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchOverviewPlaylists,
  fetchOverviewRecentlyPlayed,
  fetchOverviewTopArtists,
  fetchOverviewTopTracks,
  fetchSpotifyApiMetrics,
  fetchSpotifyConnection,
  type SpotifyApiMetricsSnapshot,
} from "@/features/dashboard/services/dashboard.service";
import type { SpotifyTimeRange } from "@/shared/constants/spotify";
import { getApiErrorMessage } from "@/shared/services/axios";

const STALE_TIME_MS = 60_000;

function updateMetricsCache(
  queryClient: ReturnType<typeof useQueryClient>,
  metrics: SpotifyApiMetricsSnapshot,
) {
  queryClient.setQueryData(["spotify-api-metrics"], metrics);
}

export function useSpotifyConnection() {
  return useQuery({
    queryKey: ["spotify-connection"],
    queryFn: fetchSpotifyConnection,
    staleTime: STALE_TIME_MS,
  });
}

export function useSpotifyApiMetrics() {
  return useQuery({
    queryKey: ["spotify-api-metrics"],
    queryFn: fetchSpotifyApiMetrics,
    refetchInterval: (query) =>
      query.state.data?.rateLimitedUntil ? 1_000 : 30_000,
  });
}

export function useOverviewTopTracks(
  timeRange: SpotifyTimeRange,
  enabled: boolean,
) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["overview-top-tracks", timeRange],
    queryFn: async () => {
      const result = await fetchOverviewTopTracks(timeRange);
      updateMetricsCache(queryClient, result.metrics);
      return result.items;
    },
    enabled,
    staleTime: STALE_TIME_MS,
  });
}

export function useOverviewTopArtists(
  timeRange: SpotifyTimeRange,
  enabled: boolean,
) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["overview-top-artists", timeRange],
    queryFn: async () => {
      const result = await fetchOverviewTopArtists(timeRange);
      updateMetricsCache(queryClient, result.metrics);
      return result.items;
    },
    enabled,
    staleTime: STALE_TIME_MS,
  });
}

export function useOverviewRecentlyPlayed(enabled: boolean) {
  return useQuery({
    queryKey: ["overview-recently-played"],
    queryFn: async () => {
      const result = await fetchOverviewRecentlyPlayed();
      return result.items;
    },
    enabled,
    staleTime: STALE_TIME_MS,
  });
}

export function useOverviewPlaylists(enabled: boolean) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["overview-playlists"],
    queryFn: async () => {
      const result = await fetchOverviewPlaylists();
      updateMetricsCache(queryClient, result.metrics);
      return result;
    },
    enabled,
    staleTime: STALE_TIME_MS,
  });
}

export function getQueryErrorMessage(error: unknown) {
  return getApiErrorMessage(error);
}
