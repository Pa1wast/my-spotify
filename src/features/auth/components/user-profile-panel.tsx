import { auth0 } from "@/shared/lib/auth0";

export async function UserProfilePanel() {
  const session = await auth0.getSession();

  if (!session) {
    return null;
  }

  return (
    <section className="rounded-[var(--radius)] border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-2 text-lg font-medium">User profile</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Session data from Auth0. This confirms login is working.
      </p>
      <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs text-foreground">
        {JSON.stringify(session.user, null, 2)}
      </pre>
    </section>
  );
}
