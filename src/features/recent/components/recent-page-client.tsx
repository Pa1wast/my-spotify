"use client";

import { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";

import { useRecentPlays } from "../hooks/use-recent-plays";
import type { RecentPlayRow } from "../services/recent.service";

import { DataTable, tablePageShellClassName } from "@/shared/components/data-table/data-table";
import { PageHeader } from "@/shared/components/page-header";
import { formatRelativeTime } from "@/shared/lib/format";

const columnHelper = createColumnHelper<RecentPlayRow>();

export function RecentPageClient() {
  const [page, setPage] = useState(1);
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
    <div className={tablePageShellClassName}>
      <PageHeader
        title="Recent"
        description="Plays stored in your database. New plays sync automatically when you open this page."
        compact
      />

      {data?.total === 0 && !isLoading ? (
        <p className="mb-3 shrink-0 text-sm text-muted-foreground">
          No plays stored yet. Listen on Spotify, then open this page or use Sync
          listening history in Settings.
        </p>
      ) : null}

      {isError ? (
        <p className="shrink-0 py-3 text-sm text-destructive">
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
                  totalPages: Math.max(1, data.totalPages),
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
