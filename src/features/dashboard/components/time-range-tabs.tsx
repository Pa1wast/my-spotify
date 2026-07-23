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
  spotifyStatus?: string;
}

export function TimeRangeTabs({
  activeRange,
  spotifyStatus,
}: TimeRangeTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TIME_RANGE_OPTIONS.map((option) => {
        const isActive = option.value === activeRange;
        const href =
          spotifyStatus && spotifyStatus.length > 0
            ? `/dashboard?time_range=${option.value}&spotify=${spotifyStatus}`
            : `/dashboard?time_range=${option.value}`;

        return (
          <Link
            key={option.value}
            href={href}
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
