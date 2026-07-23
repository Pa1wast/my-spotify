import axios, { type AxiosError, type AxiosRequestConfig } from "axios";

import { spotifyApiMetrics } from "@/shared/lib/spotify-api-metrics";

/**
 * Spotify rate limits (docs):
 * https://developer.spotify.com/documentation/web-api/concepts/rate-limits
 *
 * - App-wide limit uses a rolling 30s request window (exact quota unpublished).
 * - On HTTP 429, wait for `Retry-After` (seconds) before calling again.
 */
const DEFAULT_MAX_RETRIES = 2;
const SPOTIFY_REQUEST_TIMEOUT_MS = 15_000;
/** Max time we'll sleep inside a single request before surfacing 429 to the caller. */
const MAX_IN_REQUEST_WAIT_MS = 10_000;
/**
 * Fallback when Spotify omits Retry-After — one full rate-limit window.
 * Docs: develop a backoff-retry strategy when rate limited.
 */
const DEFAULT_RETRY_AFTER_MS = 30_000;
/** Guard against malformed Retry-After values (not a Spotify-published max). */
const MAX_RETRY_AFTER_MS = 24 * 60 * 60_000;

export type SpotifyRequestOptions = {
  attempt?: number;
  maxRetries?: number;
};

export class SpotifyRateLimitError extends Error {
  readonly retryAfterMs: number;

  constructor(
    retryAfterMs: number,
    message = formatRateLimitMessage(retryAfterMs),
  ) {
    super(message);
    this.name = "SpotifyRateLimitError";
    this.retryAfterMs = retryAfterMs;
  }
}

export function formatRateLimitMessage(retryAfterMs: number) {
  const seconds = Math.max(1, Math.ceil(retryAfterMs / 1000));

  if (seconds < 60) {
    return `Spotify rate limit (HTTP 429). Wait ${seconds}s per Retry-After, then try once.`;
  }

  const minutes = Math.floor(seconds / 60);
  const remSeconds = seconds % 60;
  if (remSeconds === 0) {
    return `Spotify rate limit (HTTP 429). Wait ${minutes} min per Retry-After, then try once.`;
  }

  return `Spotify rate limit (HTTP 429). Wait ${minutes}m ${remSeconds}s per Retry-After, then try once.`;
}

function getHeaderValue(
  headers: AxiosError["response"] extends infer R
    ? R extends { headers: infer H }
      ? H | undefined
      : unknown
    : unknown,
  name: string,
): string | null {
  if (!headers || typeof headers !== "object") {
    return null;
  }

  const record = headers as Record<string, unknown>;
  const direct = record[name] ?? record[name.toLowerCase()];

  if (typeof direct === "string" || typeof direct === "number") {
    return String(direct);
  }

  if (Array.isArray(direct) && direct[0] != null) {
    return String(direct[0]);
  }

  const match = Object.entries(record).find(
    ([key]) => key.toLowerCase() === name.toLowerCase(),
  );

  if (!match) {
    return null;
  }

  const value = match[1];
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value) && value[0] != null) {
    return String(value[0]);
  }

  return null;
}

/** Parse Spotify's Retry-After header (seconds, or HTTP-date). */
export function getRetryAfterMs(error: AxiosError): number | null {
  const retryAfter = getHeaderValue(error.response?.headers, "retry-after");

  if (!retryAfter) {
    return null;
  }

  const seconds = Number(retryAfter);

  if (!Number.isNaN(seconds)) {
    return Math.max(0, seconds * 1000);
  }

  const dateMs = Date.parse(retryAfter);

  if (!Number.isNaN(dateMs)) {
    return Math.max(0, dateMs - Date.now());
  }

  return null;
}

/**
 * Resolve how long to wait after a 429.
 * Prefer Spotify's Retry-After exactly; otherwise exponential backoff.
 */
export function resolveRetryAfterMs(
  retryAfterMs: number | null,
  attempt = 0,
): number {
  if (retryAfterMs !== null && Number.isFinite(retryAfterMs)) {
    return Math.min(MAX_RETRY_AFTER_MS, Math.max(0, retryAfterMs));
  }

  return Math.min(
    MAX_RETRY_AFTER_MS,
    Math.max(DEFAULT_RETRY_AFTER_MS, 2 ** attempt * 1000),
  );
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

  const blockedMs = spotifyApiMetrics.getRateLimitRemainingMs();
  if (blockedMs !== null) {
    throw new SpotifyRateLimitError(blockedMs);
  }

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
      const headerMs = getRetryAfterMs(error);
      const cooldownMs = resolveRetryAfterMs(headerMs, attempt);
      spotifyApiMetrics.recordRateLimit(cooldownMs);

      const canRetryInRequest =
        attempt < maxRetries &&
        (headerMs === null || headerMs <= MAX_IN_REQUEST_WAIT_MS);

      if (canRetryInRequest) {
        const waitMs = Math.min(
          headerMs ?? 2 ** attempt * 1000,
          MAX_IN_REQUEST_WAIT_MS,
        );
        await sleep(waitMs);
        return spotifyRequest<T>(config, {
          ...options,
          attempt: attempt + 1,
        });
      }

      throw new SpotifyRateLimitError(cooldownMs);
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
    return formatRateLimitMessage(
      resolveRetryAfterMs(getRetryAfterMs(error), 0),
    );
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

/** Sync should stop on first 429 — don't hang the Save request sleeping. */
export const SPOTIFY_SYNC_REQUEST_OPTIONS: SpotifyRequestOptions = {
  maxRetries: 0,
};
