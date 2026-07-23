# Create Feature — Example: Arrivals

This example scaffolds the `arrivals` feature for flight arrival management.

## Input

```
Create feature: arrivals
Entity: Arrival
Fields: flightNumber, gate, scheduledTime, status
Operations: list, getById, create, update, delete
```

## Generated structure

```
features/arrivals/
├── api/
│   ├── query-keys.ts
│   └── index.ts
├── components/
│   ├── arrival-list.tsx
│   └── index.ts
├── hooks/
│   ├── use-arrivals.ts
│   └── index.ts
├── types/
│   ├── arrival.types.ts
│   └── index.ts
├── services/
│   ├── arrival.service.ts
│   └── index.ts
├── schemas/
│   ├── arrival.schema.ts
│   └── index.ts
├── pages/
│   ├── arrivals-page.tsx
│   └── index.ts
└── index.ts
```

## `types/arrival.types.ts`

```typescript
export type ArrivalStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export interface Arrival {
  id: string;
  flightNumber: string;
  gate: string;
  scheduledTime: string;
  status: ArrivalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArrivalDto {
  flightNumber: string;
  gate: string;
  scheduledTime: string;
  status: ArrivalStatus;
}

export interface UpdateArrivalDto {
  flightNumber?: string;
  gate?: string;
  scheduledTime?: string;
  status?: ArrivalStatus;
}

export interface ArrivalListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ArrivalStatus;
}

export interface ArrivalListResponse {
  data: Arrival[];
  total: number;
  page: number;
  limit: number;
}
```

## `schemas/arrival.schema.ts`

```typescript
import { z } from "zod";

const arrivalStatusSchema = z.enum([
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
]);

export const createArrivalSchema = z.object({
  flightNumber: z.string().min(1, "Flight number is required"),
  gate: z.string().min(1, "Gate is required"),
  scheduledTime: z.string().datetime("Invalid scheduled time"),
  status: arrivalStatusSchema,
});

export const updateArrivalSchema = createArrivalSchema.partial();

export type CreateArrivalFormValues = z.infer<typeof createArrivalSchema>;
export type UpdateArrivalFormValues = z.infer<typeof updateArrivalSchema>;
```

## `services/arrival.service.ts`

```typescript
import { apiClient } from "@/shared/services/axios";

import type {
  Arrival,
  ArrivalListParams,
  ArrivalListResponse,
  CreateArrivalDto,
  UpdateArrivalDto,
} from "../types";

const BASE_PATH = "/arrivals";

export const arrivalService = {
  getAll(params?: ArrivalListParams) {
    return apiClient.get<ArrivalListResponse>(BASE_PATH, { params });
  },

  getById(id: string) {
    return apiClient.get<Arrival>(`${BASE_PATH}/${id}`);
  },

  create(payload: CreateArrivalDto) {
    return apiClient.post<Arrival>(BASE_PATH, payload);
  },

  update(id: string, payload: UpdateArrivalDto) {
    return apiClient.patch<Arrival>(`${BASE_PATH}/${id}`, payload);
  },

  remove(id: string) {
    return apiClient.delete<void>(`${BASE_PATH}/${id}`);
  },
};
```

## `api/query-keys.ts`

```typescript
export const arrivalsKeys = {
  all: ["arrivals"] as const,
  lists: () => [...arrivalsKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) =>
    [...arrivalsKeys.lists(), params] as const,
  details: () => [...arrivalsKeys.all, "detail"] as const,
  detail: (id: string) => [...arrivalsKeys.details(), id] as const,
};
```

## `hooks/use-arrivals.ts`

```typescript
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { arrivalsKeys } from "../api";
import { arrivalService } from "../services";
import type {
  ArrivalListParams,
  CreateArrivalDto,
  UpdateArrivalDto,
} from "../types";

export function useArrivals(params?: ArrivalListParams) {
  return useQuery({
    queryKey: arrivalsKeys.list(params),
    queryFn: async () => {
      const { data } = await arrivalService.getAll(params);
      return data;
    },
  });
}

export function useArrival(id: string) {
  return useQuery({
    queryKey: arrivalsKeys.detail(id),
    queryFn: async () => {
      const { data } = await arrivalService.getById(id);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateArrival() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateArrivalDto) =>
      arrivalService.create(payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arrivalsKeys.lists() });
    },
  });
}

export function useUpdateArrival() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateArrivalDto }) =>
      arrivalService.update(id, payload).then((res) => res.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: arrivalsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: arrivalsKeys.lists() });
    },
  });
}

export function useDeleteArrival() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => arrivalService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: arrivalsKeys.lists() });
    },
  });
}
```

## `components/arrival-list.tsx`

```typescript
"use client";

import { useArrivals } from "../hooks";

export function ArrivalList() {
  const { data, isLoading, isError, error } = useArrivals();

  if (isLoading) {
    return <p className="text-body-md text-on-surface-variant">Loading arrivals…</p>;
  }

  if (isError) {
    return (
      <p className="text-body-md text-destructive" role="alert">
        {error instanceof Error ? error.message : "Failed to load arrivals"}
      </p>
    );
  }

  if (!data?.data.length) {
    return (
      <p className="text-body-md text-on-surface-variant">No arrivals found.</p>
    );
  }

  return (
    <ul className="divide-y divide-card-border rounded-lg border border-card-border bg-card-surface">
      {data.data.map((arrival) => (
        <li
          key={arrival.id}
          className="flex items-center justify-between px-4 py-3"
        >
          <span className="text-mono-sm text-on-surface">{arrival.flightNumber}</span>
          <span className="text-body-sm text-on-surface-variant">
            {arrival.gate} · {arrival.status}
          </span>
        </li>
      ))}
    </ul>
  );
}
```

## `pages/arrivals-page.tsx`

```typescript
import { ArrivalList } from "../components";

export function ArrivalsPage() {
  return (
    <div className="grid gap-4">
      <section className="rounded-lg border border-card-border bg-card-surface p-6 shadow-[var(--shadow-elevated)]">
        <h3 className="text-display-sm text-on-surface">Arrivals</h3>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Manage flight arrivals, gates, and transfer scheduling.
        </p>
      </section>
      <ArrivalList />
    </div>
  );
}
```

## `index.ts`

```typescript
export { ArrivalsPage } from "./pages";
export { ArrivalList } from "./components";
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

## App route

```typescript
// app/(dashboard)/arrivals/page.tsx
import { ArrivalsPage } from "@/features/arrivals";

export default function Page() {
  return <ArrivalsPage />;
}
```
