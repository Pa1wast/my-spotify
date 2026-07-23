import { DashboardPage } from "@/features/dashboard";
import { SpotifyReconnectRedirect } from "@/features/spotify/components/spotify-reconnect-redirect";

interface PageProps {
  searchParams: Promise<{
    spotify?: string;
    consent?: string;
    time_range?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <>
      {params.spotify === "reconnect" ? (
        <SpotifyReconnectRedirect forceConsent={params.consent === "1"} />
      ) : null}
      <DashboardPage timeRange={params.time_range} />
    </>
  );
}
