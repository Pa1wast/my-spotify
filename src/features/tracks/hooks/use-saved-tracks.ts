"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchSavedTracks } from "../services/tracks.service";

export function useSavedTracks(page: number, limit = 20) {
  return useQuery({
    queryKey: ["saved-tracks", page, limit],
    queryFn: () => fetchSavedTracks(page, limit),
  });
}
