import { cn } from "@/shared/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  compact = false,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 min-w-0 flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-2",
        compact ? "mb-3 lg:mb-4" : "mb-3 lg:mb-6",
        className,
      )}
    >
      <div className="min-w-0">
        {/* Title lives in the mobile top bar; keep it for desktop/sidebar layout. */}
        <h1 className="hidden font-display text-5xl font-bold tracking-wide lg:block">
          {title}
        </h1>
        {description ? (
          <p className="text-sm text-muted-foreground lg:mt-1">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
