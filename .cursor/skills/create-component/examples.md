# Create Component — Examples

## Example 1: Shared `StatusBadge`

**Input**

```
Create component: StatusBadge
Scope: shared
Variants: scheduled, in_progress, completed, cancelled
```

**`shared/components/status-badge.tsx`**

```typescript
import { cn } from "@/shared/lib/utils";

export type StatusBadgeVariant =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface StatusBadgeProps {
  status: StatusBadgeVariant;
  className?: string;
}

const STATUS_LABEL: Record<StatusBadgeVariant, string> = {
  scheduled: "Scheduled",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_STYLES: Record<StatusBadgeVariant, string> = {
  scheduled: "bg-surface-container-high text-on-surface",
  in_progress: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

/**
 * @example
 * ```tsx
 * <StatusBadge status="in_progress" />
 * <StatusBadge status="completed" className="shrink-0" />
 * ```
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-label-md",
        STATUS_STYLES[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
```

**`shared/components/index.ts`** (append)

```typescript
export { StatusBadge } from "./status-badge";
export type { StatusBadgeProps, StatusBadgeVariant } from "./status-badge";
```

---

## Example 2: Feature `ArrivalCard`

**Input**

```
Create component: ArrivalCard
Scope: feature arrivals
Shows flight number, gate, scheduled time, status badge
```

**`features/arrivals/components/arrival-card.tsx`**

```typescript
import { StatusBadge } from "@/shared/components/status-badge";
import { cn } from "@/shared/lib/utils";

import type { Arrival } from "../types";

export interface ArrivalCardProps {
  arrival: Arrival;
  className?: string;
}

/**
 * @example
 * ```tsx
 * <ArrivalCard arrival={arrival} />
 * ```
 */
export function ArrivalCard({ arrival, className }: ArrivalCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-card-border bg-card-surface p-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      aria-label={`Arrival ${arrival.flightNumber}`}
    >
      <div className="min-w-0">
        <p className="text-label-md text-on-surface-variant">Flight</p>
        <h3 className="truncate text-h2 text-on-surface">
          {arrival.flightNumber}
        </h3>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Gate {arrival.gate} · {arrival.scheduledTime}
        </p>
      </div>
      <StatusBadge status={arrival.status} className="self-start sm:self-center" />
    </article>
  );
}
```

**`features/arrivals/components/index.ts`** (append)

```typescript
export { ArrivalCard } from "./arrival-card";
export type { ArrivalCardProps } from "./arrival-card";
```

---

## Example 3: Client `ConfirmButton` (Shadcn)

**Input**

```
Create component: ConfirmButton
Scope: shared
Uses Shadcn Button, shows loading state
```

**`shared/components/confirm-button.tsx`**

```typescript
"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export interface ConfirmButtonProps
  extends ComponentPropsWithoutRef<typeof Button> {
  label: string;
  loadingLabel?: string;
  isLoading?: boolean;
}

/**
 * @example
 * ```tsx
 * <ConfirmButton label="Confirm" onClick={onConfirm} />
 * <ConfirmButton label="Confirm" loadingLabel="Confirming…" isLoading />
 * ```
 */
export const ConfirmButton = forwardRef<HTMLButtonElement, ConfirmButtonProps>(
  function ConfirmButton(
    {
      label,
      loadingLabel = "Loading…",
      isLoading = false,
      className,
      disabled,
      ...props
    },
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
        {isLoading ? loadingLabel : label}
      </Button>
    );
  },
);
```

**`shared/components/index.ts`** (append)

```typescript
export { ConfirmButton } from "./confirm-button";
export type { ConfirmButtonProps } from "./confirm-button";
```

---

## Verification checklist

- [ ] Props interface exported
- [ ] `className` accepted and merged with `cn()` when styles are customizable
- [ ] Responsive layout tested at mobile and desktop breakpoints
- [ ] Semantic HTML and ARIA attributes in place
- [ ] `@example` JSDoc present
- [ ] Barrel export updated
- [ ] No `any`, no inline styles, under 250 lines
