import { DashboardPage } from "@/features/dashboard";

interface PageProps {
  searchParams: Promise<{
    spotify?: string;
    time_range?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <DashboardPage
      spotifyStatus={params.spotify}
      timeRange={params.time_range}
    />
  );
}
