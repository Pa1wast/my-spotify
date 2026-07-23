import Link from "next/link";
import { Suspense } from "react";

import { ConnectSpotifyCard } from "../components/connect-spotify-card";
import { PlaylistsPreviewCard } from "../components/playlists-preview-card";
import { RecentlyPlayedCard } from "../components/recently-played-card";
import { SpotifyFlashMessage } from "../components/spotify-flash-message";
import { SpotifyReconnectBanner } from "../components/spotify-reconnect-banner";
import { TimeRangeTabs } from "../components/time-range-tabs";
import { TopArtistsCard } from "../components/top-artists-card";
import { TopTracksCard } from "../components/top-tracks-card";

import {
  getSpotifyPlaylistsForUser,
  getSpotifyRecentlyPlayedForUser,
  getSpotifyTopArtistsForUser,
  getSpotifyTopTracksForUser,
  getUserByAuth0Sub,
  isSpotifyConnected,
} from "@/features/spotify/services/spotify-user.service";
import type { SpotifyTimeRange } from "@/shared/constants/spotify";
import { PageHeader } from "@/shared/components/page-header";
import { auth0 } from "@/shared/lib/auth0";
import {
  getSpotifyErrorMessage,
  isSpotifyScopeError,
} from "@/shared/lib/spotify-http";

interface DashboardPageProps {
  timeRange?: string;
}

function parseTimeRange(value: string | undefined): SpotifyTimeRange {
  if (value === "medium_term" || value === "long_term") {
    return value;
  }

  return "short_term";
}

function getScopeReconnectMessage(scopeFailedPanels: string[], hasPartialData: boolean) {
  const panelList = scopeFailedPanels.join(" and ");

  if (hasPartialData) {
    return `${panelList} need updated Spotify permissions. Reconnect to unlock them — your other data will keep working.`;
  }

  return "Spotify needs updated permissions. Reconnect to grant access to your listening data.";
}

export async function DashboardPage({ timeRange }: DashboardPageProps) {
  const session = await auth0.getSession();

  if (!session) {
    return null;
  }

  const user = await getUserByAuth0Sub(session.user.sub);
  const connected = isSpotifyConnected(user);
  const activeRange = parseTimeRange(timeRange);

  let topTracks: Awaited<ReturnType<typeof getSpotifyTopTracksForUser>> = null;
  let topArtists: Awaited<ReturnType<typeof getSpotifyTopArtistsForUser>> = null;
  let recentlyPlayed: Awaited<
    ReturnType<typeof getSpotifyRecentlyPlayedForUser>
  > = null;
  let playlists: Awaited<ReturnType<typeof getSpotifyPlaylistsForUser>> = null;
  let scopeReconnectMessage: string | null = null;
  let generalError: string | null = null;
  let recentPanelMessage = "No recent plays returned yet.";
  let playlistsPanelMessage = "No playlists found on your account.";

  if (connected && user) {
    const [tracksResult, artistsResult, recentResult, playlistsResult] =
      await Promise.allSettled([
        getSpotifyTopTracksForUser(user, activeRange),
        getSpotifyTopArtistsForUser(user, activeRange),
        getSpotifyRecentlyPlayedForUser(user),
        getSpotifyPlaylistsForUser(user),
      ]);

    if (tracksResult.status === "fulfilled") {
      topTracks = tracksResult.value;
    }

    if (artistsResult.status === "fulfilled") {
      topArtists = artistsResult.value;
    }

    if (recentResult.status === "fulfilled") {
      recentlyPlayed = recentResult.value;
    }

    if (playlistsResult.status === "fulfilled") {
      playlists = playlistsResult.value;
    }

    const scopeFailedPanels: string[] = [];

    if (
      recentResult.status === "rejected" &&
      isSpotifyScopeError(recentResult.reason)
    ) {
      scopeFailedPanels.push("Recently played");
      recentPanelMessage =
        "Reconnect Spotify to grant access to your recently played tracks.";
    } else if (recentResult.status === "rejected") {
      recentPanelMessage = getSpotifyErrorMessage(recentResult.reason);
    }

    if (
      playlistsResult.status === "rejected" &&
      isSpotifyScopeError(playlistsResult.reason)
    ) {
      scopeFailedPanels.push("Playlists");
      playlistsPanelMessage =
        "Reconnect Spotify to grant access to your private playlists.";
    } else if (playlistsResult.status === "rejected") {
      playlistsPanelMessage = getSpotifyErrorMessage(playlistsResult.reason);
    }

    const hasPartialData = Boolean(
      topTracks?.length || topArtists?.length || recentlyPlayed?.length || playlists?.items.length,
    );

    if (scopeFailedPanels.length > 0) {
      scopeReconnectMessage = getScopeReconnectMessage(
        scopeFailedPanels,
        hasPartialData,
      );
    }

    const nonScopeFailures = [
      tracksResult,
      artistsResult,
      recentResult,
      playlistsResult,
    ].filter(
      (result) =>
        result.status === "rejected" && !isSpotifyScopeError(result.reason),
    ) as PromiseRejectedResult[];

    if (nonScopeFailures.length > 0 && !scopeReconnectMessage) {
      generalError = getSpotifyErrorMessage(nonScopeFailures[0].reason);

      const refreshedUser = await getUserByAuth0Sub(session.user.sub);
      if (!isSpotifyConnected(refreshedUser)) {
        scopeReconnectMessage = generalError;
        generalError = null;
      }
    }
  }

  return (
    <div className="min-w-0 max-w-full space-y-4 overflow-x-hidden sm:space-y-6">
      <PageHeader
        title="Overview"
        description="Your listening snapshot from Spotify."
      />

      <Suspense fallback={null}>
        <SpotifyFlashMessage />
      </Suspense>

      {!connected ? (
        <ConnectSpotifyCard />
      ) : (
        <>
          {scopeReconnectMessage ? (
            <SpotifyReconnectBanner
              message={scopeReconnectMessage}
              variant={
                topTracks?.length || topArtists?.length ? "warning" : "error"
              }
            />
          ) : null}

          {generalError ? (
            <p className="border-b border-border pb-4 text-sm text-destructive">
              {generalError}
            </p>
          ) : null}

          <TimeRangeTabs activeRange={activeRange} />

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <Link href="/tracks" className="hover:text-foreground hover:underline">
              Saved tracks
            </Link>
            <Link
              href={`/artists?time_range=${activeRange}`}
              className="hover:text-foreground hover:underline"
            >
              All artists
            </Link>
            <Link href="/recent" className="hover:text-foreground hover:underline">
              Play history
            </Link>
          </div>

          <div className="grid w-full min-w-0 grid-cols-1 gap-8 lg:grid-cols-2 [&>*]:min-w-0">
            {topTracks && topTracks.length > 0 ? (
              <TopTracksCard tracks={topTracks} />
            ) : (
              <section className="min-w-0 w-full">
                <h2 className="border-b border-border pb-2 text-sm font-medium">
                  Top tracks
                </h2>
                <p className="py-3 text-sm text-muted-foreground">
                  No top tracks yet. Listen on Spotify and check back later.
                </p>
              </section>
            )}

            {topArtists && topArtists.length > 0 ? (
              <TopArtistsCard artists={topArtists} />
            ) : (
              <section className="min-w-0 w-full">
                <h2 className="border-b border-border pb-2 text-sm font-medium">
                  Top artists
                </h2>
                <p className="py-3 text-sm text-muted-foreground">
                  No top artists yet. Listen on Spotify and check back later.
                </p>
              </section>
            )}

            {recentlyPlayed && recentlyPlayed.length > 0 ? (
              <RecentlyPlayedCard items={recentlyPlayed} />
            ) : (
              <section className="min-w-0 w-full">
                <h2 className="border-b border-border pb-2 text-sm font-medium">
                  Recently played
                </h2>
                <p className="py-3 text-sm text-muted-foreground">
                  {recentPanelMessage}
                </p>
              </section>
            )}

            {playlists && playlists.items.length > 0 ? (
              <PlaylistsPreviewCard
                playlists={playlists.items}
                total={playlists.total}
              />
            ) : (
              <section className="min-w-0 w-full">
                <h2 className="border-b border-border pb-2 text-sm font-medium">
                  Your playlists
                </h2>
                <p className="py-3 text-sm text-muted-foreground">
                  {playlistsPanelMessage}
                </p>
              </section>
            )}
          </div>
        </>
      )}
    </div>
  );
}
