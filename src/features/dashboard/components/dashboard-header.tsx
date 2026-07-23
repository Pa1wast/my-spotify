interface DashboardHeaderProps {
  userName: string;
  spotifyConnected: boolean;
  spotifyDisplayName?: string | null;
}

export function DashboardHeader({
  userName,
  spotifyConnected,
  spotifyDisplayName,
}: DashboardHeaderProps) {
  const firstName = userName.split(" ")[0] ?? userName;

  return (
    <header className="space-y-3">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Hey, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground">
          Your listening snapshot from Spotify.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {spotifyConnected ? (
          <>
            <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
              Spotify linked
            </span>
            {spotifyDisplayName ? (
              <span className="text-xs text-muted-foreground">
                {spotifyDisplayName}
              </span>
            ) : null}
          </>
        ) : (
          <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
            Spotify not connected
          </span>
        )}
      </div>
    </header>
  );
}
