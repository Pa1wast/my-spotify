"use client";

import { SpotifyApiMetricsDisplay } from "@/features/dashboard/components/spotify-api-metrics-display";
import { useSpotifyApiMetrics } from "@/features/dashboard/hooks/use-dashboard-overview";

export function SpotifyApiMetricsPanel() {
  const metrics = useSpotifyApiMetrics();

  return (
    <SpotifyApiMetricsDisplay
      metrics={metrics.data}
      isLoading={metrics.isLoading}
    />
  );
}
