import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        // New variants
        success:
          "border-transparent bg-green-500 text-white shadow hover:bg-green-600",
        warning:
          "border-transparent bg-yellow-500 text-white shadow hover:bg-yellow-600",
        info: "border-transparent bg-blue-500 text-white shadow hover:bg-blue-600",
        purple:
          "border-transparent bg-purple-500 text-white shadow hover:bg-purple-600",
        pink: "border-transparent bg-pink-500 text-white shadow hover:bg-pink-600",
        amber:
          "border-transparent bg-amber-500 text-white shadow hover:bg-amber-600",
        indigo:
          "border-transparent bg-indigo-500 text-white shadow hover:bg-indigo-600",
        teal: "border-transparent bg-teal-500 text-white shadow hover:bg-teal-600",
        // Soft/pastel variants with subtle backgrounds
        "success-soft":
          "border border-green-200 bg-green-100/50 text-green-800 hover:bg-green-100",
        "warning-soft":
          "border border-yellow-200 bg-yellow-100/50 text-yellow-800 hover:bg-yellow-100",
        "info-soft":
          "border border-blue-200 bg-blue-100/50 text-blue-800 hover:bg-blue-100",
        "destructive-soft":
          "border border-red-200 bg-red-100/50 text-red-800 hover:bg-red-100",
        "purple-soft":
          "border border-purple-200 bg-purple-100/50 text-purple-800 hover:bg-purple-100",
        "indigo-soft":
          "border border-indigo-200 bg-indigo-100/50 text-indigo-800 hover:bg-indigo-100",
        // Outline variants with colored borders
        "outline-success": "border-green-500 text-green-700 hover:bg-green-50",
        "outline-warning":
          "border-yellow-500 text-yellow-700 hover:bg-yellow-50",
        "outline-info": "border-blue-500 text-blue-700 hover:bg-blue-50",
        "outline-destructive": "border-red-500 text-red-700 hover:bg-red-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
