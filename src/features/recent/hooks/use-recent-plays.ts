"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchRecentPlays } from "../services/recent.service";

export function useRecentPlays(page: number, limit = 20) {
  return useQuery({
    queryKey: ["recent-plays", page, limit],
    queryFn: () => fetchRecentPlays(page, limit),
  });
}
