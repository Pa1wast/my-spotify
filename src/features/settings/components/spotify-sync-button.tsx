"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useSpotifySync } from "@/features/settings/hooks/use-spotify-sync";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface SpotifySyncButtonProps {
  className?: string;
}

export function SpotifySyncButton({ className }: SpotifySyncButtonProps) {
  const router = useRouter();
  const sync = useSpotifySync();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = window.setTimeout(() => setMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [message]);

  function handleSync() {
    sync.mutate(undefined, {
      onSuccess: (result) => {
        router.refresh();

        if (result.skipped) {
          setMessage("Spotify is not connected. Reconnect to sync.");
          return;
        }

        if (result.inserted === 0) {
          setMessage("Already up to date.");
          return;
        }

        setMessage(
          `Synced ${result.inserted} new ${result.inserted === 1 ? "play" : "plays"}.`,
        );
      },
      onError: () => {
        setMessage("Sync failed. Try again or reconnect Spotify.");
      },
    });
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleSync}
        disabled={sync.isPending}
      >
        {sync.isPending ? "Syncing…" : "Sync now"}
      </Button>
      {message ? (
        <p className="text-xs text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
