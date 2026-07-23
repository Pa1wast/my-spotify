import Image from "next/image";

import { ConnectSpotifyCard } from "@/features/dashboard/components/connect-spotify-card";
import { getLibrarySyncState } from "@/features/library/services/library-cache.service";
import { SpotifyApiMetricsPanel } from "@/features/settings/components/spotify-api-metrics-panel";
import { SpotifySyncButton } from "@/features/settings/components/spotify-sync-button";
import {
  getUserByAuth0Sub,
  isSpotifyConnected,
} from "@/features/spotify/services/spotify-user.service";
import { PageHeader } from "@/shared/components/page-header";
import { scrollPageShellClassName } from "@/shared/components/data-table/data-table";
import { settingsActionLinkClass } from "@/shared/constants/settings-links";
import { auth0 } from "@/shared/lib/auth0";

function formatSyncTime(date: Date | null | undefined) {
  if (!date) {
    return "Never";
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function SettingsSection({
  title,
  children,
  isLast = false,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <section className={isLast ? "pb-0" : "border-b border-border pb-4 lg:border-b-0 lg:pb-0"}>
      <h2 className="text-sm font-medium">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function SpotifySectionTitle() {
  return (
    <span className="inline-flex items-center gap-2">
      <Image
        src="/logo/spotify-icon.png"
        alt=""
        width={16}
        height={16}
        className="size-4 brightness-0 invert"
        aria-hidden
      />
      Spotify
    </span>
  );
}

function SpotifyStatusItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <p className="text-sm">
      <span className="text-muted-foreground">{label}</span> {value}
    </p>
  );
}

export async function SettingsPage() {
  const session = await auth0.getSession();

  if (!session) {
    return null;
  }

  const user = await getUserByAuth0Sub(session.user.sub);
  const connected = isSpotifyConnected(user);
  const syncState = user ? await getLibrarySyncState(user.id) : null;

  return (
    <div className={scrollPageShellClassName}>
      <div className="min-w-0 space-y-4">
      <PageHeader
        title="Settings"
        description="Account and Spotify connection."
        compact
      />

      <div className="grid gap-4 border-b border-border pb-4 lg:grid-cols-2 lg:gap-8">
        <SettingsSection title="Account">
          <div className="flex items-center gap-3">
            {session.user.picture ? (
              <Image
                src={session.user.picture}
                alt={session.user.name ?? "User"}
                width={40}
                height={40}
                className="size-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                {(session.user.name ?? "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm">
                {session.user.name ?? "Unknown user"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {session.user.email ?? "No email"}
              </p>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title={<SpotifySectionTitle />}>
          {connected ? (
            <div className="space-y-3">
              <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
                <SpotifyStatusItem label="Status:" value="Connected" />
                <SpotifyStatusItem
                  label="Display name:"
                  value={user?.spotifyDisplayName ?? "—"}
                />
                <SpotifyStatusItem
                  label="Plan:"
                  value={user?.spotifyProduct ?? "—"}
                />
                <SpotifyStatusItem
                  label="Last saved:"
                  value={formatSyncTime(syncState?.lastLibrarySyncAt)}
                />
                <SpotifyStatusItem
                  label="Last play sync:"
                  value={formatSyncTime(syncState?.lastSyncedAt)}
                />
              </div>

              <SpotifySyncButton>
                <a href="/api/spotify/login?consent=1" className={settingsActionLinkClass}>
                  Reconnect Spotify
                </a>
              </SpotifySyncButton>

              <p className="text-xs text-muted-foreground">
                The app reads from your database. Use Save from Spotify when you
                want fresh data — this avoids rate limits during normal browsing.
                In-app playback requires Spotify Premium and the streaming scope.
              </p>
            </div>
          ) : (
            <ConnectSpotifyCard className="border-0 pb-0" />
          )}
        </SettingsSection>
      </div>

      {connected ? (
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-8">
          <SettingsSection title="API usage">
            <SpotifyApiMetricsPanel />
          </SettingsSection>

          <SettingsSection title="Session" isLast>
            <a href="/auth/logout" className={settingsActionLinkClass}>
              Log out
            </a>
          </SettingsSection>
        </div>
      ) : (
        <SettingsSection title="Session" isLast>
          <a href="/auth/logout" className={settingsActionLinkClass}>
            Log out
          </a>
        </SettingsSection>
      )}
      </div>
    </div>
  );
}
