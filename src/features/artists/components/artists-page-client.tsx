"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";

import { useTopArtists } from "../hooks/use-top-artists";
import type { TopArtistRow } from "../services/artists.service";

import { TimeRangeTabs } from "@/features/dashboard/components/time-range-tabs";
import { DataTable } from "@/shared/components/data-table/data-table";
import { PageHeader } from "@/shared/components/page-header";
import type { SpotifyTimeRange } from "@/shared/constants/spotify";

const columnHelper = createColumnHelper<TopArtistRow>();

interface ArtistsPageClientProps {
  initialTimeRange?: SpotifyTimeRange;
}

export function ArtistsPageClient({
  initialTimeRange = "short_term",
}: ArtistsPageClientProps) {
  const [timeRange, setTimeRange] = useState<SpotifyTimeRange>(initialTimeRange);
  const { data, isLoading, isError, error } = useTopArtists(timeRange);

  const columns = useMemo(
    () => [
      columnHelper.accessor("rank", {
        header: "#",
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{getValue()}</span>
        ),
      }),
      columnHelper.display({
        id: "image",
        header: "",
        cell: ({ row }) =>
          row.original.image ? (
            <Image
              src={row.original.image}
              alt={row.original.name}
              width={40}
              height={40}
              className="size-10 rounded-full object-cover"
            />
          ) : (
            <div className="size-10 rounded-full bg-muted" />
          ),
      }),
      columnHelper.accessor("name", {
        header: "Artist",
        cell: ({ row }) =>
          row.original.spotifyUrl ? (
            <Link
              href={row.original.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
            >
              {row.original.name}
            </Link>
          ) : (
            row.original.name
          ),
      }),
      columnHelper.accessor("genres", {
        header: "Genre",
        cell: ({ getValue }) => (
          <span className="block max-w-[10rem] truncate text-muted-foreground">
            {getValue() ?? "—"}
          </span>
        ),
      }),
      columnHelper.accessor("popularity", {
        header: "Popularity",
        cell: ({ getValue }) => getValue(),
      }),
    ],
    [],
  );

  return (
    <div className="min-w-0">
      <PageHeader
        title="Artists"
        description="Your top artists for the selected period."
      />

      <div className="mb-4">
        <TimeRangeTabs
          activeRange={timeRange}
          onChange={setTimeRange}
          useLinks={false}
        />
      </div>

      {isError ? (
        <p className="border-b border-border pb-4 text-sm text-destructive">
          {(error as Error).message}
        </p>
      ) : (
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          isLoading={isLoading}
          emptyMessage="No top artists returned for this period."
        />
      )}
    </div>
  );
}
