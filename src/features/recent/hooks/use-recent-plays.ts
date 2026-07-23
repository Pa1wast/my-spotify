"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import {
  fetchRecentPlays,
  triggerPlaySync,
} from "../services/recent.service";

export function useRecentPlays(page: number, limit = 20) {
  return useQuery({
    queryKey: ["recent-plays", page, limit],
    queryFn: () => fetchRecentPlays(page, limit),
  });
}

export function usePlaySyncOnMount() {
  const queryClient = useQueryClient();
  const hasSynced = useRef(false);

  const mutation = useMutation({
    mutationFn: triggerPlaySync,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["recent-plays"] });
    },
  });

  useEffect(() => {
    if (hasSynced.current) {
      return;
    }

    hasSynced.current = true;
    mutation.mutate();
  }, [mutation]);

  return mutation;
}
