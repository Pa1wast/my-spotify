import type { User } from "@/generated/prisma/client";

import {
  exchangeSpotifyCode,
  fetchSpotifyTopTracks,
  fetchSpotifyUserProfile,
  refreshSpotifyAccessToken,
} from "../services/spotify.service";

import { prisma } from "@/shared/lib/prisma";

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

  return prisma.user.upsert({
    where: { auth0Sub },
    create: {
      auth0Sub,
      email: authProfile.email ?? spotifyProfile.email,
      name: authProfile.name,
      picture: authProfile.picture ?? spotifyProfile.images[0]?.url,
      spotifyUserId: spotifyProfile.id,
      spotifyAccessToken: tokenResponse.access_token,
      spotifyRefreshToken: tokenResponse.refresh_token,
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
      spotifyRefreshToken: tokenResponse.refresh_token,
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

  const tokenResponse = await refreshSpotifyAccessToken(user.spotifyRefreshToken);
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
}

export async function getSpotifyTopTracksForUser(user: User) {
  const accessToken = await getValidSpotifyAccessToken(user);

  if (!accessToken) {
    return null;
  }

  return fetchSpotifyTopTracks(accessToken);
}

export function isSpotifyConnected(user: User | null) {
  return Boolean(user?.spotifyRefreshToken && user.spotifyUserId);
}
