"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";

import { PlayTrackButton } from "@/features/player/components/play-track-button";
import { savedTrackToPlayerTrack } from "@/features/player/types/player.types";
import { useSavedTracks } from "../hooks/use-saved-tracks";
import type { SavedTrackDto } from "../services/tracks.service";

import { DataTable, tablePageShellClassName } from "@/shared/components/data-table/data-table";
import { PageHeader } from "@/shared/components/page-header";
import { formatDuration } from "@/shared/lib/format";

const columnHelper = createColumnHelper<SavedTrackDto>();

function formatAddedDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TracksPageClient() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useSavedTracks(page);

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "play",
        header: "",
        cell: ({ row }) => (
          <PlayTrackButton
            track={savedTrackToPlayerTrack(row.original)}
            queue={(data?.items ?? []).map(savedTrackToPlayerTrack)}
          />
        ),
      }),
      columnHelper.display({
        id: "cover",
        header: "",
        cell: ({ row }) =>
          row.original.albumImage ? (
            <Image
              src={row.original.albumImage}
              alt={row.original.album}
              width={40}
              height={40}
              className="size-10 rounded-md object-cover"
            />
          ) : (
            <div className="size-10 rounded-md bg-muted" />
          ),
      }),
      columnHelper.accessor("name", {
        header: "Track",
        cell: ({ row }) => (
          <div className="min-w-[10rem] max-w-[14rem]">
            {row.original.spotifyUrl ? (
              <Link
                href={row.original.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate font-medium hover:underline"
              >
                {row.original.name}
              </Link>
            ) : (
              <p className="truncate font-medium">{row.original.name}</p>
            )}
            <p className="truncate text-xs text-muted-foreground">
              {row.original.artists}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor("album", {
        header: "Album",
        cell: ({ getValue }) => (
          <span className="block max-w-[10rem] truncate">{getValue()}</span>
        ),
      }),
      columnHelper.accessor("addedAt", {
        header: "Added",
        cell: ({ getValue }) => formatAddedDate(getValue()),
      }),
      columnHelper.accessor("durationMs", {
        header: "Duration",
        cell: ({ getValue }) => formatDuration(getValue()),
      }),
    ],
    [data?.items],
  );

  return (
    <div className={tablePageShellClassName}>
      <PageHeader
        title="Tracks"
        description="Your saved library from Spotify."
      />

      {isError ? (
        <p className="shrink-0 border-b border-border pb-4 text-sm text-destructive">
          {(error as Error).message}
        </p>
      ) : (
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          isLoading={isLoading}
          emptyMessage="No saved tracks found. Save songs on Spotify or reconnect with library access."
          pagination={
            data
              ? {
                  page: data.page,
                  totalPages: data.totalPages,
                  total: data.total,
                  onPageChange: setPage,
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
