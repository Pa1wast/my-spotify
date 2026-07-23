---
name: generate-crud
description: >-
  Generate complete CRUD features with list, create/edit forms, delete
  confirmation, validation, pagination, search, loading states, and error
  handling using Next.js, TypeScript, React Query, Axios, Shadcn/UI, and
  TailwindCSS. Use when the user asks to generate CRUD, scaffold admin CRUD,
  add list/create/edit/delete for an entity, or run /generate-crud.
---

# Generate CRUD

Generate complete CRUD feature using:

- Next.js
- TypeScript
- React Query
- Axios
- Shadcn/UI
- TailwindCSS

Include:

- List Page
- Create Form
- Edit Form
- Delete Confirmation
- Validation
- Pagination
- Search
- Loading States
- Error Handling

## Prerequisites

Before generating files:

1. Read [create-feature](../create-feature/SKILL.md) and scaffold the data layer (types, schemas, services, hooks, query keys).
2. Read an existing feature or `features/dashboard/` for project conventions (`@/*` alias, design tokens).
3. Install missing dependencies:

```bash
npm install @tanstack/react-query axios zod react-hook-form @hookform/resolvers
```

4. Initialize Shadcn/UI if not present, then add required components:

```bash
npx shadcn@latest init
npx shadcn@latest add button input label form table dialog alert-dialog skeleton sonner
```

5. Ensure `shared/services/axios.ts` exists (see create-feature skill).
6. Wrap the app with React Query provider in `providers/query-provider.tsx` if missing.

## Gather requirements

Ask or infer before coding:

| Input | Example |
|-------|---------|
| Feature name | `arrivals` |
| Entity name | `Arrival` |
| Fields + types | `flightNumber: string`, `status: enum` |
| Search fields | `flightNumber`, `gate` |
| Table columns | flight number, gate, status, actions |
| API base path | `/arrivals` |

## Feature structure

Extend the create-feature scaffold with CRUD UI:

```
features/[feature-name]/
├── ... (types, schemas, services, hooks, api from create-feature)
├── components/
│   ├── [entity]-table.tsx
│   ├── [entity]-form.tsx
│   ├── [entity]-delete-dialog.tsx
│   ├── [entity]-list-toolbar.tsx
│   ├── [entity]-table-skeleton.tsx
│   └── index.ts
├── pages/
│   ├── [feature]-list-page.tsx
│   ├── [feature]-create-page.tsx
│   ├── [feature]-edit-page.tsx
│   └── index.ts
└── index.ts
```

## App routes

```
app/(dashboard)/[feature]/
├── page.tsx              # List
├── loading.tsx
├── error.tsx
├── new/page.tsx          # Create
└── [id]/edit/page.tsx    # Edit
```

Keep routes thin — import feature page components only.

## Workflow checklist

```
CRUD feature:
- [ ] 1. Scaffold data layer (create-feature skill)
- [ ] 2. Add Shadcn components if missing
- [ ] 3. Create shared form with Zod + react-hook-form
- [ ] 4. Create list toolbar (search + create link)
- [ ] 5. Create table with loading, empty, error, pagination
- [ ] 6. Create delete AlertDialog
- [ ] 7. Create list, create, and edit pages
- [ ] 8. Wire app routes
- [ ] 9. Add route loading.tsx and error.tsx
- [ ] 10. Export from feature index.ts
- [ ] 11. Verify lint and types
```

## Implementation patterns

### List page (search + pagination)

- Own `page` and `search` state in `[Feature]ListPage`
- Debounce search with `useDebouncedValue` (300ms) from `shared/hooks/`
- Reset `page` to `1` when search changes
- Pass `{ page, limit, search }` to `use[Entity]s` via table props

### Forms (create + edit)

- Single `[Entity]Form` shared by create and edit pages
- `react-hook-form` + `zodResolver(create[Entity]Schema)`
- Create page: `useCreate[Entity]` → toast success → `router.push` to list
- Edit page: `use[Entity](id)` for load + Skeleton; `useUpdate[Entity]` for save
- Show `FormMessage` per field; disable submit while `isPending`

### Table

- `use[Entity]s(params)` for data
- States: Skeleton (loading), alert text (error), empty message, table + pagination
- Edit links to `/[feature]/[id]/edit`; Delete opens AlertDialog

### Delete confirmation

- Shadcn `AlertDialog` — never delete without confirmation
- `useDelete[Entity]` mutation; toast on success/error; close dialog on success

### Error handling

| Context | Pattern |
|---------|---------|
| List/detail query failure | Inline `role="alert"` message |
| Form mutation failure | `toast.error` via Sonner |
| Route segment | `error.tsx` with retry |
| Loading | Skeleton or route `loading.tsx` |

## Rules

1. No `any` — strict TypeScript
2. Never call Axios from components — hooks only
3. Validate all forms with Zod schemas from `schemas/`
4. Reset page to `1` when search changes
5. Use `"use client"` only on interactive components and hooks
6. Use Tailwind utilities and design tokens (`bg-card-surface`, `text-on-surface`, etc.)
7. Components stay under 250 lines — split when larger
8. Match import style: `@/features/...`, `@/shared/...`

## Additional resources

- Component templates: [reference.md](reference.md)
- Full worked example: [examples.md](examples.md)
- Data layer templates: [create-feature](../create-feature/SKILL.md)
