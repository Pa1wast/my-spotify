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
        "flex shrink-0 min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between",
        compact ? "mb-4" : "mb-6",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-medium tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
