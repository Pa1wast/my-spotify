"use client";

import type { SpotifyApiMetricsSnapshot } from "@/shared/lib/spotify-api-metrics";

interface SpotifyApiMetricsDisplayProps {
  metrics: SpotifyApiMetricsSnapshot | undefined;
  isLoading?: boolean;
  compact?: boolean;
}

function formatRateLimitUntil(isoDate: string | null) {
  if (!isoDate) {
    return null;
  }

  const remainingMs = new Date(isoDate).getTime() - Date.now();

  if (remainingMs <= 0) {
    return null;
  }

  const seconds = Math.ceil(remainingMs / 1000);
  return `${seconds}s`;
}

export function SpotifyApiMetricsDisplay({
  metrics,
  isLoading = false,
  compact = false,
}: SpotifyApiMetricsDisplayProps) {
  if (isLoading && !metrics) {
    return (
      <p className="text-xs text-muted-foreground">Loading API usage…</p>
    );
  }

  if (!metrics) {
    return null;
  }

  const rateLimitCountdown = formatRateLimitUntil(metrics.rateLimitedUntil);

  if (compact) {
    return (
      <p className="text-xs text-muted-foreground">
        Spotify API: {metrics.requestsInWindow}/{metrics.estimatedLimit} requests
        (30s window)
        {rateLimitCountdown
          ? ` · rate limited, retry in ${rateLimitCountdown}`
          : ` · ~${metrics.estimatedRemaining} remaining`}
      </p>
    );
  }

  return (
    <div className="space-y-2 text-sm">
      <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
        <p>
          <span className="text-muted-foreground">Requests (30s window):</span>{" "}
          {metrics.requestsInWindow} / {metrics.estimatedLimit}
        </p>
        <p>
          <span className="text-muted-foreground">Estimated remaining:</span>{" "}
          {metrics.estimatedRemaining}
        </p>
        <p>
          <span className="text-muted-foreground">Total this session:</span>{" "}
          {metrics.totalRequests}
        </p>
        {metrics.lastRequestAt ? (
          <p>
            <span className="text-muted-foreground">Last request:</span>{" "}
            {new Date(metrics.lastRequestAt).toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
        ) : null}
      </div>
      {rateLimitCountdown ? (
        <p className="text-destructive">
          Rate limited — retry in {rateLimitCountdown}
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Spotify does not publish exact quotas. Remaining is estimated from a
        rolling 30-second window.
      </p>
    </div>
  );
}
