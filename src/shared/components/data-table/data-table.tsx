"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { cn } from "@/shared/lib/utils";

interface DataTablePagination {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<TData> {
  // TanStack column helpers produce mixed TValue types; `any` is required here.
  columns: ColumnDef<TData, any>[];
  data: TData[];
  isLoading?: boolean;
  emptyMessage?: string;
  pagination?: DataTablePagination;
  className?: string;
}

function TableColGroup({ columnCount }: { columnCount: number }) {
  const width = `${100 / columnCount}%`;

  return (
    <colgroup>
      {Array.from({ length: columnCount }, (_, index) => (
        <col key={index} style={{ width }} />
      ))}
    </colgroup>
  );
}

export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "No results.",
  pagination,
  className,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: Boolean(pagination),
    pageCount: pagination?.totalPages ?? -1,
  });

  const tableClassName = "w-full table-fixed caption-bottom text-sm";
  const rowCount = table.getRowModel().rows.length;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);

  return (
    <div
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
        className,
      )}
    >
      <div className="shrink-0 overflow-x-auto border-b border-border bg-background">
        <table className={tableClassName}>
          <TableColGroup columnCount={columns.length} />
          <TableHeader className="[&_tr]:border-b-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b-0 hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="bg-background">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
        </table>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-auto bg-background">
        <table className={tableClassName}>
          <TableColGroup columnCount={columns.length} />
          <TableBody>
            {isLoading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading…
                </TableCell>
              </TableRow>
            ) : rowCount > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </table>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-background px-3 py-4 text-sm text-muted-foreground sm:px-4 sm:py-3.5">
        {isLoading ? (
          <span>Loading…</span>
        ) : pagination ? (
          <>
            <span className="min-w-0 truncate">
              Page {pagination.page} of {totalPages}
              <span className="hidden sm:inline">
                {" "}
                · {pagination.total} total
              </span>
            </span>
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                className="min-h-11 rounded-md px-3 font-action text-sm font-bold tracking-wide text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40 sm:min-h-9"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={
                  pagination.page >= totalPages || pagination.total === 0
                }
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                className="min-h-11 rounded-md px-3 font-action text-sm font-bold tracking-wide text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40 sm:min-h-9"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <span>
            {rowCount === 0 ? "No rows" : `${rowCount} row${rowCount === 1 ? "" : "s"}`}
          </span>
        )}
      </div>
    </div>
  );
}

export const tablePageShellClassName =
  "flex min-h-0 flex-1 flex-col overflow-hidden";

export const tablePageShellWithTabsClassName = tablePageShellClassName;

export const scrollPageShellClassName =
  "min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-4";
