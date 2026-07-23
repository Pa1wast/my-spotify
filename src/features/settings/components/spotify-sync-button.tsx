"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useSpotifyApiMetrics } from "@/features/dashboard/hooks/use-dashboard-overview";
import { useSpotifySync } from "@/features/settings/hooks/use-spotify-sync";
import { settingsActionLinkClass } from "@/shared/constants/settings-links";
import { getApiErrorMessage } from "@/shared/services/axios";
import { cn } from "@/shared/lib/utils";

interface SpotifySyncButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function SpotifySyncButton({
  className,
  children,
}: SpotifySyncButtonProps) {
  const router = useRouter();
  const sync = useSpotifySync();
  const metrics = useSpotifyApiMetrics();
  const [message, setMessage] = useState<string | null>(null);
  const rateLimited =
    Boolean(metrics.data?.rateLimitedUntil) &&
    new Date(metrics.data!.rateLimitedUntil!).getTime() > Date.now();

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = window.setTimeout(
      () => setMessage(null),
      message.toLowerCase().includes("rate limit") ? 20_000 : 8_000,
    );
    return () => window.clearTimeout(timer);
  }, [message]);

  function handleSync() {
    if (rateLimited) {
      setMessage(
        "Still cooling down from Spotify’s rate limit. Wait for the countdown, then try once.",
      );
      return;
    }

    sync.mutate(undefined, {
      onSuccess: (result) => {
        router.refresh();

        if (result.skipped) {
          setMessage("Spotify is not connected. Reconnect to sync listening history.");
          return;
        }

        setMessage(
          result.inserted > 0
            ? `Synced ${result.inserted} new play${result.inserted === 1 ? "" : "s"} from Spotify.`
            : "Listening history is up to date — no new plays to import.",
        );
      },
      onError: (error) => {
        setMessage(getApiErrorMessage(error));
      },
    });
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <button
          type="button"
          onClick={handleSync}
          disabled={sync.isPending || rateLimited}
          className={settingsActionLinkClass}
        >
          {sync.isPending
            ? "Syncing listening history…"
            : rateLimited
              ? "Waiting on rate limit…"
              : "Sync listening history"}
        </button>
        {children}
      </div>
      {message ? (
        <p className="text-xs text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
