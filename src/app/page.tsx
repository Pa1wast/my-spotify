import { HomePage } from "@/features/home/pages/home-page";

interface PageProps {
  searchParams: Promise<{
    spotify?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  return <HomePage spotifyStatus={params.spotify} />;
}
