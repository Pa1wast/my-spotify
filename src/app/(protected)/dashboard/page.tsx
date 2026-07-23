import { redirect } from "next/navigation";

import { DashboardPage } from "@/features/dashboard";

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
    const consent = params.consent === "1" ? "?consent=1" : "";
    redirect(`/api/spotify/login${consent}`);
  }

  return <DashboardPage timeRange={params.time_range} />;
}
