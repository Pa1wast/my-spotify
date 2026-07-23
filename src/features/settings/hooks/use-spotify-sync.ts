"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { triggerLibrarySync } from "@/features/listening/services/sync.service";

export function useSpotifySync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: triggerLibrarySync,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["spotify-api-metrics"] });
      void queryClient.invalidateQueries({ queryKey: ["spotify-connection"] });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["recent-plays"] });
      void queryClient.invalidateQueries({ queryKey: ["saved-tracks"] });
      void queryClient.invalidateQueries({ queryKey: ["top-artists"] });
      void queryClient.invalidateQueries({ queryKey: ["top-tracks"] });
      void queryClient.invalidateQueries({ queryKey: ["overview-top-tracks"] });
      void queryClient.invalidateQueries({ queryKey: ["overview-top-artists"] });
      void queryClient.invalidateQueries({ queryKey: ["overview-recently-played"] });
      void queryClient.invalidateQueries({ queryKey: ["overview-playlists"] });
    },
  });
}
