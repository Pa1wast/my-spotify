export const SPOTIFY_ACCOUNTS_URL = "https://accounts.spotify.com";
export const SPOTIFY_API_URL = "https://api.spotify.com/v1";

export const SPOTIFY_SCOPES = [
  "user-read-email",
  "user-read-private",
  "user-top-read",
  "user-read-recently-played",
  "playlist-read-private",
  "user-library-read",
  "streaming",
  "user-read-playback-state",
  "user-modify-playback-state",
].join(" ");

export const SPOTIFY_STATE_COOKIE = "spotify_oauth_state";

export type SpotifyTimeRange = "short_term" | "medium_term" | "long_term";

export function getSpotifyConfig() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Missing Spotify configuration. Set SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, and SPOTIFY_REDIRECT_URI.",
    );
  }

  if (!redirectUri.endsWith("/api/spotify/callback")) {
    throw new Error(
      "SPOTIFY_REDIRECT_URI must point to /api/spotify/callback (e.g. http://localhost:3000/api/spotify/callback).",
    );
  }

  return { clientId, clientSecret, redirectUri };
}
