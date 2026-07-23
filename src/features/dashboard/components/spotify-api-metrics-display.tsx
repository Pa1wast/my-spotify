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

  const windowSeconds = Math.round(metrics.windowMs / 1000);
  const rateLimitCountdown =
    remainingMs !== null ? formatCountdown(remainingMs) : null;

  if (compact) {
    return (
      <p className="text-xs text-muted-foreground">
        Spotify API: {metrics.requestsInWindow} requests in last {windowSeconds}
        s
        {rateLimitCountdown
          ? ` · Retry-After ${rateLimitCountdown}`
          : null}
      </p>
    );
  }

  return (
    <div className="space-y-2 text-sm">
      <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
        <p>
          <span className="text-muted-foreground">
            Requests (rolling {windowSeconds}s):
          </span>{" "}
          {metrics.requestsInWindow}
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
          App paused after Spotify HTTP 429 — wait {rateLimitCountdown}{" "}
          (Retry-After). A single docs/curl call can still work; Save used to
          fire many requests at once.
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Spotify rates apps over a rolling 30s window. Exact limits are not
        published. We only call Spotify again after Retry-After. Save now does a
        light sync (~5 calls), then fills extra time ranges if quota allows.
      </p>
    </div>
  );
}
