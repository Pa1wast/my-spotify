"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { triggerLibrarySync } from "@/features/listening/services/sync.service";

export function useSpotifySync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: triggerLibrarySync,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["recent-plays"] });
      void queryClient.invalidateQueries({ queryKey: ["saved-tracks"] });
      void queryClient.invalidateQueries({ queryKey: ["top-artists"] });
      void queryClient.invalidateQueries({ queryKey: ["overview-top-tracks"] });
      void queryClient.invalidateQueries({ queryKey: ["overview-top-artists"] });
      void queryClient.invalidateQueries({ queryKey: ["overview-recently-played"] });
      void queryClient.invalidateQueries({ queryKey: ["overview-playlists"] });
      void queryClient.invalidateQueries({ queryKey: ["spotify-connection"] });
      void queryClient.invalidateQueries({ queryKey: ["spotify-api-metrics"] });
    },
  });
}
