import { apiClient } from "@/shared/services/axios";

export interface PlayerTokenResponse {
  accessToken: string;
}

export interface PlayTrackRequest {
  deviceId: string;
  uris?: string[];
  contextUri?: string;
  offset?: { position?: number; uri?: string };
  positionMs?: number;
}

export async function fetchPlayerToken() {
  const { data } = await apiClient.get<PlayerTokenResponse>("/spotify/player/token");
  return data.accessToken;
}

export async function startPlayback(request: PlayTrackRequest) {
  const { data } = await apiClient.put<{ ok: boolean }>(
    "/spotify/player/play",
    request,
  );
  return data;
}

export async function transferPlayback(deviceId: string, play = false) {
  const { data } = await apiClient.put<{ ok: boolean }>(
    "/spotify/player/transfer",
    { deviceId, play },
  );
  return data;
}
