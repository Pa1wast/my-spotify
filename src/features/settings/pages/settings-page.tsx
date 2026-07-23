import Image from "next/image";

import { ConnectSpotifyCard } from "@/features/dashboard/components/connect-spotify-card";
import { getUserSyncState } from "@/features/listening/services/play-events.service";
import { SpotifySyncButton } from "@/features/settings/components/spotify-sync-button";
import {
  getUserByAuth0Sub,
  isSpotifyConnected,
} from "@/features/spotify/services/spotify-user.service";
import { PageHeader } from "@/shared/components/page-header";
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
  title: string;
  children: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <section className={isLast ? "pb-0" : "border-b border-border pb-6"}>
      <h2 className="text-sm font-medium">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export async function SettingsPage() {
  const session = await auth0.getSession();

  if (!session) {
    return null;
  }

  const user = await getUserByAuth0Sub(session.user.sub);
  const connected = isSpotifyConnected(user);
  const syncState = user ? await getUserSyncState(user.id) : null;

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Settings"
        description="Account and Spotify connection."
      />

      <SettingsSection title="Auth0 account">
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

      <SettingsSection title="Spotify">
        {connected ? (
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted-foreground">Status:</span> Connected
            </p>
            <p>
              <span className="text-muted-foreground">Display name:</span>{" "}
              {user?.spotifyDisplayName ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Plan:</span>{" "}
              {user?.spotifyProduct ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Last play sync:</span>{" "}
              {formatSyncTime(syncState?.lastSyncedAt)}
            </p>
            <SpotifySyncButton className="mt-3" />
            <p className="mt-4 text-xs text-muted-foreground">
              Sync uses your existing connection — no login required. Reconnect
              only if permissions changed or the connection broke.
            </p>
            <a
              href="/api/spotify/login?consent=1"
              className="mt-2 inline-block text-xs underline underline-offset-4 hover:text-muted-foreground"
            >
              Reconnect Spotify
            </a>
          </div>
        ) : (
          <ConnectSpotifyCard className="border-0 pb-0" />
        )}
      </SettingsSection>

      <SettingsSection title="Session" isLast>
        <a
          href="/auth/logout"
          className="text-sm underline underline-offset-4 hover:text-muted-foreground"
        >
          Log out
        </a>
      </SettingsSection>
    </div>
  );
}
