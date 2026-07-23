"use client";

import { useEffect, useState } from "react";

import type { SpotifyApiMetricsSnapshot } from "@/shared/lib/spotify-api-metrics";

interface SpotifyApiMetricsDisplayProps {
  metrics: SpotifyApiMetricsSnapshot | undefined;
  isLoading?: boolean;
  compact?: boolean;
}

function formatCountdown(remainingMs: number) {
  const totalSeconds = Math.max(1, Math.ceil(remainingMs / 1000));

  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

function useLiveCountdown(rateLimitedUntil: string | null) {
  const [remainingMs, setRemainingMs] = useState<number | null>(() => {
    if (!rateLimitedUntil) {
      return null;
    }

    return Math.max(0, new Date(rateLimitedUntil).getTime() - Date.now());
  });

  useEffect(() => {
    if (!rateLimitedUntil) {
      setRemainingMs(null);
      return;
    }

    function tick() {
      const next = Math.max(
        0,
        new Date(rateLimitedUntil!).getTime() - Date.now(),
      );
      setRemainingMs(next > 0 ? next : null);
    }

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [rateLimitedUntil]);

  return remainingMs;
}

export function SpotifyApiMetricsDisplay({
  metrics,
  isLoading = false,
  compact = false,
}: SpotifyApiMetricsDisplayProps) {
  const remainingMs = useLiveCountdown(metrics?.rateLimitedUntil ?? null);

  if (isLoading && !metrics) {
    return (
      <p className="text-xs text-muted-foreground">Loading API usage…</p>
    );
  }

  if (!metrics) {
    return null;
  }

  const rateLimitCountdown =
    remainingMs !== null ? formatCountdown(remainingMs) : null;

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
          Rate limited — wait {rateLimitCountdown}, then Save once. Do not
          spam Save; that resets Spotify’s limit.
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Spotify does not publish exact quotas. The 30s counter is only an
        estimate — a real 429 uses Spotify’s Retry-After cooldown (at least 1
        minute).
      </p>
    </div>
  );
}
