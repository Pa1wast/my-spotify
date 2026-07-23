import { AuthSection, UserProfilePanel } from "@/features/auth";
import { PlayerDemo } from "@/features/player";

export function HomePage() {
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
            Auth0 and Neon are connected. Plug in the Spotify Web API when your
            credentials are available.
          </p>
        </div>
        <AuthSection />
      </header>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="space-y-8">
          <div className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-medium">What&apos;s included</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Next.js App Router with Server Actions and API routes</li>
              <li>Prisma + PostgreSQL (Neon) with a baseline User model</li>
              <li>Auth0 login/logout with server-side sessions</li>
              <li>Named theme system starting with the ember palette</li>
              <li>Shadcn UI and NyxUI music player component</li>
            </ul>
          </div>

          <UserProfilePanel />
        </div>

        <PlayerDemo />
      </section>
    </div>
  );
}
