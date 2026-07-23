import { DashboardPageClient } from "@/features/dashboard";

interface PageProps {
  searchParams: Promise<{
    spotify?: string;
    consent?: string;
    time_range?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  if (params.spotify === "reconnect") {
    const { redirect } = await import("next/navigation");
    const consent = params.consent === "1" ? "?consent=1" : "";
    redirect(`/api/spotify/login${consent}`);
  }

  return <DashboardPageClient initialTimeRange={params.time_range} />;
}
