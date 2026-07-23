import { ArtistsPageClient } from "@/features/artists";

interface PageProps {
  searchParams: Promise<{ time_range?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const timeRange =
    params.time_range === "medium_term" || params.time_range === "long_term"
      ? params.time_range
      : "short_term";

  return <ArtistsPageClient initialTimeRange={timeRange} />;
}
