"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface BookingsFilterProps {
  activeFilter: string;
  counts: {
    all: number;
    upcoming: number;
    completed: number;
    cancelled: number;
  };
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
] as const;

export function BookingsFilter({ activeFilter, counts }: BookingsFilterProps) {
  return (
    <div className="flex gap-2 border-b pb-3">
      {FILTERS.map((filter) => {
        const count = counts[filter.key];
        const isActive = activeFilter === filter.key;

        return (
          <Link
            key={filter.key}
            href={
              filter.key === "all" ? "/bookings" : `/bookings?filter=${filter.key}`
            }
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            )}
          >
            {filter.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-xs",
                isActive
                  ? "bg-indigo-200 text-indigo-800"
                  : "bg-gray-100 text-gray-500"
              )}
            >
              {count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
