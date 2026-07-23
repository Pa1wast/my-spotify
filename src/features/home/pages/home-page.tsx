import { AuthSection, UserProfilePanel } from "@/features/auth";
import { PlayerDemo } from "@/features/player";
import { SpotifyPanel } from "@/features/spotify";

interface HomePageProps {
  spotifyStatus?: string;
}

export function HomePage({ spotifyStatus }: HomePageProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-10 sm:px-10">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            My Spotify
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Your music, your way
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Log in with Auth0, connect Spotify, and start pulling in your
            listening data.
          </p>
        </div>
        <AuthSection />
      </header>

      {spotifyStatus === "connected" ? (
        <p className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          Spotify connected successfully.
        </p>
      ) : null}

      {spotifyStatus === "error" ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Spotify connection failed. Check your redirect URI and try again.
        </p>
      ) : null}

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="space-y-8">
          <SpotifyPanel />

          <div className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-medium">What&apos;s included</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Auth0 login with server-side sessions</li>
              <li>Spotify OAuth connect flow</li>
              <li>Top tracks fetched from Spotify Web API</li>
              <li>Prisma + Neon for token storage</li>
              <li>NyxUI music player UI placeholder</li>
            </ul>
          </div>

          <UserProfilePanel />
        </div>

        <PlayerDemo />
      </section>
    </div>
  );
}
