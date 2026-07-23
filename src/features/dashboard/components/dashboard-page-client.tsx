"use client";

import { Suspense, useMemo, useState } from "react";

import { ConnectSpotifyCard } from "@/features/dashboard/components/connect-spotify-card";
import { PlaylistsPreviewCard } from "@/features/dashboard/components/playlists-preview-card";
import { RecentlyPlayedCard } from "@/features/dashboard/components/recently-played-card";
import { SpotifyFlashMessage } from "@/features/dashboard/components/spotify-flash-message";
import { SpotifyReconnectBanner } from "@/features/dashboard/components/spotify-reconnect-banner";
import { TimeRangeTabs } from "@/features/dashboard/components/time-range-tabs";
import { TopArtistsCard } from "@/features/dashboard/components/top-artists-card";
import { TopTracksCard } from "@/features/dashboard/components/top-tracks-card";
import {
  getQueryErrorMessage,
  useOverviewPlaylists,
  useOverviewRecentlyPlayed,
  useOverviewTopArtists,
  useOverviewTopTracks,
  useSpotifyConnection,
} from "@/features/dashboard/hooks/use-dashboard-overview";
import type { SpotifyTimeRange } from "@/shared/constants/spotify";
import { PageHeader } from "@/shared/components/page-header";
import { scrollPageShellClassName } from "@/shared/components/data-table/data-table";

function parseTimeRange(value: string | undefined): SpotifyTimeRange {
  if (value === "medium_term" || value === "long_term") {
    return value;
  }

  return "short_term";
}

function isLibraryNotSyncedMessage(message: string) {
  return (
    message.toLowerCase().includes("no saved library") ||
    message.toLowerCase().includes("save from spotify")
  );
}

function isScopeErrorMessage(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("insufficient client scope") ||
    normalized.includes("updated permissions")
  );
}

function OverviewSection({
  title,
  isLoading,
  errorMessage,
  emptyMessage,
  children,
}: {
  title: string;
  isLoading: boolean;
  errorMessage?: string | null;
  emptyMessage: string;
  children?: React.ReactNode;
}) {
  if (isLoading) {
    return (
      <section className="min-w-0 w-full">
        <h2 className="border-b border-border pb-2 text-sm font-medium">{title}</h2>
        <p className="py-3 text-sm text-muted-foreground">Loading…</p>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="min-w-0 w-full">
        <h2 className="border-b border-border pb-2 text-sm font-medium">{title}</h2>
        <p
          className={`py-3 text-sm ${
            isScopeErrorMessage(errorMessage)
              ? "text-muted-foreground"
              : "text-destructive"
          }`}
        >
          {errorMessage}
        </p>
      </section>
    );
  }

  if (children) {
    return <div className="min-w-0 w-full">{children}</div>;
  }

  return (
    <section className="min-w-0 w-full">
      <h2 className="border-b border-border pb-2 text-sm font-medium">{title}</h2>
      <p className="py-3 text-sm text-muted-foreground">{emptyMessage}</p>
    </section>
  );
}

interface DashboardPageClientProps {
  initialTimeRange?: string;
}

export function DashboardPageClient({
  initialTimeRange,
}: DashboardPageClientProps) {
  const [activeRange, setActiveRange] = useState<SpotifyTimeRange>(
    parseTimeRange(initialTimeRange),
  );

  const connection = useSpotifyConnection();
  const connected = connection.data?.connected ?? false;
  const dataEnabled = connected && !connection.isLoading;
  const needsLibrarySave =
    connected && connection.data?.hasLibraryCache === false;

  const topTracks = useOverviewTopTracks(activeRange, dataEnabled);
  const topArtists = useOverviewTopArtists(activeRange, dataEnabled);
  const recentlyPlayed = useOverviewRecentlyPlayed(dataEnabled);
  const playlists = useOverviewPlaylists(dataEnabled);

  const scopeFailedPanels = useMemo(() => {
    const panels: string[] = [];

    if (
      recentlyPlayed.error &&
      isScopeErrorMessage(getQueryErrorMessage(recentlyPlayed.error))
    ) {
      panels.push("Recently played");
    }

    if (
      playlists.error &&
      isScopeErrorMessage(getQueryErrorMessage(playlists.error))
    ) {
      panels.push("Playlists");
    }

    return panels;
  }, [playlists.error, recentlyPlayed.error]);

  const libraryNotSynced = useMemo(() => {
    const errors = [
      topTracks.error,
      topArtists.error,
      recentlyPlayed.error,
      playlists.error,
    ]
      .filter(Boolean)
      .map((error) => getQueryErrorMessage(error));

    return errors.some((message) => isLibraryNotSyncedMessage(message));
  }, [playlists.error, recentlyPlayed.error, topArtists.error, topTracks.error]);

  const hasPartialData = Boolean(
    topTracks.data?.length ||
      topArtists.data?.length ||
      recentlyPlayed.data?.length ||
      playlists.data?.items.length,
  );

  const scopeReconnectMessage =
    scopeFailedPanels.length > 0
      ? hasPartialData
        ? `${scopeFailedPanels.join(" and ")} need updated Spotify permissions. Reconnect to unlock them — your other data will keep working.`
        : "Spotify needs updated permissions. Reconnect to grant access to your listening data."
      : null;

  const generalError = useMemo(() => {
    const errors = [
      topTracks.error,
      topArtists.error,
      recentlyPlayed.error,
      playlists.error,
    ]
      .filter(Boolean)
      .map((error) => getQueryErrorMessage(error));

    const nonScopeError = errors.find(
      (message) =>
        !isScopeErrorMessage(message) && !isLibraryNotSyncedMessage(message),
    );
    return nonScopeError && !scopeReconnectMessage ? nonScopeError : null;
  }, [
    playlists.error,
    recentlyPlayed.error,
    scopeReconnectMessage,
    topArtists.error,
    topTracks.error,
  ]);

  return (
    <div className={scrollPageShellClassName}>
      <div className="min-w-0 max-w-full space-y-4 overflow-x-hidden sm:space-y-6">
      <PageHeader
        title="Overview"
        description="Your listening snapshot from Spotify."
      />

      <Suspense fallback={null}>
        <SpotifyFlashMessage />
      </Suspense>

      {connection.isLoading ? (
        <p className="text-sm text-muted-foreground">Checking Spotify connection…</p>
      ) : !connected ? (
        <ConnectSpotifyCard />
      ) : (
        <>
          {needsLibrarySave || libraryNotSynced ? (
            <p className="border-b border-border pb-4 text-sm text-muted-foreground">
              No library saved yet. Open Settings and use{" "}
              <strong className="font-medium text-foreground">
                Save from Spotify
              </strong>{" "}
              to import your data. The app only reads from your database.
            </p>
          ) : null}

          {scopeReconnectMessage ? (
            <SpotifyReconnectBanner
              message={scopeReconnectMessage}
              variant={
                topTracks.data?.length || topArtists.data?.length
                  ? "warning"
                  : "error"
              }
            />
          ) : null}

          {generalError ? (
            <p className="border-b border-border pb-4 text-sm text-destructive">
              {generalError}
            </p>
          ) : null}

          <TimeRangeTabs
            activeRange={activeRange}
            useLinks={false}
            onChange={setActiveRange}
          />

          <div className="grid w-full min-w-0 grid-cols-1 gap-8 lg:grid-cols-2 [&>*]:min-w-0">
            <OverviewSection
              title="Top tracks"
              isLoading={topTracks.isLoading}
              errorMessage={
                topTracks.error ? getQueryErrorMessage(topTracks.error) : null
              }
              emptyMessage="No top tracks yet. Listen on Spotify and check back later."
            >
              {topTracks.data && topTracks.data.length > 0 ? (
                <TopTracksCard tracks={topTracks.data} />
              ) : null}
            </OverviewSection>

            <OverviewSection
              title="Top artists"
              isLoading={topArtists.isLoading}
              errorMessage={
                topArtists.error ? getQueryErrorMessage(topArtists.error) : null
              }
              emptyMessage="No top artists yet. Listen on Spotify and check back later."
            >
              {topArtists.data && topArtists.data.length > 0 ? (
                <TopArtistsCard artists={topArtists.data} />
              ) : null}
            </OverviewSection>

            <OverviewSection
              title="Recently played"
              isLoading={recentlyPlayed.isLoading}
              errorMessage={
                recentlyPlayed.error
                  ? getQueryErrorMessage(recentlyPlayed.error)
                  : null
              }
              emptyMessage="No recent plays returned yet."
            >
              {recentlyPlayed.data && recentlyPlayed.data.length > 0 ? (
                <RecentlyPlayedCard items={recentlyPlayed.data} />
              ) : null}
            </OverviewSection>

            <OverviewSection
              title="Your playlists"
              isLoading={playlists.isLoading}
              errorMessage={
                playlists.error ? getQueryErrorMessage(playlists.error) : null
              }
              emptyMessage="No playlists found on your account."
            >
              {playlists.data && playlists.data.items.length > 0 ? (
                <PlaylistsPreviewCard
                  playlists={playlists.data.items}
                  total={playlists.data.total}
                />
              ) : null}
            </OverviewSection>
          </div>
        </>
      )}
      </div>
    </div>
  );
}
