"use client";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "success";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
        { "bg-indigo-600 text-white hover:bg-indigo-700": variant === "default",
          "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50": variant === "outline",
          "text-gray-700 hover:bg-gray-100": variant === "ghost",
          "bg-red-600 text-white hover:bg-red-700": variant === "destructive",
          "bg-green-600 text-white hover:bg-green-700": variant === "success",
        },
        { "h-10 px-4 py-2 text-sm": size === "default", "h-8 px-3 text-xs": size === "sm",
          "h-12 px-6 text-base": size === "lg", "h-10 w-10": size === "icon",
        },
        className
      )}
      ref={ref} {...props}
    />
  )
);
Button.displayName = "Button";
export { Button };
