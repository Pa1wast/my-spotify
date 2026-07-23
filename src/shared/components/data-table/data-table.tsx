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
  columns: ColumnDef<TData, unknown>[];
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
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-border">
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
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading…
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length > 0 ? (
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
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </table>
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-border bg-background px-3 py-3 text-xs text-muted-foreground">
        {pagination ? (
          <>
            <span>
              Page {pagination.page} of {pagination.totalPages} · {pagination.total}{" "}
              total
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                className="text-foreground underline-offset-4 hover:underline disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                className="text-foreground underline-offset-4 hover:underline disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <span className="text-muted-foreground">
            {table.getRowModel().rows.length} rows
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
  "min-h-0 flex-1 overflow-y-auto overflow-x-hidden";
