"use client";

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
  useLinks?: boolean;
  onChange?: (range: SpotifyTimeRange) => void;
}

export function TimeRangeTabs({
  activeRange,
  spotifyStatus,
  useLinks = true,
  onChange,
}: TimeRangeTabsProps) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-sm">
      {TIME_RANGE_OPTIONS.map((option) => {
        const isActive = option.value === activeRange;
        const className = cn(
          "font-action tracking-wide transition-colors",
          isActive
            ? "font-bold text-primary underline underline-offset-4"
            : "text-muted-foreground hover:text-foreground",
        );

        if (useLinks) {
          const href =
            spotifyStatus && spotifyStatus.length > 0
              ? `/dashboard?time_range=${option.value}&spotify=${spotifyStatus}`
              : `/dashboard?time_range=${option.value}`;

          return (
            <Link key={option.value} href={href} className={className}>
              {option.label}
            </Link>
          );
        }

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange?.(option.value)}
            className={className}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
