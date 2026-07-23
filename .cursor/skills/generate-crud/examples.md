# Generate CRUD — Example: Arrivals

Full CRUD for flight arrival management.

## Input

```
Generate CRUD: arrivals
Entity: Arrival
Fields: flightNumber (string), gate (string), scheduledTime (datetime), status (enum)
Search: flightNumber, gate
Table columns: Flight, Gate, Scheduled, Status, Actions
API: /arrivals
```

## Generated structure

```
features/arrivals/
├── api/
├── components/
│   ├── arrival-delete-dialog.tsx
│   ├── arrival-form.tsx
│   ├── arrival-list-toolbar.tsx
│   ├── arrival-table-skeleton.tsx
│   ├── arrival-table.tsx
│   └── index.ts
├── hooks/
├── pages/
│   ├── arrivals-create-page.tsx
│   ├── arrivals-edit-page.tsx
│   ├── arrivals-list-page.tsx
│   └── index.ts
├── schemas/
├── services/
├── types/
└── index.ts

app/(dashboard)/arrivals/
├── page.tsx
├── loading.tsx
├── error.tsx
├── new/page.tsx
└── [id]/edit/page.tsx
```

## `components/arrival-form.tsx`

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
  createArrivalSchema,
  type CreateArrivalFormValues,
} from "../schemas";

type ArrivalFormProps = {
  defaultValues?: Partial<CreateArrivalFormValues>;
  onSubmit: (values: CreateArrivalFormValues) => Promise<void>;
  submitLabel: string;
  isSubmitting?: boolean;
};

export function ArrivalForm({
  defaultValues,
  onSubmit,
  submitLabel,
  isSubmitting,
}: ArrivalFormProps) {
  const form = useForm<CreateArrivalFormValues>({
    resolver: zodResolver(createArrivalSchema),
    defaultValues: {
      flightNumber: "",
      gate: "",
      scheduledTime: "",
      status: "scheduled",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid max-w-lg gap-4"
      >
        <FormField
          control={form.control}
          name="flightNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Flight number</FormLabel>
              <FormControl>
                <Input placeholder="BA1234" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gate</FormLabel>
              <FormControl>
                <Input placeholder="B12" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scheduledTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scheduled time</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
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

## `components/arrival-table.tsx` (excerpt)

```typescript
<TableCell className="font-mono text-sm">{arrival.flightNumber}</TableCell>
<TableCell>{arrival.gate}</TableCell>
<TableCell>{arrival.scheduledTime}</TableCell>
<TableCell>{arrival.status}</TableCell>
```

## `pages/arrivals-list-page.tsx`

```typescript
"use client";

import { useState } from "react";

import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

import { ArrivalListToolbar, ArrivalTable } from "../components";
import type { ArrivalListParams } from "../types";

const DEFAULT_LIMIT = 10;

export function ArrivalsListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const params: ArrivalListParams = {
    page,
    limit: DEFAULT_LIMIT,
    search: debouncedSearch || undefined,
  };

  return (
    <div className="grid gap-4">
      <section className="rounded-lg border border-card-border bg-card-surface p-6 shadow-[var(--shadow-elevated)]">
        <h3 className="text-display-sm text-on-surface">Arrivals</h3>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Manage flight arrivals, gates, and transfer scheduling.
        </p>
      </section>

      <ArrivalListToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        createHref="/arrivals/new"
      />

      <ArrivalTable
        params={params}
        page={page}
        limit={DEFAULT_LIMIT}
        onPageChange={setPage}
      />
    </div>
  );
}
```

## App routes

```typescript
// app/(dashboard)/arrivals/page.tsx
import { ArrivalsListPage } from "@/features/arrivals";

export default function Page() {
  return <ArrivalsListPage />;
}

// app/(dashboard)/arrivals/new/page.tsx
import { ArrivalsCreatePage } from "@/features/arrivals";

export default function Page() {
  return <ArrivalsCreatePage />;
}

// app/(dashboard)/arrivals/[id]/edit/page.tsx
import { ArrivalsEditPage } from "@/features/arrivals";

type PageProps = { params: Promise<{ id: string }> };

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <ArrivalsEditPage id={id} />;
}
```

## `index.ts` exports

```typescript
export { ArrivalsListPage, ArrivalsCreatePage, ArrivalsEditPage } from "./pages";
export {
  ArrivalTable,
  ArrivalForm,
  ArrivalDeleteDialog,
} from "./components";
export {
  useArrivals,
  useArrival,
  useCreateArrival,
  useUpdateArrival,
  useDeleteArrival,
} from "./hooks";
export type {
  Arrival,
  ArrivalStatus,
  CreateArrivalDto,
  UpdateArrivalDto,
} from "./types";
```

## Verification checklist

After generation, confirm:

- [ ] List loads with skeleton, then data or empty state
- [ ] Search debounces and resets to page 1
- [ ] Pagination previous/next disabled at boundaries
- [ ] Create form validates required fields via Zod
- [ ] Edit form pre-fills and saves changes
- [ ] Delete opens AlertDialog and removes row on success
- [ ] Failed API calls show error message or toast
- [ ] No Axios calls inside components
