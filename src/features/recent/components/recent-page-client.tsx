"use client";

import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";

import {
  usePlaySyncOnMount,
  useRecentPlays,
} from "../hooks/use-recent-plays";
import type { RecentPlayRow } from "../services/recent.service";

import { DataTable } from "@/shared/components/data-table/data-table";
import { PageHeader } from "@/shared/components/page-header";
import { formatRelativeTime } from "@/shared/lib/format";

const columnHelper = createColumnHelper<RecentPlayRow>();

export function RecentPageClient() {
  const [page, setPage] = useState(1);
  const sync = usePlaySyncOnMount();
  const { data, isLoading, isError, error } = useRecentPlays(page);

  const columns = useMemo(
    () => [
      columnHelper.accessor("playedAt", {
        header: "When",
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">
            {formatRelativeTime(getValue())}
          </span>
        ),
      }),
      columnHelper.accessor("trackName", {
        header: "Track",
        cell: ({ row }) => (
          <div className="min-w-[10rem] max-w-[14rem]">
            <p className="truncate font-medium">{row.original.trackName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.artistNames}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor("albumName", {
        header: "Album",
        cell: ({ getValue }) => (
          <span className="block max-w-[10rem] truncate">
            {getValue() ?? "—"}
          </span>
        ),
      }),
      columnHelper.accessor("contextType", {
        header: "Context",
        cell: ({ getValue }) => getValue() ?? "—",
      }),
    ],
    [],
  );

  return (
    <div className="min-w-0">
      <PageHeader
        title="Recent"
        description="Plays tracked by this app since sync started."
      />

      {sync.isPending ? (
        <p className="mb-4 text-xs text-muted-foreground">Syncing latest plays…</p>
      ) : null}

      {data?.total === 0 && !isLoading ? (
        <p className="mb-4 border-b border-border pb-4 text-sm text-muted-foreground">
          No plays stored yet. Listen on Spotify and return here — we sync on
          load and every 30 minutes.
        </p>
      ) : null}

      {isError ? (
        <p className="border-b border-border pb-4 text-sm text-destructive">
          {(error as Error).message}
        </p>
      ) : (
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          isLoading={isLoading}
          emptyMessage="No recent plays in your history yet."
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
