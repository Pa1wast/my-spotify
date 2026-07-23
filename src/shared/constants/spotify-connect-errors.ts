export type SpotifyConnectErrorReason =
  | "rate_limit"
  | "state"
  | "denied"
  | "refresh_token"
  | "redirect_uri"
  | "generic";

export function getSpotifyConnectErrorMessage(
  reason: SpotifyConnectErrorReason,
): string {
  switch (reason) {
    case "rate_limit":
      return "Spotify rate limit reached. Wait a few minutes before reconnecting.";
    case "state":
      return "Spotify login session expired. Clear cookies for 127.0.0.1 and try again.";
    case "denied":
      return "Spotify authorization was cancelled.";
    case "refresh_token":
      return "Spotify did not return a refresh token. Remove this app in Spotify account settings, then reconnect.";
    case "redirect_uri":
      return "Spotify redirect URI mismatch. Confirm http://127.0.0.1:3000/api/spotify/callback is registered in the Spotify Developer Dashboard.";
    default:
      return "Spotify connection failed. Please try again in a few minutes.";
  }
}

export function resolveSpotifyConnectErrorReason(
  error: unknown,
): SpotifyConnectErrorReason {
  if (!(error instanceof Error)) {
    return "generic";
  }

  const message = error.message.toLowerCase();

  if (message.includes("rate limit")) {
    return "rate_limit";
  }

  if (message.includes("refresh token")) {
    return "refresh_token";
  }

  if (message.includes("redirect_uri") || message.includes("redirect uri")) {
    return "redirect_uri";
  }

  return "generic";
}
