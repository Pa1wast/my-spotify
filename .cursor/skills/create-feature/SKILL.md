---
name: create-feature
description: >-
  Scaffold a complete feature module with types, services, React Query hooks,
  Zod schemas, and UI components under features/. Use when the user asks to
  create a feature, scaffold a module, add a new domain (arrivals, fleet,
  dispatch), or run /create-feature.
---

# Create Feature

Scaffold a production-ready feature module for the My Spotify Next.js app.

## Prerequisites

Before generating files, read an existing feature (e.g. `features/auth/`) and confirm:

- Path alias: `@/*` maps to `src/*`
- Stack: Next.js App Router, TypeScript, TailwindCSS, Shadcn/UI, React Query, Prisma, Zod, Auth0
- Same-app data: Prisma + Server Actions in `api/`
- External APIs (e.g. Spotify): Axios services + React Query hooks
- If React Query or Zod are missing, install them before scaffolding hooks/services/schemas

## Feature folder structure

Create this structure for every new feature. Use kebab-case for `[feature-name]` and file names.

```
features/
└── [feature-name]
    ├── api/
    ├── components/
    ├── hooks/
    ├── types/
    ├── services/
    ├── schemas/
    ├── pages/
    └── index.ts
```

| Folder | Purpose |
|--------|---------|
| `api/` | Query keys, endpoint path constants, server actions |
| `components/` | Presentational and container UI (client only when needed) |
| `hooks/` | React Query hooks wrapping the service layer |
| `types/` | DTOs, API response interfaces, domain types |
| `services/` | Prisma queries or Axios calls — never call APIs/DB from components |
| `schemas/` | Zod validation for forms and API payloads |
| `pages/` | Feature page components consumed by `app/` routes |
| `index.ts` | Public barrel exports for the feature |

## Workflow

Copy and track progress:

```
Feature scaffold:
- [ ] 1. Gather requirements (name, entities, CRUD operations, forms)
- [ ] 2. Create folder structure
- [ ] 3. Add types
- [ ] 4. Add schemas
- [ ] 5. Add service layer
- [ ] 6. Add api/ constants (keys + paths)
- [ ] 7. Add React Query hooks
- [ ] 8. Add UI components
- [ ] 9. Add page component
- [ ] 10. Wire app route (thin wrapper only)
- [ ] 11. Export from index.ts
- [ ] 12. Verify lint and imports
```

### Naming

- Feature folder: `arrivals`, `fleet`, `dispatch` (kebab-case, plural domain noun)
- Types: PascalCase (`Arrival`, `CreateArrivalDto`)
- Files: kebab-case (`use-arrivals.ts`, `arrival.service.ts`)
- Hooks: `use[Entity]`, `use[Entity]s`, `useCreate[Entity]`, `useUpdate[Entity]`, `useDelete[Entity]`
- Components: PascalCase export, kebab-case file (`arrival-list.tsx` → `ArrivalList`)

## File templates

Replace `[feature]`, `[Feature]`, `[entity]`, `[Entity]` with the actual names.

### `types/[entity].types.ts`

```typescript
export interface [Entity] {
  id: string;
  // domain fields
  createdAt: string;
  updatedAt: string;
}

export interface Create[Entity]Dto {
  // fields required on create
}

export interface Update[Entity]Dto {
  // partial update fields
}

export interface [Entity]ListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface [Entity]ListResponse {
  data: [Entity][];
  total: number;
  page: number;
  limit: number;
}
```

### `types/index.ts`

```typescript
export type {
  [Entity],
  Create[Entity]Dto,
  Update[Entity]Dto,
  [Entity]ListParams,
  [Entity]ListResponse,
} from "./[entity].types";
```

### `schemas/[entity].schema.ts`

```typescript
import { z } from "zod";

export const create[Entity]Schema = z.object({
  // field: z.string().min(1, "Required"),
});

export const update[Entity]Schema = create[Entity]Schema.partial();

export type Create[Entity]FormValues = z.infer<typeof create[Entity]Schema>;
export type Update[Entity]FormValues = z.infer<typeof update[Entity]Schema>;
```

### `schemas/index.ts`

```typescript
export {
  create[Entity]Schema,
  update[Entity]Schema,
  type Create[Entity]FormValues,
  type Update[Entity]FormValues,
} from "./[entity].schema";
```

### `services/[entity].service.ts`

```typescript
import { apiClient } from "@/shared/services/axios";

import type {
  [Entity],
  Create[Entity]Dto,
  Update[Entity]Dto,
  [Entity]ListParams,
  [Entity]ListResponse,
} from "../types";

const BASE_PATH = "/[feature]";

export const [entity]Service = {
  getAll(params?: [Entity]ListParams) {
    return apiClient.get<[Entity]ListResponse>(BASE_PATH, { params });
  },

  getById(id: string) {
    return apiClient.get<[Entity]>(`${BASE_PATH}/${id}`);
  },

  create(payload: Create[Entity]Dto) {
    return apiClient.post<[Entity]>(BASE_PATH, payload);
  },

  update(id: string, payload: Update[Entity]Dto) {
    return apiClient.patch<[Entity]>(`${BASE_PATH}/${id}`, payload);
  },

  remove(id: string) {
    return apiClient.delete<void>(`${BASE_PATH}/${id}`);
  },
};
```

### `services/index.ts`

```typescript
export { [entity]Service } from "./[entity].service";
```

### `api/query-keys.ts`

```typescript
export const [feature]Keys = {
  all: ["[feature]"] as const,
  lists: () => [...[feature]Keys.all, "list"] as const,
  list: (params?: Record<string, unknown>) =>
    [...[feature]Keys.lists(), params] as const,
  details: () => [...[feature]Keys.all, "detail"] as const,
  detail: (id: string) => [...[feature]Keys.details(), id] as const,
};
```

### `api/index.ts`

```typescript
export { [feature]Keys } from "./query-keys";
```

### `hooks/use-[entity]s.ts`

```typescript
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { [feature]Keys } from "../api";
import { [entity]Service } from "../services";
import type {
  Create[Entity]Dto,
  [Entity]ListParams,
  Update[Entity]Dto,
} from "../types";

export function use[Entity]s(params?: [Entity]ListParams) {
  return useQuery({
    queryKey: [feature]Keys.list(params),
    queryFn: async () => {
      const { data } = await [entity]Service.getAll(params);
      return data;
    },
  });
}

export function use[Entity](id: string) {
  return useQuery({
    queryKey: [feature]Keys.detail(id),
    queryFn: async () => {
      const { data } = await [entity]Service.getById(id);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useCreate[Entity]() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Create[Entity]Dto) =>
      [entity]Service.create(payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [feature]Keys.lists() });
    },
  });
}

export function useUpdate[Entity]() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Update[Entity]Dto }) =>
      [entity]Service.update(id, payload).then((res) => res.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [feature]Keys.detail(id) });
      queryClient.invalidateQueries({ queryKey: [feature]Keys.lists() });
    },
  });
}

export function useDelete[Entity]() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => [entity]Service.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [feature]Keys.lists() });
    },
  });
}
```

### `hooks/index.ts`

```typescript
export {
  use[Entity]s,
  use[Entity],
  useCreate[Entity],
  useUpdate[Entity],
  useDelete[Entity],
} from "./use-[entity]s";
```

### `components/[entity]-list.tsx`

```typescript
"use client";

import { use[Entity]s } from "../hooks";

export function [Entity]List() {
  const { data, isLoading, isError, error } = use[Entity]s();

  if (isLoading) {
    return <p className="text-body-md text-on-surface-variant">Loading…</p>;
  }

  if (isError) {
    return (
      <p className="text-body-md text-destructive" role="alert">
        {error instanceof Error ? error.message : "Failed to load [entity]s"}
      </p>
    );
  }

  if (!data?.data.length) {
    return (
      <p className="text-body-md text-on-surface-variant">No [entity]s found.</p>
    );
  }

  return (
    <ul className="divide-y divide-card-border rounded-lg border border-card-border bg-card-surface">
      {data.data.map((item) => (
        <li key={item.id} className="px-4 py-3 text-body-md text-on-surface">
          {item.id}
        </li>
      ))}
    </ul>
  );
}
```

### `components/index.ts`

```typescript
export { [Entity]List } from "./[entity]-list";
```

### `pages/[feature]-page.tsx`

```typescript
import { [Entity]List } from "../components";

export function [Feature]Page() {
  return (
    <div className="grid gap-4">
      <section className="rounded-lg border border-card-border bg-card-surface p-6 shadow-[var(--shadow-elevated)]">
        <h3 className="text-display-sm text-on-surface">[Feature]</h3>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Manage [entity]s for Edinburgh Arrivals operations.
        </p>
      </section>
      <[Entity]List />
    </div>
  );
}
```

### `pages/index.ts`

```typescript
export { [Feature]Page } from "./[feature]-page";
```

### `index.ts` (feature barrel)

```typescript
export { [Feature]Page } from "./pages";
export { [Entity]List } from "./components";
export {
  use[Entity]s,
  use[Entity],
  useCreate[Entity],
  useUpdate[Entity],
  useDelete[Entity],
} from "./hooks";
export type { [Entity], Create[Entity]Dto, Update[Entity]Dto } from "./types";
```

## App route integration

Keep `app/` routes thin — import the feature page, no business logic:

```typescript
// app/(dashboard)/[feature]/page.tsx
import { [Feature]Page } from "@/features/[feature-name]";

export default function Page() {
  return <[Feature]Page />;
}
```

Add `loading.tsx` and `error.tsx` in the route segment when the feature fetches data.

## Shared axios instance

If `shared/services/axios.ts` does not exist, create it first:

```typescript
import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});
```

## Rules

1. No `any` — strict TypeScript throughout
2. Never call Axios from components — hooks only
3. Validate forms with Zod schemas from `schemas/`
4. Use `"use client"` only on hooks and interactive components
5. Prefer Server Components for page shells when no client interactivity is needed
6. Use Tailwind utility classes and existing design tokens (`bg-card-surface`, `text-on-surface`, etc.)
7. Components stay under 250 lines — split when larger
8. Match existing import style: `@/features/...`, `@/shared/...`

## Additional resources

- Full worked example: [examples.md](examples.md)
