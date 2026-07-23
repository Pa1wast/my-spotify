import type { User } from "@/generated/prisma/client";
import axios from "axios";

import {
  exchangeSpotifyCode,
  fetchSpotifyPlaylists,
  fetchSpotifyRecentlyPlayed,
  fetchSpotifySavedTracks,
  fetchSpotifyTopArtists,
  fetchSpotifyTopTracks,
  fetchSpotifyUserProfile,
  refreshSpotifyAccessToken,
} from "../services/spotify.service";

import type { SpotifyTimeRange } from "@/shared/constants/spotify";
import { prisma } from "@/shared/lib/prisma";
import { getSpotifyErrorMessage } from "@/shared/lib/spotify-http";

function isTokenExpired(expiresAt: Date | null | undefined) {
  if (!expiresAt) {
    return true;
  }

  return expiresAt.getTime() <= Date.now() + 60_000;
}

export async function getUserByAuth0Sub(auth0Sub: string) {
  return prisma.user.findUnique({
    where: { auth0Sub },
  });
}

export async function saveSpotifyConnection(
  auth0Sub: string,
  authProfile: {
    email?: string | null;
    name?: string | null;
    picture?: string | null;
  },
  code: string,
) {
  const tokenResponse = await exchangeSpotifyCode(code);
  const spotifyProfile = await fetchSpotifyUserProfile(tokenResponse.access_token);

  const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);
  const refreshToken = tokenResponse.refresh_token;

  if (!refreshToken) {
    throw new Error(
      "Spotify did not return a refresh token. Try connecting again.",
    );
  }

  return prisma.user.upsert({
    where: { auth0Sub },
    create: {
      auth0Sub,
      email: authProfile.email ?? spotifyProfile.email,
      name: authProfile.name,
      picture: authProfile.picture ?? spotifyProfile.images[0]?.url,
      spotifyUserId: spotifyProfile.id,
      spotifyAccessToken: tokenResponse.access_token,
      spotifyRefreshToken: refreshToken,
      spotifyTokenExpiresAt: expiresAt,
      spotifyDisplayName: spotifyProfile.display_name,
      spotifyProduct: spotifyProfile.product,
    },
    update: {
      email: authProfile.email ?? spotifyProfile.email,
      name: authProfile.name,
      picture: authProfile.picture ?? spotifyProfile.images[0]?.url,
      spotifyUserId: spotifyProfile.id,
      spotifyAccessToken: tokenResponse.access_token,
      spotifyRefreshToken: refreshToken,
      spotifyTokenExpiresAt: expiresAt,
      spotifyDisplayName: spotifyProfile.display_name,
      spotifyProduct: spotifyProfile.product,
    },
  });
}

export async function getValidSpotifyAccessToken(user: User) {
  if (!user.spotifyRefreshToken) {
    return null;
  }

  if (!isTokenExpired(user.spotifyTokenExpiresAt)) {
    return user.spotifyAccessToken;
  }

  try {
    const tokenResponse = await refreshSpotifyAccessToken(
      user.spotifyRefreshToken,
    );
    const expiresAt = new Date(Date.now() + tokenResponse.expires_in * 1000);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        spotifyAccessToken: tokenResponse.access_token,
        spotifyRefreshToken:
          tokenResponse.refresh_token ?? user.spotifyRefreshToken,
        spotifyTokenExpiresAt: expiresAt,
      },
    });

    return updatedUser.spotifyAccessToken;
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : null;

    if (status === 400 || status === 401) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          spotifyAccessToken: null,
          spotifyRefreshToken: null,
          spotifyTokenExpiresAt: null,
        },
      });
    }

    throw new Error(getSpotifyErrorMessage(error));
  }
}

async function withSpotifyAccessToken<T>(
  user: User,
  fetcher: (accessToken: string) => Promise<T>,
) {
  const accessToken = await getValidSpotifyAccessToken(user);

  if (!accessToken) {
    return null;
  }

  return fetcher(accessToken);
}

export async function getSpotifyTopTracksForUser(
  user: User,
  timeRange: SpotifyTimeRange = "short_term",
) {
  return withSpotifyAccessToken(user, (token) =>
    fetchSpotifyTopTracks(token, timeRange),
  );
}

export async function getSpotifyTopArtistsForUser(
  user: User,
  timeRange: SpotifyTimeRange = "short_term",
) {
  return withSpotifyAccessToken(user, (token) =>
    fetchSpotifyTopArtists(token, timeRange),
  );
}

export async function getSpotifyRecentlyPlayedForUser(user: User) {
  return withSpotifyAccessToken(user, (token) =>
    fetchSpotifyRecentlyPlayed(token),
  );
}

export async function getSpotifySavedTracksForUser(
  user: User,
  limit = 20,
  offset = 0,
) {
  return withSpotifyAccessToken(user, (token) =>
    fetchSpotifySavedTracks(token, limit, offset),
  );
}

export async function getSpotifyPlaylistsForUser(user: User) {
  return withSpotifyAccessToken(user, (token) => fetchSpotifyPlaylists(token));
}

export function isSpotifyConnected(user: User | null) {
  return Boolean(user?.spotifyRefreshToken && user.spotifyUserId);
}
