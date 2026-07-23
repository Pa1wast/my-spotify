export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyExternalUrls {
  spotify: string;
}

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
  images: SpotifyImage[];
  external_urls: SpotifyExternalUrls;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: SpotifyImage[];
  genres: string[];
  popularity: number;
  external_urls: SpotifyExternalUrls;
}

export interface SpotifyTopTrack {
  id: string;
  name: string;
  duration_ms: number;
  album: {
    name: string;
    images: SpotifyImage[];
  };
  artists: Array<{ name: string }>;
  external_urls: SpotifyExternalUrls;
}

export interface SpotifyTopTracksResponse {
  items: SpotifyTopTrack[];
}

export interface SpotifyTopArtistsResponse {
  items: SpotifyArtist[];
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  images: SpotifyImage[];
  tracks: {
    total: number;
  };
  owner: {
    display_name: string | null;
  };
  external_urls: SpotifyExternalUrls;
}

export interface SpotifyPlaylistsResponse {
  items: SpotifyPlaylist[];
  total: number;
}

export interface SpotifyRecentlyPlayedItem {
  played_at: string;
  track: SpotifyTopTrack;
}

export interface SpotifyRecentlyPlayedResponse {
  items: SpotifyRecentlyPlayedItem[];
}
