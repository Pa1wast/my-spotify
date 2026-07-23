---
name: create-component
description: >-
  Create production-ready TypeScript React components with TailwindCSS,
  responsive layout, accessibility, Shadcn/UI compatibility, props interfaces,
  barrel exports, and example usage. Use when the user asks to create a
  component, build reusable UI, scaffold a presentational component, or run
  /create-component.
---

# Create Component

Create production-ready component.

## Requirements

- TypeScript
- TailwindCSS
- Responsive
- Accessible
- Reusable
- Shadcn/UI compatible

## Generate

- Component
- Props Interface
- Example Usage
- Export File

## Prerequisites

Before generating files:

1. Read an existing component (`shared/components/theme-toggle.tsx`, `features/dashboard/components/dashboard-shell.tsx`) for conventions.
2. Confirm path alias: `@/*` maps to project root.
3. If composing Shadcn primitives and `shared/lib/utils.ts` is missing, create it:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

4. If Shadcn/UI primitives are needed and missing, add them:

```bash
npx shadcn@latest add button badge card input label
```

Shadcn components live at `@/shared/components/ui/*`.

## Placement

| Scope | Location | Export from |
|-------|----------|-------------|
| Cross-feature reusable UI | `shared/components/[name].tsx` | `shared/components/index.ts` |
| Feature-specific UI | `features/[feature]/components/[name].tsx` | `features/[feature]/components/index.ts` |

Default to **feature** when the component encodes domain logic or feature data shapes. Default to **shared** when it is generic and reusable across features.

## Workflow

Copy and track progress:

```
Component scaffold:
- [ ] 1. Gather requirements (name, scope, variants, Shadcn deps)
- [ ] 2. Choose placement (shared vs feature)
- [ ] 3. Define props interface
- [ ] 4. Implement component
- [ ] 5. Add example usage (JSDoc or examples.md entry)
- [ ] 6. Export from index.ts
- [ ] 7. Verify lint, types, and accessibility
```

### Naming

- File: kebab-case (`status-badge.tsx`, `page-header.tsx`)
- Export: PascalCase (`StatusBadge`, `PageHeader`)
- Props type: `[ComponentName]Props`

## File templates

Replace `[ComponentName]`, `[component-name]`, and placeholder content.

### Component + props interface

Use Server Components by default. Add `"use client"` only when the component needs hooks, browser APIs, or event handlers.

**Presentational (Server Component):**

```typescript
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

export interface [ComponentName]Props {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

/**
 * @example
 * ```tsx
 * <[ComponentName] title="Arrivals" description="Today's schedule" />
 * ```
 */
export function [ComponentName]({
  title,
  description,
  children,
  className,
}: [ComponentName]Props) {
  return (
    <section
      className={cn(
        "rounded-lg border border-card-border bg-card-surface p-4 sm:p-6",
        className,
      )}
      aria-labelledby="[component-name]-title"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="[component-name]-title"
            className="text-display-sm text-on-surface"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-body-md text-on-surface-variant">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
```

**Interactive / Shadcn-compatible (Client Component with `forwardRef`):**

```typescript
"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export interface [ComponentName]Props
  extends ComponentPropsWithoutRef<typeof Button> {
  label: string;
  isLoading?: boolean;
}

/**
 * @example
 * ```tsx
 * <[ComponentName] label="Save" onClick={handleSave} />
 * <[ComponentName] label="Saving…" isLoading disabled />
 * ```
 */
export const [ComponentName] = forwardRef<
  HTMLButtonElement,
  [ComponentName]Props
>(function [ComponentName](
  { label, isLoading = false, className, disabled, ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      type="button"
      disabled={disabled ?? isLoading}
      aria-busy={isLoading}
      className={cn(className)}
      {...props}
    >
      {label}
    </Button>
  );
});
```

### Export file

**`shared/components/index.ts`** (append export):

```typescript
export { [ComponentName] } from "./[component-name]";
export type { [ComponentName]Props } from "./[component-name]";
```

**`features/[feature]/components/index.ts`** (append export):

```typescript
export { [ComponentName] } from "./[component-name]";
export type { [ComponentName]Props } from "./[component-name]";
```

## Responsive design

- Mobile-first: base styles, then `sm:`, `md:`, `lg:` breakpoints.
- Use flex/grid with `min-w-0` on flex children to prevent overflow.
- Prefer project design tokens: `bg-card-surface`, `text-on-surface`, `border-card-border`, `text-body-md`, `text-display-sm`.
- Hide or collapse non-essential UI on small screens (`hidden md:block`, `flex-col sm:flex-row`).

## Accessibility

- Use semantic HTML (`button`, `nav`, `main`, `section`, `ul`/`li`).
- Provide visible labels; use `aria-label` only when no visible text exists.
- Wire `aria-labelledby` / `aria-describedby` for compound widgets.
- Support keyboard: native focusable elements, logical tab order, visible `focus-visible` styles.
- Announce dynamic errors with `role="alert"`.
- Set `aria-busy`, `aria-disabled`, `aria-expanded` when state changes matter to assistive tech.
- Do not rely on color alone — pair status color with text or an icon with `aria-hidden`.

## Shadcn/UI compatibility

- Compose from `@/shared/components/ui/*` instead of reimplementing primitives.
- Accept `className` and merge with `cn()` so consumers can extend styles.
- Extend primitive props via `ComponentPropsWithoutRef<typeof Primitive>`.
- Use `forwardRef` when wrapping buttons, inputs, or other focusable Shadcn components.
- Keep variant logic in Tailwind classes or Shadcn `cva` variants — avoid inline styles.

## Rules

1. No `any` — strict TypeScript throughout.
2. No placeholder or mock implementations.
3. Keep components under 250 lines — split into subcomponents when larger.
4. No business logic or Axios calls inside presentational components.
5. Use `"use client"` only when required.
6. Export both the component and its props type from the barrel file.
7. Match import style: `@/shared/...`, `@/features/...`.
8. Include at least one `@example` JSDoc block on the component.

## Additional resources

- For full worked examples, see [examples.md](examples.md)
