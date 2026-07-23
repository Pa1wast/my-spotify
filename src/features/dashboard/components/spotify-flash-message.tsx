"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const AUTO_DISMISS_MS = 4000;

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
      setMessage({
        text: "Spotify connection failed. Check your redirect URI and try again.",
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

  const styles =
    message.tone === "success"
      ? "border-primary/30 bg-primary/10 text-primary"
      : "border-destructive/30 bg-destructive/10 text-destructive";

  return (
    <p
      className={`min-w-0 break-words rounded-lg border px-4 py-3 text-sm ${styles}`}
      role="status"
    >
      {message.text}
    </p>
  );
}
