"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  getSpotifyConnectErrorMessage,
  type SpotifyConnectErrorReason,
} from "@/shared/constants/spotify-connect-errors";

const AUTO_DISMISS_MS = 6000;

function parseSpotifyConnectReason(
  value: string | null,
): SpotifyConnectErrorReason {
  switch (value) {
    case "rate_limit":
    case "state":
    case "denied":
    case "refresh_token":
    case "redirect_uri":
      return value;
    default:
      return "generic";
  }
}

export function SpotifyFlashMessage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState<{
    text: string;
    tone: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const spotify = searchParams.get("spotify");

    if (spotify === "connected") {
      setMessage({
        text: "Spotify connected successfully.",
        tone: "success",
      });
    } else if (spotify === "error") {
      const reason = parseSpotifyConnectReason(
        searchParams.get("spotify_reason"),
      );
      setMessage({
        text: getSpotifyConnectErrorMessage(reason),
        tone: "error",
      });
    }

    if (!spotify) {
      return;
    }

    const timeRange = searchParams.get("time_range");
    const nextUrl = timeRange
      ? `/dashboard?time_range=${timeRange}`
      : "/dashboard";

    router.replace(nextUrl, { scroll: false });
  }, [router, searchParams]);

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = window.setTimeout(() => {
      setMessage(null);
    }, AUTO_DISMISS_MS);

    return () => window.clearTimeout(timer);
  }, [message]);

  if (!message) {
    return null;
  }

  return (
    <p
      className={`min-w-0 text-sm ${
        message.tone === "error" ? "text-destructive" : "text-muted-foreground"
      }`}
      role="status"
    >
      {message.text}
    </p>
  );
}
