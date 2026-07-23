import Image from "next/image";
import Link from "next/link";

import type { SpotifyArtist } from "@/features/spotify/types/spotify.types";

interface TopArtistsCardProps {
  artists: SpotifyArtist[];
}

export function TopArtistsCard({ artists }: TopArtistsCardProps) {
  return (
    <section className="min-w-0 w-full">
      <h2 className="border-b border-border pb-2 text-sm font-medium">
        Top artists
      </h2>
      <ul className="min-w-0 divide-y divide-border">
        {artists.map((artist, index) => {
          const image = artist.images?.[0]?.url;
          const spotifyUrl = artist.external_urls?.spotify;
          const primaryGenre = artist.genres?.[0];

          const row = (
            <>
              <span className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground">
                {index + 1}
              </span>
              <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-muted">
                {image ? (
                  <Image
                    src={image}
                    alt={artist.name}
                    fill
                    className="object-cover"
                    sizes="36px"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{artist.name}</p>
                {primaryGenre ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {primaryGenre}
                  </p>
                ) : null}
              </div>
            </>
          );

          return (
            <li key={artist.id} className="min-w-0">
              {spotifyUrl ? (
                <Link
                  href={spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 items-center gap-3 py-3 transition-opacity hover:opacity-80"
                >
                  {row}
                </Link>
              ) : (
                <div className="flex min-w-0 items-center gap-3 py-3">
                  {row}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
