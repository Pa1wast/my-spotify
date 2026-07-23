# Generate CRUD — Component Templates

Replace `[feature]`, `[Feature]`, `[entity]`, `[Entity]` with actual names.

## `shared/hooks/use-debounced-value.ts`

```typescript
"use client";

import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
```

## List page

```typescript
"use client";

import { useState } from "react";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import { [Entity]ListToolbar, [Entity]Table } from "../components";
import type { [Entity]ListParams } from "../types";

const DEFAULT_LIMIT = 10;

export function [Feature]ListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const params: [Entity]ListParams = {
    page,
    limit: DEFAULT_LIMIT,
    search: debouncedSearch || undefined,
  };

  return (
    <div className="grid gap-4">
      <section className="rounded-lg border border-card-border bg-card-surface p-6 shadow-[var(--shadow-elevated)]">
        <h3 className="text-display-sm text-on-surface">[Feature]</h3>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Manage [entity]s.
        </p>
      </section>

      <[Entity]ListToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        createHref="/[feature]/new"
      />

      <[Entity]Table
        params={params}
        page={page}
        limit={DEFAULT_LIMIT}
        onPageChange={setPage}
      />
    </div>
  );
}
```

## Form (create + edit)

```typescript
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";

import {
  create[Entity]Schema,
  type Create[Entity]FormValues,
} from "../schemas";

type [Entity]FormProps = {
  defaultValues?: Partial<Create[Entity]FormValues>;
  onSubmit: (values: Create[Entity]FormValues) => Promise<void>;
  submitLabel: string;
  isSubmitting?: boolean;
};

export function [Entity]Form({
  defaultValues,
  onSubmit,
  submitLabel,
  isSubmitting,
}: [Entity]FormProps) {
  const form = useForm<Create[Entity]FormValues>({
    resolver: zodResolver(create[Entity]Schema),
    defaultValues: { /* field defaults */ ...defaultValues },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid max-w-lg gap-4"
      >
        <FormField
          control={form.control}
          name="fieldName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Field label</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
```

## Create page

```typescript
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";

import { [Entity]Form } from "../components";
import { useCreate[Entity] } from "../hooks";

export function [Feature]CreatePage() {
  const router = useRouter();
  const createMutation = useCreate[Entity]();

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-display-sm text-on-surface">Create [Entity]</h3>
        <Button variant="outline" asChild>
          <Link href="/[feature]">Back to list</Link>
        </Button>
      </div>
      <[Entity]Form
        submitLabel="Create"
        isSubmitting={createMutation.isPending}
        onSubmit={async (values) => {
          try {
            await createMutation.mutateAsync(values);
            toast.success("[Entity] created");
            router.push("/[feature]");
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Failed to create [entity]"
            );
          }
        }}
      />
    </div>
  );
}
```

## Edit page

```typescript
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";

import { [Entity]Form } from "../components";
import { use[Entity], useUpdate[Entity] } from "../hooks";

type [Feature]EditPageProps = { id: string };

export function [Feature]EditPage({ id }: [Feature]EditPageProps) {
  const router = useRouter();
  const { data, isLoading, isError, error } = use[Entity](id);
  const updateMutation = useUpdate[Entity]();

  if (isLoading) return <Skeleton className="h-64 w-full max-w-lg" />;

  if (isError || !data) {
    return (
      <p className="text-body-md text-destructive" role="alert">
        {error instanceof Error ? error.message : "Failed to load [entity]"}
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-display-sm text-on-surface">Edit [Entity]</h3>
        <Button variant="outline" asChild>
          <Link href="/[feature]">Back to list</Link>
        </Button>
      </div>
      <[Entity]Form
        defaultValues={data}
        submitLabel="Save changes"
        isSubmitting={updateMutation.isPending}
        onSubmit={async (values) => {
          try {
            await updateMutation.mutateAsync({ id, payload: values });
            toast.success("[Entity] updated");
            router.push("/[feature]");
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "Failed to update [entity]"
            );
          }
        }}
      />
    </div>
  );
}
```

## Table

```typescript
"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/shared/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

import { use[Entity]s } from "../hooks";
import type { [Entity], [Entity]ListParams } from "../types";

import { [Entity]DeleteDialog } from "./[entity]-delete-dialog";
import { [Entity]TableSkeleton } from "./[entity]-table-skeleton";

type [Entity]TableProps = {
  params: [Entity]ListParams;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
};

export function [Entity]Table({ params, page, limit, onPageChange }: [Entity]TableProps) {
  const { data, isLoading, isError, error } = use[Entity]s(params);
  const [deleteTarget, setDeleteTarget] = useState<[Entity] | null>(null);

  if (isLoading) return <[Entity]TableSkeleton />;
  if (isError) {
    return (
      <p className="text-body-md text-destructive" role="alert">
        {error instanceof Error ? error.message : "Failed to load [entity]s"}
      </p>
    );
  }

  const items = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (!items.length) {
    return <p className="text-body-md text-on-surface-variant">No [entity]s found.</p>;
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-card-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Column</TableHead>
              <TableHead className="w-[140px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/[feature]/${item.id}/edit`}>Edit</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setDeleteTarget(item)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-body-sm text-on-surface-variant">
          Page {page} of {totalPages} · {total} total
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
            Next
          </Button>
        </div>
      </div>

      <[Entity]DeleteDialog
        entity={deleteTarget}
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      />
    </>
  );
}
```

## Delete dialog

```typescript
"use client";

import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

import { useDelete[Entity] } from "../hooks";
import type { [Entity] } from "../types";

type [Entity]DeleteDialogProps = {
  entity: [Entity] | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function [Entity]DeleteDialog({ entity, open, onOpenChange }: [Entity]DeleteDialogProps) {
  const deleteMutation = useDelete[Entity]();

  async function handleDelete() {
    if (!entity) return;
    try {
      await deleteMutation.mutateAsync(entity.id);
      toast.success("[Entity] deleted");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete [entity]"
      );
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete [entity]?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The record will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

## List toolbar

```typescript
"use client";

import Link from "next/link";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

type [Entity]ListToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  createHref: string;
};

export function [Entity]ListToolbar({ search, onSearchChange, createHref }: [Entity]ListToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Input
        placeholder="Search [entity]s…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
        aria-label="Search [entity]s"
      />
      <Button asChild>
        <Link href={createHref}>Create [Entity]</Link>
      </Button>
    </div>
  );
}
```

## Table skeleton

```typescript
import { Skeleton } from "@/shared/components/ui/skeleton";

export function [Entity]TableSkeleton() {
  return (
    <div className="grid gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
```

## App route files

```typescript
// app/(dashboard)/[feature]/page.tsx
import { [Feature]ListPage } from "@/features/[feature-name]";
export default function Page() {
  return <[Feature]ListPage />;
}

// app/(dashboard)/[feature]/new/page.tsx
import { [Feature]CreatePage } from "@/features/[feature-name]";
export default function Page() {
  return <[Feature]CreatePage />;
}

// app/(dashboard)/[feature]/[id]/edit/page.tsx
import { [Feature]EditPage } from "@/features/[feature-name]";
type PageProps = { params: Promise<{ id: string }> };
export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <[Feature]EditPage id={id} />;
}
```
