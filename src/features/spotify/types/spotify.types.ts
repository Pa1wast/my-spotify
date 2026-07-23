export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
}

export interface SpotifyUserProfile {
  id: string;
  display_name: string | null;
  email: string | null;
  product: string | null;
  images: Array<{ url: string; height: number | null; width: number | null }>;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyTopTrack {
  id: string;
  name: string;
  duration_ms: number;
  album: {
    name: string;
    images: Array<{ url: string; height: number | null; width: number | null }>;
  };
  artists: Array<{ name: string }>;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyTopTracksResponse {
  items: SpotifyTopTrack[];
}
