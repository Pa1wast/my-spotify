"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { triggerPlaySync } from "@/features/listening/services/sync.service";

export function useSpotifySync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: triggerPlaySync,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["recent-plays"] });
      void queryClient.invalidateQueries({ queryKey: ["saved-tracks"] });
      void queryClient.invalidateQueries({ queryKey: ["top-artists"] });
    },
  });
}
