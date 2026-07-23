"use client";

import { useEffect } from "react";

interface SpotifyReconnectRedirectProps {
  forceConsent?: boolean;
}

export function SpotifyReconnectRedirect({
  forceConsent = false,
}: SpotifyReconnectRedirectProps) {
  useEffect(() => {
    const target = forceConsent
      ? "/api/spotify/login?consent=1"
      : "/api/spotify/login";

    window.location.replace(target);
  }, [forceConsent]);

  return (
    <p className="text-sm text-muted-foreground">Continuing to Spotify…</p>
  );
}
