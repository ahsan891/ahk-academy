"use client";

import { cn } from "@/lib/utils";

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  showLabel?: boolean;
  className?: string;
}

export function ProgressRing({
  percentage,
  size = 80,
  strokeWidth = 6,
  color,
  bgColor = "text-gray-200",
  showLabel = true,
  className,
}: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const resolvedColor =
    color ?? (clamped >= 80 ? "text-green-600" : clamped >= 50 ? "text-blue-600" : "text-gray-400");

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={bgColor}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(resolvedColor, "transition-[stroke-dashoffset] duration-700 ease-out")}
        />
      </svg>

      {showLabel && (
        <span
          className={cn(
            "absolute font-semibold",
            size <= 60 ? "text-xs" : size <= 100 ? "text-sm" : "text-base",
            resolvedColor
          )}
        >
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
