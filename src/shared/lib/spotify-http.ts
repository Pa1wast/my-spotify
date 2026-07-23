import axios, { type AxiosError, type AxiosRequestConfig } from "axios";

import { spotifyApiMetrics } from "@/shared/lib/spotify-api-metrics";

const DEFAULT_MAX_RETRIES = 2;
const SPOTIFY_REQUEST_TIMEOUT_MS = 15_000;
const MAX_RETRY_AFTER_MS = 30_000;

export type SpotifyRequestOptions = {
  attempt?: number;
  maxRetries?: number;
};

export class SpotifyRateLimitError extends Error {
  constructor(message = "Spotify rate limit reached. Please try again shortly.") {
    super(message);
    this.name = "SpotifyRateLimitError";
  }
}

function getRetryAfterMs(error: AxiosError): number | null {
  const retryAfter = error.response?.headers["retry-after"];

  if (!retryAfter) {
    return null;
  }

  const seconds = Number(retryAfter);

  if (!Number.isNaN(seconds)) {
    return seconds * 1000;
  }

  const dateMs = Date.parse(String(retryAfter));

  if (!Number.isNaN(dateMs)) {
    return Math.max(0, dateMs - Date.now());
  }

  return null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isSpotifyRateLimitError(error: unknown) {
  if (error instanceof SpotifyRateLimitError) {
    return true;
  }

  return axios.isAxiosError(error) && error.response?.status === 429;
}

export async function spotifyRequest<T>(
  config: AxiosRequestConfig,
  options: SpotifyRequestOptions = {},
): Promise<T> {
  const attempt = options.attempt ?? 0;
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;

  try {
    spotifyApiMetrics.recordRequest();
    const response = await axios.request<T>({
      timeout: SPOTIFY_REQUEST_TIMEOUT_MS,
      ...config,
    });
    return response.data;
  } catch (error) {
    if (!axios.isAxiosError(error)) {
      throw error;
    }

    if (error.code === "ECONNABORTED") {
      throw new Error("Spotify request timed out. Please try again.");
    }

    const status = error.response?.status;

    if (status === 429) {
      const retryAfterMs = getRetryAfterMs(error);
      const backoffMs = Math.min(
        retryAfterMs ?? 2 ** attempt * 1000,
        MAX_RETRY_AFTER_MS,
      );
      spotifyApiMetrics.recordRateLimit(backoffMs);

      if (attempt < maxRetries) {
        await sleep(backoffMs);
        return spotifyRequest<T>(config, {
          ...options,
          attempt: attempt + 1,
        });
      }

      throw new SpotifyRateLimitError();
    }

    throw error;
  }
}

export function getSpotifyErrorMessage(error: unknown): string {
  if (error instanceof SpotifyRateLimitError) {
    return error.message;
  }

  if (error instanceof Error && !axios.isAxiosError(error)) {
    return error.message;
  }

  if (!axios.isAxiosError(error)) {
    return "An unexpected error occurred while contacting Spotify.";
  }

  const data = error.response?.data as
    | { error?: { message?: string }; error_description?: string }
    | undefined;

  if (data?.error?.message) {
    return data.error.message;
  }

  if (data?.error_description) {
    return data.error_description;
  }

  if (error.response?.status === 401) {
    return "Spotify authorization expired. Please connect Spotify again.";
  }

  if (error.response?.status === 403) {
    const message = data?.error?.message ?? data?.error_description ?? "";

    if (message.toLowerCase().includes("insufficient client scope")) {
      return "Spotify needs updated permissions. Reconnect to grant access to recently played and playlists.";
    }

    return "Spotify denied access. Check app permissions and user allow-list.";
  }

  if (error.response?.status === 429) {
    return "Spotify rate limit reached. Wait a minute, then try Save from Spotify again.";
  }

  return "Spotify request failed. Please try again.";
}

export function isSpotifyScopeError(error: unknown) {
  const message = getSpotifyErrorMessage(error).toLowerCase();
  return (
    message.includes("insufficient client scope") ||
    message.includes("updated permissions")
  );
}

export const SPOTIFY_SYNC_REQUEST_OPTIONS: SpotifyRequestOptions = {
  maxRetries: 1,
};
