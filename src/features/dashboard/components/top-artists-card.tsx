import Image from "next/image";
import Link from "next/link";

import type { SpotifyArtist } from "@/features/spotify/types/spotify.types";
import { cn } from "@/shared/lib/utils";

interface TopArtistsCardProps {
  artists: SpotifyArtist[];
}

export function TopArtistsCard({ artists }: TopArtistsCardProps) {
  return (
    <section className="min-w-0 w-full overflow-hidden rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-medium">Top artists</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        {artists.map((artist) => {
          const image = artist.images?.[0]?.url;
          const spotifyUrl = artist.external_urls?.spotify;
          const primaryGenre = artist.genres?.[0];

          const card = (
            <>
              <div className="relative mx-auto size-16 overflow-hidden rounded-full bg-muted sm:size-20">
                {image ? (
                  <Image
                    src={image}
                    alt={artist.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 80px, 96px"
                  />
                ) : null}
              </div>
              <p className="mt-2 truncate text-center text-sm font-medium sm:mt-3">
                {artist.name}
              </p>
              {primaryGenre ? (
                <p className="mt-1 truncate text-center text-xs text-muted-foreground">
                  {primaryGenre}
                </p>
              ) : null}
            </>
          );

          const itemClassName =
            "min-w-0 rounded-lg border border-border/60 p-2 sm:p-3";

          return spotifyUrl ? (
            <Link
              key={artist.id}
              href={spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(itemClassName, "transition-colors hover:bg-muted/40")}
            >
              {card}
            </Link>
          ) : (
            <div key={artist.id} className={itemClassName}>
              {card}
            </div>
          );
        })}
      </div>
    </section>
  );
}
