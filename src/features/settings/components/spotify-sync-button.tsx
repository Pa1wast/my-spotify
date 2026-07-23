"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = window.setTimeout(() => setMessage(null), 6000);
    return () => window.clearTimeout(timer);
  }, [message]);

  function handleSync() {
    sync.mutate(undefined, {
      onSuccess: (result) => {
        router.refresh();

        if (result.skipped) {
          setMessage("Spotify is not connected. Reconnect to save your library.");
          return;
        }

        if (result.partial) {
          const needsReconnect = result.errors.some((error) =>
            error.toLowerCase().includes("reconnect"),
          );
          setMessage(
            `Saved partially (${result.cachesWritten} sections): ${result.savedTracks} liked tracks, ${result.playlists} playlists, ${result.playEventsInserted} new plays. ${result.errors[0] ?? "Some sections failed."}${needsReconnect ? " Use Reconnect Spotify, then save again." : " Wait a minute if rate limited, then save again."}`,
          );
          return;
        }

        setMessage(
          `Saved to database (${result.cachesWritten} sections): ${result.savedTracks} liked tracks, ${result.playlists} playlists, ${result.playEventsInserted} new plays.`,
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
          disabled={sync.isPending}
          className={settingsActionLinkClass}
        >
          {sync.isPending ? "Saving from Spotify…" : "Save from Spotify"}
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
