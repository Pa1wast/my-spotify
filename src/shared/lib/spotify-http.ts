import axios, { type AxiosError, type AxiosRequestConfig } from "axios";

const MAX_RETRIES = 3;

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

export async function spotifyRequest<T>(
  config: AxiosRequestConfig,
  attempt = 0,
): Promise<T> {
  try {
    const response = await axios.request<T>(config);
    return response.data;
  } catch (error) {
    if (!axios.isAxiosError(error)) {
      throw error;
    }

    const status = error.response?.status;

    if (status === 429 && attempt < MAX_RETRIES) {
      const retryAfterMs = getRetryAfterMs(error);
      const backoffMs = retryAfterMs ?? 2 ** attempt * 1000;
      await sleep(backoffMs);
      return spotifyRequest<T>(config, attempt + 1);
    }

    throw error;
  }
}

export function getSpotifyErrorMessage(error: unknown): string {
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
    return "Spotify rate limit reached. Please try again shortly.";
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
