import {
  SPOTIFY_ACCOUNTS_URL,
  SPOTIFY_API_URL,
  SPOTIFY_SCOPES,
  getSpotifyConfig,
  type SpotifyTimeRange,
} from "@/shared/constants/spotify";
import { spotifyRequest, type SpotifyRequestOptions } from "@/shared/lib/spotify-http";

import type {
  SpotifyPlaylistsResponse,
  SpotifyPlaylist,
  SpotifyRecentlyPlayedResponse,
  SpotifySavedTracksResponse,
  SpotifyTokenResponse,
  SpotifyTopArtistsResponse,
  SpotifyTopTracksResponse,
  SpotifyUserProfile,
} from "../types/spotify.types";

function getBasicAuthHeader(clientId: string, clientSecret: string) {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  return `Basic ${credentials}`;
}

export function buildSpotifyAuthorizeUrl(
  state: string,
  { forceConsent = false }: { forceConsent?: boolean } = {},
) {
  const { clientId, redirectUri } = getSpotifyConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: SPOTIFY_SCOPES,
    state,
    access_type: "offline",
  });

  if (forceConsent) {
    params.set("prompt", "consent");
  }

  return `${SPOTIFY_ACCOUNTS_URL}/authorize?${params.toString()}`;
}

export async function exchangeSpotifyCode(code: string) {
  const { clientId, clientSecret, redirectUri } = getSpotifyConfig();

  return spotifyRequest<SpotifyTokenResponse>({
    method: "POST",
    url: `${SPOTIFY_ACCOUNTS_URL}/api/token`,
    data: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
    headers: {
      Authorization: getBasicAuthHeader(clientId, clientSecret),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}

export async function refreshSpotifyAccessToken(refreshToken: string) {
  const { clientId, clientSecret } = getSpotifyConfig();

  return spotifyRequest<SpotifyTokenResponse>({
    method: "POST",
    url: `${SPOTIFY_ACCOUNTS_URL}/api/token`,
    data: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    headers: {
      Authorization: getBasicAuthHeader(clientId, clientSecret),
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}

export async function fetchSpotifyUserProfile(accessToken: string) {
  return spotifyRequest<SpotifyUserProfile>({
    method: "GET",
    url: `${SPOTIFY_API_URL}/me`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function fetchSpotifyTopTracks(
  accessToken: string,
  timeRange: SpotifyTimeRange = "short_term",
  limit = 10,
  requestOptions?: SpotifyRequestOptions,
) {
  const response = await spotifyRequest<SpotifyTopTracksResponse>(
    {
      method: "GET",
      url: `${SPOTIFY_API_URL}/me/top/tracks`,
      params: {
        limit,
        time_range: timeRange,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    requestOptions,
  );

  return response.items;
}

export async function fetchSpotifyTopArtists(
  accessToken: string,
  timeRange: SpotifyTimeRange = "short_term",
  limit = 10,
  requestOptions?: SpotifyRequestOptions,
) {
  const response = await spotifyRequest<SpotifyTopArtistsResponse>(
    {
      method: "GET",
      url: `${SPOTIFY_API_URL}/me/top/artists`,
      params: {
        limit,
        time_range: timeRange,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    requestOptions,
  );

  return response.items;
}

export async function fetchSpotifyRecentlyPlayed(
  accessToken: string,
  limit = 10,
) {
  const response = await fetchSpotifyRecentlyPlayedWithCursor(
    accessToken,
    limit,
  );

  return response.items;
}

export async function fetchSpotifyRecentlyPlayedWithCursor(
  accessToken: string,
  limit = 50,
  after?: string,
  requestOptions?: SpotifyRequestOptions,
) {
  return spotifyRequest<SpotifyRecentlyPlayedResponse>(
    {
      method: "GET",
      url: `${SPOTIFY_API_URL}/me/player/recently-played`,
      params: {
        limit,
        ...(after ? { after } : {}),
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    requestOptions,
  );
}

export async function fetchSpotifySavedTracks(
  accessToken: string,
  limit = 20,
  offset = 0,
  requestOptions?: SpotifyRequestOptions,
) {
  return spotifyRequest<SpotifySavedTracksResponse>(
    {
      method: "GET",
      url: `${SPOTIFY_API_URL}/me/tracks`,
      params: { limit, offset },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    requestOptions,
  );
}

export async function fetchSpotifyPlaylists(
  accessToken: string,
  limit = 50,
  offset = 0,
  requestOptions?: SpotifyRequestOptions,
) {
  const response = await spotifyRequest<SpotifyPlaylistsResponse>(
    {
      method: "GET",
      url: `${SPOTIFY_API_URL}/me/playlists`,
      params: { limit, offset },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    requestOptions,
  );

  return {
    ...response,
    items: response.items.filter(
      (playlist): playlist is SpotifyPlaylist =>
        playlist != null && typeof playlist.id === "string",
    ),
  };
}

export interface StartPlaybackBody {
  uris?: string[];
  context_uri?: string;
  offset?: { position?: number; uri?: string };
  position_ms?: number;
}

export async function startSpotifyPlayback(
  accessToken: string,
  deviceId: string,
  body: StartPlaybackBody,
) {
  return spotifyRequest<void>({
    method: "PUT",
    url: `${SPOTIFY_API_URL}/me/player/play`,
    params: { device_id: deviceId },
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    data: body,
  });
}

export async function transferSpotifyPlayback(
  accessToken: string,
  deviceId: string,
  play = false,
) {
  return spotifyRequest<void>({
    method: "PUT",
    url: `${SPOTIFY_API_URL}/me/player`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    data: {
      device_ids: [deviceId],
      play,
    },
  });
}
