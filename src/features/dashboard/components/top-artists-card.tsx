import Image from "next/image";
import Link from "next/link";

import type { SpotifyArtist } from "@/features/spotify/types/spotify.types";

interface TopArtistsCardProps {
  artists: SpotifyArtist[];
}

export function TopArtistsCard({ artists }: TopArtistsCardProps) {
  return (
    <section className="rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-medium">Top artists</h2>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
        {artists.map((artist) => {
          const image = artist.images[0]?.url;

          return (
            <Link
              key={artist.id}
              href={artist.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-[9rem] shrink-0 rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/40 sm:min-w-0"
            >
              <div className="relative mx-auto size-20 overflow-hidden rounded-full bg-muted">
                {image ? (
                  <Image
                    src={image}
                    alt={artist.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : null}
              </div>
              <p className="mt-3 truncate text-center text-sm font-medium">
                {artist.name}
              </p>
              {artist.genres[0] ? (
                <p className="mt-1 truncate text-center text-xs text-muted-foreground">
                  {artist.genres[0]}
                </p>
              ) : null}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
