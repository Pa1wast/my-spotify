import {
  fetchSpotifyPlaylists,
  fetchSpotifySavedTracks,
  fetchSpotifyTopArtists,
  fetchSpotifyTopTracks,
} from "@/features/spotify/services/spotify.service";

import type {
  CachedPlaylistRow,
  CachedSavedTrackRow,
  CachedTopArtistRow,
  CachedTopTrackRow,
} from "./library-cache.service";

export function mapTopTrack(
  track: Awaited<ReturnType<typeof fetchSpotifyTopTracks>>[number],
): CachedTopTrackRow {
  return {
    id: track.id,
    name: track.name,
    album: track.album.name,
    albumImage: track.album.images?.[0]?.url ?? null,
    artists: track.artists.map((artist) => artist.name).join(", "),
    durationMs: track.duration_ms,
    spotifyUrl: track.external_urls?.spotify ?? null,
  };
}

export function mapTopArtist(
  artist: Awaited<ReturnType<typeof fetchSpotifyTopArtists>>[number],
): CachedTopArtistRow {
  return {
    id: artist.id,
    name: artist.name,
    image: artist.images?.[0]?.url ?? null,
    genres: artist.genres?.[0] ?? null,
    popularity: artist.popularity,
    spotifyUrl: artist.external_urls?.spotify ?? null,
  };
}

export function mapSavedTrackPage(
  page: Awaited<ReturnType<typeof fetchSpotifySavedTracks>>,
): { total: number; items: CachedSavedTrackRow[] } {
  const items: CachedSavedTrackRow[] = [];

  for (const item of page.items) {
    const track = item.track;
    if (!track?.id) {
      continue;
    }

    items.push({
      id: track.id,
      name: track.name,
      album: track.album.name,
      albumImage: track.album.images?.[0]?.url ?? null,
      artists: track.artists.map((artist) => artist.name).join(", "),
      durationMs: track.duration_ms,
      addedAt: item.added_at,
      spotifyUrl: track.external_urls?.spotify ?? null,
    });
  }

  return { total: page.total, items };
}

export function mapPlaylistPage(
  page: Awaited<ReturnType<typeof fetchSpotifyPlaylists>>,
): { total: number; items: CachedPlaylistRow[] } {
  const items: CachedPlaylistRow[] = page.items.map((playlist) => ({
    id: playlist.id,
    name: playlist.name,
    image: playlist.images?.[0]?.url ?? null,
    trackCount: playlist.tracks?.total ?? null,
    ownerName: playlist.owner?.display_name ?? null,
    spotifyUrl: playlist.external_urls?.spotify ?? null,
  }));

  return { total: page.total, items };
}
