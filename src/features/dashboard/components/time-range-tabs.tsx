import Link from "next/link";

import type { SpotifyTimeRange } from "@/shared/constants/spotify";
import { cn } from "@/shared/lib/utils";

const TIME_RANGE_OPTIONS: Array<{
  value: SpotifyTimeRange;
  label: string;
}> = [
  { value: "short_term", label: "4 weeks" },
  { value: "medium_term", label: "6 months" },
  { value: "long_term", label: "All time" },
];

interface TimeRangeTabsProps {
  activeRange: SpotifyTimeRange;
}

export function TimeRangeTabs({ activeRange }: TimeRangeTabsProps) {
  return (
    <div className="flex min-w-0 flex-wrap gap-2">
      {TIME_RANGE_OPTIONS.map((option) => {
        const isActive = option.value === activeRange;

        return (
          <Link
            key={option.value}
            href={`/dashboard?time_range=${option.value}`}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              isActive
                ? "border-primary bg-primary/15 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
