import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "outline";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      {
        "bg-indigo-100 text-indigo-700": variant === "default",
        "bg-green-100 text-green-700": variant === "success",
        "bg-yellow-100 text-yellow-700": variant === "warning",
        "bg-red-100 text-red-700": variant === "error",
        "border border-gray-300 text-gray-600": variant === "outline",
      },
      className
    )}>
      {children}
    </span>
  );
}
